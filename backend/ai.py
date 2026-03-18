import os
import traceback
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2

from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types

# โหลดตัวแปรจากไฟล์ .env
load_dotenv()

# ==========================================
# 1. ตั้งค่า API และ Database
# ==========================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([GOOGLE_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    raise RuntimeError("Missing Environment Variables: เช็กไฟล์ .env ด่วน!")

ai_client = genai.Client(api_key=GOOGLE_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="WhisperHunt AI Backend (Production)",
    description="API วิเคราะห์ความเข้าใจนักเรียน (RAG + Supabase pgvector + Gemini 2.5 Flash)",
    version="1.0.0"
)

# ปลดล็อก CORS ให้หน้าเว็บ Next.js เข้ามาคุยได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    student_id: str = "anonymous"

# ==========================================
# Helper: ดึง ID ของห้องเรียนล่าสุด
# ==========================================
def get_latest_class_id():
    res = supabase.table("classes").select("id").order("created_at", desc=True).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    return None

# ==========================================
# 2. API Endpoints
# ==========================================

@app.get("/")
def read_root():
    return {"status": "online", "message": "WhisperHunt Backend is connected to Supabase 🚀"}

@app.post("/upload-slide")
async def upload_slide(file: UploadFile = File(...)):
    """รับ PDF -> หั่นทีละหน้า -> แปลงเป็น Vector -> เก็บลง Supabase"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="กรุณาอัปโหลดไฟล์ PDF เท่านั้น")

    try:
        # 1. สร้างห้องเรียนใหม่ทุกครั้งที่อัปโหลดสไลด์ใหม่ (สำหรับ Demo)
        class_res = supabase.table("classes").insert({
            "teacher_name": "Teacher",
            "subject_name": file.filename
        }).execute()
        class_id = class_res.data[0]["id"]

        # 2. อ่านไฟล์ PDF
        pdf_reader = PyPDF2.PdfReader(file.file)
        slide_data = []

        # 3. สกัด Text และสร้าง Vector Embeddings ทีละหน้า
        for page_num in range(len(pdf_reader.pages)):
            chunk_text = pdf_reader.pages[page_num].extract_text()
            if not chunk_text.strip():
                continue

            # เรียกใช้โมเดล Embedding ของ Google (768 มิติ)
            embed_res = ai_client.models.embed_content(
                model='text-embedding-004',
                contents=chunk_text,
                config=types.EmbedContentConfig(task_type='RETRIEVAL_DOCUMENT')
            )
            embedding_vector = embed_res.embeddings[0].values

            slide_data.append({
                "class_id": class_id,
                "page_number": page_num + 1,
                "chunk_text": chunk_text,
                "embedding": embedding_vector
            })

        # 4. ยัดข้อมูลทั้งหมดลง Table 'slides' ใน Supabase
        if slide_data:
            supabase.table("slides").insert(slide_data).execute()

        return {"status": "success", "message": f"ฝัง Vector สำเร็จ {len(slide_data)} หน้า"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question")
def ask_question(req: QuestionRequest):
    """รับคำถามจากเด็กนักเรียน แล้วเก็บลง Supabase Table 'questions'"""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="คำถามว่างเปล่าไม่ได้")

    class_id = get_latest_class_id()
    if not class_id:
        raise HTTPException(status_code=400, detail="ครูยังไม่ได้สร้างห้องเรียน/อัปโหลดสไลด์")

    supabase.table("questions").insert({
        "class_id": class_id,
        "student_message": req.question,
        "is_clustered": False
    }).execute()

    return {"status": "success", "message": "ส่งคำถามสำเร็จ"}

@app.post("/process-clusters")
def process_clusters():
    """RAG ของจริง: ค้นหาสไลด์ที่ตรงกับคำถาม -> ส่งให้ Gemini จัดกลุ่ม -> บันทึกลง DB"""
    class_id = get_latest_class_id()
    if not class_id:
        raise HTTPException(status_code=400, detail="ไม่มีห้องเรียนที่เปิดใช้งาน")

    # 1. ดึงคำถามที่ยังไม่ได้จัดกลุ่มออกมา
    q_res = supabase.table("questions").select("*").eq("class_id", class_id).eq("is_clustered", False).execute()
    questions = q_res.data

    if not questions:
        return {"status": "success", "message": "ไม่มีคำถามใหม่ให้ประมวลผล"}

    # รวมคำถามทั้งหมดเป็นก้อนเดียว เพื่อเอาไปใช้ค้นหาสไลด์ที่ตรงกัน (Vector Search)
    questions_text = "\n".join([f"- {q['student_message']}" for q in questions])

    try:
        # 2. แปลงคำถามรวมเป็น Vector
        embed_res = ai_client.models.embed_content(
            model='text-embedding-004',
            contents=questions_text,
            config=types.EmbedContentConfig(task_type='RETRIEVAL_QUERY')
        )
        # แปลงเป็น plain Python list ก่อนส่งเป็น JSON payload
        query_embedding = list(embed_res.embeddings[0].values)

        # 3. ค้นหา RAG: เรียกใช้ฟังก์ชัน match_slides ใน Supabase (ดึง 3 หน้าที่เกี่ยวที่สุด)
        rpc_res = supabase.rpc('match_slides', {
            'query_embedding': query_embedding,
            'match_threshold': 0.1,
            'match_count': 3,
            'p_class_id': str(class_id)
        }).execute()

        relevant_slides = rpc_res.data
        context_text = "\n".join([
            f"--- [สไลด์หน้า {s['page_number']}] ---\n{s['chunk_text']}"
            for s in relevant_slides
        ])

        # 4. ส่ง Context + Questions ให้ Gemini วิเคราะห์
        prompt = f"""
        คุณคือ 'InsightPulse AI' ผู้ช่วยวิเคราะห์ความเข้าใจของนักเรียน
        จงจัดกลุ่มความเข้าใจผิด (Semantic Clustering) จากข้อมูลต่อไปนี้

        [ข้อมูลบริบทคำศัพท์วัยรุ่นไทย]:
        - "จารย์" = คุณครู
        - "ตึ้บ", "งง", "แอบงง" = ไม่เข้าใจ
        - "ปะ", "ป่าว" = หรือเปล่า

        [เนื้อหาสไลด์ที่ AI ค้นพบว่าเกี่ยวข้องที่สุด]:
        {context_text}

        [คำถามจากนักเรียน]:
        {questions_text}

        [คำสั่งรูปแบบ Output JSON เท่านั้น]:
        {{
            "clusters": [
                {{
                    "issue": "ประเด็นที่เด็กงง",
                    "student_count": จำนวนเด็ก,
                    "related_slide": "อ้างอิงเลขหน้าสไลด์จากเนื้อหาด้านบน",
                    "ai_suggestion": "คำแนะนำสำหรับครู"
                }}
            ]
        }}
        """

        response = ai_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )

        parsed_result = json.loads(response.text)
        clusters_to_insert = []

        # 5. บันทึกผลลัพธ์ลง Table 'clusters'
        for c in parsed_result.get("clusters", []):
            clusters_to_insert.append({
                "class_id": class_id,
                "issue_summary": c["issue"],
                "student_count": c["student_count"],
                "related_slides": c["related_slide"],
                "ai_suggestion": c["ai_suggestion"]
            })

        if clusters_to_insert:
            supabase.table("clusters").insert(clusters_to_insert).execute()

        # 6. อัปเดตสถานะคำถามว่าประมวลผลแล้ว
        q_ids = [q['id'] for q in questions]
        supabase.table("questions").update({"is_clustered": True}).in_("id", q_ids).execute()

        return {"status": "success", "message": "จัดกลุ่มสำเร็จ"}

    except Exception as e:
        traceback.print_exc()  # พิมพ์ traceback จริงๆ ออก uvicorn log
        raise HTTPException(status_code=500, detail=f"AI/DB Error: {str(e)}")

@app.get("/get-clusters")
def get_clusters():
    """ดึงข้อมูลจาก DB มาแสดงบน Dashboard ครู"""
    class_id = get_latest_class_id()
    if not class_id:
        return {"status": "success", "data": {"clusters": []}}

    # ดึง Cluster ของห้องเรียนปัจจุบัน
    res = supabase.table("clusters").select("*").eq("class_id", class_id).order("created_at", desc=True).execute()

    # แปลงกลับให้อยู่ในรูปแบบที่ Frontend หวังผล
    formatted_clusters = [
        {
            "issue": c["issue_summary"],
            "student_count": c["student_count"],
            "related_slide": c["related_slides"],
            "ai_suggestion": c["ai_suggestion"]
        }
        for c in res.data
    ]

    return {"status": "success", "data": {"clusters": formatted_clusters}}