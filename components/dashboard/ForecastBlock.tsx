import type { Sector } from "@/types/dashboard";

type ForecastItem = {
  sector: Sector;
  predictedValue: number;
  confidenceLowerBound: number;
  confidenceUpperBound: number;
  timestamp: string;
};

type ForecastBlockProps = {
  title?: string;
  subtitle?: string;
  items: ForecastItem[];
  emptyMessage?: string;
  className?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sectorLabel(value: Sector) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  return "Инфраструктура";
}

function barClass(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-cyan-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ForecastBlock({
  title = "Прогноз по секторам",
  subtitle = "Ожидаемое состояние ключевых городских направлений на ближайший цикл.",
  items,
  emptyMessage = "Прогнозные данные пока недоступны.",
  className = "",
}: ForecastBlockProps) {
  const latestBySector = Object.values(
    items.reduce<Record<string, ForecastItem>>((acc, item) => {
      const key = item.sector;
      const prev = acc[key];
      if (!prev || new Date(item.timestamp).getTime() > new Date(prev.timestamp).getTime()) {
        acc[key] = item;
      }
      return acc;
    }, {}),
  );

  return (
    <section
      className={`rounded-[30px] border border-white/10 bg-white/[0.04] p-6 ${className}`}
    >
      <div>
        <div className="section-label">Прогнозирование</div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      {latestBySector.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {latestBySector.map((item) => {
            const value = clamp(item.predictedValue);

            return (
              <article
                key={item.sector}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {sectorLabel(item.sector)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                      Обновление: {formatTime(item.timestamp)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-semibold text-white">{value}</div>
                    <div className="text-xs text-slate-500">прогноз</div>
                  </div>
                </div>

                <div className="mt-4 h-2.5 w-full rounded-full bg-slate-800">
                  <div
                    className={`h-2.5 rounded-full ${barClass(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Нижняя граница: {clamp(item.confidenceLowerBound)}</span>
                  <span>Верхняя граница: {clamp(item.confidenceUpperBound)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}