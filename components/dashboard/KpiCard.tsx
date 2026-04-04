import type { ReactNode } from "react";

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
      className={`rounded-[26px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {value}
          </div>
        </div>

        {icon ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-200">
            {icon}
          </div>
        ) : null}
      </div>

      {hint ? (
        <div className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-500">
          {hint}
        </div>
      ) : null}

      {trendLabel && trend ? (
        <p className={`mt-2 text-xs font-medium ${trendColor(trend)}`}>
          {trendLabel}
        </p>
      ) : null}
    </article>
  );
}