"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  MapPinned,
  Radar,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import PriorityAlert from "@/components/ai/PriorityAlert";
import RecommendationsPanel from "@/components/ai/RecommendationsPanel";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import type {
  Recommendation,
  RecommendationPriority,
  SeverityLevel,
} from "@/types/dashboard";

function severityRank(value: SeverityLevel) {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function priorityRank(value: RecommendationPriority) {
  if (value === "Critical") return 4;
  if (value === "High") return 3;
  if (value === "Medium") return 2;
  return 1;
}

function priorityToSeverity(value: RecommendationPriority): SeverityLevel {
  if (value === "Critical") return "critical";
  if (value === "High") return "high";
  if (value === "Medium") return "medium";
  return "low";
}

function sectorLabel(value: string) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  if (value === "Utilities") return "Инфраструктура";
  return value;
}

function getDistrictName(
  districtId: string | undefined,
  districts: { id: string; name: string }[],
) {
  if (!districtId) return "Район Алматы";
  return districts.find((item) => item.id === districtId)?.name ?? "Район Алматы";
}

function getPriorityLabel(value: SeverityLevel) {
  if (value === "critical") return "Критический";
  if (value === "high") return "Высокий";
  if (value === "medium") return "Средний";
  return "Низкий";
}

function getPriorityPill(value: SeverityLevel) {
  if (value === "critical") return "border-rose-400/20 bg-rose-500/10 text-rose-300";
  if (value === "high") return "border-orange-400/20 bg-orange-500/10 text-orange-300";
  if (value === "medium") return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
}

function getSeverityBar(value: SeverityLevel) {
  if (value === "critical") return "bg-rose-500";
  if (value === "high") return "bg-orange-400";
  if (value === "medium") return "bg-amber-400";
  return "bg-emerald-400";
}

function formatImpact(score: number) {
  return `${score}/100`;
}

function mapStatus(status: Recommendation["status"]) {
  if (status === "resolved") return "done" as const;
  return status;
}

function mapEta(difficulty: Recommendation["implementationDifficulty"]) {
  if (difficulty === "high") return "2–6 ч";
  if (difficulty === "medium") return "45–90 мин";
  return "10–30 мин";
}

