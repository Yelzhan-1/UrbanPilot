import type { SeverityLevel, SectorScores } from "@/types/dashboard";

type DistrictRiskRow = {
  id: string;
  name: string;
  healthScore: number;
  riskScore: number;
  severity: SeverityLevel;
  status: string;
  activeAlerts: number;
  population?: number;
  mainIssue?: string | null;
  sectorScores: SectorScores;
};

type DistrictRiskTableProps = {
  rows: DistrictRiskRow[];
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  title?: string;
  subtitle?: string;
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
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }
  if (value === "high") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }
  if (value === "medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }
  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
}

function barClass(score: number) {
  if (score >= 80) return "bg-rose-400";
  if (score >= 65) return "bg-orange-400";
  if (score >= 50) return "bg-amber-300";
  return "bg-emerald-400";
}

function weakestSector(scores: SectorScores) {
  const sectors = [
    { label: "Транспорт", value: scores.transport },
    { label: "Экология", value: scores.ecology },
    { label: "Безопасность", value: scores.safety },
    { label: "Инфраструктура", value: scores.utilities },
  ].sort((a, b) => a.value - b.value);

  return sectors[0]?.label ?? "—";
}

export default function DistrictRiskTable({
  rows,
  selectedDistrictId,
  onSelectDistrict,
  title = "Сравнение районов",
  subtitle = "Сравни здоровье районов, уровень риска и ключевые зоны давления.",
  className = "",
}: DistrictRiskTableProps) {
  const sorted = [...rows].sort((a, b) => {
    if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
    return a.healthScore - b.healthScore;
  });

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Территориальный обзор
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {sorted.length} районов
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-400">
          Данные по районам пока недоступны.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Район</th>
                <th className="px-3 py-2">Риск</th>
                <th className="px-3 py-2">Здоровье</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Сигналы</th>
                <th className="px-3 py-2">Слабый сектор</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((row) => {
                const isSelected = selectedDistrictId === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectDistrict?.(row.id)}
                    className={`cursor-pointer rounded-2xl transition ${
                      isSelected ? "bg-cyan-500/10" : "bg-slate-900/60 hover:bg-slate-900/80"
                    }`}
                  >
                    <td className="rounded-l-2xl px-3 py-3 align-top">
                      <div className="font-semibold text-slate-100">{row.name}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {row.mainIssue || "Сигналы распределены по нескольким направлениям."}
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="text-sm font-semibold text-white">
                        {clamp(row.riskScore)}/100
                      </div>
                      <div className="mt-2 h-2 w-28 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${barClass(row.riskScore)}`}
                          style={{ width: `${clamp(row.riskScore)}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="text-sm font-semibold text-white">
                        {clamp(row.healthScore)}
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${severityClass(
                          row.severity,
                        )}`}
                      >
                        {severityLabel(row.severity)}
                      </span>
                      <div className="mt-2 text-xs text-slate-500">{row.status}</div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="text-sm font-semibold text-white">
                        {row.activeAlerts}
                      </div>
                    </td>

                    <td className="rounded-r-2xl px-3 py-3 align-top">
                      <div className="text-sm text-slate-300">
                        {weakestSector(row.sectorScores)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}