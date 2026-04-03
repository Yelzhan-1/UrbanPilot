type ScenarioType = "traffic_surge" | "utility_outage" | "bad_weather";

type ScenarioOption = {
  id: ScenarioType;
  label: string;
  description: string;
};

type ScenarioControlsProps = {
  scenario: ScenarioType;
  intensity: number; // 0-100
  onScenarioChange: (scenario: ScenarioType) => void;
  onIntensityChange: (intensity: number) => void;
  disabled?: boolean;
  className?: string;
};

const SCENARIOS: ScenarioOption[] = [
  {
    id: "traffic_surge",
    label: "Traffic Surge",
    description: "Simulate sharp traffic volume increase during peak windows.",
  },
  {
    id: "utility_outage",
    label: "Utility Outage",
    description: "Simulate disruption in power/water/network utility systems.",
  },
  {
    id: "bad_weather",
    label: "Bad Weather",
    description: "Simulate storm/rain/wind pressure across city services.",
  },
];

function getIntensityLabel(value: number): "Low" | "Medium" | "High" | "Critical" {
  if (value >= 85) return "Critical";
  if (value >= 65) return "High";
  if (value >= 40) return "Medium";
  return "Low";
}

function intensityStyle(value: number): string {
  if (value >= 85) return "text-rose-300";
  if (value >= 65) return "text-orange-300";
  if (value >= 40) return "text-amber-300";
  return "text-emerald-300";
}

export default function ScenarioControls({
  scenario,
  intensity,
  onScenarioChange,
  onIntensityChange,
  disabled = false,
  className = "",
}: ScenarioControlsProps) {
  const clampedIntensity = Math.max(0, Math.min(100, intensity));
  const selected = SCENARIOS.find((item) => item.id === scenario) ?? SCENARIOS[0];

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scenario Controls</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">Select Simulation Inputs</h3>
        <p className="mt-1 text-sm text-slate-400">
          Choose a disruption type and set pressure intensity to model city impact.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {SCENARIOS.map((item) => {
          const isActive = item.id === scenario;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onScenarioChange(item.id)}
              className={`rounded-xl border p-4 text-left transition ${
                isActive
                  ? "border-cyan-400/40 bg-cyan-500/10 ring-1 ring-cyan-400/30"
                  : "border-white/10 bg-slate-900/70 hover:border-white/20"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <p className={`text-sm font-semibold ${isActive ? "text-cyan-200" : "text-slate-100"}`}>{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-100">Intensity</p>
          <p className={`text-sm font-semibold ${intensityStyle(clampedIntensity)}`}>
            {clampedIntensity}% ({getIntensityLabel(clampedIntensity)})
          </p>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={clampedIntensity}
          disabled={disabled}
          onChange={(e) => onIntensityChange(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-500 disabled:cursor-not-allowed"
          aria-label="Scenario intensity"
        />

        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>Low (0)</span>
          <span>Medium (40)</span>
          <span>High (65)</span>
          <span>Critical (85+)</span>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs text-slate-400">Selected scenario</p>
          <p className="mt-1 text-sm font-medium text-slate-100">{selected.label}</p>
          <p className="mt-1 text-xs text-slate-400">{selected.description}</p>
        </div>
      </div>
    </section>
  );
}