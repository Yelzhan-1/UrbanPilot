import RiskBadge from "@/components/dashboard/RiskBadge";

type RiskLevel = "low" | "medium" | "high" | "critical";

export type ForecastDriver = {
  id: string;
  label: string;
  value: string;
  impact?: RiskLevel;
  contribution?: number; // 0–100 optional weight for display
};

type ForecastBlockProps = {
  headline?: string;
  summary?: string;
  horizon?: string;
  confidence?: number; // 0–100
  drivers: ForecastDriver[];
  emptyMessage?: string;
  className?: string;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function barColor(v: number): string {
  if (v >= 75) return "bg-rose-500";
  if (v >= 50) return "bg-orange-500";
  if (v >= 30) return "bg-amber-500";
  return "bg-cyan-500";
}

export default function ForecastBlock({
  headline = "Forecast",
  summary,
  horizon,
  confidence,
  drivers,
  emptyMessage = "No forecast drivers available.",
  className = "",
}: ForecastBlockProps) {
  const conf = typeof confidence === "number" ? clamp(confidence, 0, 100) : null;

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Outlook</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-100">{headline}</h2>
          {summary ? <p className="mt-2 max-w-2xl text-sm text-slate-300">{summary}</p> : null}
          {horizon ? <p className="mt-2 text-xs text-slate-500">Horizon: {horizon}</p> : null}
        </div>
        {conf !== null ? (
          <div className="min-w-[140px] rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Confidence</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-100">{conf}%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${conf}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      {drivers.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {drivers.map((d) => {
            const w = typeof d.contribution === "number" ? clamp(d.contribution, 0, 100) : null;
            return (
              <li key={d.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{d.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{d.value}</p>
                  </div>
                  {d.impact ? <RiskBadge level={d.impact} label={`${d.impact} impact`} /> : null}
                </div>
                {w !== null ? (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                      <span>Weight</span>
                      <span className="tabular-nums text-slate-300">{w}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div className={`h-1.5 rounded-full ${barColor(w)}`} style={{ width: `${w}%` }} />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
