import type { SeverityLevel, Sector } from "@/types/dashboard";

type TopAnomalyItem = {
  id: string;
  title: string;
  description?: string;
  severity: SeverityLevel;
  sector: Sector;
  district: string;
  metricLabel?: string;
  metricValue?: string;
  detectedAt: string;
  aiRiskScore: number;
};

type TopAnomaliesBlockProps = {
  title?: string;
  subtitle?: string;
  items: TopAnomalyItem[];
  maxItems?: number;
  emptyMessage?: string;
  className?: string;
};

function severityRank(value: SeverityLevel) {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function severityLabel(value: SeverityLevel) {
  if (value === "critical") return "Критический";
  if (value === "high") return "Высокий";
  if (value === "medium") return "Средний";
  return "Низкий";
}

function severityClass(value: SeverityLevel) {
  if (value === "critical") {
    return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30";
  }
  if (value === "high") {
    return "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30";
  }
  if (value === "medium") {
    return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30";
  }
  return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30";
}

function sectorLabel(value: Sector) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  return "Инфраструктура";
}

export default function TopAnomaliesBlock({
  title = "Сигналы по району",
  subtitle = "Наиболее сильные аномалии, влияющие на выбранный район.",
  items,
  maxItems = 5,
  emptyMessage = "Сильных сигналов по выбранному району сейчас нет.",
  className = "",
}: TopAnomaliesBlockProps) {
  const topItems = [...items]
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        b.aiRiskScore - a.aiRiskScore,
    )
    .slice(0, maxItems);

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Мониторинг сигналов
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {topItems.length} в фокусе
        </span>
      </div>

      {topItems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {topItems.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-white/10 bg-slate-900/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </h4>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${severityClass(
                    item.severity,
                  )}`}
                >
                  {severityLabel(item.severity)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                <p>
                  <span className="text-slate-500">Сектор:</span>{" "}
                  {sectorLabel(item.sector)}
                </p>
                <p>
                  <span className="text-slate-500">Район:</span> {item.district}
                </p>
                <p>
                  <span className="text-slate-500">
                    {item.metricLabel ?? "Метрика"}:
                  </span>{" "}
                  {item.metricValue ?? "—"}
                </p>
                <p>
                  <span className="text-slate-500">Обнаружено:</span>{" "}
                  {item.detectedAt}
                </p>
              </div>

              <div className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">
                Индекс риска ИИ: {item.aiRiskScore}/100
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}