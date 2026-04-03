type RiskLevel = "low" | "medium" | "high" | "critical";

type RiskBadgeProps = {
  level: RiskLevel;
  label?: string;
  className?: string;
};

const STYLES: Record<RiskLevel, string> = {
  low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/35",
  medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/35",
  high: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/35",
  critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40",
};

const DEFAULT_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export default function RiskBadge({ level, label, className = "" }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[level]} ${className}`}
    >
      {label ?? DEFAULT_LABELS[level]}
    </span>
  );
}