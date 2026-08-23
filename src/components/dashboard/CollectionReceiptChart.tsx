'use client';

// components/dashboard/CollectionReceiptChart.tsx
// ─── Collection vs Dispatch vs Receipt — Chart.js Horizontal Bar ──────────
// Makes supply-chain losses visible at a glance (per 14.md §11).

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useVolumeTrend } from '../../hooks/useDashboard';
import styles from './ChartPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function formatL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M L`;
  return `${(n / 1_000).toFixed(0)}K L`;
}

export default function CollectionReceiptChart() {
  const { data, isLoading, error, refetch } = useVolumeTrend('7D');

  // Sum across the period
  const totals = data?.reduce(
    (acc, p) => ({
      collected: acc.collected + p.collected,
      dispatched: acc.dispatched + p.dispatched,
      received: acc.received + p.received,
    }),
    { collected: 0, dispatched: 0, received: 0 },
  ) ?? { collected: 0, dispatched: 0, received: 0 };

  const chartData = {
    labels: ['Collected', 'Dispatched', 'Received'],
    datasets: [
      {
        label: 'Volume (L)',
        data: [totals.collected, totals.dispatched, totals.received],
        backgroundColor: ['#1a56db', '#0ea5e9', '#16a34a'],
        borderRadius: 4,
        barThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.2,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${formatL(Number(ctx.raw))}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11 },
          color: '#94a3b8',
          callback: (v: unknown) => formatL(Number(v)),
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 600 as const }, color: '#475569' },
      },
    },
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <span aria-hidden="true">⟳</span>
          Collection vs Receipt (7D)
        </h2>
        {!isLoading && !error && data && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Loss: {formatL(totals.collected - totals.received)}
          </span>
        )}
      </div>

      <div className={styles.panelBody}>
        {isLoading && <div className={`${styles.skelChart} skeleton`} />}
        {error && !isLoading && (
          <div className={styles.errorState}>
            <p>Unable to load collection data.</p>
            <button id="collection-receipt-retry" className={styles.retryBtn} onClick={refetch}>Retry</button>
          </div>
        )}
        {!isLoading && !error && data && (
          <Bar data={chartData} options={options} aria-label="Collection vs dispatch vs receipt horizontal bar chart" />
        )}
      </div>
    </div>
  );
}
