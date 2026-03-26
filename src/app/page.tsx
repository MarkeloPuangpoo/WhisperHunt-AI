"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  GraduationCap, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  BrainCircuit,
  Hash,
  Sparkles
} from "lucide-react";

export default function Home() {
  const [classCode, setClassCode] = useState("");
  const router = useRouter();

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (classCode.trim()) {
      router.push(`/student/${classCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-indigo-100 selection:text-indigo-700">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full glass-card-strong shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              WhisperHunt <span className="text-gradient">AI</span>
            </span>
          </div>
          
          <Link 
            href="/teacher" 
            className="group flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200/80 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-200 hover:shadow-lg hover:shadow-indigo-100"
          >
            สำหรับคุณครู
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="px-6 py-16 text-center lg:py-28">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-200/60 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Empowering Student Silence
            </div>
            
            <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 sm:text-7xl leading-[1.1]">
              ทลายกำแพงความเงียบ <br />
              ด้วย <span className="text-gradient">AI อัจฉริยะ</span>
            </h1>
            
            <p className="mx-auto mb-14 max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl">
              ระบบให้นักเรียนกล้าถามคำถามที่คุณครูกล้าตอบ 
              สรุปความเข้าใจผิดในห้องเรียนด้วย AI ทันใจ ไม่ต้องบอกชื่อ
            </p>

            {/* Join Class Box */}
            <div className="mx-auto max-w-md">
              <div className="rounded-[1.75rem] bg-white/70 p-2 shadow-2xl shadow-indigo-100/50 ring-1 ring-white/80 backdrop-blur-xl focus-within:ring-indigo-400 focus-within:ring-2 transition-all">
                <form onSubmit={handleJoinClass} className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="ป้อนรหัส Class ID เพื่อเข้าเรียน..."
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      className="w-full rounded-2xl border-none bg-transparent py-4 pl-12 pr-4 text-base font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.02] active:scale-95"
                  >
                    เข้าร่วม 🚀
                  </button>
                </form>
              </div>
              <p className="mt-5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                ไม่ระบุตัวตน · ไม่ต้องสมัครสมาชิก · ถามได้เลย
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section className="border-t border-slate-200/40 py-24 bg-gradient-to-b from-white/0 to-white/80">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="h-7 w-7" />,
                  color: "from-indigo-500 to-indigo-600",
                  shadowColor: "shadow-indigo-200",
                  title: "ถามคำถาม Anonymous",
                  desc: "นักเรียนกล้าถามมากขึ้นโดยไม่ต้องกลัวหน้าแตก รักษาความเป็นส่วนตัว 100% ไม่เก็บประวัติส่วนตัว"
                },
                {
                  icon: <BrainCircuit className="h-7 w-7" />,
                  color: "from-violet-500 to-purple-600",
                  shadowColor: "shadow-violet-200",
                  title: "AI Super Co-Pilot",
                  desc: "AI สรุปจัดกลุ่มคำถามอัตโนมัติ พร้อมให้คำอธิบายเปรียบเทียบ ประโยคเปิดประเด็น และคำถามเช็กความเข้าใจทันที"
                },
                {
                  icon: <Users className="h-7 w-7" />,
                  color: "from-sky-500 to-cyan-600",
                  shadowColor: "shadow-sky-200",
                  title: "จัดการ Class เรียนง่าย",
                  desc: "สร้างห้องเรียนได้ไม่จำกัด อัปโหลดสไลด์ PDF เพื่อให้ AI ช่วยแนะนำเนื้อหาที่นักเรียนไม่เข้าใจ"
                }
              ].map((f, i) => (
                <div 
                  key={i}
                  className="group rounded-3xl bg-white/60 p-8 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 hover:ring-indigo-200/50"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg ${f.shadowColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {f.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-800">{f.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Call to Action ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-20 text-center text-white shadow-2xl shadow-indigo-200">
            <div className="relative z-10 mx-auto max-w-2xl">
              <GraduationCap className="mx-auto mb-6 h-16 w-16 animate-float opacity-90" />
              <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl leading-[1.15]">
                พร้อมที่จะเปลี่ยน <br />
                ห้องเรียนของคุณหรือยัง?
              </h2>
              <p className="mb-10 text-lg font-medium text-indigo-100/90">
                เปิดห้องเรียน WhisperHunt AI วันนี้ 
                เพื่อการเรียนการสอนที่มีประสิทธิภาพกว่าเดิม
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/teacher" 
                  className="rounded-2xl bg-white px-8 py-4 font-black text-indigo-600 shadow-xl transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow-2xl active:scale-95"
                >
                  เริ่มสร้างห้องเรียนเลย 🧑‍🏫
                </Link>
                <button className="rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40">
                  ดูตัวอย่าง Dashboard
                </button>
              </div>
            </div>
            
            {/* Decor */}
            <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-2xl" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/50 bg-white/60 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
             🚀 OTTC Hackathon 2026 · WhisperHunt Project
          </p>
        </div>
      </footer>
    </div>
  );
}
