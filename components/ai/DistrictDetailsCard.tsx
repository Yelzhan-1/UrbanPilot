type Severity = "low" | "medium" | "high" | "critical";

type DistrictDetails = {
  id: string;
  name: string;
  riskScore: number; // 0-100
  severity: Severity;
  activeAlerts: number;
  criticalAlerts?: number;
  trend?: "rising" | "stable" | "falling";
  population?: number;
  updatedAt?: string;
  summary?: string;
  topIssue?: string;
  recommendedAction?: string;
};

type DistrictDetailsCardProps = {
  district: DistrictDetails | null;
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

function barColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function trendStyles(trend?: "rising" | "stable" | "falling"): string {
  if (trend === "rising") return "text-rose-300";
  if (trend === "falling") return "text-emerald-300";
  return "text-slate-300";
}

export default function DistrictDetailsCard({
  district,
  title = "Selected District",
  className = "",
}: DistrictDetailsCardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">District Intelligence</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      </div>

      {!district ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          Select a district to inspect detailed risk signals and recommended response.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">District</p>
                <h4 className="mt-1 text-xl font-semibold text-slate-100">{district.name}</h4>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[district.severity]}`}>
                {district.severity} risk
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>Overall Risk Score</span>
                <span className="text-slate-200">{clamp(district.riskScore)}/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className={`h-2 rounded-full ${barColor(clamp(district.riskScore))}`} style={{ width: `${clamp(district.riskScore)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Active Alerts</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">{district.activeAlerts}</p>
              <p className="mt-2 text-xs text-slate-400">
                Critical: <span className="text-rose-300">{district.criticalAlerts ?? 0}</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Trend</p>
              <p className={`mt-1 text-2xl font-semibold ${trendStyles(district.trend)}`}>{district.trend ?? "stable"}</p>
              <p className="mt-2 text-xs text-slate-400">
                {district.population ? `Population: ${district.population.toLocaleString()}` : "Population not provided"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Operational Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {district.summary ?? "No summary provided for this district."}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Top Issue</p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {district.topIssue ?? "No issue identified"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Recommended Action</p>
                <p className="mt-1 text-sm font-medium text-cyan-200">
                  {district.recommendedAction ?? "No action suggested"}
                </p>
              </div>
            </div>

            {district.updatedAt && <p className="mt-3 text-xs text-slate-500">Updated: {district.updatedAt}</p>}
          </div>
        </div>
      )}
    </section>
  );
}