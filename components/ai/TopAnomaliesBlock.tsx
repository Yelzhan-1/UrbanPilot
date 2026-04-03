type Severity = "low" | "medium" | "high" | "critical";

type AnomalyItem = {
  id: string;
  title: string;
  sector: string;
  district: string;
  severity: Severity;
  metricLabel: string;
  metricValue: string;
  detectedAt: string;
  trend?: "rising" | "stable" | "falling";
  description?: string;
};

type TopAnomaliesBlockProps = {
  title?: string;
  items: AnomalyItem[];
  maxItems?: number;
  emptyMessage?: string;
  className?: string;
};

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

function severityRank(value: Severity): number {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function trendStyle(trend: "rising" | "stable" | "falling" | undefined): string {
  if (trend === "rising") return "text-rose-300";
  if (trend === "falling") return "text-emerald-300";
  return "text-slate-300";
}

export default function TopAnomaliesBlock({
  title = "Top Active Anomalies",
  items,
  maxItems = 5,
  emptyMessage = "No anomalies detected in the current time window.",
  className = "",
}: TopAnomaliesBlockProps) {
  const topItems = [...items].sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, maxItems);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signal Monitoring</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{topItems.length} tracked</span>
      </div>

      {topItems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">{emptyMessage}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {topItems.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                  {item.description && <p className="mt-1 text-sm text-slate-300">{item.description}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${severityStyles[item.severity]}`}>{item.severity}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-slate-500">Sector:</span> {item.sector}</p>
                <p><span className="text-slate-500">District:</span> {item.district}</p>
                <p><span className="text-slate-500">{item.metricLabel}:</span> {item.metricValue}</p>
                <p><span className="text-slate-500">Detected:</span> {item.detectedAt}</p>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3 text-xs">
                <span className={`${trendStyle(item.trend)} rounded-full bg-slate-800 px-2.5 py-1 ring-1 ring-white/10`}>
                  Trend: {item.trend ?? "stable"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}