"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClasses, createClass } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import { LogOut, Plus, BookOpen, Clock, User, Loader2, Sparkles, LayoutDashboard, Users, Zap } from "lucide-react";

interface ClassInfo {
  id: string;
  teacher_name: string;
  subject_name: string;
  status: string;
  created_at: string;
}

export default function TeacherDashboard() {
  const [session, setSession] = useState<any>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [greeting, setGreeting] = useState("สวัสดี คุณครู");
  const router = useRouter();

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("อรุณสวัสดิ์ ☀️");
    else if (hour < 18) setGreeting("สวัสดีตอนบ่าย ⛅");
    else setGreeting("สวัสดีตอนเย็น 🌙");
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchClasses(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchClasses(session.user.id);
      else {
        setClasses([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClasses = async (userId: string) => {
    setLoading(true);
    try {
      const res = await getClasses(userId);
      setClasses(res.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !session) return;
    setCreating(true);
    try {
      const res = await createClass({
        teacher_name: session.user.email?.split("@")[0] || "คุณครู",
        subject_name: newSubject,
        teacher_id: session.user.id,
      });
      router.push(`/teacher/class/${res.class_id}`);
    } catch (err) {
      alert("สร้างห้องเรียนไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!session && !loading) {
    return <Auth />;
  }

  if (loading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const activeClasses = classes.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto max-w-5xl p-6 sm:p-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-1">{greeting}</p>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Teacher Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="hidden text-right sm:block">
              <p className="font-bold text-slate-700">{session?.user.email}</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Active Session
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl bg-white/70 backdrop-blur-xl px-5 py-3 text-sm font-bold text-red-500 ring-1 ring-slate-200/60 transition-all hover:bg-red-50 hover:ring-red-200 hover:shadow-lg active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* Stats Row */}
        {!loading && classes.length > 0 && (
          <div className="mb-8 flex gap-4 animate-in slide-in-from-top-4 fade-in duration-500 delay-100">
             <div className="flex flex-1 items-center gap-4 rounded-[1.5rem] bg-white/60 backdrop-blur-xl p-5 ring-1 ring-slate-200/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                   <BookOpen className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-400">ห้องเรียนทั้งหมด</p>
                   <p className="text-2xl font-black text-slate-800">{classes.length}</p>
                </div>
             </div>
             <div className="flex flex-1 items-center gap-4 rounded-[1.5rem] bg-white/60 backdrop-blur-xl p-5 ring-1 ring-slate-200/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                   <Zap className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-400">กำลังสอน (Active)</p>
                   <p className="text-2xl font-black text-slate-800">{activeClasses}</p>
                </div>
             </div>
          </div>
        )}

        <section className="mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-200/30 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-indigo-200" />
              <h2 className="text-2xl font-black relative z-10">เปิดห้องเรียนใหม่</h2>
            </div>
            <p className="mb-8 font-medium text-indigo-100/80 relative z-10">สร้างพื้นที่ให้นักเรียนถามคำถามแบบไม่ระบุตัวตนได้ทันที</p>
            
            <form onSubmit={handleCreateClass} className="flex flex-col gap-4 sm:flex-row relative z-10">
              <div className="relative flex-1 group">
                <BookOpen className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-300 transition-colors group-focus-within:text-white" />
                <input
                  type="text"
                  placeholder="ระบุชื่อวิชาหรือหัวข้อการสอน เช่น 'Intro to Quantum Physics'"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-2xl border-none bg-white/10 backdrop-blur-md py-4 pl-14 pr-6 text-lg font-medium text-white placeholder:text-indigo-200/50 focus:bg-white/20 focus:ring-4 focus:ring-white/20 transition-all outline-none ring-1 ring-white/10"
                />
              </div>
              <button
                disabled={creating || !newSubject.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-xl transition-all hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {creating ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Plus className="h-6 w-6" /> เปิดห้องเรียน</>}
              </button>
            </form>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        </section>

        <section className="animate-in fade-in duration-500 delay-300">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Users className="h-6 w-6 text-indigo-500" />
              ห้องเรียนของคุณ
            </h2>
          </div>
          
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-[1.75rem] bg-white/60 backdrop-blur-xl ring-1 ring-slate-200/50" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] border-2 border-dashed border-slate-200/60 bg-white/30 backdrop-blur-sm">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100/50 rotate-3">
                <BookOpen className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">ยังไม่มีห้องเรียนเลยจ้า</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm">เริ่มสร้างห้องเรียนแรกของคุณด้านบน เพื่อให้นักเรียนเข้ามาส่งคำถามได้ทันที 🚀</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => router.push(`/teacher/class/${cls.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] bg-white/80 backdrop-blur-xl p-7 ring-1 ring-slate-200/60 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 hover:ring-indigo-200 hover:-translate-y-1"
                >
                  {/* Accent Line */}
                  <div className={`absolute left-0 top-0 h-full w-1.5 transition-colors duration-300 ${cls.status === 'active' ? 'bg-emerald-400 group-hover:bg-emerald-500' : 'bg-slate-300 group-hover:bg-indigo-400'}`} />
                  
                  <div className="mb-6 flex items-center justify-between pl-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black tracking-tight ${
                      cls.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/60'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${cls.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                      {cls.status === 'active' ? 'ACTIVE' : 'ENDED'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(cls.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-black text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 pl-2">
                    {cls.subject_name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-6 pl-2 border-t border-slate-100 mt-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                       <User className="h-4 w-4 text-slate-400" />
                       {cls.teacher_name}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 group-hover:scale-110">
                      <Plus className="h-4 w-4 rotate-45" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
