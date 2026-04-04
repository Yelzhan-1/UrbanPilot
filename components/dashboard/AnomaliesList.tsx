import RiskBadge from "@/components/dashboard/RiskBadge";
import type { SeverityLevel, Sector } from "@/types/dashboard";

type AnomalyListItem = {
  id: string;
  title: string;
  district: string;
  sector: Sector;
  severity: SeverityLevel;
  aiRiskScore: number;
  detectedAt: string;
  description?: string;
};

type AnomaliesListProps = {
  title?: string;
  subtitle?: string;
  items: AnomalyListItem[];
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

function sectorLabel(value: Sector) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  return "Инфраструктура";
}

function dotClass(value: SeverityLevel) {
  if (value === "critical") {
    return "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.65)]";
  }
  if (value === "high") {
    return "bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.55)]";
  }
  if (value === "medium") {
    return "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.55)]";
  }
  return "bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.55)]";
}

export default function AnomaliesList({
  title = "Уведомления ИИ",
  subtitle = "Наиболее сильные сигналы текущего цикла мониторинга.",
  items,
  maxItems = 4,
  emptyMessage = "Активные сигналы пока не найдены.",
  className = "",
}: AnomaliesListProps) {
  const visibleItems = [...items]
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        b.aiRiskScore - a.aiRiskScore,
    )
    .slice(0, maxItems);

  return (
    <section
      className={`rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 ${className}`}
    >
      <div>
        <div className="section-label">Мониторинг сигналов</div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : (
          visibleItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{item.district}</div>
                  {item.description ? (
                    <div className="mt-2 text-sm leading-6 text-slate-400">
                      {item.description}
                    </div>
                  ) : null}
                </div>

                <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${dotClass(item.severity)}`} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RiskBadge level={item.severity} />
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300">
                  {sectorLabel(item.sector)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300">
                  Риск ИИ: {item.aiRiskScore}/100
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {item.detectedAt}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}