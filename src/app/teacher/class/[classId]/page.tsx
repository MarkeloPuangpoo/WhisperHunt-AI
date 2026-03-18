"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { processClusters, getClusters, endClass } from "@/lib/api";
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

export default function ClassManagementPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch clusters ───────────────────────────────────────────────────────────
  const fetchClusters = useCallback(async (silent = false) => {
    if (!classId) return;
    if (!silent) setLoadingClusters(true);
    try {
      const data = (await getClusters(classId)) as {
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
  }, [classId]);

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
    if (!classId) return;
    setLoadingAI(true);
    setAiError(null);
    try {
      await processClusters({ class_id: classId });
      await fetchClusters();
    } catch {
      setAiError("AI สรุปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleEndClass = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการปิดห้องเรียนนี้? นักเรียนจะไม่สามารถส่งคำถามเพิ่มได้")) return;
    try {
      await endClass(classId);
      alert("ปิดห้องเรียนเรียบร้อยแล้ว");
      router.push("/teacher");
    } catch {
      alert("ไม่สามารถปิดห้องเรียนได้");
    }
  };

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/student/${classId}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <button onClick={() => router.push("/teacher")} className="text-xl hover:scale-110 transition-transform">🔙</button>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-800 leading-tight">
                WhisperHunt AI
              </h1>
              <p className="text-xs text-slate-500">Class Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Live — {timeLabel}
              </span>
            </div>
            
            <button
                onClick={handleEndClass}
                className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-200 hover:bg-red-100 transition-colors"
            >
                🛑 ปิดคลาส
            </button>
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
            {/* Share Link Card */}
            <div className="rounded-2xl bg-indigo-600 p-5 shadow-lg text-white">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest opacity-80">
                🔗 ลิงก์สำหรับนักเรียน
              </p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 mb-3">
                <input 
                    readOnly 
                    value={joinUrl} 
                    className="bg-transparent text-xs w-full outline-none"
                />
              </div>
              <button 
                onClick={handleCopyLink}
                className="w-full bg-white text-indigo-600 rounded-xl py-2 text-sm font-bold hover:bg-indigo-50 transition-colors"
              >
                {copied ? "คัดลอกแล้ว! ✅" : "คัดลอกลิงก์"}
              </button>
            </div>

            {/* Upload card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                📁 อัปโหลดสไลด์ PDF (ห้องนี้)
              </p>
              <DropZone classId={classId} onUploadSuccess={() => fetchClusters(true)} />
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
          </aside>

          {/* ╔═══════════════════════════════════╗
              ║   Section 2 — AI Insight Board    ║
              ╚═══════════════════════════════════╝ */}
          <section aria-labelledby="insight-heading" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="insight-heading"
                  className="text-lg font-extrabold text-slate-800"
                >
                  🧠 AI Insight Board
                </h2>
                <p className="text-sm text-slate-500">
                  สำหรับคลาสนี้เท่านั้น
                </p>
              </div>
              {clusters.length > 0 && <StatsBar clusters={clusters} />}
            </div>

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
