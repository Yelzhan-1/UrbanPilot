"use client";

import { useEffect, useMemo, useState } from "react";
import AnomaliesList, { type AnomalyListItem } from "@/components/dashboard/AnomaliesList";
import DistrictOverviewBlock, { type DistrictOverviewRow } from "@/components/dashboard/DistrictOverviewBlock";
import ExecutiveSummaryBlock from "@/components/dashboard/ExecutiveSummaryBlock";
import ForecastBlock, { type ForecastDriver } from "@/components/dashboard/ForecastBlock";
import KpiCard from "@/components/dashboard/KpiCard";
import RiskBadge from "@/components/dashboard/RiskBadge";
import SectorCard from "@/components/dashboard/SectorCard";
import PageStateBlock from "@/components/dashboard/PageStateBlock";
import Container from "@/components/ui/Container";
import Header from "@/components/ui/Header";
import SectionWrapper from "@/components/ui/SectionWrapper";

type RiskLevel = "low" | "medium" | "high" | "critical";

type OverviewData = {
  cityName?: string;
  generatedAt?: string;
  overallRiskScore?: number;
  confidence?: number;
  activeAlerts?: number;
  recommendationCount?: number;
  executiveSummary?: string;
  sectors?: Array<{
    sector?: string;
    score?: number;
    delta?: number;
    severity?: RiskLevel;
  }>;
};

type DistrictRaw = {
  id?: string;
  name?: string;
  district?: string;
  risk?: number;
  riskScore?: number;
  score?: number;
  alerts?: number;
  activeAlerts?: number;
  severity?: RiskLevel;
};

type AnomalyRaw = {
  id?: string;
  title?: string;
  sector?: string;
  district?: string;
  severity?: RiskLevel;
  metricLabel?: string;
  metricValue?: string | number;
  detectedAt?: string;
  description?: string;
};

type ForecastRaw = {
  headline?: string;
  summary?: string;
  horizon?: string;
  confidence?: number;
  drivers?: Array<{
    id?: string;
    label?: string;
    value?: string;
    severity?: RiskLevel;
    impact?: RiskLevel;
    contribution?: number;
  }>;
};

type RecommendationRaw = {
  id?: string;
  title?: string;
  description?: string;
  sector?: string;
  severity?: RiskLevel;
};

