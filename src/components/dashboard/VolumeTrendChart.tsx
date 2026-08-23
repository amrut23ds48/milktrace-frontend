'use client';

// components/dashboard/VolumeTrendChart.tsx
// ─── Milk Volume Trend — Chart.js Line Chart ──────────────────────────────

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useVolumeTrend } from '../../hooks/useDashboard';
import type { DateRange } from '../../types/dashboard.types';
import styles from './ChartPanel.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

const PERIODS: { label: string; value: DateRange }[] = [
  { label: '7D',  value: '7D'  },
  { label: '30D', value: '30D' },
  { label: '90D', value: '90D' },
];

function formatL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M L`;
  return `${(n / 1_000).toFixed(0)}K L`;
}

export default function VolumeTrendChart() {
  const [period, setPeriod] = useState<DateRange>('7D');
  const { data, isLoading, error, refetch } = useVolumeTrend(period);

  const chartData = {
    labels: data?.map((p) => p.date) ?? [],
    datasets: [
      {
        label: 'Collected',
        data: data?.map((p) => p.collected) ?? [],
        borderColor: '#1a56db',
        backgroundColor: 'rgba(26,86,219,0.08)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Dispatched',
        data: data?.map((p) => p.dispatched) ?? [],
        borderColor: '#0ea5e9',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.4,
        borderDash: [4, 3],
      },
      {
        label: 'Received',
        data: data?.map((p) => p.received) ?? [],
        borderColor: '#16a34a',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.4,
        borderDash: [2, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.4,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            `${ctx.dataset.label}: ${formatL(Number(ctx.raw))}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
          callback: (v: unknown) => formatL(Number(v)),
        },
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <span aria-hidden="true">📈</span>
          Milk Volume Trend
        </h2>
        <div className={styles.periodToggle} role="group" aria-label="Period selector">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              id={`volume-trend-${p.value}`}
              className={`${styles.periodBtn} ${period === p.value ? styles.active : ''}`}
              onClick={() => setPeriod(p.value)}
              aria-pressed={period === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelBody}>
        {isLoading && <div className={`${styles.skelChart} skeleton`} />}
        {error && !isLoading && (
          <div className={styles.errorState}>
            <p>Unable to load volume trend.</p>
            <button id="volume-trend-retry" className={styles.retryBtn} onClick={refetch}>Retry</button>
          </div>
        )}
        {!isLoading && !error && data && data.length === 0 && (
          <div className={styles.emptyState}>No data available for selected period</div>
        )}
        {!isLoading && !error && data && data.length > 0 && (
          <Line data={chartData} options={options} aria-label="Milk volume trend line chart" />
        )}
      </div>

      {/* Manual legend */}
      {!isLoading && !error && (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#1a56db' }} />
            Collected
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#0ea5e9' }} />
            Dispatched
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#16a34a' }} />
            Received
          </div>
        </div>
      )}
    </div>
  );
}
