"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { processClusters, getClusters } from "@/lib/api";
import DropZone from "@/components/DropZone";
import ClusterCard, { type Cluster } from "@/components/ClusterCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 animate-pulse">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 h-14 rounded-xl bg-slate-100" />
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400">
      <span className="text-5xl">🧐</span>
      <p className="font-semibold text-slate-600">ยังไม่มีข้อมูลสรุปจาก AI</p>
      <p className="text-sm">
        อัปโหลดสไลด์แล้วกด&nbsp;
        <span className="font-bold">✨ ให้ AI สรุปความเข้าใจเด็ก</span>
      </p>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ clusters }: { clusters: Cluster[] }) {
  const totalStudents = clusters.reduce((s, c) => s + c.student_count, 0);
  const urgent = clusters.filter((c) => c.student_count >= 5).length;

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <div className="flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 font-semibold text-violet-700">
        <span>🗂️</span>
        <span>{clusters.length} กลุ่มปัญหา</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-sky-100 px-4 py-2 font-semibold text-sky-700">
        <span>🧑‍🎓</span>
        <span>{totalStudents} ข้อความรวม</span>
      </div>
      {urgent > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700">
          <span>🚨</span>
          <span>{urgent} เร่งด่วน</span>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch clusters ───────────────────────────────────────────────────────────
  const fetchClusters = useCallback(async (silent = false) => {
    if (!silent) setLoadingClusters(true);
    try {
      const data = (await getClusters()) as {
        data?: { clusters?: Cluster[] };
      };
      const list = data?.data?.clusters ?? [];
      setClusters(list);
      setLastUpdated(new Date());
    } catch {
      // silently ignore polling errors
    } finally {
      if (!silent) setLoadingClusters(false);
    }
  }, []);

  // ── Start / stop polling ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchClusters();
    pollRef.current = setInterval(() => fetchClusters(true), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchClusters]);

  // ── AI Summarize ─────────────────────────────────────────────────────────────
  const handleAISummarize = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      await processClusters();
      await fetchClusters();
    } catch {
      setAiError("AI สรุปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoadingAI(false);
    }
  };

  // ── Format last-updated time ─────────────────────────────────────────────────
  const timeLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧑‍🏫</span>
            <div>
              <h1 className="text-base font-extrabold text-slate-800 leading-tight">
                WhisperHunt AI
              </h1>
              <p className="text-xs text-slate-500">Teacher Dashboard</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Live — อัปเดตทุก 5 วิ
            </span>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">

          {/* ╔════════════════════════════════╗
              ║   Section 1 — Control Panel    ║
              ╚════════════════════════════════╝ */}
          <aside className="flex flex-col gap-6">
            {/* Panel header */}
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                🎛️ แผงควบคุม
              </h2>
              <p className="text-sm text-slate-500">
                อัปโหลดสไลด์แล้วให้ AI วิเคราะห์
              </p>
            </div>

            {/* Upload card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                📁 อัปโหลดสไลด์ PDF
              </p>
              <DropZone onUploadSuccess={() => fetchClusters(true)} />
            </div>

            {/* AI summarize button */}
            <button
              id="ai-summarize-btn"
              onClick={handleAISummarize}
              disabled={loadingAI}
              className="
                group relative w-full overflow-hidden rounded-2xl
                bg-gradient-to-r from-violet-600 to-indigo-600
                px-6 py-4 text-base font-bold text-white
                shadow-lg shadow-violet-200
                transition-all duration-200
                hover:shadow-violet-300 hover:shadow-xl hover:-translate-y-0.5
                active:scale-95 active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
              "
            >
              {/* Shimmer effect */}
              <span
                aria-hidden
                className="
                  absolute inset-y-0 left-[-100%] w-full
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  group-hover:animate-[shimmer_700ms_ease-in-out]
                "
              />

              {loadingAI ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  AI กำลังประมวลผล…
                </span>
              ) : (
                "✨ ให้ AI สรุปความเข้าใจเด็ก"
              )}
            </button>

            {aiError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-200">
                ❌ {aiError}
              </p>
            )}

            {/* Manual refresh */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {timeLabel ? `อัปเดตล่าสุด ${timeLabel}` : "กำลังโหลด…"}
              </span>
              <button
                id="refresh-btn"
                onClick={() => fetchClusters()}
                disabled={loadingClusters}
                className="
                  flex items-center gap-1 rounded-lg px-2.5 py-1.5
                  font-semibold text-slate-600
                  hover:bg-slate-100 active:bg-slate-200
                  disabled:opacity-50 transition-colors duration-150
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3.5 w-3.5 ${loadingClusters ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                รีเฟรชข้อมูล
              </button>
            </div>
          </aside>

          {/* ╔═══════════════════════════════════╗
              ║   Section 2 — AI Insight Board    ║
              ╚═══════════════════════════════════╝ */}
          <section aria-labelledby="insight-heading" className="flex flex-col gap-6">
            {/* Board header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="insight-heading"
                  className="text-lg font-extrabold text-slate-800"
                >
                  🧠 AI Insight Board
                </h2>
                <p className="text-sm text-slate-500">
                  จัดกลุ่มคำถามนักเรียนอัตโนมัติด้วย AI
                </p>
              </div>
              {clusters.length > 0 && <StatsBar clusters={clusters} />}
            </div>

            {/* Cards grid / states */}
            {loadingClusters && clusters.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : clusters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {clusters.map((c, i) => (
                  <ClusterCard key={i} cluster={c} index={i} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
