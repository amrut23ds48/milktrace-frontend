// components/dashboard/KpiStrip.tsx
// ─── 8-Card KPI Strip for Super Admin ─────────────────────────────────────

import KpiCard, { KpiCardSkeleton } from './KpiCard';
import type { KpiMetrics } from '../../types/dashboard.types';
import styles from './KpiCard.module.css';

interface KpiStripProps {
  data: KpiMetrics | null;
  isLoading: boolean;
  error: string | null;
}

function formatLitres(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M L`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K L`;
  return `${n} L`;
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function KpiStrip({ data, isLoading, error }: KpiStripProps) {
  if (isLoading) {
    return (
      <div className={styles.strip}>
        {Array.from({ length: 8 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.strip}>
        <p style={{ color: 'var(--color-danger)', gridColumn: '1/-1', fontSize: 13 }}>
          ⚠ Unable to load KPI metrics.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.strip}>
      <KpiCard
        id="kpi-milk-collected"
        label="Milk Collected Today"
        icon="🥛"
        value={formatLitres(data.milkCollectedToday)}
        change={data.milkCollectedChange}
      />
      <KpiCard
        id="kpi-milk-transit"
        label="Milk In Transit"
        icon="🚛"
        value={formatLitres(data.milkInTransit)}
        change={data.milkInTransitChange}
        variant="info"
      />
      <KpiCard
        id="kpi-milk-delivered"
        label="Milk Delivered"
        icon="✅"
        value={formatLitres(data.milkDelivered)}
        change={data.milkDeliveredChange}
      />
      <KpiCard
        id="kpi-active-farmers"
        label="Active Farmers"
        icon="👨‍🌾"
        value={formatCount(data.activeFarmers)}
        change={data.activeFarmersChange}
      />
      <KpiCard
        id="kpi-collection-centers"
        label="Collection Centers"
        icon="🏠"
        value={formatCount(data.activeCollectionCenters)}
        change={data.activeCollectionCentersChange}
      />
      <KpiCard
        id="kpi-active-routes"
        label="Active Routes"
        icon="🛣"
        value={formatCount(data.activeRoutes)}
        change={data.activeRoutesChange}
      />
      <KpiCard
        id="kpi-open-anomalies"
        label="Open Anomalies"
        icon="⚠"
        value={formatCount(data.openAnomalies)}
        change={data.openAnomaliesChange}
        variant="warning"
      />
      <KpiCard
        id="kpi-high-risk"
        label="High-Risk Incidents"
        icon="🔴"
        value={formatCount(data.highRiskIncidents)}
        change={data.highRiskIncidentsChange}
        variant="danger"
      />
    </div>
  );
}
