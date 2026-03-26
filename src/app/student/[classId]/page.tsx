"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { askQuestion } from "@/lib/api";
import Toast from "@/components/Toast";
import { Send, Sparkles } from "lucide-react";

// ─── Quick React Button ────────────────────────────────────────────────────────

function QuickReactButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    if (loading) return;
    setPressed(true);
    onClick();
    setTimeout(() => setPressed(false), 600);
  };

  return (
    <button
      id="quick-react-btn"
      onClick={handlePress}
      disabled={loading}
      aria-label="ส่งสัญญาณว่างงให้ครู"
      className={`
        group relative flex flex-col items-center justify-center gap-4
        w-full rounded-[1.75rem] bg-white/70 backdrop-blur-xl
        ring-1 ring-indigo-200/60 
        px-6 py-10 shadow-lg shadow-indigo-100/30
        transition-all duration-300 ease-out
        hover:ring-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 hover:bg-white/90
        active:scale-[0.97]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${pressed ? "scale-[0.97] ring-indigo-500 bg-indigo-50/80" : ""}
      `}
    >
      {/* Ripple ring animation on press */}
      {pressed && (
        <span
          className="absolute inset-0 rounded-[1.75rem] border-4 border-indigo-400 animate-ping opacity-75"
          aria-hidden
        />
      )}

      <span
        className={`
          text-7xl select-none transition-transform duration-300
          ${pressed ? "scale-125 rotate-12" : "group-hover:scale-110 group-hover:-rotate-6"}
        `}
      >
        🥺
      </span>

      <span className="text-center font-bold text-indigo-700 text-base leading-snug">
        จารย์งงจัง!
        <br />
        <span className="font-medium text-indigo-400 text-sm">
          (กดปุ่มนี้เพื่อส่งสัญญาณ)
        </span>
      </span>

      {loading && (
        <span className="absolute top-4 right-5 h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      )}
    </button>
  );
}

// ─── Question Form ─────────────────────────────────────────────────────────────

function QuestionForm({
  onSubmit,
  loading,
}: {
  onSubmit: (text: string) => void;
  loading: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          id="question-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          placeholder={`เช่น "สไลด์หน้า 3 ไม่เข้าใจตรงที่อาจารย์พูดเรื่อง..."`}
          rows={4}
          className="
            w-full resize-none rounded-2xl bg-white/70 backdrop-blur-xl
            ring-1 ring-slate-200/60 
            p-5 text-slate-800 text-sm leading-relaxed placeholder:text-slate-400
            outline-none transition-all duration-300
            focus:ring-2 focus:ring-indigo-400 focus:bg-white/90 focus:shadow-lg focus:shadow-indigo-100/30
            disabled:opacity-60
          "
        />
      </div>
      <button
        id="submit-question-btn"
        type="submit"
        disabled={!text.trim() || loading}
        className="
          relative w-full rounded-2xl 
          bg-gradient-to-r from-indigo-600 to-violet-600 
          py-4 px-6
          font-bold text-white text-base 
          shadow-lg shadow-indigo-200/50
          transition-all duration-300 ease-out
          hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5
          active:scale-[0.97] active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            กำลังส่ง...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />
            ส่งคำถาม
          </span>
        )}
      </button>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface ToastState {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const QUICK_REACT_MESSAGE = "หนูงงสไลด์หน้านี้ค่ะ 🥺";

export default function StudentPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const sendQuestion = async (question: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      await askQuestion({ class_id: classId, question, student_id: "anonymous" });
      addToast("ส่งให้ครูแล้วจ้า 🚀", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "ส่งไม่สำเร็จ ลองใหม่อีกทีน้า 😢";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReact = () => sendQuestion(QUICK_REACT_MESSAGE);
  const handleSubmitQuestion = (text: string) => sendQuestion(text);

  return (
    <>
      {/* ── Background ───────────────────────────────────────── */}
      <div className="min-h-screen bg-mesh">
        {/* ── Safe area wrapper (mobile-first, max 480 px) ───────────── */}
        <div className="mx-auto flex min-h-screen max-w-sm flex-col px-5 pb-10 pt-8">

          {/* ── Hero Section ──────────────────────────────────────────── */}
          <div className="mb-10 text-center animate-fade-in-up">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 text-xs font-bold text-indigo-600 ring-1 ring-indigo-200/60 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              ไม่ระบุตัวตน · Anonymous
            </div>

            <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-slate-800">
              มีอะไรที่เรียนแล้วงง
              <br />
              พิมพ์มาได้เลย{" "}
              <span className="inline-block animate-bounce">🤫</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500 font-medium">
              ไม่มีใครรู้ว่าใครส่ง — ถามได้เลย!
            </p>
          </div>

          {/* ── Quick React ───────────────────────────────────────────── */}
          <section aria-labelledby="quick-react-heading" className="mb-8 animate-slide-up">
            <h2
              id="quick-react-heading"
              className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              ⚡ Quick React
            </h2>
            <QuickReactButton onClick={handleQuickReact} loading={loading} />
          </section>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">หรือ</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          {/* ── Question Form ─────────────────────────────────────────── */}
          <section aria-labelledby="question-heading" className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h2
              id="question-heading"
              className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              ✏️ ถามแบบละเอียด
            </h2>
            <QuestionForm onSubmit={handleSubmitQuestion} loading={loading} />
          </section>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <p className="mt-auto pt-12 text-center text-xs text-slate-400 font-medium">
            WhisperHunt AI · ช่วยครูเข้าใจนักเรียนมากขึ้น 🧑‍🏫
          </p>
        </div>
      </div>

      {/* ── Toast Notifications ───────────────────────────────────────── */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
