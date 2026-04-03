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

type DataBundle = {
  overview: OverviewData | null;
  districts: DistrictRaw[] | null;
  anomalies: AnomalyRaw[] | null;
  forecast: ForecastRaw | null;
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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataBundle>({
    overview: null,
    districts: null,
    anomalies: null,
    forecast: null,
  });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [overview, districts, anomalies, forecast] = await Promise.all([
          loadJson<OverviewData>("/data/overview.json"),
          loadJson<DistrictRaw[]>("/data/districts.json"),
          loadJson<AnomalyRaw[]>("/data/anomalies.json"),
          loadJson<ForecastRaw>("/data/forecast.json"),
        ]);

        if (!mounted) return;
        setData({
          overview,
          districts: Array.isArray(districts) ? districts : null,
          anomalies: Array.isArray(anomalies) ? anomalies : null,
          forecast,
        });
      } catch {
        if (!mounted) return;
        setError("Unable to load dashboard preview data.");
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
      typeof data.overview?.recommendationCount === "number" ? data.overview.recommendationCount : 0;

    const executiveSummary =
      anomaliesMapped.length > 0
        ? `${anomaliesMapped.length} active anomalies detected. Prioritize high and critical signals, then review district hotspots and forecast drivers.`
        : "Operational posture appears stable. Continue monitoring sector status and short-term forecast changes.";

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
      forecastHeadline: data.forecast?.headline || "12-hour City Risk Forecast",
      forecastSummary:
        data.forecast?.summary ||
        "AI combines incoming signals from transport, ecology, safety, and utilities to estimate near-term operational pressure.",
      forecastHorizon: data.forecast?.horizon || "Next 12 hours",
      forecastDrivers,
      districtRows,
      executiveSummary,
    };
  }, [data]);

  const hasAnyData =
    view.riskScore > 0 ||
    view.anomaliesMapped.length > 0 ||
    view.forecastDrivers.length > 0 ||
    view.districtRows.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 pb-10 pt-6 text-slate-100">
      <Container>
        <div className="space-y-6">
          <Header
            eyebrow="UrbanPilot Smart City AI"
            title="City Operations Command"
            subtitle="One intelligence surface for transport, ecology, safety, and utilities. Detect risk early, understand impact, and act faster."
            statusLabel="Demo Ready"
            links={[
              { label: "Main Dashboard", href: "/dashboard" },
              { label: "Decision Center", href: "/decision-center" },
              { label: "District Analysis", href: "/district" },
              { label: "Scenario Simulator", href: "/simulator" },
            ]}
          />

          {loading && <PageStateBlock type="loading" message="Loading city intelligence preview..." />}

          {!loading && error && <PageStateBlock type="error" message={error} />}

          {!loading && !error && !hasAnyData && (
            <PageStateBlock
              type="empty"
              message="Add mock JSON records in public/data to activate the live preview."
            />
          )}

          {!loading && !error && hasAnyData && (
            <>
              <ExecutiveSummaryBlock
                title="AI Executive Brief"
                cityName={view.cityName}
                updatedAt={view.generatedAt}
                summary={view.executiveSummary}
                riskLevel={view.riskLevel}
                highlights={[
                  { id: "risk", label: "City risk", value: `${view.riskScore}/100`, tone: view.riskScore >= 65 ? "bad" : "neutral" },
                  { id: "alerts", label: "Active alerts", value: String(view.activeAlerts), tone: view.activeAlerts > 0 ? "bad" : "good" },
                  { id: "confidence", label: "Model confidence", value: `${view.confidence}%`, tone: "neutral" },
                ]}
                primaryActions={[
                  { id: "go-dashboard", label: "Open Main Dashboard", href: "/dashboard" },
                  { id: "go-decision", label: "Decision Center", href: "/decision-center" },
                ]}
              />

              <SectionWrapper
                title="City-wide AI Risk Snapshot"
                subtitle={`${view.cityName} · Updated ${view.generatedAt}`}
                actions={<RiskBadge level={view.riskLevel} label={`${view.riskLevel} risk`} />}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard label="Overall Risk Score" value={`${view.riskScore}/100`} hint="Composite city-wide risk" />
                  <KpiCard label="Model Confidence" value={`${view.confidence}%`} hint="Forecast confidence" />
                  <KpiCard label="Active Alerts" value={view.activeAlerts} hint="High + critical signals" />
                  <KpiCard label="Recommended Actions" value={view.recommendationCount} hint="Immediate response options" />
                </div>
              </SectionWrapper>

              <SectionWrapper title="Sector Health Overview" subtitle="Current pressure across core city systems">
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
                <AnomaliesList className="xl:col-span-3" items={view.anomaliesMapped} maxItems={5} />
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
                title="District Risk Ranking"
                subtitle="Top districts by current operational risk"
              />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}