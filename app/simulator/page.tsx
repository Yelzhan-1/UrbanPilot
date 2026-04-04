"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CloudRain,
  MapPinned,
  ShieldAlert,
  Waves,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import ScenarioControls, {
  type ScenarioType,
} from "@/components/simulator/ScenarioControls";
import ScenarioResults from "@/components/simulator/ScenarioResults";
import ScenarioComparison from "@/components/simulator/ScenarioComparison";
import { calculateRealtimeHealth } from "@/lib/ai-engine";
import type { District, SectorScores } from "@/types/dashboard";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function districtFallback(district: District | null) {
  return district?.name ?? "Выбранный район";
}

function scenarioLabel(scenario: ScenarioType) {
  if (scenario === "traffic_pressure") return "Пиковая транспортная нагрузка";
  if (scenario === "infrastructure_stress") return "Нагрузка на инфраструктуру";
  return "Погодное давление";
}

function scenarioDriver(scenario: ScenarioType) {
  if (scenario === "traffic_pressure") {
    return "Транспортный коридор и перегрузка улично-дорожной сети";
  }
  if (scenario === "infrastructure_stress") {
    return "Инженерные сети и устойчивость коммунального контура";
  }
  return "Погодный фактор и вторичное давление на городские службы";
}

function getPriorityZone(
  scenario: ScenarioType,
  districtName: string,
  riskScore: number,
  transportLoad: number,
  infrastructureLoad: number,
) {
  if (scenario === "traffic_pressure" && transportLoad >= 70) {
    return `${districtName} · магистральные коридоры и пересадочные узлы`;
  }

  if (scenario === "infrastructure_stress" && infrastructureLoad >= 70) {
    return `${districtName} · инженерные узлы и коммунальная сеть`;
  }

  if (scenario === "weather_pressure" && transportLoad + infrastructureLoad >= 130) {
    return `${districtName} · участки погодного давления и сложной доступности`;
  }

  if (riskScore >= 70) {
    return `${districtName} · комбинированная зона повышенного риска`;
  }

  return `${districtName} · локальные точки наблюдения`;
}

function buildSummary(riskScore: number, scenario: ScenarioType, districtName: string) {
  if (riskScore >= 80) {
    return `Сценарий для района ${districtName} оценивается как критический: при текущем сочетании факторов район может быстро перейти в режим оперативного реагирования.`;
  }

  if (riskScore >= 60) {
    return `Сценарий для района ${districtName} оценивается как высокий: системе нужен усиленный контроль и готовность к быстрому вмешательству.`;
  }

  if (riskScore >= 40) {
    return `Сценарий для района ${districtName} оценивается как средний: городская система остается управляемой, но требует внимания к приоритетным узлам.`;
  }

  if (scenario === "weather_pressure") {
    return `Погодное давление пока не переводит район ${districtName} в опасный режим, но требует мониторинга на уязвимых участках.`;
  }

  return `Сценарий для района ${districtName} остается контролируемым: система сохраняет устойчивость при текущих параметрах нагрузки.`;
}

function buildActions(
  scenario: ScenarioType,
  districtName: string,
  transportLoad: number,
  infrastructureLoad: number,
  responseReadiness: number,
) {
  const actions: string[] = [];

  if (scenario === "traffic_pressure") {
    actions.push(
      `Перенастроить транспортные приоритеты и усилить контроль загруженных коридоров в районе ${districtName}.`,
    );
  } else if (scenario === "infrastructure_stress") {
    actions.push(
      `Подготовить резервный сценарий по инженерным сетям и усилить наблюдение за коммунальными узлами района ${districtName}.`,
    );
  } else {
    actions.push(
      `Заранее активировать погодный сценарий реагирования и усилить мониторинг сложных участков района ${districtName}.`,
    );
  }

  if (transportLoad >= 65) {
    actions.push(
      "Проверить транспортные коридоры, светофорные циклы и плотность потока на ключевых направлениях.",
    );
  } else {
    actions.push("Транспортный контур остается в рабочем диапазоне, достаточно усиленного наблюдения.");
  }

  if (infrastructureLoad >= 65) {
    actions.push(
      "Подтвердить готовность инженерных и коммунальных служб к росту нагрузки на сеть.",
    );
  } else {
    actions.push("Инфраструктурный контур не формирует критическую нагрузку при текущем сценарии.");
  }

  if (responseReadiness <= 45) {
    actions.push("Повысить готовность оперативных служб: текущий буфер реагирования недостаточен.");
  } else {
    actions.push("Уровень готовности реагирования помогает сгладить часть сценарного давления.");
  }

  return actions.slice(0, 4);
}

