"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { processClusters, getClusters, endClass } from "@/lib/api";
import DropZone from "@/components/DropZone";
import ClusterCard, { type Cluster } from "@/components/ClusterCard";
import QRCodeModal from "@/components/QRCodeModal";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  XCircle,
  QrCode,
  Loader2,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-[1.75rem] bg-white/60 backdrop-blur-xl p-6 ring-1 ring-slate-200/50 animate-pulse">
      <div className="flex gap-3.5">
        <div className="h-13 w-13 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-3 w-1/3 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-16 rounded-2xl bg-slate-100/80" />
        <div className="h-16 rounded-2xl bg-slate-50" />
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100/50">
        <span className="text-5xl">🧐</span>
      </div>
      <p className="font-bold text-slate-700 text-lg">ยังไม่มีข้อมูลสรุปจาก AI</p>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        อัปโหลดสไลด์แล้วกด&nbsp;
        <span className="font-bold text-indigo-600">✨ ให้ AI สรุปความเข้าใจเด็ก</span>
      </p>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ clusters }: { clusters: Cluster[] }) {
  const totalStudents = clusters.reduce((s, c) => s + c.student_count, 0);
  const urgent = clusters.filter((c) => c.student_count >= 5).length;

  return (
    <div className="flex flex-wrap gap-2.5 text-sm">
      <div className="flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 font-bold text-violet-600 ring-1 ring-violet-200/60">
        🗂️ <span>{clusters.length} กลุ่ม</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 font-bold text-sky-600 ring-1 ring-sky-200/60">
        🧑‍🎓 <span>{totalStudents} ข้อความ</span>
      </div>
      {urgent > 0 && (
        <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 font-bold text-red-600 ring-1 ring-red-200/60 animate-pulse-glow">
          🚨 <span>{urgent} เร่งด่วน</span>
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
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

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (clusters.length === 0) {
      alert("ไม่มีข้อมูลกลุ่มปัญหาให้ Export (รอนักเรียนถามและให้ AI สรุปก่อน)");
      return;
    }

    const headers = ["หัวข้อปัญหา (Issue)", "จำนวนนักเรียน (Count)", "อ้างอิงหน้าสไลด์ (Slide)", "คำแนะนำจาก AI (AI Suggestion)"];
    const escapeCSV = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;

    const rows = clusters.map((c) => [
      escapeCSV(c.issue),
      escapeCSV(c.student_count),
      escapeCSV(c.related_slide || ""),
      escapeCSV(c.ai_suggestion || ""),
    ]);

    const csvContent = 
      "\uFEFF" + 
      headers.join(",") + "\n" +
      rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `WhisperHunt_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── PDF Export ───────────────────────────────────────────────────────────────
  const exportToPDF = () => {
    if (clusters.length === 0) {
      alert("ไม่มีข้อมูลกลุ่มปัญหาให้ Export (รอนักเรียนถามและให้ AI สรุปก่อน)");
      return;
    }
    window.print();
  };

  const handleEndClass = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการปิดห้องเรียนนี้? ระบบจะดาวน์โหลดรายงาน (CSV) ให้โดยอัตโนมัติก่อนปิดคลาส")) return;
    try {
      if (clusters.length > 0) {
        exportToCSV();
      }
      await endClass(classId);
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
    <>
      <div className="min-h-screen bg-mesh print:bg-white print:min-h-0">
        {/* ── Top Bar ──────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 glass-card-strong shadow-sm print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/teacher")} 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 ring-1 ring-slate-200/60 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-200 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold text-slate-800 leading-tight">
                WhisperHunt <span className="text-gradient">AI</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Class Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50/80 px-3.5 py-2 ring-1 ring-emerald-200/60 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Live — {timeLabel}
              </span>
            </div>
            
            <button
                onClick={exportToPDF}
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-orange-50/80 px-4 py-2 text-xs font-bold text-orange-600 ring-1 ring-orange-200/60 hover:bg-orange-100 transition-all"
            >
                <FileText className="h-3.5 w-3.5" /> PDF
            </button>
            <button
                onClick={exportToCSV}
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-600 ring-1 ring-blue-200/60 hover:bg-blue-100 transition-all"
            >
                <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button
                onClick={handleEndClass}
                className="flex items-center gap-1.5 rounded-full bg-red-50/80 px-4 py-2 text-xs font-bold text-red-600 ring-1 ring-red-200/60 hover:bg-red-100 transition-all"
            >
                <XCircle className="h-3.5 w-3.5" /> ปิดคลาส
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-8 print:py-0 print:px-0">
        
        {/* Print-only Header */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-200">
           <h2 className="text-3xl font-extrabold text-slate-800">WhisperHunt AI - รายงานประเมินผลหลังจบคาบเรียน</h2>
           <p className="text-sm text-slate-500 mt-2 font-medium">วันที่พิมพ์: {new Date().toLocaleDateString("th-TH")} | สรุปจากความคิดเห็นนักเรียน {clusters.reduce((s, c) => s + c.student_count, 0)} ข้อความ</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] print:block">

          {/* ╔════════════════════════════════╗
              ║   Section 1 — Control Panel    ║
              ╚════════════════════════════════╝ */}
          <aside className="flex flex-col gap-5 print:hidden">
            {/* Share Link Card */}
            <div className="rounded-[1.75rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 shadow-xl shadow-indigo-200/30 text-white">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-200">
                🔗 ลิงก์สำหรับนักเรียน
              </p>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 ring-1 ring-white/10">
                <input 
                    readOnly 
                    value={joinUrl} 
                    className="bg-transparent text-xs w-full outline-none text-white/90 font-medium"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-indigo-600 rounded-xl py-3 text-sm font-bold hover:bg-indigo-50 transition-all active:scale-[0.97]"
                >
                  {copied ? <><Check className="h-4 w-4" /> คัดลอกแล้ว!</> : <><Copy className="h-4 w-4" /> คัดลอกลิงก์</>}
                </button>
                <button 
                  onClick={() => setIsQRModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white rounded-xl px-4 py-3 text-sm font-bold ring-1 ring-white/20 hover:bg-white/25 transition-all active:scale-[0.97]"
                >
                  <QrCode className="h-4 w-4" /> QR
                </button>
              </div>
            </div>

            {/* Upload card */}
            <div className="rounded-[1.75rem] bg-white/70 backdrop-blur-xl p-6 shadow-sm ring-1 ring-slate-200/50">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                📁 อัปโหลดสไลด์ PDF (ห้องนี้)
              </p>
              <DropZone 
                classId={classId} 
                onUploadSuccess={() => {
                  setIsQRModalOpen(true);
                  fetchClusters(true);
                }} 
              />
            </div>

            {/* AI summarize button */}
            <button
              id="ai-summarize-btn"
              onClick={handleAISummarize}
              disabled={loadingAI}
              className="
                group relative w-full overflow-hidden rounded-2xl
                bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600
                px-6 py-4.5 text-base font-bold text-white
                shadow-lg shadow-violet-200/50
                transition-all duration-300
                hover:shadow-xl hover:shadow-violet-300/50 hover:-translate-y-0.5
                active:scale-[0.97] active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
              "
            >
              {loadingAI ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI กำลังประมวลผล…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  ให้ AI สรุปความเข้าใจเด็ก
                </span>
              )}
            </button>

            {aiError && (
              <p className="rounded-2xl bg-red-50/80 backdrop-blur-sm px-5 py-4 text-sm font-bold text-red-600 ring-1 ring-red-200/60">
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
                  className="text-xl font-extrabold text-slate-800"
                >
                  🧠 AI Insight Board
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  สำหรับคลาสนี้เท่านั้น
                </p>
              </div>
              {clusters.length > 0 && <StatsBar clusters={clusters} />}
            </div>

            {loadingClusters && clusters.length === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : clusters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {clusters.map((c, i) => (
                  <ClusterCard key={i} cluster={c} index={i} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>

    <QRCodeModal 
      url={joinUrl} 
      isOpen={isQRModalOpen} 
      onClose={() => setIsQRModalOpen(false)} 
    />
    </>
  );
}
