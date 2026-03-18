"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError("ตรวจสอบอีเมลเพื่อยืนยันการสมัคร!");
    else setError("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมล");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg shadow-indigo-200">
            🧑‍🏫
          </div>
          <h2 className="text-3xl font-black text-slate-800">Teacher Login</h2>
          <p className="mt-2 text-slate-500">สำหรับคุณครูเพื่อจัดการห้องเรียน</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700">อีเมล</label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">รหัสผ่าน</label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "เข้าสู่ระบบ"}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ยังไม่มีบัญชี? สมัครสมาชิกใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
