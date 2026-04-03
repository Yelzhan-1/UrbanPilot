type Severity = "low" | "medium" | "high" | "critical";

type DistrictRiskRow = {
  id: string;
  name: string;
  riskScore: number; // 0-100
  severity: Severity;
  activeAlerts?: number;
  trend?: "rising" | "stable" | "falling";
  transport: number; // 0-100
  ecology: number; // 0-100
  safety: number; // 0-100
  utilities: number; // 0-100
};

type DistrictRiskTableProps = {
  rows: DistrictRiskRow[];
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  title?: string;
  subtitle?: string;
  className?: string;
};

const severityBadgeStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

function trendStyles(trend?: "rising" | "stable" | "falling"): string {
  if (trend === "rising") return "text-rose-300";
  if (trend === "falling") return "text-emerald-300";
  return "text-slate-300";
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function riskBarColor(score: number): string {
  if (score >= 85) return "bg-rose-500";
  if (score >= 65) return "bg-orange-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function sortRows(rows: DistrictRiskRow[]): DistrictRiskRow[] {
  const rank = (s: Severity): number => (s === "critical" ? 4 : s === "high" ? 3 : s === "medium" ? 2 : 1);

  return [...rows].sort((a, b) => {
    if (rank(b.severity) !== rank(a.severity)) return rank(b.severity) - rank(a.severity);
    return clamp(b.riskScore) - clamp(a.riskScore);
  });
}

export default function DistrictRiskTable({
  rows,
  selectedDistrictId,
  onSelectDistrict,
  title = "District Risk Comparison",
  subtitle = "Compare district pressure and prioritize intervention zones.",
  className = "",
}: DistrictRiskTableProps) {
  const sorted = sortRows(rows);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">District Analysis</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{sorted.length} districts</span>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          No district risk data available.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Alerts</th>
                <th className="px-3 py-2">Trend</th>
                <th className="px-3 py-2">T</th>
                <th className="px-3 py-2">E</th>
                <th className="px-3 py-2">S</th>
                <th className="px-3 py-2">U</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const isSelected = selectedDistrictId === row.id;
                const risk = clamp(row.riskScore);

                return (
                  <tr
                    key={row.id}
                    className={`rounded-xl bg-slate-900/70 transition ${isSelected ? "ring-1 ring-cyan-400/40" : "hover:bg-slate-900"}`}
                  >
                    <td className="rounded-l-xl px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onSelectDistrict?.(row.id)}
                        className="text-left"
                      >
                        <p className="text-sm font-semibold text-slate-100">{row.name}</p>
                        <p className="text-xs text-slate-400">Click to inspect details</p>
                      </button>
                    </td>

                    <td className="px-3 py-3">
                      <div className="min-w-[140px]">
                        <p className="text-sm font-semibold text-slate-100">{risk}/100</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
                          <div className={`h-1.5 rounded-full ${riskBarColor(risk)}`} style={{ width: `${risk}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityBadgeStyles[row.severity]}`}>
                        {row.severity}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-200">{row.activeAlerts ?? 0}</td>

                    <td className={`px-3 py-3 text-sm font-medium ${trendStyles(row.trend)}`}>
                      {row.trend ?? "stable"}
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-200">{clamp(row.transport)}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{clamp(row.ecology)}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{clamp(row.safety)}</td>
                    <td className="rounded-r-xl px-3 py-3 text-sm text-slate-200">{clamp(row.utilities)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}