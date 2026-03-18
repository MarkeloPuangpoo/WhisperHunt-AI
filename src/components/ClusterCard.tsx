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
      ring: "ring-red-300",
      bg: "bg-red-50",
      countBg: "bg-red-500",
      badge: "bg-red-100 text-red-700",
      badgeText: "เร่งด่วน 🔥",
      icon: "🚨",
    };
  if (count >= 3)
    return {
      ring: "ring-amber-300",
      bg: "bg-amber-50",
      countBg: "bg-amber-500",
      badge: "bg-amber-100 text-amber-700",
      badgeText: "ควรเร่ง ⚡",
      icon: "⚠️",
    };
  return {
    ring: "ring-sky-300",
    bg: "bg-sky-50",
    countBg: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    badgeText: "ทั่วไป",
    icon: "💬",
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ClusterCard({ cluster, index }: ClusterCardProps) {
  const { issue, student_count, related_slide, ai_suggestion } = cluster;
  const u = urgencyConfig(student_count);

  return (
    <article
      aria-label={`Cluster ${index + 1}: ${issue}`}
      className={`
        relative flex flex-col gap-4 rounded-2xl p-5
        bg-white ring-2 ${u.ring}
        shadow-sm hover:shadow-md transition-shadow duration-200
      `}
    >
      {/* ── Header row ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Student count bubble */}
          <div
            className={`
              flex h-12 w-12 shrink-0 flex-col items-center justify-center
              rounded-xl ${u.countBg} text-white shadow-sm
            `}
          >
            <span className="text-xl font-extrabold leading-none">
              {student_count}
            </span>
            <span className="text-[9px] font-medium leading-none opacity-80">
              คน
            </span>
          </div>

          {/* Issue & slide tag */}
          <div className="min-w-0">
            <p className="font-bold text-slate-800 leading-snug line-clamp-2">
              {u.icon} {issue}
            </p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              📄 {related_slide}
            </span>
          </div>
        </div>

        {/* Urgency badge */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${u.badge}`}
        >
          {u.badgeText}
        </span>
      </div>

      {/* ── AI Suggestion ────────────────────────────────────────────── */}
      <div className={`rounded-xl p-3 ${u.bg}`}>
        <p className="mb-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
          ✨ คำแนะนำจาก AI
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{ai_suggestion}</p>
      </div>
    </article>
  );
}
