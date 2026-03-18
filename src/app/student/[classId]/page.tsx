"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { askQuestion } from "@/lib/api";
import Toast from "@/components/Toast";

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
        group relative flex flex-col items-center justify-center gap-3
        w-full rounded-3xl border-2 border-indigo-200 bg-white
        px-6 py-8 shadow-lg
        transition-all duration-200 ease-out
        hover:border-indigo-400 hover:shadow-indigo-100 hover:shadow-xl hover:-translate-y-1
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        ${pressed ? "scale-95 border-indigo-500 bg-indigo-50" : ""}
      `}
    >
      {/* Ripple ring animation on press */}
      {pressed && (
        <span
          className="absolute inset-0 rounded-3xl border-4 border-indigo-400 animate-ping opacity-75"
          aria-hidden
        />
      )}

      <span
        className={`
          text-6xl select-none transition-transform duration-300
          ${pressed ? "scale-125" : "group-hover:scale-110"}
        `}
      >
        🥺
      </span>

      <span className="text-center font-bold text-indigo-700 text-base leading-snug">
        จารย์งงจัง!
        <br />
        <span className="font-normal text-indigo-500 text-sm">
          (กดปุ่มนี้เพื่อส่งสัญญาณ)
        </span>
      </span>

      {loading && (
        <span className="absolute top-3 right-4 h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="question-input"
        className="text-sm font-semibold text-slate-600"
      >
        หรือจะพิมพ์คำถามของหนูก็ได้น้า 📝
      </label>
      <textarea
        id="question-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        placeholder="เช่น &quot;สไลด์หน้า 3 ไม่เข้าใจตรงที่อาจารย์พูดเรื่อง...&quot;"
        rows={4}
        className="
          w-full resize-none rounded-2xl border-2 border-slate-200 bg-white
          p-4 text-slate-800 text-sm leading-relaxed placeholder:text-slate-400
          outline-none transition-all duration-200
          focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50
          disabled:opacity-60
        "
      />
      <button
        id="submit-question-btn"
        type="submit"
        disabled={!text.trim() || loading}
        className="
          relative w-full rounded-2xl bg-indigo-600 py-4 px-6
          font-bold text-white text-base shadow-md shadow-indigo-200
          transition-all duration-200 ease-out
          hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5
          active:scale-95 active:translate-y-0
          disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            กำลังส่ง...
          </span>
        ) : (
          "ส่งคำถาม 🚀"
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
    } catch (e: any) {
      addToast(e.message || "ส่งไม่สำเร็จ ลองใหม่อีกทีน้า 😢", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReact = () => sendQuestion(QUICK_REACT_MESSAGE);
  const handleSubmitQuestion = (text: string) => sendQuestion(text);

  return (
    <>
      {/* ── Background gradient ───────────────────────────────────────── */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        {/* ── Safe area wrapper (mobile-first, max 480 px) ───────────── */}
        <div className="mx-auto flex min-h-screen max-w-sm flex-col px-5 pb-10 pt-6">

          {/* ── Hero Section ──────────────────────────────────────────── */}
          <div className="mb-8 text-center">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              ไม่ระบุตัวตน · Anonymous
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-800">
              มีอะไรที่เรียนแล้วงง
              <br />
              พิมพ์มาได้เลย{" "}
              <span className="inline-block animate-bounce">🤫</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              ไม่มีใครรู้ว่าใครส่ง — ถามได้เลย!
            </p>
          </div>

          {/* ── Quick React ───────────────────────────────────────────── */}
          <section aria-labelledby="quick-react-heading" className="mb-6">
            <h2
              id="quick-react-heading"
              className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              ⚡ Quick React
            </h2>
            <QuickReactButton onClick={handleQuickReact} loading={loading} />
          </section>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">หรือ</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* ── Question Form ─────────────────────────────────────────── */}
          <section aria-labelledby="question-heading">
            <h2
              id="question-heading"
              className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              ✏️ ถามแบบละเอียด
            </h2>
            <QuestionForm onSubmit={handleSubmitQuestion} loading={loading} />
          </section>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <p className="mt-auto pt-10 text-center text-xs text-slate-400">
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
