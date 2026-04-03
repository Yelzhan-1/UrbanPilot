"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ai/SectionHeader";
import ScenarioComparison from "@/components/simulator/ScenarioComparison";
import ScenarioControls from "@/components/simulator/ScenarioControls";
import ScenarioResults from "@/components/simulator/ScenarioResults";

type ScenarioType = "traffic_surge" | "utility_outage" | "bad_weather";

type SectorRisk = {
  transport: number;
  ecology: number;
  safety: number;
  utilities: number;
};

const BASELINE_SECTORS: SectorRisk = {
  transport: 46,
  ecology: 38,
  safety: 42,
  utilities: 40,
};

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  traffic_surge: "Traffic Surge",
  utility_outage: "Utility Outage",
  bad_weather: "Bad Weather",
};

const SCENARIO_MULTIPLIERS: Record<ScenarioType, SectorRisk> = {
  traffic_surge: {
    transport: 0.75,
    ecology: 0.35,
    safety: 0.45,
    utilities: 0.3,
  },
  utility_outage: {
    transport: 0.3,
    ecology: 0.25,
    safety: 0.4,
    utilities: 0.85,
  },
  bad_weather: {
    transport: 0.55,
    ecology: 0.8,
    safety: 0.6,
    utilities: 0.55,
  },
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function weightedCityRisk(sectors: SectorRisk): number {
  const value =
    sectors.transport * 0.3 +
    sectors.ecology * 0.2 +
    sectors.safety * 0.25 +
    sectors.utilities * 0.25;
  return Math.round(clamp(value));
}

function intensityLabel(intensity: number): "Low" | "Medium" | "High" | "Critical" {
  if (intensity >= 85) return "Critical";
  if (intensity >= 65) return "High";
  if (intensity >= 40) return "Medium";
  return "Low";
}

function riskLabel(risk: number): "Low" | "Medium" | "High" | "Critical" {
  if (risk >= 85) return "Critical";
  if (risk >= 65) return "High";
  if (risk >= 40) return "Medium";
  return "Low";
}

function interpretationText(
  scenario: ScenarioType,
  intensity: number,
  baselineRisk: number,
  projectedRisk: number,
  after: SectorRisk,
): string {
  const delta = projectedRisk - baselineRisk;
  const scenarioName = SCENARIO_LABELS[scenario];
  const topSector = (Object.keys(after) as Array<keyof SectorRisk>).sort(
    (a, b) => after[b] - after[a],
  )[0];

  const topSectorLabel =
    topSector === "transport"
      ? "Transport"
      : topSector === "ecology"
        ? "Ecology"
        : topSector === "safety"
          ? "Safety"
          : "Utilities";

  if (delta >= 20) {
    return `${scenarioName} at ${intensityLabel(intensity)} intensity pushes city risk sharply upward (+${delta}). ${topSectorLabel} becomes the dominant stress point, so operators should activate cross-sector escalation and pre-position response teams.`;
  }

  if (delta >= 10) {
    return `${scenarioName} produces a meaningful risk increase (+${delta}), with strongest pressure on ${topSectorLabel}. Prioritize targeted interventions in the next 1-2 operational windows to avoid cascading impacts.`;
  }

  if (delta > 0) {
    return `${scenarioName} creates a moderate uplift in risk (+${delta}). The system remains manageable, but proactive controls in ${topSectorLabel} are recommended to maintain stability.`;
  }

  if (delta === 0) {
    return `${scenarioName} at this intensity keeps city risk stable. Continue monitoring sector volatility and keep contingency actions ready.`;
  }

  return `${scenarioName} lowers projected risk (${delta}). Current mitigation assumptions appear effective; maintain monitoring and validate readiness for rapid escalation if conditions shift.`;
}

export default function SimulatorPage() {
  const [scenario, setScenario] = useState<ScenarioType>("traffic_surge");
  const [intensity, setIntensity] = useState<number>(55);

  const simulation = useMemo(() => {
    const normalizedIntensity = clamp(intensity) / 100;
    const multipliers = SCENARIO_MULTIPLIERS[scenario];

    const afterSectors: SectorRisk = {
      transport: clamp(
        Math.round(BASELINE_SECTORS.transport + normalizedIntensity * 52 * multipliers.transport),
      ),
      ecology: clamp(
        Math.round(BASELINE_SECTORS.ecology + normalizedIntensity * 52 * multipliers.ecology),
      ),
      safety: clamp(
        Math.round(BASELINE_SECTORS.safety + normalizedIntensity * 52 * multipliers.safety),
      ),
      utilities: clamp(
        Math.round(BASELINE_SECTORS.utilities + normalizedIntensity * 52 * multipliers.utilities),
      ),
    };

    const baselineRisk = weightedCityRisk(BASELINE_SECTORS);
    const projectedRisk = weightedCityRisk(afterSectors);

    return {
      baselineRisk,
      projectedRisk,
      afterSectors,
      interpretation: interpretationText(
        scenario,
        clamp(intensity),
        baselineRisk,
        projectedRisk,
        afterSectors,
      ),
    };
  }, [scenario, intensity]);

  const riskDelta = simulation.projectedRisk - simulation.baselineRisk;

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SectionHeader
          title="Scenario Simulator"
          subtitle="Run deterministic what-if simulations to estimate city-wide impact before real-world decisions are made."
          statusLabel="Simulation Mode"
          navItems={[
            { label: "Decision Center", href: "/decision-center" },
            { label: "District Analysis", href: "/district" },
            { label: "Scenario Simulator", href: "/simulator", active: true },
          ]}
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Selected Scenario</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{SCENARIO_LABELS[scenario]}</p>
            <p className="mt-1 text-xs text-slate-400">Intensity: {clamp(intensity)}%</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current Baseline</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{simulation.baselineRisk}/100</p>
            <p className="mt-1 text-xs text-slate-400">{riskLabel(simulation.baselineRisk)} city risk</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Projected City Risk</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{simulation.projectedRisk}/100</p>
            <p className="mt-1 text-xs text-slate-400">{riskLabel(simulation.projectedRisk)} city risk</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Net Change</p>
            <p className={`mt-1 text-xl font-semibold ${riskDelta > 0 ? "text-rose-300" : riskDelta < 0 ? "text-emerald-300" : "text-slate-100"}`}>
              {riskDelta > 0 ? "+" : ""}
              {riskDelta}
            </p>
            <p className="mt-1 text-xs text-slate-400">Baseline to projected</p>
          </article>
        </section>

        <ScenarioControls
          scenario={scenario}
          intensity={intensity}
          onScenarioChange={setScenario}
          onIntensityChange={setIntensity}
        />

        <ScenarioResults
          scenarioLabel={SCENARIO_LABELS[scenario]}
          intensity={intensity}
          baselineRisk={simulation.baselineRisk}
          projectedRisk={simulation.projectedRisk}
          beforeSectors={BASELINE_SECTORS}
          afterSectors={simulation.afterSectors}
        />

        <ScenarioComparison
          beforeRisk={simulation.baselineRisk}
          afterRisk={simulation.projectedRisk}
          beforeSectors={BASELINE_SECTORS}
          afterSectors={simulation.afterSectors}
        />

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Operational Interpretation</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-100">AI Guidance for City Operators</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">{simulation.interpretation}</p>
          <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3">
            <p className="text-xs text-cyan-100">
              This simulator uses deterministic local logic for hackathon demos. It is designed for fast planning support, not live control automation.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}