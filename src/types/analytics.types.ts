// types/analytics.types.ts

export type AnalyticsPeriod = '7D' | '30D' | '90D';

export interface VolumeTrendPoint {
  date: string;
  collected: number;
  dispatched: number;
  received: number;
}

export interface LossRatePoint {
  date: string;
  lossPercent: number;
  spikePercent: number;
}

export interface AnomalyTypeBreakdown {
  type: string;
  count: number;
  severity: string;
}

export interface AnomalySeverityBreakdown {
  severity: string;
  count: number;
}

export interface AnomalyBreakdownResponse {
  byType: AnomalyTypeBreakdown[];
  bySeverity: AnomalySeverityBreakdown[];
  total: number;
}

export interface DistrictAnomalyData {
  district: string;
  count: number;
  avgRiskScore: number;
}

export interface DistrictSummary {
  district: string;
  totalCollectedL: number;
  totalTransfers: number;
  discrepancies: number;
  discrepancyRate: number;
}
