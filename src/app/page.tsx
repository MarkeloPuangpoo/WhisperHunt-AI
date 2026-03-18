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
  Hash
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
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              WhisperHunt <span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <Link 
            href="/teacher" 
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
          >
            สำหรับคุณครู
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="px-6 py-16 text-center lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              Empowering Student Silence
            </div>
            
            <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 sm:text-7xl">
              ทลายกำแพงความเงียบ <br />
              ด้วย <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI อัจฉริยะ</span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl">
              ระบบให้นักเรียนกล้าถามคำถามที่คุณครูกล้าตอบ 
              สรุปความเข้าใจผิดในห้องเรียนด้วย AI ทันใจ ไม่ต้องบอกชื่อ
            </p>

            {/* Join Class Box */}
            <div className="mx-auto max-w-md">
              <div className="rounded-3xl bg-white p-2 shadow-2xl shadow-indigo-100 ring-1 ring-slate-200 focus-within:ring-indigo-400 focus-within:ring-2 transition-all">
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
                    className="rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
                  >
                    เข้าร่วมเลคเชอร์ 🚀
                  </button>
                </form>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                ไม่ระบุตัวตน · ไม่ต้องสมัครสมาชิก · ถามได้เลย
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section className="border-t border-slate-200/60 bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-3xl p-8 transition-all hover:bg-slate-50">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">ถามคำถาม Anonymous</h3>
                <p className="text-slate-500 font-medium">
                  นักเรียนกล้าถามมากขึ้นโดยไม่ต้องกลัวหน้าแตก 
                  รักษาความเป็นส่วนตัว 100% ไม่เก็บประวัติส่วนตัว
                </p>
              </div>

              <div className="group rounded-3xl p-8 transition-all hover:bg-slate-50">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">สรุปความเข้าใจด้วย AI</h3>
                <p className="text-slate-500 font-medium">
                  AI ช่วยจัดกลุ่มคำถามที่คล้ายกันอัตโนมัติ 
                  ทำให้คุณครูมองเห็นภาพรวมของห้องเรียนได้ในพริบตา
                </p>
              </div>

              <div className="group rounded-3xl p-8 transition-all hover:bg-slate-50">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">จัดการ Class เรียนง่าย</h3>
                <p className="text-slate-500 font-medium">
                  สร้างห้องเรียนได้ไม่จำกัด อัปโหลดสไลด์ PDF 
                  เพื่อให้ AI ช่วยแนะนำเนื้อหาที่นักเรียนไม่เข้าใจ
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Call to Action ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="relative overflow-hidden rounded-[3rem] bg-indigo-600 px-8 py-20 text-center text-white">
            <div className="relative z-10 mx-auto max-w-2xl">
              <GraduationCap className="mx-auto mb-6 h-16 w-16 animate-float opacity-80" />
              <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl">
                พร้อมที่จะเปลี่ยน <br />
                ห้องเรียนของคุณหรือยัง?
              </h2>
              <p className="mb-10 text-lg font-medium text-indigo-100">
                เปิดห้องเรียน WhisperHunt AI วันนี้ 
                เพื่อการเรียนการสอนที่มีประสิทธิภาพกว่าเดิม
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/teacher" 
                  className="rounded-2xl bg-white px-8 py-4 font-black text-indigo-600 shadow-xl transition-all hover:bg-indigo-50 hover:scale-105 active:scale-95"
                >
                  เริ่มสร้างห้องเรียนเลย 🧑‍🏫
                </Link>
                <button className="rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-sm transition-all hover:bg-white/20">
                  ดูตัวอย่าง Dashboard
                </button>
              </div>
            </div>
            
            {/* Decor bubbles */}
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-indigo-500/30" />
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
             🚀 OTTC Hackathon 2026 · WhisperHunt Project
          </p>
        </div>
      </footer>
    </div>
  );
}
