import RiskBadge from "@/components/dashboard/RiskBadge";

type RiskLevel = "low" | "medium" | "high" | "critical";

type SectorCardProps = {
  name: string;
  score: number; // 0–100
  level: RiskLevel;
  description?: string;
  delta?: number;
  className?: string;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function barColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function SectorCard({
  name,
  score,
  level,
  description,
  delta,
  className = "",
}: SectorCardProps) {
  const s = clamp(score);

  return (
    <article
      className={`flex flex-col rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm ring-1 ring-white/5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100">{name}</h3>
        <RiskBadge level={level} />
      </div>
      {description ? <p className="mt-1 text-xs text-slate-400">{description}</p> : null}
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums text-slate-50">{s}</p>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className={`h-2 rounded-full transition-all ${barColor(s)}`} style={{ width: `${s}%` }} />
      </div>
      {typeof delta === "number" ? (
        <p className={`mt-2 text-xs ${delta > 0 ? "text-rose-300" : delta < 0 ? "text-emerald-300" : "text-slate-500"}`}>
          {delta > 0 ? "+" : ""}
          {delta} vs prior window
        </p>
      ) : null}
    </article>
  );
}