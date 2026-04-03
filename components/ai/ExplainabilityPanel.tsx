type Severity = "low" | "medium" | "high" | "critical";

type ExplainabilityFactor = {
  id: string;
  label: string;
  value: string;
  contribution: number; // 0-100
  direction: "up" | "down" | "neutral"; // impact on risk
  severity?: Severity;
};

type ExplainabilityPanelProps = {
  title?: string;
  rationale?: string;
  confidence?: number; // 0-100
  factors: ExplainabilityFactor[];
  className?: string;
};

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function directionStyle(direction: "up" | "down" | "neutral"): string {
  if (direction === "up") return "text-rose-300";
  if (direction === "down") return "text-emerald-300";
  return "text-slate-300";
}

function directionLabel(direction: "up" | "down" | "neutral"): string {
  if (direction === "up") return "increases risk";
  if (direction === "down") return "reduces risk";
  return "neutral impact";
}

function contributionBarColor(value: number): string {
  if (value >= 75) return "bg-rose-500";
  if (value >= 50) return "bg-orange-500";
  if (value >= 30) return "bg-amber-500";
  return "bg-cyan-500";
}

export default function ExplainabilityPanel({
  title = "Why the AI predicts this risk",
  rationale = "The model combines current anomalies, district pressure, and short-term forecasts to explain risk changes.",
  confidence = 0,
  factors,
  className = "",
}: ExplainabilityPanelProps) {
  const confidenceValue = clamp(confidence, 0, 100);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Explainability</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">{rationale}</p>
        </div>

        <div className="min-w-[180px] rounded-xl border border-white/10 bg-slate-900/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Confidence</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{confidenceValue}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${confidenceValue}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {factors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
            No explainability factors were supplied.
          </div>
        ) : (
          factors.map((factor) => {
            const contribution = clamp(factor.contribution, 0, 100);
            return (
              <article key={factor.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{factor.label}</h4>
                    <p className="mt-1 text-sm text-slate-300">{factor.value}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {factor.severity && (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${severityStyles[factor.severity]}`}>
                        {factor.severity}
                      </span>
                    )}
                    <span className={`rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium ring-1 ring-white/10 ${directionStyle(factor.direction)}`}>
                      {directionLabel(factor.direction)}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Contribution weight</span>
                    <span className="text-slate-200">{contribution}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div className={`h-2 rounded-full ${contributionBarColor(contribution)}`} style={{ width: `${contribution}%` }} />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}