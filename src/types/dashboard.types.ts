// types/dashboard.types.ts
// ─── MilkTrace Dashboard Data Shapes ─────────────────────────────────────────

export type RiskLevel = 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AnomalyStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
export type DateRange = '1D' | '7D' | '30D' | '90D';

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/** Top-level KPI metrics for the Super Admin dashboard */
export interface KpiMetrics {
  milkCollectedToday: number;       // Litres
  milkCollectedChange: number;      // % change vs previous period
  milkInTransit: number;            // Litres
  milkInTransitChange: number;
  milkDelivered: number;            // Litres
  milkDeliveredChange: number;
  activeFarmers: number;
  activeFarmersChange: number;
  activeCollectionCenters: number;
  activeCollectionCentersChange: number;
  activeRoutes: number;
  activeRoutesChange: number;
  openAnomalies: number;
  openAnomaliesChange: number;
  highRiskIncidents: number;
  highRiskIncidentsChange: number;
}

/** A single anomaly event for the Recent Anomalies list */
export interface AnomalyEvent {
  id: string;
  type: string;
  location: string;
  riskScore: number;
  detectedAt: string;   // ISO date string
  status: AnomalyStatus;
  assignedTo: string | null;
}

/** A single data point on the Volume Trend line chart */
export interface VolumeTrendPoint {
  date: string;           // "Mon", "Tue" etc. or "Jan 1"
  collected: number;      // Litres
  dispatched: number;
  received: number;
}

/** A facility ranked by risk */
export interface TopRiskFacility {
  id: string;
  name: string;
  type: string;
  district: string;
  riskScore: number;      // 0–100
  openAnomalies: number;
}

/** A single bar in the Collection vs Receipt chart */
export interface CollectionReceiptData {
  label: string;
  value: number;
  color: string;
}
