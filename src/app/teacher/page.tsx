"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClasses, createClass } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import { LogOut, Plus, BookOpen, Clock, User, Loader2 } from "lucide-react";

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
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchClasses(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
              🧑‍🏫
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Teacher Dashboard</h1>
              <p className="text-slate-500 font-medium">จัดการห้องเรียนและสรุปผล AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="hidden text-right sm:block">
              <p className="font-bold text-slate-700">{session?.user.email}</p>
              <p className="text-xs font-semibold text-emerald-600">Active Session</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-red-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:ring-red-200 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        <section className="mb-10 overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100">
          <div className="relative z-10">
            <h2 className="mb-2 text-2xl font-black">เปิดห้องเรียนใหม่ 🚀</h2>
            <p className="mb-8 font-medium text-indigo-100 opacity-90">สร้างพื้นที่ให้นักเรียนถามคำถามแบบไม่ระบุตัวตนได้ทันที</p>
            
            <form onSubmit={handleCreateClass} className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <BookOpen className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-300" />
                <input
                  type="text"
                  placeholder="ระบุชื่อวิชาหรือหัวข้อการสอน เช่น 'Intro to Quantum Physics'"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-2xl border-none bg-indigo-500/50 py-4 pl-14 pr-6 text-lg font-medium text-white placeholder:text-indigo-200 focus:bg-indigo-500/80 focus:ring-4 focus:ring-white/20 transition-all outline-none"
                />
              </div>
              <button
                disabled={creating || !newSubject.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Plus className="h-6 w-6" /> เปิดห้องเรียน</>}
              </button>
            </form>
          </div>
        </section>

        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800">📚 ห้องเรียนทั้งหมด</h2>
            <div className="flex items-center gap-2 rounded-full bg-slate-200/50 px-4 py-1.5 text-sm font-bold text-slate-500">
              {classes.length} Classes
            </div>
          </div>
          
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-100" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-5xl grayscale opacity-50">
                🫙
              </div>
              <h3 className="text-xl font-bold text-slate-700">ยังไม่มีห้องเรียนเลยจ้า</h3>
              <p className="mt-2 text-slate-500">ห้องเรียนที่คุณสร้างจะปรากฏขึ้นที่นี่</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => router.push(`/teacher/class/${cls.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:shadow-indigo-100 hover:ring-indigo-300 hover:-translate-y-1"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black tracking-tight ${
                      cls.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${cls.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {cls.status === 'active' ? 'ACTIVE' : 'ENDED'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(cls.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-black text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {cls.subject_name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                       <User className="h-4 w-4" />
                       {cls.teacher_name}
                    </div>
                    <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-6 w-6 rotate-45" />
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
