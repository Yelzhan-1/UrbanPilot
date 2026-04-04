import type { SeverityLevel, SectorScores } from "@/types/dashboard";

type DistrictSectorBreakdownData = {
  districtName: string;
  sectors: SectorScores;
  severity?: SeverityLevel;
};

type DistrictSectorBreakdownProps = {
  data: DistrictSectorBreakdownData | null;
  title?: string;
  className?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function barClass(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-cyan-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function levelLabel(score: number) {
  if (score >= 85) return "Стабильно";
  if (score >= 65) return "Под контролем";
  if (score >= 40) return "Нужен контроль";
  return "Нагрузка высокая";
}

function severityLabel(value?: SeverityLevel) {
  if (!value) return null;
  if (value === "critical") return "Критический";
  if (value === "high") return "Высокий";
  if (value === "medium") return "Средний";
  return "Низкий";
}

function severityClass(value?: SeverityLevel) {
  if (!value) return "bg-slate-800 text-slate-300";
  if (value === "critical") return "bg-rose-500/10 text-rose-300";
  if (value === "high") return "bg-orange-500/10 text-orange-300";
  if (value === "medium") return "bg-amber-500/10 text-amber-300";
  return "bg-emerald-500/10 text-emerald-300";
}

export default function DistrictSectorBreakdown({
  data,
  title = "Секторный разбор",
  className = "",
}: DistrictSectorBreakdownProps) {
  const sectorList = data
    ? [
        { key: "transport", label: "Транспорт", score: clamp(data.sectors.transport) },
        { key: "ecology", label: "Экология", score: clamp(data.sectors.ecology) },
        { key: "safety", label: "Безопасность", score: clamp(data.sectors.safety) },
        { key: "utilities", label: "Инфраструктура", score: clamp(data.sectors.utilities) },
      ]
    : [];

  const average =
    sectorList.length > 0
      ? Math.round(
          sectorList.reduce((acc, sector) => acc + sector.score, 0) / sectorList.length,
        )
      : 0;

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Диагностика по секторам
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {data
              ? `${data.districtName}`
              : "Выбери район, чтобы посмотреть секторный профиль."}
          </p>
        </div>

        {data ? (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityClass(
                data.severity,
              )}`}
            >
              {severityLabel(data.severity)}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              Среднее: {average}/100
            </span>
          </div>
        ) : null}
      </div>

      {!data ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          Район ещё не выбран.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {sectorList.map((sector) => (
            <article
              key={sector.key}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{sector.label}</p>
                <p className="text-sm font-semibold text-white">{sector.score}</p>
              </div>

              <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800">
                <div
                  className={`h-2.5 rounded-full ${barClass(sector.score)}`}
                  style={{ width: `${sector.score}%` }}
                />
              </div>

              <div className="mt-2 text-xs text-slate-400">
                {levelLabel(sector.score)}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}