export default function DecisionCenterPage() {
  const { loading, error, data } = useDashboardData();

  const anomalies = data.anomalies ?? [];
  const recommendations = data.recommendations ?? [];
  const overview = data.overview;
  const districts = data.districts ?? [];

  const cityName = overview?.cityName ?? "Алматы";

  const topAnomaly = [...anomalies].sort(
    (a, b) =>
      severityRank(b.severity) - severityRank(a.severity) ||
      b.aiRiskScore - a.aiRiskScore,
  )[0];

  const topRecommendations = [...recommendations]
    .sort(
      (a, b) =>
        priorityRank(b.priority) - priorityRank(a.priority) ||
        b.estimatedImpactScore - a.estimatedImpactScore,
    )
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      sector: item.sector,
      severity: priorityToSeverity(item.priority),
      eta: mapEta(item.implementationDifficulty),
      impact: formatImpact(item.estimatedImpactScore),
      status: mapStatus(item.status),
    }));

  const priorityCards = [...anomalies]
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        b.aiRiskScore - a.aiRiskScore,
    )
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      level: getPriorityLabel(item.severity),
      desc: item.description,
      sector: sectorLabel(item.sector),
      district: getDistrictName(item.districtId, districts),
      severity: item.severity,
    }));

  const aiSteps = [
    {
      title: "Сбор сигналов",
      desc: "Платформа собирает оперативные данные по ключевым городским направлениям и объединяет их в единый контур наблюдения.",
    },
    {
      title: "Поиск аномалий",
      desc: "Система выделяет отклонения, сравнивает их по силе сигнала и сортирует по уровню риска.",
    },
    {
      title: "Оценка влияния",
      desc: "ИИ связывает аномалии с возможными последствиями и показывает, где вмешательство даст наибольший эффект.",
    },
    {
      title: "Рекомендации",
      desc: "На выходе формируется список действий, упорядоченный по срочности и ожидаемому эффекту.",
    },
  ];

  const operativeActions = [
    {
      icon: Radar,
      title: "Уточнить сигнал",
      desc: "Перепроверить наиболее сильные события и исключить ложные отклонения.",
    },
    {
      icon: Clock3,
      title: "Обновить цикл",
      desc: "После новой подгрузки данных система уточнит влияние и очередность реакции.",
    },
    {
      icon: MapPinned,
      title: "Сравнить районы",
      desc: "Модуль районов помогает быстро увидеть, где риски концентрируются сильнее всего.",
    },
    {
      icon: CheckCircle2,
      title: "Исполнить план",
      desc: "В первую очередь применять меры с высокой ожидаемой эффективностью и низким временем запуска.",
    },
  ];

  return (
    <main
      className="relative min-h-screen overflow-hidden pb-16 pt-6"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,92,246,0.16) 0%, transparent 65%), linear-gradient(180deg, #040812 0%, #060a18 55%, #070c1e 100%)",
      }}
    >
      {/* Grid texture — violet-shifted for Decision Center identity */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.022,
          maskImage:
            "radial-gradient(ellipse 100% 50% at 50% 0%, black 0%, transparent 100%)",
        }}
      />

      <Container>
        <div className="space-y-5">
          <Header
            eyebrow="UrbanPilot · Центр решений"
            title="Центр решений"
            subtitle={`Приоритеты, ключевые выводы и рекомендуемые действия для оперативного управления городской ситуацией в ${cityName}.`}
            statusLabel="ИИ активен"
          />

          {/* ── MISSION BRIEF ─────────────────────────────── */}
          <section
            className="relative overflow-hidden rounded-[36px] p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(34,211,238,0.10) 50%, rgba(139,92,246,0.07) 100%)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[35px] px-7 py-8 md:px-9 md:py-10"
              style={{
                background:
                  "linear-gradient(145deg, rgba(7,12,28,0.99) 0%, rgba(10,14,32,0.98) 55%, rgba(5,9,22,0.99) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full bg-violet-600/[0.10] blur-3xl" />
              <div className="pointer-events-none absolute -right-8 top-0 h-72 w-72 rounded-full bg-cyan-500/[0.07] blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-fuchsia-600/[0.07] blur-3xl" />

              {/* Status strip */}
              <div className="relative mb-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                    ИИ активен
                  </span>
                </div>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-[11px] tracking-wide text-white/25">
                  Центр управленческих решений
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span className="font-mono text-[11px] tracking-widest text-white/20">
                  {cityName} · Оперативный контур
                </span>
              </div>

              <div className="relative grid gap-10 xl:grid-cols-[1.25fr_0.95fr]">
                {/* Left: mission statement */}
                <div>
                  <div className="section-label">Главный вывод</div>
                  <h2
                    className="mt-4 font-bold tracking-[-0.05em] text-white"
                    style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.75rem)", lineHeight: 1.05 }}
                  >
                    Приоритет сейчас —
                    <br />
                    <span
                      style={{
                        background:
                          "linear-gradient(90deg, #c4b5fd 0%, #67e8f9 60%, #c4b5fd 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      сигналы с максимальным риском
                    </span>
                    <br />
                    <span className="text-white/55">и сильнейшим влиянием</span>
                  </h2>

                  <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-slate-400">
                    Модуль решений показывает, какие аномалии требуют первоочередного
                    внимания, какие действия дают лучший эффект и куда стоит
                    направить оперативный ресурс в первую очередь.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/district"
                      className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(255,255,255,0.10)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(255,255,255,0.18)]"
                    >
                      Открыть районы
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/simulator"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08]"
                    >
                      Перейти в симулятор
                    </Link>
                  </div>
                </div>

                {/* Right: AI briefing panel */}
                <div className="rounded-3xl border border-white/[0.07] bg-black/20 p-5 backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-violet-400/70" />
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-400/60">
                        Сводка ИИ
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-2.5 py-0.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
                        Онлайн
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Текущий фокус",
                        text: topAnomaly
                          ? `Сейчас система выделяет событие «${topAnomaly.title}» как наиболее приоритетное по силе сигнала и уровню риска.`
                          : "Система не обнаружила критических аномалий в текущем цикле анализа.",
                      },
                      {
                        label: "Статус системы",
                        text: overview
                          ? `${overview.status}. Активных аномалий: ${overview.activeAnomalies}. Критических сигналов: ${overview.criticalAlerts}.`
                          : "Данные обзора пока недоступны.",
                      },
                      {
                        label: "Короткое резюме",
                        text:
                          overview?.executiveSummary ??
                          "Система формирует сводку по приоритетным районам, сигналам и оперативным действиям.",
                      },
                    ].map((block) => (
                      <div
                        key={block.label}
                        className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4"
                      >
                        <div className="text-[11px] font-semibold text-white/60">
                          {block.label}
                        </div>
                        <div className="mt-1.5 text-[13px] leading-[1.7] text-slate-500">
                          {block.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── LOADING / ERROR ───────────────────────────── */}
          {loading ? (
            <section className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] px-6 py-6">
              <div className="text-[13px] text-slate-600">
                Загрузка данных модуля решений...
              </div>
            </section>
          ) : error ? (
            <section className="rounded-[28px] border border-rose-400/10 bg-rose-500/[0.04] px-6 py-6">
              <div className="text-[13px] text-rose-400">{error}</div>
            </section>
          ) : (
            <>
              {/* Priority alert */}
              <PriorityAlert
                title={topAnomaly ? topAnomaly.title : "Критических сигналов нет"}
                message={
                  topAnomaly
                    ? `${topAnomaly.description} Индекс риска: ${topAnomaly.aiRiskScore}/100.`
                    : "На текущем цикле система не выявила аномалий, требующих немедленного реагирования."
                }
                severity={topAnomaly ? topAnomaly.severity : "low"}
                sector={topAnomaly?.sector}
                district={
                  topAnomaly
                    ? getDistrictName(topAnomaly.districtId, districts)
                    : "Алматы"
                }
                actionLabel="Открыть план реагирования"
              />

              {/* ── PRIORITIES + RECOMMENDATIONS ──────────── */}
              <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                {/* Priority signals */}
                <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.03] p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                      <ShieldAlert className="h-4 w-4 text-sky-300" />
                    </div>
                    <div className="section-label">Приоритеты</div>
                  </div>

                  <div className="space-y-3">
                    {priorityCards.length === 0 ? (
                      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-[13px] text-slate-600">
                        Активных приоритетов пока нет.
                      </div>
                    ) : (
                      priorityCards.map((item, i) => (
                        <div
                          key={item.title}
                          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                          {/* Severity accent bar */}
                          <div
                            className={`absolute left-0 top-0 h-full w-[3px] rounded-l-2xl ${getSeverityBar(item.severity)} opacity-70`}
                          />

                          <div className="flex flex-wrap items-start justify-between gap-3 pl-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] tracking-widest text-white/[0.15]">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="text-[13px] font-semibold text-white truncate">
                                  {item.title}
                                </div>
                              </div>
                              <div className="mt-1.5 text-[12px] leading-6 text-slate-500">
                                {item.desc}
                              </div>
                            </div>

                            <span
                              className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${getPriorityPill(item.severity)}`}
                            >
                              {item.level}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 pl-1 text-[11px] uppercase tracking-[0.12em] text-slate-700">
                            <span>{item.sector}</span>
                            <span>·</span>
                            <span>{item.district}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <RecommendationsPanel
                  title="Рекомендуемые действия"
                  subtitle="Упорядочено по приоритету и ожидаемому эффекту"
                  items={topRecommendations}
                  maxItems={6}
                  emptyMessage="Рекомендации пока недоступны."
                />
              </section>
            </>
          )}

          {/* ── AI PIPELINE + OPERATIVE ACTIONS ──────────── */}
          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            {/* AI decision pipeline */}
            <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                  <Brain className="h-4 w-4 text-sky-300" />
                </div>
                <div className="section-label">Как ИИ принимает решение</div>
              </div>

              <div className="relative space-y-2">
                {/* Connecting line */}
                <div className="pointer-events-none absolute left-[19px] top-10 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-sky-400/20 via-violet-400/10 to-transparent" />

                {aiSteps.map((item, index) => (
                  <div
                    key={item.title}
                    className="relative flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
                  >
                    <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/[0.08] text-[11px] font-bold text-sky-300">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">
                        {item.title}
                      </div>
                      <div className="mt-1.5 text-[12px] leading-[1.7] text-slate-500">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operative actions */}
            <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                  <Sparkles className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div className="section-label">Оперативные действия</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {operativeActions.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.09] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-300" />
                      </div>
                      <div className="text-[13px] font-semibold text-white">{title}</div>
                    </div>
                    <div className="mt-2.5 text-[12px] leading-[1.7] text-slate-500">
                      {desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/district"
                  className="group inline-flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.07]"
                >
                  Районы
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/simulator"
                  className="group inline-flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.07]"
                >
                  Симулятор
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── STATUS STRIP ──────────────────────────────── */}
          <section className="grid gap-3 md:grid-cols-3">
            {[
              {
                icon: ShieldAlert,
                title: "Приоритетный сигнал",
                body: topAnomaly ? topAnomaly.title : "Нет активного критического сигнала",
              },
              {
                icon: Brain,
                title: "Активные рекомендации",
                body: `${recommendations.length} рекомендаций в текущем наборе данных`,
              },
              {
                icon: Waves,
                title: "Общий статус",
                body: overview
                  ? `${overview.status}. Активных аномалий: ${overview.activeAnomalies}. Критических сигналов: ${overview.criticalAlerts}.`
                  : "Обзор системы пока недоступен.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5 transition-colors duration-300 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 flex-shrink-0 text-slate-600" />
                  <div className="text-[13px] font-semibold text-white/70">{item.title}</div>
                </div>
                <div className="mt-3 text-[13px] leading-6 text-slate-600">{item.body}</div>
              </div>
            ))}
          </section>
        </div>
      </Container>
    </main>
  );
}