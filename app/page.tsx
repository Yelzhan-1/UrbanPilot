"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BellRing,
  Brain,
  Building2,
  Car,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import type { District, Sector } from "@/types/dashboard";

function sectorLabel(value: Sector | string) {
  if (value === "Transport") return "Транспорт";
  if (value === "Ecology") return "Экология";
  if (value === "Safety") return "Безопасность";
  if (value === "Utilities") return "Инфраструктура";
  return value;
}

function getDistrictName(districtId: string | undefined, districts: District[]) {
  if (!districtId) return "Район Алматы";
  return districts.find((item) => item.id === districtId)?.name ?? "Район Алматы";
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

function getRiskVariant(score: number) {
  if (score >= 80)
    return {
      dotCls: "bg-red-400",
      badgeCls: "border-red-400/25 bg-red-500/10 text-red-300",
      barCls: "bg-red-500",
    };
  if (score >= 60)
    return {
      dotCls: "bg-orange-400",
      badgeCls: "border-orange-400/25 bg-orange-500/10 text-orange-300",
      barCls: "bg-orange-400",
    };
  return {
    dotCls: "bg-amber-400",
    badgeCls: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    barCls: "bg-amber-400",
  };
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-500 hover:border-cyan-400/20 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-transparent p-3">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <span className="font-mono text-[11px] tracking-widest text-white/[0.12]">{num}</span>
      </div>
      <div className="mt-6 text-[17px] font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-2 text-[13px] leading-[1.75] text-slate-500">{description}</div>
    </div>
  );
}

function ModuleCard({
  href,
  title,
  description,
  tag,
}: {
  href: string;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-500 hover:border-cyan-400/[0.15] hover:bg-white/[0.05]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-400/[0.04] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/80">
          {tag}
        </span>
        <div className="flex-shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] p-1.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
      <div className="mt-6 text-xl font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-2 text-[13px] leading-6 text-slate-500">{description}</div>
    </Link>
  );
}

