import Link from "next/link";
import { ReactNode } from "react";
import RiskBadge from "@/components/dashboard/RiskBadge";

type RiskLevel = "low" | "medium" | "high" | "critical";

type HighlightItem = {
  id: string;
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
};

type ActionItem = {
  id: string;
  label: string;
  href?: string;
};

type ExecutiveSummaryBlockProps = {
  title?: string;
  summary: string;
  riskLevel: RiskLevel;
  updatedAt?: string;
  cityName?: string;
  highlights?: HighlightItem[];
  primaryActions?: ActionItem[];
  className?: string;
};

function toneClass(tone: HighlightItem["tone"]): string {
  if (tone === "good") return "text-emerald-300";
  if (tone === "bad") return "text-rose-300";
  return "text-slate-200";
}

function renderAction(action: ActionItem): ReactNode {
  if (!action.href) {
    return (
      <span
        key={action.id}
        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
      >
        {action.label}
      </span>
    );
  }

  if (action.href.startsWith("/")) {
    return (
      <Link
        key={action.id}
        href={action.href}
        className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/30"
      >
        {action.label}
      </Link>
    );
  }

  return (
    <a
      key={action.id}
      href={action.href}
      className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/30"
    >
      {action.label}
    </a>
  );
}

export default function ExecutiveSummaryBlock({
  title = "Executive Summary",
  summary,
  riskLevel,
  updatedAt,
  cityName,
  highlights = [],
  primaryActions = [],
  className = "",
}: ExecutiveSummaryBlockProps) {
  return (
    <section
      className={`rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 shadow-[0_18px_60px_-35px_rgba(0,0,0,1)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Briefing</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>
          {cityName || updatedAt ? (
            <p className="mt-1 text-xs text-slate-400">
              {cityName ? <span>{cityName}</span> : null}
              {cityName && updatedAt ? <span className="mx-1">·</span> : null}
              {updatedAt ? <span>Updated {updatedAt}</span> : null}
            </p>
          ) : null}
        </div>
        <RiskBadge level={riskLevel} />
      </div>

      <div className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
        <p className="text-sm leading-relaxed text-slate-200">{summary}</p>
      </div>

      {highlights.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{h.label}</p>
              <p className={`mt-1 text-sm font-medium ${toneClass(h.tone)}`}>{h.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {primaryActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
          {primaryActions.map(renderAction)}
        </div>
      ) : null}
    </section>
  );
}