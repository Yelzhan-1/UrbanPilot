"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  MapPinned,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import DistrictRiskTable from "@/components/ai/DistrictRiskTable";
import DistrictDetailsCard from "@/components/ai/DistrictDetailsCard";
import DistrictSectorBreakdown from "@/components/ai/DistrictSectorBreakdown";
import TopAnomaliesBlock from "@/components/ai/TopAnomaliesBlock";
import { calculateRealtimeHealth, prioritizeAnomalies } from "@/lib/ai-engine";
import type { District, SeverityLevel } from "@/types/dashboard";

type DistrictWithHealth = District & {
  realtimeHealth: number;
  riskScore: number;
  topAnomaly?: {
    id: string;
    title: string;
    description: string;
    severity: SeverityLevel;
    sector: string;
    districtId: string;
    timestamp: string;
    aiRiskScore: number;
    metricValue?: number;
    metricUnit?: string;
  };
};

function severityRank(value: SeverityLevel) {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function severityLabel(value: SeverityLevel) {
  if (value === "critical") return "Критический";
  if (value === "high") return "Высокий";
  if (value === "medium") return "Средний";
  return "Низкий";
}

function formatTimeAgo(timestamp: string) {
  const now = Date.now();
  const date = new Date(timestamp).getTime();

  if (Number.isNaN(date)) return "недавно";

  const diffMin = Math.max(1, Math.round((now - date) / 60000));
  if (diffMin < 60) return `${diffMin} мин назад`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} д назад`;
}

function getDistrictMainIssue(district: District) {
  if (district.mainIssue) return district.mainIssue;

  const entries = [
    { label: "Транспорт", value: district.sectorScores.transport },
    { label: "Экология", value: district.sectorScores.ecology },
    { label: "Безопасность", value: district.sectorScores.safety },
    { label: "Инфраструктура", value: district.sectorScores.utilities },
  ].sort((a, b) => a.value - b.value);

  const weakest = entries[0];

  if (weakest.value <= 55) return `Основное давление: ${weakest.label}`;
  if (weakest.value <= 70) return `Зона внимания: ${weakest.label}`;
  return "Ситуация близка к стабильной";
}

function getDistrictRiskLabel(score: number): SeverityLevel | "stable" {
  if (score >= 80) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  if (score >= 35) return "low";
  return "stable";
}

function normalizeSeverity(score: number): SeverityLevel {
  const riskLabel = getDistrictRiskLabel(score);
  return riskLabel === "stable" ? "low" : riskLabel;
}

function getDistrictStatus(score: number) {
  const riskLabel = getDistrictRiskLabel(score);
  if (riskLabel === "stable") return "Стабильный режим";
  return `${severityLabel(riskLabel)} риск`;
}

function avgHealth(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export default function DistrictPage() {
  const { loading, error, data } = useDashboardData();

  const districts = useMemo(() => data.districts ?? [], [data.districts]);
  const anomalies = useMemo(() => data.anomalies ?? [], [data.anomalies]);
  const recommendations = useMemo(
    () => data.recommendations ?? [],
    [data.recommendations],
  );
  const overview = data.overview;

  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const districtNameById = useMemo(() => {
    return new Map(districts.map((district) => [district.id, district.name]));
  }, [districts]);

  const anomalyCountByDistrictId = useMemo(() => {
    const counts = new Map<string, number>();

    for (const anomaly of anomalies) {
      counts.set(
        anomaly.districtId,
        (counts.get(anomaly.districtId) ?? 0) + 1,
      );
    }

    return counts;
  }, [anomalies]);

  const districtsWithHealth = useMemo<DistrictWithHealth[]>(() => {
    return [...districts]
      .map((district) => {
        const districtAnomalies = anomalies.filter(
          (item) => item.districtId === district.id,
        );

        const realtimeHealth = calculateRealtimeHealth(district, anomalies);
        const riskScore = 100 - realtimeHealth;

        const topAnomaly = [...districtAnomalies].sort(
          (a, b) =>
            severityRank(b.severity) - severityRank(a.severity) ||
            b.aiRiskScore - a.aiRiskScore,
        )[0];

        return {
          ...district,
          realtimeHealth,
          riskScore,
          topAnomaly,
        };
      })
      .sort((a, b) => a.realtimeHealth - b.realtimeHealth);
  }, [districts, anomalies]);

  const topRiskDistrict = districtsWithHealth[0] ?? null;

  const mostStableDistrict = useMemo(() => {
    return (
      [...districtsWithHealth].sort(
        (a, b) => b.realtimeHealth - a.realtimeHealth,
      )[0] ?? null
    );
  }, [districtsWithHealth]);

  const effectiveSelectedDistrictId =
    selectedDistrictId || topRiskDistrict?.id || "";

  const selectedDistrict =
    districtsWithHealth.find(
      (district) => district.id === effectiveSelectedDistrictId,
    ) ??
    topRiskDistrict ??
    null;

  const selectedDistrictAnomalies = useMemo(() => {
    if (!selectedDistrict) return [];

    return prioritizeAnomalies(
      anomalies.filter((item) => item.districtId === selectedDistrict.id),
    );
  }, [selectedDistrict, anomalies]);

  const cityAverage = useMemo(() => {
    return avgHealth(districtsWithHealth.map((item) => item.realtimeHealth));
  }, [districtsWithHealth]);

  const selectedRecommendation = useMemo(() => {
    if (!selectedDistrict) return null;

    return (
      recommendations.find((item) => item.scope === selectedDistrict.id) ??
      recommendations.find(
        (item) => item.sector === selectedDistrict.topAnomaly?.sector,
      ) ??
      null
    );
  }, [recommendations, selectedDistrict]);

  const districtTableRows = useMemo(() => {
    return districtsWithHealth.map((district) => ({
      id: district.id,
      name: district.name,
      healthScore: district.realtimeHealth,
      riskScore: district.riskScore,
      severity: normalizeSeverity(district.riskScore),
      status: getDistrictStatus(district.riskScore),
      activeAlerts: anomalyCountByDistrictId.get(district.id) ?? 0,
      population: district.population,
      mainIssue: district.topAnomaly?.title ?? getDistrictMainIssue(district),
      sectorScores: district.sectorScores,
    }));
  }, [districtsWithHealth, anomalyCountByDistrictId]);

  const cityName = overview?.cityName ?? "Алматы";

  const selectedDistrictAlertCount = selectedDistrict
    ? anomalyCountByDistrictId.get(selectedDistrict.id) ?? 0
    : 0;

  const cityRiskSpread =
    topRiskDistrict && mostStableDistrict
      ? Math.max(
          0,
          Math.round(topRiskDistrict.riskScore - mostStableDistrict.riskScore),
        )
      : null;

  const latestSelectedSignalTime =
    selectedDistrictAnomalies[0]?.timestamp
      ? formatTimeAgo(selectedDistrictAnomalies[0].timestamp)
      : "нет новых сигналов";

  const selectedDistrictStatus = selectedDistrict
    ? getDistrictStatus(selectedDistrict.riskScore)
    : "—";

  return (
    <main className="relative min-h-screen overflow-hidden pb-12 pt-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/12 blur-[120px]" />
        <div className="absolute right-[-10%] top-[14%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute bottom-[-8%] left-[12%] h-[20rem] w-[20rem] rounded-full bg-sky-400/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),linear-gradient(180deg,#030712_0%,#07111f_45%,#030712_100%)]" />
      </div>

      <Container>
        <div className="relative space-y-6">
          <Header
            eyebrow="UrbanPilot · Районы Алматы"
            title="Районный контур"
            subtitle={`Сравнение районов ${cityName}, локальных сигналов и зон, где городская система испытывает наибольшее давление.`}
            statusLabel="Районы в фокусе"
          />

          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/30 p-[1px] shadow-[0_30px_80px_rgba(2,6,23,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.14),transparent_28%)]" />
            <div className="relative rounded-[33px] border border-white/6 bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.86))] px-6 py-6 md:px-7 md:py-7">
              <div className="grid gap-6 xl:grid-cols-[1.18fr_0.92fr]">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Spatial intelligence · Алматы
                  </div>

                  <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-[2.3rem] md:leading-[1.05]">
                    Районная аналитика должна показывать не только где возник
                    сигнал, но и где управленческое вмешательство даст
                    максимальный эффект
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
                    Этот модуль раскрывает территориальный слой Алматы: где
                    нагрузка распределяется неравномерно, какие районы выходят в
                    зону внимания и как локальные сигналы меняют общую городскую
                    картину.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200">
                      Районы Алматы
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200">
                      AI-приоритизация сигналов
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200">
                      Территориальный контекст решений
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(103,232,249,0.25)]"
                    >
                      Открыть дашборд
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/decision-center"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
                    >
                      Центр решений
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Среднее здоровье
                    </div>
                    <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
                      {cityAverage ?? "—"}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      по районам Алматы
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/60 to-transparent" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Активные районы
                    </div>
                    <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
                      {districts.length}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      в контуре наблюдения
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Район внимания
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                      {topRiskDistrict?.name ?? "—"}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      максимальное давление
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Наиболее стабильный
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                      {mostStableDistrict?.name ?? "—"}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      лучший текущий баланс
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(255,255,255,0.03))] p-5 sm:col-span-2">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl" />
                    <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">
                      Территориальный разрыв
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-5">
                      <div>
                        <div className="text-4xl font-semibold tracking-tight text-white">
                          {cityRiskSpread ?? "—"}
                        </div>
                        <div className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                          пунктов между наиболее напряжённым и наиболее
                          устойчивым районом
                        </div>
                      </div>

                      <div className="max-w-[16rem] text-right text-sm leading-6 text-slate-300">
                        {topRiskDistrict
                          ? topRiskDistrict.topAnomaly?.title ??
                            getDistrictMainIssue(topRiskDistrict)
                          : "Система пока не выделила основной территориальный сигнал."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] px-6 py-6">
              <div className="text-sm text-slate-300">
                Загрузка районного контура...
              </div>
            </section>
          ) : error ? (
            <section className="rounded-[30px] border border-rose-400/20 bg-rose-400/10 px-6 py-6">
              <div className="text-sm text-rose-300">{error}</div>
            </section>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,35,0.9),rgba(6,12,24,0.92))] p-5 shadow-[0_16px_40px_rgba(2,6,23,0.28)]">
                  <div className="absolute right-[-10%] top-[-10%] h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3">
                      <MapPinned className="h-5 w-5 text-cyan-200" />
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      Focus
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-400">Район внимания</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {topRiskDistrict?.name ?? "Нет данных"}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {topRiskDistrict
                      ? `Оперативное здоровье: ${topRiskDistrict.realtimeHealth}. Риск: ${topRiskDistrict.riskScore}/100.`
                      : "Система пока не выделила район с максимальным давлением."}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,35,0.9),rgba(6,12,24,0.92))] p-5 shadow-[0_16px_40px_rgba(2,6,23,0.28)]">
                  <div className="absolute right-[-10%] top-[-10%] h-28 w-28 rounded-full bg-amber-400/10 blur-3xl" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3">
                      <ShieldAlert className="h-5 w-5 text-amber-200" />
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      Signals
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-400">Сигналы по городу</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {overview?.activeAnomalies ?? anomalies.length}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {overview
                      ? `Критических сигналов: ${overview.criticalAlerts}.`
                      : "Городская сводка пока недоступна."}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,35,0.9),rgba(6,12,24,0.92))] p-5 shadow-[0_16px_40px_rgba(2,6,23,0.28)]">
                  <div className="absolute right-[-10%] top-[-10%] h-28 w-28 rounded-full bg-fuchsia-400/10 blur-3xl" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/10 p-3">
                      <Brain className="h-5 w-5 text-fuchsia-200" />
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                      AI
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-400">Ключевой вывод</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {districts.length > 0 ? "Риск распределён неравномерно" : "Нет данных"}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {overview
                      ? `Система фиксирует ${overview.activeAnomalies} активных аномалий по городу и смещение нагрузки в отдельных районах Алматы.`
                      : "Обзор городской ситуации пока недоступен."}
                  </p>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-[1px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_22%)]" />
                <div className="relative rounded-[31px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6 md:px-7">
                  <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                    <div>
                      <div className="section-label">Фокус района</div>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3">
                          <MapPinned className="h-5 w-5 text-cyan-200" />
                        </div>
                        <div>
                          <div className="text-2xl font-semibold tracking-tight text-white">
                            {selectedDistrict?.name ?? "Район не выбран"}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {selectedDistrictStatus}
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                        {selectedDistrict
                          ? selectedDistrict.topAnomaly
                            ? `Ключевой сигнал для района — «${selectedDistrict.topAnomaly.title}». Территориальный слой показывает, что именно здесь нужен более точный контроль и адресное управленческое вмешательство.`
                            : `Район ${selectedDistrict.name} остаётся в контуре наблюдения. Явного критического сигнала нет, но территориальный профиль требует постоянной оценки.`
                          : "Выберите район в таблице, чтобы увидеть детальный территориальный профиль."}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Оперативное здоровье
                          </div>
                          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            {selectedDistrict?.realtimeHealth ?? "—"}
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Активные сигналы
                          </div>
                          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            {selectedDistrictAlertCount}
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Последний сигнал
                          </div>
                          <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                            {latestSelectedSignalTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Главная зона давления
                        </div>
                        <div className="mt-3 text-lg font-semibold leading-7 text-white">
                          {selectedDistrict?.topAnomaly?.title ??
                            (selectedDistrict
                              ? getDistrictMainIssue(selectedDistrict)
                              : "Нет данных")}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          {selectedDistrict?.topAnomaly?.description ??
                            "Система не зафиксировала явной доминирующей аномалии для выбранного района."}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Рекомендованное действие
                        </div>
                        <div className="mt-3 text-lg font-semibold leading-7 text-white">
                          {selectedRecommendation?.title ??
                            "Уточнить районный контекст и проверить слабый сектор"}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          {selectedRecommendation?.description ??
                            "Сначала локализуйте источник давления, затем оцените, нужен ли адресный ответ на уровне района или сектора."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))]">
                    <div className="border-b border-white/8 px-6 py-5">
                      <div className="section-label">Сравнение районов</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                        Территориальный рейтинг и сигналы по районам
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-2 sm:px-3">
                      <DistrictRiskTable
                        rows={districtTableRows}
                        selectedDistrictId={effectiveSelectedDistrictId}
                        onSelectDistrict={setSelectedDistrictId}
                      />
                    </div>
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.14),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))]">
                    <div className="border-b border-white/8 px-6 py-5">
                      <div className="section-label">Детали района</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                        Профиль выбранной территории
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-2 sm:px-3">
                      <DistrictDetailsCard
                        district={
                          selectedDistrict
                            ? {
                                id: selectedDistrict.id,
                                name: selectedDistrict.name,
                                healthScore: selectedDistrict.realtimeHealth,
                                riskScore: selectedDistrict.riskScore,
                                severity: normalizeSeverity(selectedDistrict.riskScore),
                                status: getDistrictStatus(selectedDistrict.riskScore),
                                activeAlerts:
                                  anomalyCountByDistrictId.get(selectedDistrict.id) ??
                                  0,
                                population: selectedDistrict.population,
                                summary: selectedDistrict.topAnomaly
                                  ? `Ключевой сигнал для района: «${selectedDistrict.topAnomaly.title}». Система выделяет этот район как важный для более точного контроля.`
                                  : `Район ${selectedDistrict.name} остаётся под наблюдением без явно выраженного критического сигнала.`,
                                topIssue:
                                  selectedDistrict.topAnomaly?.description ??
                                  getDistrictMainIssue(selectedDistrict),
                                recommendedAction:
                                  selectedRecommendation?.title ??
                                  "Провести дополнительную проверку по слабому сектору и уточнить районный контекст.",
                              }
                            : null
                        }
                      />
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))]">
                    <div className="border-b border-white/8 px-6 py-5">
                      <div className="section-label">Секторный профиль</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                        Где именно район показывает слабость
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-2 sm:px-3">
                      <DistrictSectorBreakdown
                        data={
                          selectedDistrict
                            ? {
                                districtName: selectedDistrict.name,
                                sectors: selectedDistrict.sectorScores,
                                severity: normalizeSeverity(selectedDistrict.riskScore),
                              }
                            : null
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px] shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_28%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))]">
                    <div className="border-b border-white/8 px-6 py-5">
                      <div className="section-label">Локальные сигналы</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                        Аномалии выбранного района
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-2 sm:px-3">
                      <TopAnomaliesBlock
                        title={
                          selectedDistrict
                            ? `Сигналы: ${selectedDistrict.name}`
                            : "Сигналы по району"
                        }
                        subtitle="Наиболее заметные аномалии для выбранного района."
                        items={selectedDistrictAnomalies.map((item) => ({
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          severity: item.severity,
                          sector: item.sector,
                          district:
                            districtNameById.get(item.districtId) ?? "Район Алматы",
                          metricLabel: item.metricUnit ? "Показатель" : "Метрика",
                          metricValue:
                            item.metricValue !== undefined && item.metricUnit
                              ? `${item.metricValue} ${item.metricUnit}`
                              : item.metricValue !== undefined
                                ? `${item.metricValue}`
                                : "—",
                          detectedAt: formatTimeAgo(item.timestamp),
                          aiRiskScore: item.aiRiskScore,
                        }))}
                      />
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_26%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-cyan-200" />
                      <div className="section-label">Что видно по районам</div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-white">
                          Районы отличаются по профилю давления
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          Один район может испытывать нагрузку из-за транспорта,
                          другой — из-за инженерной инфраструктуры или локальных
                          инцидентов.
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-white">
                          Одинаковое число сигналов не значит одинаковый риск
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          Важен не только объём событий, но и их сила, сектор и
                          потенциальный эффект на районную среду.
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-white">
                          Слабый сектор помогает понять точку вмешательства
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          Даже без критического сигнала район может показывать
                          устойчивую слабость по конкретному направлению.
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-white">
                          Территориальный слой нужен для адресных решений
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-400">
                          Он помогает понять, где именно управленческий ресурс
                          даст наибольший эффект.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30 p-[1px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_24%)]" />
                  <div className="relative rounded-[29px] bg-[linear-gradient(180deg,rgba(6,15,30,0.96),rgba(7,17,31,0.9))] px-6 py-6">
                    <div className="flex items-center gap-3">
                      <Waves className="h-5 w-5 text-cyan-200" />
                      <div className="section-label">Связанные модули</div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <Link
                        href="/dashboard"
                        className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        <div>
                          <div className="font-semibold text-white">Дашборд</div>
                          <div className="mt-1 text-xs text-slate-400">
                            Общий городской command center
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-white" />
                      </Link>

                      <Link
                        href="/decision-center"
                        className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        <div>
                          <div className="font-semibold text-white">Центр решений</div>
                          <div className="mt-1 text-xs text-slate-400">
                            Приоритеты, действия и AI-рекомендации
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-white" />
                      </Link>

                      <Link
                        href="/simulator"
                        className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        <div>
                          <div className="font-semibold text-white">Симулятор</div>
                          <div className="mt-1 text-xs text-slate-400">
                            Проверка сценариев и прогноз влияния решений
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-white" />
                      </Link>

                      <div className="rounded-[22px] border border-fuchsia-300/10 bg-[linear-gradient(135deg,rgba(168,85,247,0.12),rgba(255,255,255,0.03))] p-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-fuchsia-200" />
                          <div className="text-sm font-semibold text-white">
                            Почему этот модуль важен
                          </div>
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-300">
                          Районный слой связывает общую городскую картину с
                          точечным анализом и помогает не терять пространственный
                          контекст при принятии решений.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_14px_34px_rgba(2,6,23,0.22)]">
                  <div className="text-sm text-slate-400">Выбранный район</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {selectedDistrict?.name ?? "—"}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_14px_34px_rgba(2,6,23,0.22)]">
                  <div className="text-sm text-slate-400">Оперативное здоровье</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {selectedDistrict?.realtimeHealth ?? "—"}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_14px_34px_rgba(2,6,23,0.22)]">
                  <div className="text-sm text-slate-400">Активные сигналы</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {selectedDistrictAnomalies.length}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}