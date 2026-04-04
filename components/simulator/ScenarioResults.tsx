type ScenarioResultsProps = {
  districtName: string;
  scenarioLabel: string;
  baselineHealth: number;
  projectedHealth: number;
  riskScore: number;
  priorityZone: string;
  mainDriver: string;
  summary: string;
  recommendedActions: string[];
  className?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function severityLabel(score: number) {
  if (score >= 85) return "Критический риск";
  if (score >= 65) return "Высокий риск";
  if (score >= 40) return "Средний риск";
  return "Низкий риск";
}

function severityClass(score: number) {
  if (score >= 85) {
    return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30";
  }
  if (score >= 65) {
    return "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30";
  }
  if (score >= 40) {
    return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30";
  }
  return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30";
}

function deltaColor(delta: number) {
  if (delta > 0) return "text-emerald-300";
  if (delta < 0) return "text-rose-300";
  return "text-slate-300";
}

export default function ScenarioResults({
  districtName,
  scenarioLabel,
  baselineHealth,
  projectedHealth,
  riskScore,
  priorityZone,
  mainDriver,
  summary,
  recommendedActions,
  className = "",
}: ScenarioResultsProps) {
  const baseline = clamp(baselineHealth);
  const projected = clamp(projectedHealth);
  const risk = clamp(riskScore);
  const delta = projected - baseline;

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Результат модели
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">
            {districtName}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{scenarioLabel}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClass(
            risk,
          )}`}
        >
          {severityLabel(risk)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Базовое здоровье
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">{baseline}</div>
          <div className="mt-2 text-sm text-slate-400">До применения сценария</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Прогнозное здоровье
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">{projected}</div>
          <div className={`mt-2 text-sm ${deltaColor(delta)}`}>
            {delta > 0 ? "+" : ""}
            {delta} к базовому состоянию
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Индекс риска
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">{risk}</div>
          <div className="mt-2 text-sm text-slate-400">Интегральная оценка сценария</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Приоритетная зона
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            {priorityZone}
          </div>

          <div className="mt-5 text-xs uppercase tracking-[0.14em] text-slate-500">
            Главный драйвер
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-300">{mainDriver}</div>

          <div className="mt-5 text-xs uppercase tracking-[0.14em] text-slate-500">
            Краткая сводка ИИ
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-400">{summary}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Рекомендуемые действия
          </div>

          <div className="mt-3 space-y-2">
            {recommendedActions.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-400">
                Список действий пока не сформирован.
              </div>
            ) : (
              recommendedActions.map((action, index) => (
                <div
                  key={`${action}-${index}`}
                  className="rounded-xl border border-white/10 bg-slate-950/50 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
                      {index + 1}
                    </div>
                    <div className="text-sm leading-6 text-slate-300">{action}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}