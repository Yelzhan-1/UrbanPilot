import RiskBadge from "@/components/dashboard/RiskBadge";

type RiskLevel = "low" | "medium" | "high" | "critical";

export type AnomalyListItem = {
  id: string;
  title: string;
  sector?: string;
  district?: string;
  severity: RiskLevel;
  metricLabel?: string;
  metricValue?: string;
  detectedAt?: string;
  description?: string;
};

type AnomaliesListProps = {
  items: AnomalyListItem[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
};

function severityRank(s: RiskLevel): number {
  if (s === "critical") return 4;
  if (s === "high") return 3;
  if (s === "medium") return 2;
  return 1;
}

export default function AnomaliesList({
  items,
  title = "Active anomalies",
  subtitle = "Highest severity first",
  emptyMessage = "No anomalies in the current window.",
  maxItems = 8,
  className = "",
}: AnomaliesListProps) {
  const sorted = [...items].sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, maxItems);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signals</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{sorted.length} shown</span>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  {item.description ? <p className="mt-1 text-xs text-slate-400">{item.description}</p> : null}
                </div>
                <RiskBadge level={item.severity} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {item.sector ? <span>Sector: <span className="text-slate-300">{item.sector}</span></span> : null}
                {item.district ? <span>District: <span className="text-slate-300">{item.district}</span></span> : null}
                {item.metricLabel && item.metricValue ? (
                  <span>
                    {item.metricLabel}: <span className="text-slate-300">{item.metricValue}</span>
                  </span>
                ) : null}
                {item.detectedAt ? <span>Detected: <span className="text-slate-300">{item.detectedAt}</span></span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}