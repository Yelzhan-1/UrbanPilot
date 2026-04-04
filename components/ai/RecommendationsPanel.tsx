type Severity = "low" | "medium" | "high" | "critical";
type RecommendationStatus = "pending" | "in_progress" | "scheduled" | "done";

type RecommendationItem = {
  id: string;
  title: string;
  description: string;
  sector: string;
  severity: Severity;
  eta?: string;
  impact?: string;
  status?: RecommendationStatus;
};

type RecommendationsPanelProps = {
  title?: string;
  subtitle?: string;
  items: RecommendationItem[];
  maxItems?: number;
  emptyMessage?: string;
  onActionClick?: (item: RecommendationItem) => void;
  className?: string;
};

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30",
  critical: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30",
};

const statusStyles: Record<RecommendationStatus, string> = {
  pending: "bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/30",
  in_progress: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30",
  scheduled: "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30",
  done: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
};

function severityRank(value: Severity): number {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function severityLabel(value: Severity) {
  if (value === "critical") return "критический";
  if (value === "high") return "высокий";
  if (value === "medium") return "средний";
  return "низкий";
}

function statusLabel(value: RecommendationStatus) {
  if (value === "pending") return "ожидает";
  if (value === "in_progress") return "в работе";
  if (value === "scheduled") return "запланировано";
  return "завершено";
}

function sectorLabel(value: string) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  if (value === "Utilities") return "Инфраструктура";
  return value;
}

function itemWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "действие";
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    !(count % 100 >= 12 && count % 100 <= 14)
  ) {
    return "действия";
  }
  return "действий";
}

export default function RecommendationsPanel({
  title = "Рекомендуемые действия",
  subtitle = "Упорядочено по severity и ожидаемому влиянию",
  items,
  maxItems = 6,
  emptyMessage = "Для текущего состояния рекомендации пока недоступны.",
  onActionClick,
  className = "",
}: RecommendationsPanelProps) {
  const sorted = [...items]
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, maxItems);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            AI рекомендации
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {sorted.length} {itemWord(sorted.length)}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sorted.map((item, index) => (
            <article
              key={item.id}
              className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">#{index + 1}</p>
                  <h4 className="mt-0.5 text-sm font-semibold text-slate-100">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${severityStyles[item.severity]}`}
                  >
                    {severityLabel(item.severity)}
                  </span>

                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
                    {sectorLabel(item.sector)}
                  </span>

                  {item.status && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[item.status]}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  {item.eta && (
                    <p>
                      Срок: <span className="text-slate-200">{item.eta}</span>
                    </p>
                  )}
                  {item.impact && (
                    <p>
                      Ожидаемый эффект:{" "}
                      <span className="text-slate-200">{item.impact}</span>
                    </p>
                  )}
                </div>

                {onActionClick && (
                  <button
                    type="button"
                    onClick={() => onActionClick(item)}
                    className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/30 transition hover:bg-cyan-500/30"
                  >
                    Открыть план
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}