import type { SeverityLevel } from "@/types/dashboard";

type DistrictDetails = {
  id: string;
  name: string;
  healthScore: number;
  riskScore: number;
  severity: SeverityLevel;
  status: string;
  activeAlerts: number;
  population?: number;
  summary?: string;
  topIssue?: string;
  recommendedAction?: string;
};

type DistrictDetailsCardProps = {
  district: DistrictDetails | null;
  title?: string;
  className?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
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

function barClass(score: number) {
  if (score >= 80) return "bg-rose-400";
  if (score >= 65) return "bg-orange-400";
  if (score >= 50) return "bg-amber-300";
  return "bg-emerald-400";
}

export default function DistrictDetailsCard({
  district,
  title = "Карточка района",
  className = "",
}: DistrictDetailsCardProps) {
  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Районная аналитика
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      </div>

      {!district ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          Выбери район, чтобы открыть подробную карточку с его состоянием,
          проблемами и приоритетными действиями.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Район
                </p>
                <h4 className="mt-1 text-xl font-semibold text-slate-100">
                  {district.name}
                </h4>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClass(
                  district.severity,
                )}`}
              >
                {severityLabel(district.severity)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Оперативное здоровье
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {clamp(district.healthScore)}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Риск
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {clamp(district.riskScore)}/100
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Активные сигналы
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {district.activeAlerts}
                </div>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
              <div
                className={`h-2.5 rounded-full ${barClass(district.riskScore)}`}
                style={{ width: `${clamp(district.riskScore)}%` }}
              />
            </div>

            <div className="mt-3 text-sm text-slate-400">{district.status}</div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Краткая сводка
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {district.summary ?? "Сводка по району пока недоступна."}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Главная проблема
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {district.topIssue ?? "Явно выраженная проблемная зона не выделена."}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Рекомендуемое действие
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {district.recommendedAction ??
                  "Рекомендация по выбранному району пока не сформирована."}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}