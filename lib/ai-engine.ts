// lib/ai-engine.ts

import { Anomaly, District, Sector } from '../types/dashboard';

// Weights applied to different severity levels for risk calculations
const SEVERITY_WEIGHTS = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 85,
};

/**
 * AI Utility to dynamically calculate a district's real-time health score.
 * It takes the baseline health and penalizes it based on active anomalies.
 */
export function calculateRealtimeHealth(district: District, activeAnomalies: Anomaly[]): number {
  const districtAnomalies = activeAnomalies.filter(a => a.districtId === district.id);

  if (districtAnomalies.length === 0) return district.overallHealth;

  // Calculate the total risk penalty for the district
  const penalty = districtAnomalies.reduce((acc, anomaly) => {
    const baseWeight = SEVERITY_WEIGHTS[anomaly.severity];
    // Factor in the AI's confidence/risk score (percentage) for this specific anomaly
    const impact = baseWeight * (anomaly.aiRiskScore / 100);
    return acc + impact;
  }, 0);

  // Ensure the health score stays within a realistic 0-100 range
  return Math.max(0, Math.round(district.overallHealth - penalty));
}

/**
 * AI Decision Support: Prioritizes a list of anomalies.
 * Useful for sorting the Decision Center inbox so operators see the worst threats first.
 */
export function prioritizeAnomalies(anomalies: Anomaly[]): Anomaly[] {
  return [...anomalies].sort((a, b) => {
    // First, sort by severity category
    const weightDiff = SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity];
    if (weightDiff !== 0) return weightDiff;
    
    // If severity category is the same, use the precise AI Risk Score as the tiebreaker
    return b.aiRiskScore - a.aiRiskScore;
  });
}

/**
 * Simulates a real-time AI short-term prediction for a sector's health.
 * In a real production app, this would call a remote Machine Learning endpoint.
 */
export function predictNextHourTrend(currentScore: number, sector: Sector, activeAnomalies: Anomaly[]): {
  predictedScore: number;
  trend: 'improving' | 'stable' | 'degrading';
  confidence: number;
} {
  const sectorAnomalies = activeAnomalies.filter(a => a.sector === sector);
  const hasCritical = sectorAnomalies.some(a => a.severity === 'critical' || a.severity === 'high');
  
  let predictedScore = currentScore;
  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  // Simulate AI confidence interval
  let confidence = 85 + Math.random() * 10; 

  if (hasCritical) {
    // Sharp drop expected due to critical alerts
    predictedScore = Math.max(0, currentScore - (10 + Math.random() * 15));
    trend = 'degrading';
    confidence -= 15; 
  } else if (sectorAnomalies.length > 0) {
    // Minor drop expected due to low/medium alerts
    predictedScore = Math.max(0, currentScore - (2 + Math.random() * 8));
    trend = 'degrading';
  } else if (currentScore < 90) {
    // Natural recovery if there are no active issues
    predictedScore = Math.min(100, currentScore + (2 + Math.random() * 5));
    trend = 'improving';
  }

  return {
    predictedScore: Math.round(predictedScore),
    trend,
    confidence: Math.round(confidence)
  };
}