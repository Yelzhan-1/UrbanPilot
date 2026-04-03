"use client";

import { useEffect, useMemo, useState } from "react";
import AiSummary from "@/components/ai/AiSummary";
import ExplainabilityPanel from "@/components/ai/ExplainabilityPanel";
import PriorityAlert from "@/components/ai/PriorityAlert";
import RecommendationsPanel from "@/components/ai/RecommendationsPanel";
import SectionHeader from "@/components/ai/SectionHeader";
import TopAnomaliesBlock from "@/components/ai/TopAnomaliesBlock";

type Severity = "low" | "medium" | "high" | "critical";

type OverviewData = {
  cityName?: string;
  generatedAt?: string;
  overallRiskScore?: number;
  confidence?: number;
  activeAlerts?: number;
  recommendationCount?: number;
  sectors?: Array<{
    sector?: string;
    score?: number;
    delta?: number;
    severity?: Severity;
  }>;
};

type AnomalyData = Array<{
  id?: string;
  title?: string;
  sector?: string;
  district?: string;
  severity?: Severity;
  metricLabel?: string;
  metricValue?: string | number;
  detectedAt?: string;
  trend?: "rising" | "stable" | "falling";
  description?: string;
}>;

type ForecastData = {
  confidence?: number;
  drivers?: Array<{
    id?: string;
    label?: string;
    value?: string;
    contribution?: number;
    direction?: "up" | "down" | "neutral";
    severity?: Severity;
  }>;
};

type RecommendationsData = Array<{
  id?: string;
  title?: string;
  description?: string;
  sector?: string;
  severity?: Severity;
  eta?: string;
  impact?: string;
  status?: "pending" | "in_progress" | "scheduled" | "done";
}>;

type DistrictsData = Array<{
  name?: string;
  risk?: number;
  severity?: Severity;
}>;

