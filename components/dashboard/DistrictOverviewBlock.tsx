import RiskBadge from "@/components/dashboard/RiskBadge";

type RiskLevel = "low" | "medium" | "high" | "critical";

export type DistrictOverviewRow = {
  id: string;
  name: string;
  riskScore: number; // 0–100
  level: RiskLevel;
  alerts?: number;
};

type DistrictOverviewBlockProps = {
  districts: DistrictOverviewRow[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  maxItems?: number;
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

export default function DistrictOverviewBlock({
  districts,
  title = "District overview",
  subtitle = "Highest risk districts",
  emptyMessage = "No district data available.",
  maxItems = 6,
  className = "",
}: DistrictOverviewBlockProps) {
  const rows = [...districts]
    .sort((a, b) => clamp(b.riskScore) - clamp(a.riskScore))
    .slice(0, maxItems);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Geography</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{rows.length} districts</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((d) => {
            const s = clamp(d.riskScore);
            return (
              <li key={d.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">{d.name}</p>
                  <div className="flex items-center gap-2">
                    {typeof d.alerts === "number" ? (
                      <span className="text-xs text-slate-500">Alerts: {d.alerts}</span>
                    ) : null}
                    <RiskBadge level={d.level} />
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <span className="text-2xl font-bold tabular-nums text-slate-50">{s}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                  <div className={`h-1.5 rounded-full ${barColor(s)}`} style={{ width: `${s}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}