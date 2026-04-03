type Severity = "low" | "medium" | "high" | "critical";

type SectorScore = {
  sector: string;
  score: number; // 0-100
  delta?: number; // positive = worsening, negative = improving
  severity?: Severity;
};

type AiSummaryProps = {
  title?: string;
  cityName?: string;
  overallRiskScore: number; // 0-100
  severity: Severity;
  confidence: number; // 0-100
  activeAlerts: number;
  recommendationCount: number;
  generatedAt?: string;
  sectors?: SectorScore[];
  className?: string;
};

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

const severityLabel: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreBarColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function AiSummary({
  title = "AI Situation Summary",
  cityName = "UrbanPilot City",
  overallRiskScore,
  severity,
  confidence,
  activeAlerts,
  recommendationCount,
  generatedAt,
  sectors = [],
  className = "",
}: AiSummaryProps) {
  const risk = clamp(overallRiskScore, 0, 100);
  const confidenceValue = clamp(confidence, 0, 100);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Decision Center</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{cityName}</p>
        </div>

        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[severity]}`}>
          {severityLabel[severity]} Priority
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Overall Risk</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-100">{risk}</p>
            <p className="pb-1 text-xs text-slate-400">/100</p>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
            <div className={`h-2 rounded-full ${scoreBarColor(risk)}`} style={{ width: `${risk}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Model Confidence</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-2xl font-bold text-slate-100">{confidenceValue}%</p>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${confidenceValue}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active Alerts</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{activeAlerts}</p>
          <p className="mt-2 text-xs text-slate-400">Across all monitored sectors</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Recommended Actions</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{recommendationCount}</p>
          <p className="mt-2 text-xs text-slate-400">{generatedAt ? `Updated ${generatedAt}` : "Latest inference cycle"}</p>
        </div>
      </div>

      {sectors.length > 0 && (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Sector Risk Split</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {sectors.map((item) => {
              const score = clamp(item.score, 0, 100);
              const impliedSeverity: Severity =
                item.severity ?? (score >= 85 ? "critical" : score >= 65 ? "high" : score >= 40 ? "medium" : "low");

              return (
                <div key={item.sector} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">{item.sector}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${severityStyles[impliedSeverity]}`}>
                      {severityLabel[impliedSeverity]}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{score}</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className={`h-1.5 rounded-full ${scoreBarColor(score)}`} style={{ width: `${score}%` }} />
                  </div>
                  {typeof item.delta === "number" && (
                    <p className={`mt-2 text-xs ${item.delta > 0 ? "text-rose-300" : item.delta < 0 ? "text-emerald-300" : "text-slate-400"}`}>
                      {item.delta > 0 ? "+" : ""}
                      {item.delta} vs last period
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}