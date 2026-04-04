import type { District } from "@/types/dashboard";

export type ScenarioType =
  | "traffic_pressure"
  | "infrastructure_stress"
  | "weather_pressure";

type ScenarioOption = {
  id: ScenarioType;
  label: string;
  description: string;
};

export type ScenarioControlsProps = {
  districts: District[];
  selectedDistrictId: string;
  onDistrictChange: (districtId: string) => void;

  scenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;

  transportLoad: number;
  infrastructureLoad: number;
  responseReadiness: number;

  onTransportLoadChange: (value: number) => void;
  onInfrastructureLoadChange: (value: number) => void;
  onResponseReadinessChange: (value: number) => void;

  onReset?: () => void;
  disabled?: boolean;
  className?: string;
};

const SCENARIOS: ScenarioOption[] = [
  {
    id: "traffic_pressure",
    label: "Пиковая транспортная нагрузка",
    description:
      "Моделирует рост трафика, задержек и давления на ключевые городские коридоры.",
  },
  {
    id: "infrastructure_stress",
    label: "Нагрузка на инфраструктуру",
    description:
      "Проверяет устойчивость коммунальных и инженерных систем при росте нагрузки.",
  },
  {
    id: "weather_pressure",
    label: "Погодное давление",
    description:
      "Оценивает влияние неблагоприятной погоды на транспорт, экологию и операционную устойчивость.",
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelLabel(value: number) {
  if (value >= 85) return "Критический";
  if (value >= 65) return "Высокий";
  if (value >= 40) return "Средний";
  return "Низкий";
}

function levelClass(value: number) {
  if (value >= 85) return "text-rose-300";
  if (value >= 65) return "text-orange-300";
  if (value >= 40) return "text-amber-300";
  return "text-emerald-300";
}

function Slider({
  label,
  value,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  hint: string;
}) {
  const normalized = clamp(value);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-slate-100">{label}</div>
          <div className="mt-1 text-xs leading-5 text-slate-400">{hint}</div>
        </div>

        <div className={`text-sm font-semibold ${levelClass(normalized)}`}>
          {normalized}% · {levelLabel(normalized)}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={normalized}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-500 disabled:cursor-not-allowed"
        aria-label={label}
      />

      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>0</span>
        <span>40</span>
        <span>65</span>
        <span>85+</span>
      </div>
    </div>
  );
}

export default function ScenarioControls({
  districts,
  selectedDistrictId,
  onDistrictChange,
  scenario,
  onScenarioChange,
  transportLoad,
  infrastructureLoad,
  responseReadiness,
  onTransportLoadChange,
  onInfrastructureLoadChange,
  onResponseReadinessChange,
  onReset,
  disabled = false,
  className = "",
}: ScenarioControlsProps) {
  const selectedScenario =
    SCENARIOS.find((item) => item.id === scenario) ?? SCENARIOS[0];

  return (
    <section
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Параметры сценария
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">
            Управление моделью нагрузки
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Выбери район Алматы, сценарий и интенсивность факторов, которые будут
            влиять на прогноз.
          </p>
        </div>

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Сбросить
          </button>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-sm font-medium text-slate-100">Район анализа</div>
        <select
          value={selectedDistrictId}
          disabled={disabled}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed"
        >
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {SCENARIOS.map((item) => {
          const isActive = item.id === scenario;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onScenarioChange(item.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                isActive
                  ? "border-cyan-400/40 bg-cyan-500/10 ring-1 ring-cyan-400/30"
                  : "border-white/10 bg-slate-900/70 hover:border-white/20"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <p
                className={`text-sm font-semibold ${
                  isActive ? "text-cyan-200" : "text-slate-100"
                }`}
              >
                {item.label}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Slider
          label="Транспортная нагрузка"
          value={transportLoad}
          onChange={onTransportLoadChange}
          disabled={disabled}
          hint="Давление на потоки, магистрали и пассажирские коридоры."
        />

        <Slider
          label="Нагрузка на инфраструктуру"
          value={infrastructureLoad}
          onChange={onInfrastructureLoadChange}
          disabled={disabled}
          hint="Влияние на инженерные сети, энерго- и водоснабжение."
        />

        <Slider
          label="Готовность реагирования"
          value={responseReadiness}
          onChange={onResponseReadinessChange}
          disabled={disabled}
          hint="Чем выше значение, тем сильнее система сглаживает последствия."
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Выбранный сценарий
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-100">
          {selectedScenario.label}
        </div>
        <div className="mt-1 text-sm leading-6 text-slate-400">
          {selectedScenario.description}
        </div>
      </div>
    </section>
  );
}