export default function LandingPage() {
  const { loading, data } = useDashboardData();

  const overview = data.overview;
  const districts = data.districts ?? [];
  const anomalies = data.anomalies ?? [];
  const recommendations = data.recommendations ?? [];

  const topSignals = [...anomalies]
    .sort((a, b) => b.aiRiskScore - a.aiRiskScore)
    .slice(0, 3);

  const overviewMeta = overview as
    | (typeof overview & { cityName?: string; executiveSummary?: string })
    | null;

  const cityName = overviewMeta?.cityName ?? "Алматы";

  const featureCards = [
    {
      icon: MapPinned,
      title: "Единая городская картина",
      description:
        "В одном интерфейсе объединяются сигналы по транспорту, экологии, безопасности и инфраструктуре.",
    },
    {
      icon: Brain,
      title: "Приоритизация ИИ",
      description:
        "Система автоматически выделяет сигналы, которые требуют внимания в первую очередь.",
    },
    {
      icon: Sparkles,
      title: "Сценарное моделирование",
      description:
        "Симулятор помогает заранее оценить последствия роста нагрузки и выбрать лучший ответ.",
    },
  ];

  return (
    <main
      className="relative min-h-screen overflow-hidden pb-16 pt-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.20) 0%, transparent 65%), linear-gradient(180deg, #040812 0%, #060a18 55%, #070c1e 100%)",
      }}
    >
      {/* Subtle city-grid texture */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,210,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,210,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.028,
          maskImage:
            "radial-gradient(ellipse 100% 55% at 50% 0%, black 0%, transparent 100%)",
        }}
      />

      <Container>
        <div className="space-y-5">
          <Header
            eyebrow="UrbanPilot · Городская платформа"
            title="Умное управление Алматы на одном экране"
            subtitle="UrbanPilot объединяет городской мониторинг, рекомендации ИИ, сравнение районов и сценарное моделирование в единую платформу для быстрых решений."
            statusLabel="Платформа активна"
          />

          {/* ── HERO ────────────────────────────────────────── */}
          <section
            className="relative overflow-hidden rounded-[36px] p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.22) 0%, rgba(139,92,246,0.14) 45%, rgba(34,211,238,0.07) 100%)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[35px] px-7 py-8 md:px-9 md:py-10"
              style={{
                background:
                  "linear-gradient(145deg, rgba(7,12,28,0.99) 0%, rgba(9,15,34,0.98) 55%, rgba(5,9,22,0.99) 100%)",
              }}
            >
              {/* Intentional glow anchors */}
              <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-cyan-500/[0.09] blur-3xl" />
              <div className="pointer-events-none absolute -right-10 top-0 h-80 w-80 rounded-full bg-violet-600/[0.09] blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-blue-700/[0.08] blur-3xl" />

              {/* Technical metadata strip */}
              <div className="relative mb-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    Система активна
                  </span>
                </div>
                <span className="h-3 w-px bg-white/10" />
                <span className="font-mono text-[11px] tracking-widest text-white/25">
                  43°15′N · 76°54′E
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-[11px] tracking-wide text-white/25">
                  Алматы, Казахстан
                </span>
              </div>

              <div className="relative grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
                {/* Left */}
                <div>
                  <div className="section-label">Платформа управления городом</div>

                  <h2 className="mt-4 max-w-2xl font-bold tracking-[-0.05em] text-white"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.0 }}
                  >
                    Не просто дашборд —
                    <br />
                    <span
                      style={{
                        background:
                          "linear-gradient(90deg, #67e8f9 0%, #a78bfa 55%, #67e8f9 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      командный центр
                    </span>
                    <br />
                    <span className="text-white/60">{cityName}</span>
                  </h2>

                  <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-slate-400">
                    Платформа помогает быстро увидеть, где растёт нагрузка, какие
                    районы требуют внимания, какие действия дадут лучший эффект и
                    как будет меняться ситуация при разных сценариях.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_28px_rgba(255,255,255,0.10)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(255,255,255,0.18)]"
                    >
                      Открыть дашборд
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/decision-center"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08]"
                    >
                      Центр решений
                    </Link>
                  </div>

                  {/* KPI strip */}
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Районы в системе",
                        value: districts.length || "—",
                        sub: "охвачено мониторингом",
                      },
                      {
                        label: "Активные сигналы",
                        value: overview ? overview.activeAnomalies : anomalies.length,
                        sub: "текущий цикл анализа",
                      },
                      {
                        label: "AI-действия",
                        value: recommendations.length,
                        sub: "готово к исполнению",
                      },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          {kpi.label}
                        </div>
                        <div className="mt-2 text-[2.25rem] font-bold leading-none tracking-tight text-white">
                          {kpi.value}
                        </div>
                        <div className="mt-1.5 text-[12px] text-slate-600">{kpi.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: live intelligence panel */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="section-label">Живой срез города</div>
                    <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Brain, label: "Индекс здоровья", value: overview?.overallHealth ?? "—" },
                      { icon: BellRing, label: "Критические", value: overview?.criticalAlerts ?? "—" },
                      { icon: Car, label: "Транспорт", value: overview?.sectorScores?.transport ?? "—" },
                      { icon: Wind, label: "Экология", value: overview?.sectorScores?.ecology ?? "—" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/[0.05] bg-black/30 p-4 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-cyan-400/60" />
                          <div className="text-[11px] text-slate-600">{label}</div>
                        </div>
                        <div className="mt-3 text-[2.25rem] font-bold leading-none tracking-tight text-white">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/[0.05] bg-black/25 p-4 backdrop-blur-sm">
                    <div className="mb-2.5 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-violet-400/70" />
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-400/60">
                        AI · Коротко по ситуации
                      </div>
                    </div>
                    <div className="text-[13px] leading-[1.75] text-slate-500">
                      {overviewMeta?.executiveSummary ??
                        "Система готова показать приоритетные районы, ключевые сигналы и рекомендуемые действия для Алматы."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURE CARDS ───────────────────────────────── */}
          <section className="grid gap-4 md:grid-cols-3">
            {featureCards.map((item, i) => (
              <FeatureCard key={item.title} {...item} index={i} />
            ))}
          </section>

          {/* ── CAPABILITIES + SIGNALS ──────────────────────── */}
          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            {/* Capabilities */}
            <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="section-label">Что умеет платформа</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Дашборд",
                    desc: "Главный экран с картой, метриками и приоритетными уведомлениями.",
                    href: "/dashboard",
                  },
                  {
                    title: "Центр решений",
                    desc: "AI-рекомендации и порядок действий по наиболее важным событиям.",
                    href: "/decision-center",
                  },
                  {
                    title: "Районы Алматы",
                    desc: "Сравнение районов по уровню риска, устойчивости и активным сигналам.",
                    href: "/district",
                  },
                  {
                    title: "Симулятор",
                    desc: "Проверка сценариев нагрузки и прогноз влияния на выбранный район.",
                    href: "/simulator",
                  },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.09] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-semibold text-white">{item.title}</div>
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-slate-400" />
                    </div>
                    <div className="mt-2 text-[12px] leading-6 text-slate-600">{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live signals */}
            <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                  <Zap className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div className="section-label">Текущие сигналы</div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-[13px] text-slate-600">
                    Загрузка сигнального слоя...
                  </div>
                ) : topSignals.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-[13px] text-slate-600">
                    Активные сигналы пока недоступны.
                  </div>
                ) : (
                  topSignals.map((item) => {
                    const risk = getRiskVariant(item.aiRiskScore);
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className={`mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${risk.dotCls}`} />
                            <div>
                              <div className="text-[13px] font-semibold text-white">
                                {item.title}
                              </div>
                              <div className="mt-0.5 text-[12px] text-slate-600">
                                {getDistrictName(item.districtId, districts)}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums tracking-wide ${risk.badgeCls}`}
                          >
                            {item.aiRiskScore}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                            <div
                              className={`h-full rounded-full ${risk.barCls} opacity-60`}
                              style={{ width: `${item.aiRiskScore}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-700">
                            <span>{sectorLabel(item.sector)}</span>
                            <span>·</span>
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* ── MODULE CARDS ────────────────────────────────── */}
          <section className="grid gap-4 md:grid-cols-3">
            <ModuleCard
              href="/dashboard"
              tag="Главный экран"
              title="Дашборд"
              description="Карта Алматы, live-метрики, AI-уведомления и командный обзор города."
            />
            <ModuleCard
              href="/decision-center"
              tag="AI workflow"
              title="Центр решений"
              description="Упорядоченные рекомендации, приоритетные сигналы и действия с максимальным эффектом."
            />
            <ModuleCard
              href="/district"
              tag="Territory view"
              title="Районы Алматы"
              description="Сравнение районов, оценка устойчивости и поиск территорий с повышенным риском."
            />
          </section>

          {/* ── CTA ─────────────────────────────────────────── */}
          <section
            className="relative overflow-hidden rounded-[32px] p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(34,211,238,0.07) 100%)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[31px] p-8 md:p-10"
              style={{
                background:
                  "linear-gradient(145deg, rgba(8,14,32,0.99) 0%, rgba(11,19,44,0.98) 55%, rgba(6,10,24,0.99) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -left-16 top-0 h-60 w-60 rounded-full bg-cyan-500/[0.08] blur-3xl" />
              <div className="pointer-events-none absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-violet-600/[0.08] blur-3xl" />

              <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
                <div>
                  <div className="section-label">Следующий шаг</div>
                  <h3
                    className="mt-3 font-bold tracking-[-0.04em] text-white"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}
                  >
                    Открой командный центр — посмотри ситуацию по {cityName} прямо сейчас
                  </h3>
                  <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-slate-500">
                    Главный дашборд — самый сильный экран платформы. Карта, приоритетные
                    сигналы, районы риска и AI-действия в единой системе.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 xl:justify-end">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_28px_rgba(255,255,255,0.10)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(255,255,255,0.20)]"
                  >
                    Перейти в дашборд
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.05] px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.08]"
                  >
                    Открыть симулятор
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── INFO STRIP ──────────────────────────────────── */}
          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Районы в фокусе",
                body:
                  districts.length > 0
                    ? `${districts.length} районов Алматы подключены к аналитическому контуру.`
                    : "Районный слой готов к подключению.",
              },
              {
                icon: Waves,
                title: "Состояние системы",
                body: overview
                  ? `Индекс здоровья города: ${overview.overallHealth}. Активных аномалий: ${overview.activeAnomalies}.`
                  : "Оперативный слой ожидает загрузки данных.",
              },
              {
                icon: BellRing,
                title: "AI-рекомендации",
                body:
                  recommendations.length > 0
                    ? `${recommendations.length} рекомендаций доступны для оперативной оценки и исполнения.`
                    : "Рекомендации появятся после загрузки аналитического слоя.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.09] hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 flex-shrink-0 text-cyan-400/60" />
                  <div className="text-[13px] font-semibold text-white/80">{item.title}</div>
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