type DataBundle = {
  overview: OverviewData | null;
  anomalies: AnomalyData | null;
  forecast: ForecastData | null;
  recommendations: RecommendationsData | null;
  districts: DistrictsData | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function severityFromScore(score: number): Severity {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function safeJsonParse<T>(text: string): T | null {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function loadJson<T>(path: string): Promise<T | null> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) return null;
  const raw = await response.text();
  return safeJsonParse<T>(raw);
}

export default function DecisionCenterPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataBundle>({
    overview: null,
    anomalies: null,
    forecast: null,
    recommendations: null,
    districts: null,
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [overview, anomalies, forecast, recommendations, districts] = await Promise.all([
          loadJson<OverviewData>("/data/overview.json"),
          loadJson<AnomalyData>("/data/anomalies.json"),
          loadJson<ForecastData>("/data/forecast.json"),
          loadJson<RecommendationsData>("/data/recommendations.json"),
          loadJson<DistrictsData>("/data/districts.json"),
        ]);

        if (!mounted) return;

        setData({
          overview,
          anomalies,
          forecast,
          recommendations,
          districts,
        });
      } catch {
        if (!mounted) return;
        setError("Failed to load decision data. Please retry in a moment.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const mapped = useMemo(() => {
    const anomalies = (Array.isArray(data.anomalies) ? data.anomalies : [])
      .filter((a) => a && (a.title || a.metricLabel || a.metricValue))
      .map((a, index) => {
        const metricLabel = a.metricLabel || "Anomaly Value";
        const metricValue = typeof a.metricValue === "number" ? a.metricValue.toString() : a.metricValue || "n/a";
        return {
          id: a.id || `anomaly-${index}`,
          title: a.title || `${a.sector || "City"} anomaly detected`,
          sector: a.sector || "Unknown Sector",
          district: a.district || "Unknown District",
          severity: a.severity || "medium" as Severity,
          metricLabel,
          metricValue,
          detectedAt: a.detectedAt || "recently",
          trend: a.trend || "stable" as "rising" | "stable" | "falling",
          description: a.description,
        };
      });

    const recommendations = (Array.isArray(data.recommendations) ? data.recommendations : [])
      .filter((r) => r && (r.title || r.description))
      .map((r, index) => ({
        id: r.id || `recommendation-${index}`,
        title: r.title || "Operational adjustment",
        description: r.description || "No description provided.",
        sector: r.sector || "Cross-sector",
        severity: r.severity || "medium" as Severity,
        eta: r.eta,
        impact: r.impact,
        status: r.status,
      }));

    const explainability = (Array.isArray(data.forecast?.drivers) ? data.forecast?.drivers : [])
      .filter((d) => d && (d.label || d.value))
      .map((d, index) => ({
        id: d.id || `driver-${index}`,
        label: d.label || "Risk driver",
        value: d.value || "Signal in observed range",
        contribution: clamp(typeof d.contribution === "number" ? d.contribution : 25, 0, 100),
        direction: d.direction || "neutral" as "up" | "down" | "neutral",
        severity: d.severity,
      }));

    const sectorScores =
      data.overview?.sectors?.map((s) => {
        const score = clamp(typeof s.score === "number" ? s.score : 0, 0, 100);
        return {
          sector: s.sector || "Unknown",
          score,
          delta: typeof s.delta === "number" ? s.delta : undefined,
          severity: s.severity || severityFromScore(score),
        };
      }) || [];

    const overviewRisk = clamp(typeof data.overview?.overallRiskScore === "number" ? data.overview.overallRiskScore : 0, 0, 100);
    const computedRisk =
      overviewRisk > 0
        ? overviewRisk
        : anomalies.length > 0
          ? Math.round(
              anomalies.reduce((acc, item) => {
                if (item.severity === "critical") return acc + 90;
                if (item.severity === "high") return acc + 72;
                if (item.severity === "medium") return acc + 52;
                return acc + 28;
              }, 0) / anomalies.length,
            )
          : 0;

    const topCritical = [...anomalies].sort((a, b) => {
      const rank = (v: Severity): number => (v === "critical" ? 4 : v === "high" ? 3 : v === "medium" ? 2 : 1);
      return rank(b.severity) - rank(a.severity);
    })[0];

    const districtFromData =
      topCritical?.district ||
      (Array.isArray(data.districts) && data.districts.length > 0 ? data.districts[0]?.name : undefined) ||
      "Citywide";

    return {
      cityName: data.overview?.cityName || "UrbanPilot Smart City",
      generatedAt: data.overview?.generatedAt || new Date().toLocaleString(),
      confidence: clamp(
        typeof data.overview?.confidence === "number"
          ? data.overview.confidence
          : typeof data.forecast?.confidence === "number"
            ? data.forecast.confidence
            : 78,
        0,
        100,
      ),
      activeAlerts:
        typeof data.overview?.activeAlerts === "number"
          ? data.overview.activeAlerts
          : anomalies.filter((a) => a.severity === "high" || a.severity === "critical").length,
      recommendationCount:
        typeof data.overview?.recommendationCount === "number" ? data.overview.recommendationCount : recommendations.length,
      overallRiskScore: computedRisk,
      severity: severityFromScore(computedRisk),
      anomalies,
      recommendations,
      explainability,
      sectors: sectorScores,
      priority: {
        title: topCritical?.title || "No critical city alert at this moment",
        message:
          topCritical?.description ||
          (anomalies.length > 0
            ? "AI has detected active anomalies that require coordinated response planning."
            : "System is online. Waiting for incoming anomalies from sector streams."),
        severity: topCritical?.severity || severityFromScore(computedRisk),
        sector: topCritical?.sector || (sectorScores[0]?.sector ?? "Cross-sector"),
        district: districtFromData,
      },
    };
  }, [data]);

  const hasAnyData =
    mapped.anomalies.length > 0 ||
    mapped.recommendations.length > 0 ||
    mapped.explainability.length > 0 ||
    mapped.sectors.length > 0 ||
    mapped.overallRiskScore > 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SectionHeader
          title="Decision Center"
          subtitle="The city operations brain: monitor live anomalies, assess risk criticality, and surface next-best actions for operators."
          statusLabel="Live Signals"
          navItems={[
            { label: "Decision Center", href: "/decision-center", active: true },
            { label: "District Analysis", href: "/district" },
            { label: "Scenario Simulator", href: "/simulator" },
          ]}
        />

        {loading && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
            <p className="mt-3 text-sm text-slate-300">Loading city intelligence signals...</p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <h2 className="text-base font-semibold text-rose-200">Data stream unavailable</h2>
            <p className="mt-2 text-sm text-rose-100/90">{error}</p>
          </section>
        )}

        {!loading && !error && !hasAnyData && (
          <section className="rounded-2xl border border-dashed border-white/20 bg-slate-900/50 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-100">No decision data yet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Add valid JSON payloads in `public/data` (`overview`, `anomalies`, `forecast`, `recommendations`, `districts`) to activate
              the full Decision Center experience.
            </p>
          </section>
        )}

        {!loading && !error && hasAnyData && (
          <>
            <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">City Operational Status</p>
                  <p className="mt-1 text-sm text-slate-200">
                    Now monitoring <span className="font-semibold text-cyan-300">{mapped.cityName}</span> with{" "}
                    <span className="font-semibold text-slate-100">{mapped.activeAlerts}</span> active alerts and{" "}
                    <span className="font-semibold text-slate-100">{mapped.recommendationCount}</span> proposed interventions.
                  </p>
                </div>
                <p className="text-xs text-slate-400">Updated {mapped.generatedAt}</p>
              </div>
            </section>

            <AiSummary
              title="Real-time AI Operational Summary"
              cityName={mapped.cityName}
              overallRiskScore={mapped.overallRiskScore}
              severity={mapped.severity}
              confidence={mapped.confidence}
              activeAlerts={mapped.activeAlerts}
              recommendationCount={mapped.recommendationCount}
              generatedAt={mapped.generatedAt}
              sectors={mapped.sectors}
            />

            <PriorityAlert
              title={mapped.priority.title}
              message={mapped.priority.message}
              severity={mapped.priority.severity}
              sector={mapped.priority.sector}
              district={mapped.priority.district}
              actionLabel="Escalate Response"
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
              <TopAnomaliesBlock className="xl:col-span-3" items={mapped.anomalies} />
              <ExplainabilityPanel
                className="xl:col-span-2"
                confidence={mapped.confidence}
                rationale="The model combines anomaly pressure, district context, and forecast drivers to explain risk and prioritize action."
                factors={mapped.explainability}
              />
            </div>

            <RecommendationsPanel
              title="Next Best Actions for City Operators"
              subtitle="Interventions ranked by urgency, feasibility, and expected impact"
              items={mapped.recommendations}
            />
          </>
        )}
      </div>
    </main>
  );
}