// types/dashboard.ts

/**
 * Core Smart City Sectors
 */
export type Sector = 'Transport' | 'Ecology' | 'Safety' | 'Utilities';

/**
 * Risk & Severity Levels
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type DifficultyLevel = 'low' | 'medium' | 'high';

/**
 * Baseline metrics for sectors. Scores are typically 0-100.
 */
export interface SectorScores {
  transport: number;
  ecology: number;
  safety: number;
  utilities: number;
}

/**
 * City Overview - Used for the main dashboard landing view.
 */
export interface CityOverview {
  overallHealth: number; // 0-100 index representing the whole city
  activeAnomalies: number;
  criticalAlerts: number;
  sectorScores: SectorScores;
  lastUpdated: string; // ISO Date string
}

/**
 * District - Used for granular neighborhood breakdowns.
 */
export interface District {
  id: string;
  name: string;
  overallHealth: number;
  sectorScores: SectorScores;
  population: number;
  activeAnomaliesCount: number;
}

/**
 * AI Anomaly - Represents a detected irregular event in the city.
 */
export interface Anomaly {
  id: string;
  title: string;
  description: string;
  sector: Sector;
  severity: SeverityLevel;
  districtId: string;
  timestamp: string; // ISO Date string
  metricValue?: number; // e.g., current AQI, traffic density %
  metricUnit?: string; // e.g., 'AQI', 'vehicles/min', 'dB'
  aiRiskScore: number; // 0-100 indicating the AI's confidence in an impending crisis
}

/**
 * Forecast Point - Used for plotting short-term predictive charts.
 */export interface ForecastPoint {
  timestamp: string; // ISO Date string
  sector: Sector;
  predictedValue: number;
  confidenceLowerBound: number;
  confidenceUpperBound: number;
}

/**
 * AI Recommendation - Actionable insights for city operators.
 */
export interface Recommendation {
  id: string;
  anomalyId?: string; // Links this recommendation to a specific anomaly (optional)
  sector: Sector;
  title: string;
  description: string;
  suggestedActions: string[];
  estimatedImpactScore: number; // 0-100 improvement expected if implemented
  implementationDifficulty: DifficultyLevel;
  status: 'pending' | 'in_progress' | 'resolved';
}