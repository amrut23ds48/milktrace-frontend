// components/index.ts
// ─── Reusable UI Components ───────────────────────────────────────────────────

// Layout
export { default as AppShell } from './layout/AppShell';
export { default as Sidebar  } from './layout/Sidebar';
export { default as Header   } from './layout/Header';

// Dashboard
export { default as KpiCard, KpiCardSkeleton } from './dashboard/KpiCard';
export { default as KpiStrip                 } from './dashboard/KpiStrip';
export { default as AnomalyList              } from './dashboard/AnomalyList';
export { default as VolumeTrendChart         } from './dashboard/VolumeTrendChart';
export { default as CollectionReceiptChart   } from './dashboard/CollectionReceiptChart';
export { default as TopRiskFacilities        } from './dashboard/TopRiskFacilities';
