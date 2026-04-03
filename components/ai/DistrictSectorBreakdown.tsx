type Severity = "low" | "medium" | "high" | "critical";

type DistrictSectorBreakdownData = {
  districtName: string;
  severity?: Severity;
  sectors: {
    transport: number; // 0-100
    ecology: number; // 0-100
    safety: number; // 0-100
    utilities: number; // 0-100
  };
};

type DistrictSectorBreakdownProps = {
  data: DistrictSectorBreakdownData | null;
  title?: string;
  className?: string;
};

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getBarColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function getSeverity(score: number): Severity {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export default function DistrictSectorBreakdown({
  data,
  title = "Sector Risk Breakdown",
  className = "",
}: DistrictSectorBreakdownProps) {
  const sectorList = data
    ? [
        { key: "transport", label: "Transport", score: clamp(data.sectors.transport) },
        { key: "ecology", label: "Ecology", score: clamp(data.sectors.ecology) },
        { key: "safety", label: "Safety", score: clamp(data.sectors.safety) },
        { key: "utilities", label: "Utilities", score: clamp(data.sectors.utilities) },
      ]
    : [];

  const average =
    sectorList.length > 0
      ? Math.round(sectorList.reduce((acc, sector) => acc + sector.score, 0) / sectorList.length)
      : 0;

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sector Diagnostics</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {data ? `${data.districtName} district` : "Select a district to view sector pressure"}
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-2">
            {data.severity && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityStyles[data.severity]}`}>
                {data.severity}
              </span>
            )}
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              Avg {average}/100
            </span>
          </div>
        )}
      </div>

      {!data ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          No district selected yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {sectorList.map((sector) => {
            const sectorSeverity = getSeverity(sector.score);
            return (
              <article key={sector.key} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-100">{sector.label}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityStyles[sectorSeverity]}`}>
                    {sectorSeverity}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Score</span>
                    <span className="text-slate-200">{sector.score}/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div className={`h-2 rounded-full ${getBarColor(sector.score)}`} style={{ width: `${sector.score}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}