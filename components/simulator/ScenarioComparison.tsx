import type { SectorScores } from "@/types/dashboard";

type ScenarioComparisonProps = {
  beforeHealth: number;
  afterHealth: number;
  beforeSectors: SectorScores;
  afterSectors: SectorScores;
  className?: string;
};

const SECTORS = [
  { key: "transport", label: "Транспорт" },
  { key: "ecology", label: "Экология" },
  { key: "safety", label: "Безопасность" },
  { key: "utilities", label: "Инфраструктура" },
] as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function barColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-cyan-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function deltaColor(delta: number) {
  if (delta > 0) return "text-emerald-300";
  if (delta < 0) return "text-rose-300";
  return "text-slate-300";
}

function deltaLabel(delta: number) {
  if (delta > 0) return "улучшение";
  if (delta < 0) return "ухудшение";
  return "без изменений";
}

export default function ScenarioComparison({
  beforeHealth,
  afterHealth,
  beforeSectors,
  afterSectors,
  className = "",
}: ScenarioComparisonProps) {
  const baseline = clamp(beforeHealth);
  const projected = clamp(afterHealth);
  const healthDelta = projected - baseline;

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          До / после
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">
          Сравнение сценария
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Быстрое сравнение базового и прогнозного состояния по району и городским
          секторам.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            До сценария
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">{baseline}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            После сценария
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">{projected}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Изменение
          </div>
          <div className={`mt-2 text-3xl font-semibold ${deltaColor(healthDelta)}`}>
            {healthDelta > 0 ? "+" : ""}
            {healthDelta}
          </div>
          <div className="mt-2 text-sm text-slate-400">{deltaLabel(healthDelta)}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          Секторные изменения
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SECTORS.map((sector) => {
            const before = clamp(beforeSectors[sector.key]);
            const after = clamp(afterSectors[sector.key]);
            const delta = after - before;

            return (
              <article
                key={sector.key}
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">
                    {sector.label}
                  </p>
                  <p className={`text-xs font-semibold ${deltaColor(delta)}`}>
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                      <span>До</span>
                      <span>{before}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${barColor(before)}`}
                        style={{ width: `${before}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                      <span>После</span>
                      <span>{after}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${barColor(after)}`}
                        style={{ width: `${after}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}