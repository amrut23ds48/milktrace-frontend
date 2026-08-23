'use client';

// app/dashboard/page.tsx
// ─── Super Admin Dashboard Page ───────────────────────────────────────────────
// Phase 7 — KPI Strip, Volume Trend, Collection vs Receipt, Anomaly List, Top Risk Facilities

import KpiStrip from '../../../components/dashboard/KpiStrip';
import AnomalyList from '../../../components/dashboard/AnomalyList';
import VolumeTrendChart from '../../../components/dashboard/VolumeTrendChart';
import CollectionReceiptChart from '../../../components/dashboard/CollectionReceiptChart';
import TopRiskFacilities from '../../../components/dashboard/TopRiskFacilities';
import {
  useKpiMetrics,
  useRecentAnomalies,
  useTopRiskFacilities,
} from '../../../hooks/useDashboard';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const kpi = useKpiMetrics();
  const anomalies = useRecentAnomalies(8);
  const topRisk = useTopRiskFacilities();

  const updatedAt = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.page}>
      {/* Page heading */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeading}>Maharashtra Overview</h1>
          <p className={styles.pageSubheading}>
            Real-time milk supply chain monitoring across all districts
          </p>
        </div>
        <span className={styles.lastUpdated}>Updated at {updatedAt}</span>
      </div>

      {/* KPI Strip — 8 cards */}
      <KpiStrip
        data={kpi.data}
        isLoading={kpi.isLoading}
        error={kpi.error}
      />

      {/* Charts row */}
      <div className={styles.chartRow}>
        <VolumeTrendChart />
        <CollectionReceiptChart />
      </div>

      {/* Bottom row — Anomaly list + Top Risk Facilities */}
      <div className={styles.bottomRow}>
        <AnomalyList
          data={anomalies.data}
          isLoading={anomalies.isLoading}
          error={anomalies.error}
          onRetry={anomalies.refetch}
        />
        <TopRiskFacilities
          data={topRisk.data}
          isLoading={topRisk.isLoading}
          error={topRisk.error}
          onRetry={topRisk.refetch}
        />
      </div>
    </div>
  );
}
