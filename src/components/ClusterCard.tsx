"use client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Cluster {
  issue: string;
  student_count: number;
  related_slide: string;
  ai_suggestion: string;
}

interface ClusterCardProps {
  cluster: Cluster;
  index: number;
}

// ─── Urgency helpers ───────────────────────────────────────────────────────────

function urgencyConfig(count: number) {
  if (count >= 5)
    return {
      ring: "ring-red-200/80",
      gradient: "from-red-500 to-rose-600",
      countBg: "bg-gradient-to-br from-red-500 to-rose-600",
      shadow: "shadow-red-200",
      badge: "bg-red-50 text-red-600 ring-1 ring-red-200/60",
      badgeText: "เร่งด่วน 🔥",
      icon: "🚨",
    };
  if (count >= 3)
    return {
      ring: "ring-amber-200/80",
      gradient: "from-amber-500 to-orange-600",
      countBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      shadow: "shadow-amber-200",
      badge: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60",
      badgeText: "ควรเร่ง ⚡",
      icon: "⚠️",
    };
  return {
    ring: "ring-sky-200/80",
    gradient: "from-sky-500 to-blue-600",
    countBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    shadow: "shadow-sky-200",
    badge: "bg-sky-50 text-sky-600 ring-1 ring-sky-200/60",
    badgeText: "ทั่วไป",
    icon: "💬",
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ClusterCard({ cluster, index }: ClusterCardProps) {
  const { issue, student_count, related_slide, ai_suggestion } = cluster;
  const u = urgencyConfig(student_count);

  let aiData = { analogy: "", socratic_guide: "", checkup_question: "" };
  try {
    const parsed = JSON.parse(ai_suggestion);
    if (parsed.socratic_guide || parsed.analogy || parsed.checkup_question) {
      aiData = {
        analogy: parsed.analogy || "",
        socratic_guide: parsed.socratic_guide || "",
        checkup_question: parsed.checkup_question || "",
      };
    } else {
      aiData.socratic_guide = ai_suggestion;
    }
  } catch {
    aiData.socratic_guide = ai_suggestion;
  }

  return (
    <article
      aria-label={`Cluster ${index + 1}: ${issue}`}
      className={`
        relative flex flex-col gap-5 rounded-[1.75rem] p-6
        bg-white/70 backdrop-blur-xl ring-1 ${u.ring}
        shadow-sm hover:shadow-xl hover:shadow-indigo-50 
        transition-all duration-300 hover:-translate-y-1
        print:shadow-none print:ring-slate-200 print:hover:translate-y-0
      `}
    >
      {/* ── Header row ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Student count bubble */}
          <div
            className={`
              flex h-13 w-13 shrink-0 flex-col items-center justify-center
              rounded-2xl ${u.countBg} text-white shadow-lg ${u.shadow}
            `}
          >
            <span className="text-xl font-extrabold leading-none">
              {student_count}
            </span>
            <span className="text-[9px] font-semibold leading-none opacity-80">
              คน
            </span>
          </div>

          {/* Issue & slide tag */}
          <div className="min-w-0">
            <p className="font-bold text-slate-800 leading-snug line-clamp-2">
              {u.icon} {issue}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              📄 {related_slide}
            </span>
          </div>
        </div>

        {/* Urgency badge */}
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${u.badge}`}
        >
          {u.badgeText}
        </span>
      </div>

      {/* ── AI Super Co-Pilot ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {aiData.analogy && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white p-4 ring-1 ring-indigo-100/60 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs shadow-md shadow-indigo-200">💡</span>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Analogy</p>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{aiData.analogy}</p>
          </div>
        )}

        {aiData.socratic_guide && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-50/80 to-white p-4 ring-1 ring-violet-100/60 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs shadow-md shadow-violet-200">🎯</span>
              <p className="text-xs font-bold text-violet-700 uppercase tracking-widest">Socratic Guide</p>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">&ldquo;{aiData.socratic_guide}&rdquo;</p>
          </div>
        )}

        {aiData.checkup_question && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white p-4 ring-1 ring-emerald-100/60 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs shadow-md shadow-emerald-200">✅</span>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Check-up Question</p>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{aiData.checkup_question}</p>
          </div>
        )}
      </div>
    </article>
  );
}
