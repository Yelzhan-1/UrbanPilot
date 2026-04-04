"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Brain,
  Building2,
  Car,
  Droplets,
  ShieldAlert,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import RealCityMap from "@/components/dashboard/RealCityMap";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import KpiCard from "@/components/dashboard/KpiCard";
import PageStateBlock from "@/components/dashboard/PageStateBlock";
import ExecutiveSummaryBlock from "@/components/dashboard/ExecutiveSummaryBlock";
import SectorCard from "@/components/dashboard/SectorCard";
import AnomaliesList from "@/components/dashboard/AnomaliesList";
import ForecastBlock from "@/components/dashboard/ForecastBlock";
import DistrictOverviewBlock from "@/components/dashboard/DistrictOverviewBlock";
import { calculateRealtimeHealth, prioritizeAnomalies } from "@/lib/ai-engine";
import type { Anomaly, District } from "@/types/dashboard";

function formatUpdatedAt(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function sectorStatus(score: number) {
  if (score >= 80) return "Стабильный режим";
  if (score >= 65) return "Под контролем";
  if (score >= 50) return "Нужен контроль";
  return "Высокая нагрузка";
}

function riskLevelFromScore(score: number) {
  if (score >= 70) return "critical" as const;
  if (score >= 55) return "high" as const;
  if (score >= 35) return "medium" as const;
  return "low" as const;
}

function avgDistrictHealth(districts: District[], anomalies: Anomaly[]) {
  if (districts.length === 0) return null;
  const values = districts.map((district) =>
    calculateRealtimeHealth(district, anomalies),
  );
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default function DashboardPage() {
  const { loading, error, data } = useDashboardData();

  const overview = data.overview;
  const districts = data.districts ?? [];
  const anomalies = data.anomalies ?? [];
  const forecast = data.forecast ?? [];
  const recommendations = data.recommendations ?? [];

  const cityName = overview?.cityName ?? "Алматы";
  const summary =
    overview?.executiveSummary ??
    "UrbanPilot объединяет карту, оперативные метрики, сигналы системы и рекомендации ИИ, чтобы быстрее видеть проблемные зоны и принимать решения на уровне города.";

  const sortedAnomalies = prioritizeAnomalies(anomalies);
  const topAnomalies = sortedAnomalies.slice(0, 4);

  const districtsWithHealth = districts
    .map((district) => {
      const realtimeHealth = calculateRealtimeHealth(district, anomalies);
      return { ...district, realtimeHealth, riskScore: 100 - realtimeHealth };
    })
    .sort((a, b) => a.realtimeHealth - b.realtimeHealth);

  const weakestDistrict = districtsWithHealth[0] ?? null;
  const averageHealth = avgDistrictHealth(districts, anomalies);

  const stats = [
    {
      label: "Индекс здоровья города",
      value: overview?.overallHealth ?? "—",
      hint: "общий городской индекс",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      label: "Активные аномалии",
      value: overview?.activeAnomalies ?? anomalies.length,
      hint: "текущий цикл мониторинга",
      icon: <BellRing className="h-5 w-5" />,
    },
    {
      label: "Критические сигналы",
      value: overview?.criticalAlerts ?? "—",
      hint: "требуют немедленного контроля",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      label: "Рекомендации ИИ",
      value: recommendations.length,
      hint: "доступно к исполнению",
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  const sectorCards = [
    {
      title: "Транспорт",
      subtitle: "Городские потоки и загруженность коридоров",
      value: overview?.sectorScores.transport ?? 0,
      status: sectorStatus(overview?.sectorScores.transport ?? 0),
      badge: "Онлайн",
      accent: "from-cyan-400/30 via-sky-500/20 to-blue-600/10",
      icon: <Car className="h-5 w-5" />,
    },
    {
      title: "Экология",
      subtitle: "Качество воздуха и локальные отклонения",
      value: overview?.sectorScores.ecology ?? 0,
      status: sectorStatus(overview?.sectorScores.ecology ?? 0),
      badge: "Аналитика",
      accent: "from-emerald-400/30 via-teal-500/20 to-cyan-600/10",
      icon: <Wind className="h-5 w-5" />,
    },
    {
      title: "Безопасность",
      subtitle: "Оперативные сигналы и нагрузка на службы",
      value: overview?.sectorScores.safety ?? 0,
      status: sectorStatus(overview?.sectorScores.safety ?? 0),
      badge: "Контроль",
      accent: "from-amber-300/30 via-orange-500/20 to-rose-600/10",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      title: "Инфраструктура",
      subtitle: "Коммунальные системы и устойчивость узлов",
      value: overview?.sectorScores.utilities ?? 0,
      status: sectorStatus(overview?.sectorScores.utilities ?? 0),
      badge: "Сеть",
      accent: "from-fuchsia-400/30 via-violet-500/20 to-purple-600/10",
      icon: <Droplets className="h-5 w-5" />,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-8%] top-[-6%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[6%] h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-8%] left-[18%] h-[20rem] w-[20rem] rounded-full bg-violet-500/8 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#040812_0%,#060a18_55%,#070c1e_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(147,210,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,210,255,1)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <Container>
        <div className="relative space-y-6">
          <Header
            eyebrow="UrbanPilot · Командный центр Алматы"
            title="Городской командный центр Алматы"
            subtitle="Единая панель для мониторинга городской среды, оценки рисков и ИИ-аналитики по районам Алматы."
            statusLabel="Система активна"
          />

          <ExecutiveSummaryBlock
            cityName={cityName}
            updatedAt={formatUpdatedAt(overview?.lastUpdated)}
            riskLevel={riskLevelFromScore(overview?.riskScore ?? 0)}
            summary={summary}
            highlights={[
              {
                id: "active-anomalies",
                label: "Активные сигналы",
                value: `${overview?.activeAnomalies ?? anomalies.length}`,
                tone: "bad",
              },
              {
                id: "priority-district",
                label: "Район внимания",
                value: weakestDistrict?.name ?? "—",
                tone: "neutral",
              },
              {
                id: "avg-health",
                label: "Среднее здоровье",
                value: `${averageHealth ?? "—"}`,
                tone: averageHealth !== null && averageHealth >= 65 ? "good" : "bad",
              },
            ]}
            primaryActions={[
              { id: "decision", label: "Центр решений", href: "/decision-center" },
              { id: "district", label: "Районы Алматы", href: "/district" },
              { id: "simulator", label: "Симулятор", href: "/simulator" },
            ]}
          />

          {loading ? (
            <PageStateBlock
              type="loading"
              message="Загрузка данных городского командного центра..."
            />
          ) : districts.length === 0 && anomalies.length === 0 && !overview ? (
            <PageStateBlock
              type="empty"
              message="UrbanPilot пока не получил данные для отображения дашборда."
            />
          ) : (
            <>
              {error && (
                <PageStateBlock
                  type="error"
                  title="Часть данных недоступна"
                  message={error}
                />
              )}

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <KpiCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    hint={item.hint}
                    icon={item.icon}
                  />
                ))}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-3">
                  <div className="section-label">Секторы мониторинга</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
                </div>
                <div className="grid gap-3 xl:grid-cols-4">
                  {sectorCards.map((card) => (
                    <SectorCard key={card.title} {...card} />
                  ))}
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.34fr_0.66fr]">
                <div className="relative overflow-hidden rounded-[34px] p-[1px] shadow-[0_24px_70px_rgba(2,6,23,0.36)]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(139,92,246,0.10),rgba(34,211,238,0.06))]" />
                  <div className="relative overflow-hidden rounded-[33px] bg-[linear-gradient(160deg,rgba(7,12,28,0.99)_0%,rgba(9,15,34,0.98)_60%,rgba(5,9,22,0.99)_100%)] p-6">
                    <div className="pointer-events-none absolute -left-16 -top-8 h-56 w-56 rounded-full bg-cyan-500/[0.08] blur-3xl" />
                    <div className="pointer-events-none absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-violet-600/[0.07] blur-3xl" />

                    <div className="relative mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="section-label">Карта мониторинга</div>
                          <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-2.5 py-0.5">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                              Live
                            </span>
                          </div>
                        </div>

                        <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white">
                          Карта {cityName} и точки контроля
                        </h3>

                        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-slate-500">
                          Пространственный слой с районами Алматы, зонами внимания,
                          инфраструктурными узлами и ключевыми маршрутами.
                        </p>
                      </div>

                      <div className="hidden rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 md:block">
                        Онлайн-карта
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
                      <RealCityMap />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {[
                        {
                          label: "Активные аномалии",
                          value: anomalies.length,
                        },
                        {
                          label: "Рекомендации ИИ",
                          value: recommendations.length,
                        },
                        {
                          label: "Приоритетный район",
                          value: weakestDistrict?.name ?? "—",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                            {item.label}
                          </div>
                          <div className="mt-2 text-xl font-bold tracking-tight text-white">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <AnomaliesList
                  items={topAnomalies.map((item) => ({
                    id: item.id,
                    title: item.title,
                    district:
                      districts.find((d) => d.id === item.districtId)?.name ??
                      "Район Алматы",
                    sector: item.sector,
                    severity: item.severity,
                    aiRiskScore: item.aiRiskScore,
                    detectedAt: formatTimeAgo(item.timestamp),
                    description: item.description,
                  }))}
                />
              </section>

              <section>
                <div className="mb-3 flex items-center gap-3">
                  <div className="section-label">Районная аналитика и прогноз</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <DistrictOverviewBlock
                    items={districtsWithHealth.map((district) => ({
                      id: district.id,
                      name: district.name,
                      healthScore: district.realtimeHealth,
                      riskScore: district.riskScore,
                      severity: riskLevelFromScore(district.riskScore),
                      activeAlerts: district.activeAnomaliesCount,
                      mainIssue: district.mainIssue,
                    }))}
                  />
                  <ForecastBlock items={forecast} />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-3">
                  <div className="section-label">Модули платформы</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      href: "/decision-center",
                      icon: Brain,
                      tag: "AI workflow",
                      title: "Центр решений",
                      desc: "Приоритеты ИИ, рекомендуемые действия и очередность реагирования.",
                    },
                    {
                      href: "/district",
                      icon: Building2,
                      tag: "Territory view",
                      title: "Районы Алматы",
                      desc: "Сравнение районов по здоровью системы, сигналам и ключевым рискам.",
                    },
                    {
                      href: "/simulator",
                      icon: Sparkles,
                      tag: "Scenario lab",
                      title: "Симулятор",
                      desc: "Проверка сценариев нагрузки и оценка эффекта управленческих решений.",
                    },
                  ].map(({ href, icon: Icon, tag, title, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-500 hover:border-cyan-400/[0.15] hover:bg-white/[0.05]"
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-400/[0.04] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5">
                            <Icon className="h-4 w-4 text-cyan-300" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/60">
                            {tag}
                          </span>
                        </div>

                        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] p-1.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="mt-5 text-[17px] font-semibold tracking-tight text-white">
                        {title}
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-slate-500">
                        {desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Город", value: cityName },
                  { label: "Район внимания", value: weakestDistrict?.name ?? "—" },
                  { label: "Среднее здоровье", value: averageHealth ?? "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors duration-300 hover:bg-white/[0.04]"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {item.label}
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}