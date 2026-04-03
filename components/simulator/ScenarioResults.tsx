type Severity = "low" | "medium" | "high" | "critical";

type SectorRisk = {
  transport: number;
  ecology: number;
  safety: number;
  utilities: number;
};

type ScenarioResultsProps = {
  scenarioLabel: string;
  intensity: number; // 0-100
  baselineRisk: number; // 0-100
  projectedRisk: number; // 0-100
  beforeSectors: SectorRisk;
  afterSectors: SectorRisk;
  className?: string;
};

type SectorItem = {
  key: keyof SectorRisk;
  label: string;
};

const SECTORS: SectorItem[] = [
  { key: "transport", label: "Transport" },
  { key: "ecology", label: "Ecology" },
  { key: "safety", label: "Safety" },
  { key: "utilities", label: "Utilities" },
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function severityFromScore(score: number): Severity {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function severityStyle(severity: Severity): string {
  if (severity === "critical") return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30";
  if (severity === "high") return "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30";
  if (severity === "medium") return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30";
  return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30";
}

function barColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function deltaColor(delta: number): string {
  if (delta > 0) return "text-rose-300";
  if (delta < 0) return "text-emerald-300";
  return "text-slate-300";
}

export default function ScenarioResults({
  scenarioLabel,
  intensity,
  baselineRisk,
  projectedRisk,
  beforeSectors,
  afterSectors,
  className = "",
}: ScenarioResultsProps) {
  const base = clamp(baselineRisk);
  const projected = clamp(projectedRisk);
  const delta = projected - base;
  const projectedSeverity = severityFromScore(projected);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Simulation Results</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{scenarioLabel}</h3>
          <p className="mt-1 text-sm text-slate-400">Intensity: {clamp(intensity)}%</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyle(projectedSeverity)}`}>
          {projectedSeverity.toUpperCase()} RISK
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Baseline Risk</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{base}/100</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
            <div className={`h-1.5 rounded-full ${barColor(base)}`} style={{ width: `${base}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Projected Risk</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{projected}/100</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
            <div className={`h-1.5 rounded-full ${barColor(projected)}`} style={{ width: `${projected}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Risk Delta</p>
          <p className={`mt-1 text-2xl font-semibold ${deltaColor(delta)}`}>{delta > 0 ? "+" : ""}{delta}</p>
          <p className="mt-2 text-xs text-slate-400">
            {delta > 0 ? "Risk worsens under this scenario." : delta < 0 ? "Risk improves under this scenario." : "No net change."}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Sector Impacts</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SECTORS.map((sector) => {
            const before = clamp(beforeSectors[sector.key]);
            const after = clamp(afterSectors[sector.key]);
            const change = after - before;

            return (
              <article key={sector.key} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-100">{sector.label}</p>
                  <p className={`text-xs font-semibold ${deltaColor(change)}`}>
                    {change > 0 ? "+" : ""}{change}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                      <span>Before</span>
                      <span>{before}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div className={`h-1.5 rounded-full ${barColor(before)}`} style={{ width: `${before}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                      <span>After</span>
                      <span>{after}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div className={`h-1.5 rounded-full ${barColor(after)}`} style={{ width: `${after}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}