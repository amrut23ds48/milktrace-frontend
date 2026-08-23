'use client';

// app/(protected)/facilities/[id]/page.tsx
// ─── Facility Detail / Drill-Down Page ────────────────────────────────────────

import { use } from 'react';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { ErrorBoundary } from '../../../../components/common/ErrorBoundary';
import ErrorCard from '../../../../components/common/ErrorCard';
import { mapService } from '../../../../services/mapService';
import { formatLitres } from '../../../../utils';
import styles from './facility.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Mock facility fetcher (uses mapService until API is ready) ───────────────
async function fetchFacility(id: string) {
  const all = await mapService.fetchMapFacilities();
  const facility = all.find((f) => f.id === id);
  if (!facility) throw new Error('Facility not found');
  return facility;
}

async function fetchFacilityRoutes(id: string) {
  const all = await mapService.fetchMapRoutes();
  return all.filter((r) => r.fromFacilityId === id || r.toFacilityId === id);
}

// ─── Sub-component: Volume Trend Chart ───────────────────────────────────────
function VolumeTrendSection({ facilityId }: { facilityId: string }) {
  // Mock 7-day trend data based on the facility's daily volume
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seed = facilityId.charCodeAt(0);
  const volumes = labels.map((_, i) =>
    Math.max(0, Math.round(500 + seed * 12 + Math.sin(i + seed) * 200))
  );

  const data = {
    labels,
    datasets: [{
      label: 'Volume (L)',
      data: volumes,
      borderColor: '#1a56db',
      backgroundColor: 'rgba(26,86,219,0.08)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: '#e2e8f0' },
        ticks: { color: '#94a3b8', font: { size: 11 as const } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 as const } },
      },
    },
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.cardTitle}>7-Day Volume Trend</h3>
      <Line data={data} options={options} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: facility, error: facilityError, isLoading: facilityLoading } =
    useSWR(`facility-${id}`, () => fetchFacility(id));

  const { data: routes, isLoading: routesLoading } =
    useSWR(`facility-routes-${id}`, () => fetchFacilityRoutes(id));

  if (facilityLoading) {
    return (
      <div className={styles.page}>
        <div className={`${styles.headerSkeleton} skeleton`} />
        <div className={`${styles.chartCardSkeleton} skeleton`} />
      </div>
    );
  }

  if (facilityError || !facility) {
    return (
      <div className={styles.page}>
        <ErrorCard title="Facility not found" message="This facility does not exist or failed to load." />
      </div>
    );
  }

  const riskClass =
    facility.riskScore >= 70 ? 'badge-danger'
    : facility.riskScore >= 40 ? 'badge-warning'
    : 'badge-normal';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.facilityMeta}>
            <span className={styles.facilityType}>{facility.type.replace('_', ' ')}</span>
            <span className={styles.facilityDistrict}>{facility.district}</span>
          </div>
          <h1 className={styles.facilityName}>{facility.name}</h1>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{formatLitres(facility.dailyVolumeL)}</span>
            <span className={styles.statLabel}>Today</span>
          </div>
          <div className={styles.statBox}>
            <span className={`badge ${riskClass}`}>Risk {facility.riskScore}/100</span>
            <span className={styles.statLabel}>{facility.openAnomalies} open anomalies</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <ErrorBoundary fallback={<ErrorCard title="Chart failed to load" />}>
        <VolumeTrendSection facilityId={id} />
      </ErrorBoundary>

      {/* Active Routes */}
      <div className={styles.routesCard}>
        <h3 className={styles.cardTitle}>Active Routes</h3>
        {routesLoading ? (
          <div className={`${styles.routeSkeleton} skeleton`} />
        ) : routes && routes.length > 0 ? (
          <table className={styles.routeTable}>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Dispatched</th>
                <th>Received</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const statusClass =
                  r.status === 'ANOMALOUS' ? 'badge-danger'
                  : r.status === 'INVESTIGATING' ? 'badge-warning'
                  : r.status === 'IN_TRANSIT' ? 'badge-info'
                  : 'badge-normal';
                return (
                  <tr key={r.id}>
                    <td>{r.fromName}</td>
                    <td>{r.toName}</td>
                    <td><span className={`badge ${statusClass}`}>{r.status.replace('_', ' ')}</span></td>
                    <td>{r.dispatchedL} L</td>
                    <td>{r.receivedL > 0 ? `${r.receivedL} L` : '—'}</td>
                    <td>{r.riskScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyText}>No active routes for this facility.</p>
        )}
      </div>
    </div>
  );
}
