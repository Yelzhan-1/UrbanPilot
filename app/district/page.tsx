"use client";

import { useEffect, useMemo, useState } from "react";
import DistrictDetailsCard from "@/components/ai/DistrictDetailsCard";
import DistrictRiskTable from "@/components/ai/DistrictRiskTable";
import DistrictSectorBreakdown from "@/components/ai/DistrictSectorBreakdown";
import SectionHeader from "@/components/ai/SectionHeader";

type Severity = "low" | "medium" | "high" | "critical";

type RawDistrict = {
  id?: string;
  name?: string;
  district?: string;
  risk?: number;
  riskScore?: number;
  score?: number;
  severity?: Severity;
  activeAlerts?: number;
  alerts?: number;
  criticalAlerts?: number;
  trend?: "rising" | "stable" | "falling";
  population?: number;
  updatedAt?: string;
  summary?: string;
  topIssue?: string;
  recommendedAction?: string;
  sectors?: {
    transport?: number;
    ecology?: number;
    safety?: number;
    utilities?: number;
  };
  transport?: number;
  ecology?: number;
  safety?: number;
  utilities?: number;
};

type DistrictRecord = {
  id: string;
  name: string;
  riskScore: number;
  severity: Severity;
  activeAlerts: number;
  criticalAlerts: number;
  trend: "rising" | "stable" | "falling";
  population?: number;
  updatedAt?: string;
  summary?: string;
  topIssue?: string;
  recommendedAction?: string;
  sectors: {
    transport: number;
    ecology: number;
    safety: number;
    utilities: number;
  };
};

type RawAnomaly = {
  id?: string;
  title?: string;
  district?: string;
  severity?: Severity;
  description?: string;
};

type RawRecommendation = {
  id?: string;
  title?: string;
  district?: string;
  severity?: Severity;
  description?: string;
};

function clamp(value: number, min = 0, max = 100): number {
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
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) return null;
  const text = await res.text();
  return safeJsonParse<T>(text);
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

