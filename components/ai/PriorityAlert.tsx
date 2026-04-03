type Severity = "low" | "medium" | "high" | "critical";

type PriorityAlertProps = {
  title: string;
  message: string;
  severity: Severity;
  sector?: string;
  district?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
};

const severityContainer: Record<Severity, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10",
  medium: "border-amber-500/30 bg-amber-500/10",
  high: "border-orange-500/30 bg-orange-500/10",
  critical: "border-rose-500/40 bg-rose-500/10",
};

const severityText: Record<Severity, string> = {
  low: "text-emerald-300",
  medium: "text-amber-300",
  high: "text-orange-300",
  critical: "text-rose-300",
};

export default function PriorityAlert({
  title,
  message,
  severity,
  sector,
  district,
  actionLabel = "Open Response Plan",
  onActionClick,
  className = "",
}: PriorityAlertProps) {
  return (
    <section
      className={`rounded-2xl border p-4 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${severityContainer[severity]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs uppercase tracking-[0.2em] ${severityText[severity]}`}>Priority Alert</p>
          <h3 className="mt-1 text-base font-semibold text-slate-100">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-200">{message}</p>
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${severityText[severity]} ring-current/30`}>
          {severity.toUpperCase()}
        </span>
      </div>

      {(sector || district) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {sector && <span className="rounded-full bg-slate-900/60 px-2.5 py-1 text-slate-200 ring-1 ring-white/10">{sector}</span>}
          {district && <span className="rounded-full bg-slate-900/60 px-2.5 py-1 text-slate-200 ring-1 ring-white/10">{district}</span>}
        </div>
      )}

      {onActionClick && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onActionClick}
            className="rounded-lg bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-white/15 transition hover:bg-slate-900"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}