// lib/ai-engine.ts

import type {
  Anomaly,
  District,
  Sector,
  SectorPrediction,
  SeverityLevel,
} from "@/types/dashboard";

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 85,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getSeverityWeight(severity: SeverityLevel) {
  return SEVERITY_WEIGHTS[severity];
}

export function calculateRealtimeHealth(
  district: District,
  activeAnomalies: Anomaly[],
): number {
  const districtAnomalies = activeAnomalies.filter(
    (anomaly) => anomaly.districtId === district.id,
  );

  if (districtAnomalies.length === 0) {
    return district.overallHealth;
  }

  const penalty = districtAnomalies.reduce((sum, anomaly) => {
    const weight = getSeverityWeight(anomaly.severity);
    const impact = weight * (anomaly.aiRiskScore / 100);
    return sum + impact;
  }, 0);

  return Math.round(clamp(district.overallHealth - penalty));
}

export function prioritizeAnomalies(anomalies: Anomaly[]): Anomaly[] {
  return [...anomalies].sort((a, b) => {
    const severityDiff =
      getSeverityWeight(b.severity) - getSeverityWeight(a.severity);

    if (severityDiff !== 0) {
      return severityDiff;
    }

    const riskDiff = b.aiRiskScore - a.aiRiskScore;
    if (riskDiff !== 0) {
      return riskDiff;
    }

    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export function predictNextHourTrend(
  currentScore: number,
  sector: Sector,
  activeAnomalies: Anomaly[],
): SectorPrediction {
  const sectorAnomalies = activeAnomalies.filter(
    (anomaly) => anomaly.sector === sector,
  );

  const hasHighPressure = sectorAnomalies.some(
    (anomaly) =>
      anomaly.severity === "critical" || anomaly.severity === "high",
  );

  let predictedScore = currentScore;
  let trend: SectorPrediction["trend"] = "stable";
  let confidence = 90;

  if (hasHighPressure) {
    predictedScore = currentScore - (10 + sectorAnomalies.length * 3);
    trend = "degrading";
    confidence = 78;
  } else if (sectorAnomalies.length > 0) {
    predictedScore = currentScore - (3 + sectorAnomalies.length * 2);
    trend = "degrading";
    confidence = 84;
  } else if (currentScore < 90) {
    predictedScore = currentScore + 4;
    trend = "improving";
    confidence = 88;
  }

  return {
    predictedScore: Math.round(clamp(predictedScore)),
    trend,
    confidence: Math.round(clamp(confidence)),
  };
}