function normalizeDistrictKey(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/\bdistrict\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDistricts(input: unknown): DistrictRecord[] {
  const rawList = Array.isArray(input)
    ? input
    : input && typeof input === "object" && "districts" in input
      ? toArray<RawDistrict>((input as { districts?: unknown }).districts)
      : [];

  return rawList
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const district = item as RawDistrict;
      const name = district.name || district.district || `District ${index + 1}`;

      const sectors = {
        transport: clamp(
          typeof district.sectors?.transport === "number"
            ? district.sectors.transport
            : typeof district.transport === "number"
              ? district.transport
              : 0,
        ),
        ecology: clamp(
          typeof district.sectors?.ecology === "number"
            ? district.sectors.ecology
            : typeof district.ecology === "number"
              ? district.ecology
              : 0,
        ),
        safety: clamp(
          typeof district.sectors?.safety === "number"
            ? district.sectors.safety
            : typeof district.safety === "number"
              ? district.safety
              : 0,
        ),
        utilities: clamp(
          typeof district.sectors?.utilities === "number"
            ? district.sectors.utilities
            : typeof district.utilities === "number"
              ? district.utilities
              : 0,
        ),
      };

      const fallbackRisk =
        Math.round((sectors.transport + sectors.ecology + sectors.safety + sectors.utilities) / 4) || 0;

      const riskScore = clamp(
        typeof district.riskScore === "number"
          ? district.riskScore
          : typeof district.risk === "number"
            ? district.risk
            : typeof district.score === "number"
              ? district.score
              : fallbackRisk,
      );

      return {
        id: district.id || `district-${index}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        riskScore,
        severity: district.severity || severityFromScore(riskScore),
        activeAlerts:
          typeof district.activeAlerts === "number"
            ? district.activeAlerts
            : typeof district.alerts === "number"
              ? district.alerts
              : 0,
        criticalAlerts: typeof district.criticalAlerts === "number" ? district.criticalAlerts : 0,
        trend: district.trend || "stable",
        population: district.population,
        updatedAt: district.updatedAt,
        summary: district.summary,
        topIssue: district.topIssue,
        recommendedAction: district.recommendedAction,
        sectors,
      };
    });
}

export default function DistrictAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [anomalies, setAnomalies] = useState<RawAnomaly[]>([]);
  const [recommendations, setRecommendations] = useState<RawRecommendation[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const [districtsJson, anomaliesJson, recommendationsJson] = await Promise.all([
          loadJson<unknown>("/data/districts.json"),
          loadJson<unknown>("/data/anomalies.json"),
          loadJson<unknown>("/data/recommendations.json"),
        ]);

        if (!mounted) return;

        const normalizedDistricts = normalizeDistricts(districtsJson);
        setDistricts(normalizedDistricts);

        const rawAnomalies = Array.isArray(anomaliesJson)
          ? toArray<RawAnomaly>(anomaliesJson)
          : anomaliesJson && typeof anomaliesJson === "object" && "anomalies" in anomaliesJson
            ? toArray<RawAnomaly>((anomaliesJson as { anomalies?: unknown }).anomalies)
            : [];

        const rawRecommendations = Array.isArray(recommendationsJson)
          ? toArray<RawRecommendation>(recommendationsJson)
          : recommendationsJson && typeof recommendationsJson === "object" && "recommendations" in recommendationsJson
            ? toArray<RawRecommendation>((recommendationsJson as { recommendations?: unknown }).recommendations)
            : [];

        setAnomalies(rawAnomalies);
        setRecommendations(rawRecommendations);

        if (normalizedDistricts.length > 0) {
          const highestRisk = [...normalizedDistricts].sort((a, b) => b.riskScore - a.riskScore)[0];
          setSelectedDistrictId(highestRisk.id);
        }
      } catch {
        if (!mounted) return;
        setError("Unable to load district intelligence data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedDistrict = useMemo(
    () => districts.find((d) => d.id === selectedDistrictId) || null,
    [districts, selectedDistrictId],
  );

  const overview = useMemo(() => {
    if (districts.length === 0) {
      return {
        districtCount: 0,
        avgRisk: 0,
        criticalCount: 0,
        totalAlerts: 0,
      };
    }

    const avgRisk = Math.round(districts.reduce((acc, d) => acc + d.riskScore, 0) / districts.length);
    const criticalCount = districts.filter((d) => d.severity === "critical").length;
    const totalAlerts = districts.reduce((acc, d) => acc + d.activeAlerts, 0);

    return {
      districtCount: districts.length,
      avgRisk,
      criticalCount,
      totalAlerts,
    };
  }, [districts]);

  const districtAnomalies = useMemo(() => {
    if (!selectedDistrict) return [];
    const key = normalizeDistrictKey(selectedDistrict.name);
    return anomalies
      .filter((a) => normalizeDistrictKey(a.district) === key)
      .slice(0, 4);
  }, [anomalies, selectedDistrict]);

  const districtRecommendations = useMemo(() => {
    if (!selectedDistrict) return [];
    const key = normalizeDistrictKey(selectedDistrict.name);
    return recommendations
      .filter((r) => normalizeDistrictKey(r.district) === key)
      .slice(0, 4);
  }, [recommendations, selectedDistrict]);

  const tableRows = useMemo(
    () =>
      districts.map((d) => ({
        id: d.id,
        name: d.name,
        riskScore: d.riskScore,
        severity: d.severity,
        activeAlerts: d.activeAlerts,
        trend: d.trend,
        transport: d.sectors.transport,
        ecology: d.sectors.ecology,
        safety: d.sectors.safety,
        utilities: d.sectors.utilities,
      })),
    [districts],
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SectionHeader
          title="District Analysis"
          subtitle="Compare district-level pressure, inspect localized risk drivers, and identify the next operational actions."
          statusLabel="District View"
          navItems={[
            { label: "Decision Center", href: "/decision-center" },
            { label: "District Analysis", href: "/district", active: true },
            { label: "Scenario Simulator", href: "/simulator" },
          ]}
        />

        {loading && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
            <p className="mt-3 text-sm text-slate-300">Loading district intelligence...</p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <h2 className="text-base font-semibold text-rose-200">District feed unavailable</h2>
            <p className="mt-2 text-sm text-rose-100/90">{error}</p>
          </section>
        )}

        {!loading && !error && districts.length === 0 && (
          <section className="rounded-2xl border border-dashed border-white/20 bg-slate-900/50 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-100">No district data yet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Add district records to <code>public/data/districts.json</code> to activate district comparison and drill-down.
            </p>
          </section>
        )}

        {!loading && !error && districts.length > 0 && (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Districts Monitored</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{overview.districtCount}</p>
              </article>

              <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Average Risk</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{overview.avgRisk}/100</p>
              </article>

              <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Critical Districts</p>
                <p className="mt-1 text-2xl font-semibold text-rose-300">{overview.criticalCount}</p>
              </article>

              <article className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total Active Alerts</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{overview.totalAlerts}</p>
              </article>
            </section>

            <DistrictRiskTable
              rows={tableRows}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={setSelectedDistrictId}
              title="District Comparison Matrix"
              subtitle="Prioritize where intervention teams should act first."
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
              <DistrictDetailsCard
                className="xl:col-span-3"
                district={
                  selectedDistrict
                    ? {
                        id: selectedDistrict.id,
                        name: selectedDistrict.name,
                        riskScore: selectedDistrict.riskScore,
                        severity: selectedDistrict.severity,
                        activeAlerts: selectedDistrict.activeAlerts,
                        criticalAlerts: selectedDistrict.criticalAlerts,
                        trend: selectedDistrict.trend,
                        population: selectedDistrict.population,
                        updatedAt: selectedDistrict.updatedAt,
                        summary:
                          selectedDistrict.summary ||
                          `${selectedDistrict.name} is operating at ${selectedDistrict.severity} risk with sector pressure concentrated in the highest-scoring systems.`,
                        topIssue: selectedDistrict.topIssue,
                        recommendedAction: selectedDistrict.recommendedAction,
                      }
                    : null
                }
                title="Selected District Details"
              />

              <DistrictSectorBreakdown
                className="xl:col-span-2"
                data={
                  selectedDistrict
                    ? {
                        districtName: selectedDistrict.name,
                        severity: selectedDistrict.severity,
                        sectors: {
                          transport: selectedDistrict.sectors.transport,
                          ecology: selectedDistrict.sectors.ecology,
                          safety: selectedDistrict.sectors.safety,
                          utilities: selectedDistrict.sectors.utilities,
                        },
                      }
                    : null
                }
              />
            </div>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">District Anomalies</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-100">
                      {selectedDistrict ? `${selectedDistrict.name} Highlights` : "Highlights"}
                    </h3>
                  </div>
                </div>

                {districtAnomalies.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-4 text-sm text-slate-400">
                    No district-specific anomalies found.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {districtAnomalies.map((item, idx) => (
                      <li key={item.id || `${item.title}-${idx}`} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm font-semibold text-slate-100">{item.title || "Anomaly detected"}</p>
                        <p className="mt-1 text-xs text-slate-300">{item.description || "No additional context provided."}</p>
                        <p className="mt-2 text-[11px] text-slate-400">Severity: {item.severity || "unknown"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">District Actions</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-100">
                      {selectedDistrict ? `${selectedDistrict.name} Recommended Actions` : "Recommended Actions"}
                    </h3>
                  </div>
                </div>

                {districtRecommendations.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-4 text-sm text-slate-400">
                    No district-specific recommendations found.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {districtRecommendations.map((item, idx) => (
                      <li key={item.id || `${item.title}-${idx}`} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm font-semibold text-slate-100">{item.title || "Operational action"}</p>
                        <p className="mt-1 text-xs text-slate-300">{item.description || "No action details provided."}</p>
                        <p className="mt-2 text-[11px] text-slate-400">Priority: {item.severity || "unspecified"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}