function projectSectorScores(
  base: SectorScores,
  scenario: ScenarioType,
  transportLoad: number,
  infrastructureLoad: number,
  responseReadiness: number,
): SectorScores {
  const scenarioPressure =
    scenario === "traffic_pressure"
      ? { transport: 16, ecology: 5, safety: 6, utilities: 4 }
      : scenario === "infrastructure_stress"
        ? { transport: 5, ecology: 4, safety: 7, utilities: 18 }
        : { transport: 9, ecology: 14, safety: 7, utilities: 10 };

  const trafficPenalty = transportLoad / 7;
  const infraPenalty = infrastructureLoad / 7;
  const responseBonus = responseReadiness / 9;

  return {
    transport: clamp(
      base.transport - trafficPenalty - scenarioPressure.transport + responseBonus * 0.45,
    ),
    ecology: clamp(
      base.ecology - scenarioPressure.ecology - infraPenalty * 0.2 + responseBonus * 0.25,
    ),
    safety: clamp(
      base.safety - scenarioPressure.safety - trafficPenalty * 0.15 + responseBonus * 0.35,
    ),
    utilities: clamp(
      base.utilities - infraPenalty - scenarioPressure.utilities + responseBonus * 0.4,
    ),
  };
}

export default function SimulatorPage() {
  const { loading, error, data } = useDashboardData();

  const districts = useMemo(() => data.districts ?? [], [data.districts]);
  const anomalies = useMemo(() => data.anomalies ?? [], [data.anomalies]);
  const overview = data.overview;

  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [scenario, setScenario] = useState<ScenarioType>("traffic_pressure");
  const [transportLoad, setTransportLoad] = useState(62);
  const [infrastructureLoad, setInfrastructureLoad] = useState(46);
  const [responseReadiness, setResponseReadiness] = useState(68);

  const activeDistrict =
    districts.find((item) => item.id === selectedDistrictId) ?? districts[0] ?? null;

  const districtAnomalies = useMemo(() => {
    if (!activeDistrict) return [];
    return anomalies.filter((item) => item.districtId === activeDistrict.id);
  }, [activeDistrict, anomalies]);

  const topDistrictSignal = useMemo(() => {
    return districtAnomalies
      .slice()
      .sort((a, b) => b.aiRiskScore - a.aiRiskScore)[0];
  }, [districtAnomalies]);

  const baselineHealth = useMemo(() => {
    if (activeDistrict) {
      return calculateRealtimeHealth(activeDistrict, anomalies);
    }

    return overview?.overallHealth ?? 76;
  }, [activeDistrict, anomalies, overview]);

  const baselineSectors = useMemo<SectorScores>(() => {
    if (activeDistrict) return activeDistrict.sectorScores;

    return (
      overview?.sectorScores ?? {
        transport: 68,
        ecology: 64,
        safety: 72,
        utilities: 66,
      }
    );
  }, [activeDistrict, overview]);

  const simulation = useMemo(() => {
    const districtName = districtFallback(activeDistrict);

    const grossPressure = clamp(
      transportLoad * 0.45 +
        infrastructureLoad * 0.4 +
        (100 - responseReadiness) * 0.25,
    );

    const scenarioBoost =
      scenario === "traffic_pressure"
        ? transportLoad * 0.12
        : scenario === "infrastructure_stress"
          ? infrastructureLoad * 0.14
          : (transportLoad + infrastructureLoad) * 0.08;

    const effectivePressure = clamp(grossPressure + scenarioBoost - responseReadiness * 0.08);

    const projectedHealth = clamp(
      baselineHealth - effectivePressure * 0.34 + responseReadiness * 0.12,
    );

    const riskScore = clamp(
      (100 - projectedHealth) * 0.58 + effectivePressure * 0.42,
    );

    const projectedSectors = projectSectorScores(
      baselineSectors,
      scenario,
      transportLoad,
      infrastructureLoad,
      responseReadiness,
    );

    const priorityZone = getPriorityZone(
      scenario,
      districtName,
      riskScore,
      transportLoad,
      infrastructureLoad,
    );

    const mainDriver = scenarioDriver(scenario);
    const summary = buildSummary(riskScore, scenario, districtName);
    const recommendedActions = buildActions(
      scenario,
      districtName,
      transportLoad,
      infrastructureLoad,
      responseReadiness,
    );

    return {
      districtName,
      scenarioLabel: scenarioLabel(scenario),
      riskScore,
      projectedHealth,
      projectedSectors,
      priorityZone,
      mainDriver,
      summary,
      recommendedActions,
    };
  }, [
    activeDistrict,
    baselineHealth,
    baselineSectors,
    infrastructureLoad,
    responseReadiness,
    scenario,
    transportLoad,
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-14 pt-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-violet-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[18%] h-[20rem] w-[20rem] rounded-full bg-sky-400/8 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#030712_0%,#07111f_45%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <Container>
        <div className="relative space-y-6">
          <Header
            eyebrow="UrbanPilot · Симулятор Алматы"
            title="Симулятор сценариев"
            subtitle="Измени параметры нагрузки и посмотри, как меняются здоровье района, приоритетная зона и риск для городской системы Алматы."
            statusLabel="Сценарий активен"
          />

          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/30 p-[1px] shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_28%)]" />
            <div className="relative rounded-[33px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6 md:px-7 md:py-7">
              <div className="grid gap-6 xl:grid-cols-[1.18fr_0.92fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Scenario intelligence · Алматы
                  </div>

                  <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-[2.35rem] md:leading-[1.05]">
                    Проверяй давление на район до того, как ситуация перейдёт в
                    реальный городской риск
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
                    Этот модуль моделирует нагрузку в районах Алматы и сразу
                    показывает, где именно нужно усилить контроль, какие факторы
                    сильнее всего влияют на риск и насколько система готова к
                    сценарию.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/district"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:translate-y-[-1px] hover:shadow-[0_14px_34px_rgba(255,255,255,0.14)]"
                    >
                      Районы Алматы
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/decision-center"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
                    >
                      Центр решений
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Выбранный район
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {simulation.districtName}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Прогноз здоровья
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {simulation.projectedHealth}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Риск сценария
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {simulation.riskScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="section-label">Сводка модели</div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
                        Онлайн
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white">
                          Главный драйвер
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-400">
                          {simulation.mainDriver}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white">
                          Приоритетная зона
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-400">
                          {simulation.priorityZone}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white">
                          Вывод ИИ
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-400">
                          {simulation.summary}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.03))] p-5">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">
                      Активный режим
                    </div>
                    <div className="mt-3 text-xl font-semibold text-white">
                      {simulation.scenarioLabel}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">
                      Система мгновенно пересчитывает изменение состояния района
                      при обновлении параметров нагрузки.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-6">
              <div className="text-sm text-slate-300">Загрузка сценарных данных...</div>
            </section>
          ) : error ? (
            <section className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 px-6 py-6">
              <div className="text-sm text-rose-300">{error}</div>
            </section>
          ) : (
            <>
              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] p-2 sm:p-3">
                    <ScenarioControls
                      districts={districts}
                      selectedDistrictId={activeDistrict?.id ?? ""}
                      onDistrictChange={setSelectedDistrictId}
                      scenario={scenario}
                      onScenarioChange={setScenario}
                      transportLoad={transportLoad}
                      infrastructureLoad={infrastructureLoad}
                      responseReadiness={responseReadiness}
                      onTransportLoadChange={setTransportLoad}
                      onInfrastructureLoadChange={setInfrastructureLoad}
                      onResponseReadinessChange={setResponseReadiness}
                      onReset={() => {
                        setScenario("traffic_pressure");
                        setTransportLoad(62);
                        setInfrastructureLoad(46);
                        setResponseReadiness(68);
                      }}
                    />
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] p-2 sm:p-3">
                    <ScenarioResults
                      districtName={simulation.districtName}
                      scenarioLabel={simulation.scenarioLabel}
                      baselineHealth={baselineHealth}
                      projectedHealth={simulation.projectedHealth}
                      riskScore={simulation.riskScore}
                      priorityZone={simulation.priorityZone}
                      mainDriver={simulation.mainDriver}
                      summary={simulation.summary}
                      recommendedActions={simulation.recommendedActions}
                    />
                  </div>
                </section>
              </section>

              <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
                <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] p-2 sm:p-3">
                  <ScenarioComparison
                    beforeHealth={baselineHealth}
                    afterHealth={simulation.projectedHealth}
                    beforeSectors={baselineSectors}
                    afterSectors={simulation.projectedSectors}
                  />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-amber-300" />
                      <div className="section-label">Контекст района</div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-white">
                          Активные сигналы
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          В выбранном районе сейчас {districtAnomalies.length} активных
                          сигналов.
                        </div>
                      </div>

                      {topDistrictSignal ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                          <div className="text-sm font-semibold text-white">
                            Самый сильный сигнал
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-300">
                            {topDistrictSignal.title}
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                            Риск ИИ: {topDistrictSignal.aiRiskScore} · сектор:{" "}
                            {topDistrictSignal.sector}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                          <div className="text-sm font-semibold text-white">
                            Сильных сигналов нет
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-400">
                            Для выбранного района сейчас нет активных аномалий с
                            высоким приоритетом.
                          </div>
                        </div>
                      )}

                      {activeDistrict ? (
                        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                          <div className="text-sm font-semibold text-white">
                            Базовые показатели района
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
                              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Транспорт
                              </div>
                              <div className="mt-1 text-sm font-semibold text-white">
                                {activeDistrict.sectorScores.transport}
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
                              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Экология
                              </div>
                              <div className="mt-1 text-sm font-semibold text-white">
                                {activeDistrict.sectorScores.ecology}
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
                              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Безопасность
                              </div>
                              <div className="mt-1 text-sm font-semibold text-white">
                                {activeDistrict.sectorScores.safety}
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
                              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Инфраструктура
                              </div>
                              <div className="mt-1 text-sm font-semibold text-white">
                                {activeDistrict.sectorScores.utilities}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6">
                    <div className="flex items-center gap-3">
                      <Waves className="h-5 w-5 text-cyan-300" />
                      <div className="section-label">Что это даёт городу</div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <MapPinned className="h-5 w-5 text-slate-100" />
                          <div className="text-sm font-semibold text-white">
                            Пространственный фокус
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          Помогает заранее увидеть, какой район и какая зона будут
                          первыми нуждаться в управленческом внимании.
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="h-5 w-5 text-slate-100" />
                          <div className="text-sm font-semibold text-white">
                            Проверка устойчивости
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          Показывает, насколько быстро выбранный район переходит в
                          более рискованный режим при росте нагрузки.
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <CloudRain className="h-5 w-5 text-slate-100" />
                          <div className="text-sm font-semibold text-white">
                            Сценарная проверка
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          Позволяет сравнить состояние до и после сценария без
                          обращения к сырым данным.
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-3">
                          <Brain className="h-5 w-5 text-slate-100" />
                          <div className="text-sm font-semibold text-white">
                            Рекомендации ИИ
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          Система сразу показывает главный драйвер и подсказывает,
                          какие действия дадут лучший эффект.
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/decision-center"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Центр решений
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Дашборд
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </section>
              </section>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}