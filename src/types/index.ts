// types/index.ts
// ─── Shared TypeScript Types & Interfaces ─────────────────────────────────────
// Never use `any` — if a type is unknown, use `unknown` and narrow it.

export type {
  ApiResponse,
  KpiMetrics,
  AnomalyEvent,
  AnomalyStatus,
  VolumeTrendPoint,
  TopRiskFacility,
  CollectionReceiptData,
  DateRange,
  RiskLevel,
} from './dashboard.types';
