import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
      <div className="mb-10 text-center">
        <span className="mb-4 inline-block text-6xl animate-bounce">🎯</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
          WhisperHunt <span className="text-violet-600">AI</span>
        </h1>
        <p className="mt-4 text-slate-500">
          ระบบจับชีพจรความเข้าใจ ทลายกำแพงความเงียบในห้องเรียน
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {/* Student Card */}
        <Link
          href="/student"
          className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-10 shadow-sm transition-all hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-1 active:scale-95"
        >
          <span className="text-5xl transition-transform group-hover:scale-110">👨‍🎓</span>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">สำหรับนักเรียน</h2>
            <p className="mt-1 text-sm text-slate-500">บอกครูว่าหนูงงตรงไหน (ไม่ระบุตัวตน)</p>
          </div>
        </Link>

        {/* Teacher Card */}
        <Link
          href="/teacher"
          className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-10 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 hover:-translate-y-1 active:scale-95"
        >
          <span className="text-5xl transition-transform group-hover:scale-110">🧑‍🏫</span>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">สำหรับคุณครู</h2>
            <p className="mt-1 text-sm text-slate-500">ดู Dashboard และสรุปจาก AI</p>
          </div>
        </Link>
      </div>

      <p className="mt-16 text-xs text-slate-400 font-semibold tracking-wide uppercase">
        🚀 OTTC Hackathon 2026
      </p>
    </div>
  );
}
