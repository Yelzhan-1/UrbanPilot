// types/dashboard.ts

export type Sector = "Transport" | "Ecology" | "Safety" | "Utilities";
export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type DifficultyLevel = "low" | "medium" | "high";
export type RecommendationStatus = "pending" | "in_progress" | "resolved";
export type RecommendationPriority = "Low" | "Medium" | "High" | "Critical";
export type TrendDirection = "improving" | "stable" | "degrading";

export interface SectorScores {
  transport: number;
  ecology: number;
  safety: number;
  utilities: number;
}

export interface CityOverview {
  cityName: string;
  overallHealth: number;
  riskScore: number;
  status: string;
  activeAnomalies: number;
  criticalAlerts: number;
  sectorScores: SectorScores;
  executiveSummary: string;
  lastUpdated: string;
}

export interface District {
  id: string;
  name: string;
  overallHealth: number;
  overallRisk: SeverityLevel;
  status: string;
  population: number;
  activeAnomaliesCount: number;
  sectorScores: SectorScores;
  mainIssue: string | null;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  sector: Sector;
  severity: SeverityLevel;
  districtId: string;
  timestamp: string;
  metricValue?: number;
  metricUnit?: string;
  aiRiskScore: number;
}

export interface ForecastPoint {
  timestamp: string;
  sector: Sector;
  predictedValue: number;
  confidenceLowerBound: number;
  confidenceUpperBound: number;
}

export interface Recommendation {
  id: string;
  anomalyId?: string;
  sector: Sector;
  scope: string;
  priority: RecommendationPriority;
  title: string;
  description: string;
  suggestedActions: string[];
  estimatedImpactScore: number;
  implementationDifficulty: DifficultyLevel;
  status: RecommendationStatus;
}

export interface SectorPrediction {
  predictedScore: number;
  trend: TrendDirection;
  confidence: number;
}