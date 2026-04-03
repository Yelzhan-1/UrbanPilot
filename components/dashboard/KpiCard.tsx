import { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  icon?: ReactNode;
  className?: string;
};

function trendColor(trend?: "up" | "down" | "flat"): string {
  if (trend === "up") return "text-rose-300";
  if (trend === "down") return "text-emerald-300";
  return "text-slate-400";
}

export default function KpiCard({
  label,
  value,
  hint,
  trend,
  trendLabel,
  icon,
  className = "",
}: KpiCardProps) {
  return (
    <article
      className={`rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm ring-1 ring-white/5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {icon ? <span className="text-slate-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {trendLabel && trend ? (
        <p className={`mt-2 text-xs font-medium ${trendColor(trend)}`}>{trendLabel}</p>
      ) : null}
    </article>
  );
}