type DataBundle = {
  overview: OverviewData | null;
  districts: DistrictRaw[] | null;
  anomalies: AnomalyRaw[] | null;
  forecast: ForecastRaw | null;
  recommendations: RecommendationRaw[] | null;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function safeParse<T>(text: string): T | null {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function loadJson<T>(path: string): Promise<T | null> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) return null;
  const text = await res.text();
  return safeParse<T>(text);
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function severityRank(s: RiskLevel): number {
  if (s === "critical") return 4;
  if (s === "high") return 3;
  if (s === "medium") return 2;
  return 1;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataBundle>({
    overview: null,
    districts: null,
    anomalies: null,
    forecast: null,
    recommendations: null,
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [overview, districts, anomalies, forecast, recommendations] = await Promise.all([
          loadJson<OverviewData>("/data/overview.json"),
          loadJson<DistrictRaw[]>("/data/districts.json"),
          loadJson<AnomalyRaw[]>("/data/anomalies.json"),
          loadJson<ForecastRaw>("/data/forecast.json"),
          loadJson<RecommendationRaw[]>("/data/recommendations.json"),
        ]);

        if (!mounted) return;
        setData({
          overview,
          districts: Array.isArray(districts) ? districts : null,
          anomalies: Array.isArray(anomalies) ? anomalies : null,
          forecast,
          recommendations: Array.isArray(recommendations) ? recommendations : null,
        });
      } catch {
        if (!mounted) return;
        setError("Unable to load operational dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const view = useMemo(() => {
    const anomaliesMapped: AnomalyListItem[] = (data.anomalies ?? [])
      .filter((a) => a && (a.title || a.metricLabel || a.metricValue))
      .map((a, index) => ({
        id: a.id || `anomaly-${index}`,
        title: a.title || `${a.sector || "City"} anomaly`,
        sector: a.sector,
        district: a.district,
        severity: a.severity || "medium",
        metricLabel: a.metricLabel,
        metricValue: typeof a.metricValue === "number" ? String(a.metricValue) : a.metricValue,
        detectedAt: a.detectedAt,
        description: a.description,
      }));

    const forecastDrivers: ForecastDriver[] = (data.forecast?.drivers ?? []).map((d, index) => ({
      id: d.id || `driver-${index}`,
      label: d.label || "Risk driver",
      value: d.value || "No detail available",
      impact: d.impact || d.severity,
      contribution: typeof d.contribution === "number" ? clamp(d.contribution) : undefined,
    }));

    const districtRows: DistrictOverviewRow[] = (data.districts ?? []).map((d, index) => {
      const riskScore = clamp(
        typeof d.riskScore === "number"
          ? d.riskScore
          : typeof d.risk === "number"
            ? d.risk
            : typeof d.score === "number"
              ? d.score
              : 0,
      );
      return {
        id: d.id || `district-${index}`,
        name: d.name || d.district || `District ${index + 1}`,
        riskScore,
        level: d.severity || levelFromScore(riskScore),
        alerts:
          typeof d.activeAlerts === "number"
            ? d.activeAlerts
            : typeof d.alerts === "number"
              ? d.alerts
              : undefined,
      };
    });

    const sectors = data.overview?.sectors ?? [];
    const sectorMap = {
      transport: sectors.find((s) => (s.sector || "").toLowerCase() === "transport"),
      ecology: sectors.find((s) => (s.sector || "").toLowerCase() === "ecology"),
      safety: sectors.find((s) => (s.sector || "").toLowerCase() === "safety"),
      utilities: sectors.find((s) => (s.sector || "").toLowerCase() === "utilities"),
    };

    const riskScore =
      typeof data.overview?.overallRiskScore === "number"
        ? clamp(data.overview.overallRiskScore)
        : anomaliesMapped.length > 0
          ? clamp(
              Math.round(
                anomaliesMapped.reduce((acc, item) => {
                  if (item.severity === "critical") return acc + 90;
                  if (item.severity === "high") return acc + 72;
                  if (item.severity === "medium") return acc + 50;
                  return acc + 28;
                }, 0) / anomaliesMapped.length,
              ),
            )
          : 0;

    const confidence =
      typeof data.overview?.confidence === "number"
        ? clamp(data.overview.confidence)
        : typeof data.forecast?.confidence === "number"
          ? clamp(data.forecast.confidence)
          : 76;

    const activeAlerts =
      typeof data.overview?.activeAlerts === "number"
        ? data.overview.activeAlerts
        : anomaliesMapped.filter((a) => a.severity === "high" || a.severity === "critical").length;

    const recommendationCount =
      typeof data.overview?.recommendationCount === "number"
        ? data.overview.recommendationCount
        : (data.recommendations ?? []).length;

    const topRecs = [...(data.recommendations ?? [])]
      .filter((r) => r && (r.title || r.description))
      .sort((a, b) => severityRank((b.severity || "medium") as RiskLevel) - severityRank((a.severity || "medium") as RiskLevel))
      .slice(0, 3);

    const executiveSummary =
      data.overview?.executiveSummary ||
      (topRecs.length > 0
        ? `Priority focus: ${topRecs.map((r) => r.title || "Action").join("; ")}. Coordinate cross-sector response where anomalies cluster.`
        : anomaliesMapped.length > 0
          ? `${anomaliesMapped.length} active signals require monitoring. Review sector pressure and district hotspots below.`
          : "Operational posture is stable. Continue monitoring live signals and short-term forecast drivers.");

    return {
      cityName: data.overview?.cityName || "UrbanPilot City",
      generatedAt: data.overview?.generatedAt || new Date().toLocaleString(),
      riskScore,
      riskLevel: levelFromScore(riskScore),
      confidence,
      activeAlerts,
      recommendationCount,
      sectors: sectorMap,
      anomaliesMapped,
      forecastHeadline: data.forecast?.headline || "Short-term operational forecast",
      forecastSummary:
        data.forecast?.summary ||
        "Weighted outlook across transport load, environmental stress, public safety incidents, and utility reliability.",
      forecastHorizon: data.forecast?.horizon || "Next 12 hours",
      forecastDrivers,
      districtRows,
      executiveSummary,
      topRecs,
    };
  }, [data]);

  const hasAnyData =
    view.riskScore > 0 ||
    view.anomaliesMapped.length > 0 ||
    view.forecastDrivers.length > 0 ||
    view.districtRows.length > 0 ||
    view.topRecs.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 pb-12 pt-6 text-slate-100">
      <Container>
        <div className="space-y-6">
          <Header
            eyebrow="UrbanPilot · Operations"
            title="Main Dashboard"
            subtitle="City-wide situational awareness: risk, sectors, anomalies, forecast, and districts in one operational view."
            statusLabel="Live Overview"
            links={[
              { label: "Landing", href: "/" },
              { label: "Dashboard", href: "/dashboard", active: true },
              { label: "Decision Center", href: "/decision-center" },
              { label: "Districts", href: "/district" },
              { label: "Simulator", href: "/simulator" },
            ]}
          />

          {loading && <PageStateBlock type="loading" message="Loading operational data..." />}
          {!loading && error && <PageStateBlock type="error" message={error} />}
          {!loading && !error && !hasAnyData && (
            <PageStateBlock type="empty" message="Populate public/data JSON files to power this dashboard." />
          )}

          {!loading && !error && hasAnyData && (
            <>
              <SectionWrapper
                title="City operational overview"
                subtitle={`${view.cityName} · Last refresh ${view.generatedAt}`}
                actions={<RiskBadge level={view.riskLevel} label={`${view.riskLevel} city risk`} />}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard label="City risk score" value={`${view.riskScore}/100`} hint="Composite index" />
                  <KpiCard label="Model confidence" value={`${view.confidence}%`} hint="Signal fusion confidence" />
                  <KpiCard label="Active alerts" value={view.activeAlerts} hint="High-priority signals" />
                  <KpiCard label="Recommended actions" value={view.recommendationCount} hint="Open interventions" />
                </div>
              </SectionWrapper>

              <ExecutiveSummaryBlock
                title="Executive summary"
                cityName={view.cityName}
                updatedAt={view.generatedAt}
                summary={view.executiveSummary}
                riskLevel={view.riskLevel}
                highlights={[
                  { id: "alerts", label: "Active alerts", value: String(view.activeAlerts), tone: view.activeAlerts > 0 ? "bad" : "good" },
                  { id: "risk", label: "City risk", value: `${view.riskScore}/100`, tone: view.riskScore >= 65 ? "bad" : "neutral" },
                  { id: "confidence", label: "Confidence", value: `${view.confidence}%`, tone: "neutral" },
                ]}
                primaryActions={[
                  { id: "decision", label: "Open Decision Center", href: "/decision-center" },
                  { id: "district", label: "District analysis", href: "/district" },
                ]}
              />

              <SectionWrapper title="Sector status" subtitle="Transport · Ecology · Safety · Utilities">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SectorCard
                    name="Transport"
                    score={view.sectors.transport?.score ?? 0}
                    level={view.sectors.transport?.severity ?? levelFromScore(view.sectors.transport?.score ?? 0)}
                    delta={view.sectors.transport?.delta}
                  />
                  <SectorCard
                    name="Ecology"
                    score={view.sectors.ecology?.score ?? 0}
                    level={view.sectors.ecology?.severity ?? levelFromScore(view.sectors.ecology?.score ?? 0)}
                    delta={view.sectors.ecology?.delta}
                  />
                  <SectorCard
                    name="Safety"
                    score={view.sectors.safety?.score ?? 0}
                    level={view.sectors.safety?.severity ?? levelFromScore(view.sectors.safety?.score ?? 0)}
                    delta={view.sectors.safety?.delta}
                  />
                  <SectorCard
                    name="Utilities"
                    score={view.sectors.utilities?.score ?? 0}
                    level={view.sectors.utilities?.severity ?? levelFromScore(view.sectors.utilities?.score ?? 0)}
                    delta={view.sectors.utilities?.delta}
                  />
                </div>
              </SectionWrapper>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <AnomaliesList
                  className="xl:col-span-3"
                  items={view.anomaliesMapped}
                  title="Active anomalies"
                  subtitle="Sorted by severity — full detail in Decision Center"
                  maxItems={12}
                />
                <ForecastBlock
                  className="xl:col-span-2"
                  headline={view.forecastHeadline}
                  summary={view.forecastSummary}
                  horizon={view.forecastHorizon}
                  confidence={view.confidence}
                  drivers={view.forecastDrivers}
                />
              </div>

              <DistrictOverviewBlock
                districts={view.districtRows}
                title="District overview"
                subtitle="Ranked by risk — drill down per district"
                maxItems={8}
              />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}