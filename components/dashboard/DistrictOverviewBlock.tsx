import type { SeverityLevel } from "@/types/dashboard";
import RiskBadge from "@/components/dashboard/RiskBadge";

type DistrictOverviewItem = {
  id: string;
  name: string;
  healthScore: number;
  riskScore: number;
  severity: SeverityLevel;
  activeAlerts: number;
  mainIssue?: string | null;
};

type DistrictOverviewBlockProps = {
  title?: string;
  subtitle?: string;
  items: DistrictOverviewItem[];
  maxItems?: number;
  emptyMessage?: string;
  className?: string;
};

function healthBarClass(score: number) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-amber-300";
  if (score >= 40) return "bg-orange-400";
  return "bg-rose-400";
}

export default function DistrictOverviewBlock({
  title = "Районы Алматы",
  subtitle = "Районы с наибольшим текущим давлением на систему.",
  items,
  maxItems = 4,
  emptyMessage = "Данные по районам пока недоступны.",
  className = "",
}: DistrictOverviewBlockProps) {
  const visibleItems = [...items]
    .sort((a, b) => a.healthScore - b.healthScore || b.riskScore - a.riskScore)
    .slice(0, maxItems);

  return (
    <section
      className={`rounded-[30px] border border-white/10 bg-white/[0.04] p-6 ${className}`}
    >
      <div>
        <div className="section-label">Территориальный обзор</div>
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
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {item.mainIssue ?? "Выраженная проблемная зона не выделена."}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-semibold text-white">{item.healthScore}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    здоровье
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${healthBarClass(item.healthScore)}`}
                  style={{ width: `${item.healthScore}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <RiskBadge level={item.severity} />
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300">
                  Риск: {item.riskScore}/100
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300">
                  Сигналы: {item.activeAlerts}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}