-- 1. เปิดใช้งาน Extension pgvector สำหรับเก็บและค้นหาข้อมูลแบบ Vector
CREATE EXTENSION IF NOT EXISTS vector;
-- ==========================================
-- 2. สร้าง Tables
-- ==========================================
-- Table: classes (เก็บข้อมูลห้องเรียน / เซสชันการสอน)
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    -- active, ended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Table: slides (เก็บเนื้อหาที่สกัดจาก PDF และ Vector Embeddings)
-- หมายเหตุ: โมเดล Embedding ของ Gemini (เช่น text-embedding-004) จะมีขนาด 768 มิติ
CREATE TABLE slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(768),
    -- ขนาด Vector อิงตามโมเดลที่ใช้
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Table: questions (เก็บคำถามหรือ Feedback ที่เด็กส่งเข้ามา)
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_message TEXT NOT NULL,
    is_clustered BOOLEAN DEFAULT FALSE,
    -- จัดกลุ่มไปแล้วหรือยัง?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Table: clusters (เก็บผลลัพธ์จาก AI เพื่อยิงขึ้น Dashboard ครู)
CREATE TABLE clusters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    issue_summary TEXT NOT NULL,
    student_count INTEGER DEFAULT 1,
    related_slides TEXT,
    ai_suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- ==========================================
-- 3. สร้างฟังก์ชันสำหรับการค้นหา Vector (RAG)
-- ==========================================
-- ฟังก์ชันนี้ใช้เทียบคำถามเด็ก กับ เนื้อหาสไลด์ เพื่อดึงหน้าที่เกี่ยวข้องกันมากที่สุดออกมา
CREATE OR REPLACE FUNCTION match_slides (
        query_embedding VECTOR(768),
        match_threshold FLOAT,
        -- ความแม่นยำ (เช่น 0.7)
        match_count INT,
        -- จำนวนหน้าที่ต้องการดึง (เช่น 3 หน้าแรก)
        p_class_id UUID -- ค้นหาเฉพาะในห้องเรียนนั้นๆ
    ) RETURNS TABLE (
        id UUID,
        page_number INTEGER,
        chunk_text TEXT,
        similarity FLOAT
    ) LANGUAGE sql STABLE AS $$
SELECT slides.id,
    slides.page_number,
    slides.chunk_text,
    1 - (slides.embedding <=> query_embedding) AS similarity
FROM slides
WHERE class_id = p_class_id
    AND 1 - (slides.embedding <=> query_embedding) > match_threshold
ORDER BY slides.embedding <=> query_embedding
LIMIT match_count;
$$;