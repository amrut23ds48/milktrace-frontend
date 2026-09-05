'use client';
// components/analytics/AnomalySeverityBar.tsx

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { AnomalyBreakdownResponse } from '../../types/analytics.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const SEV_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a',
};

const SKEL_STYLE: React.CSSProperties = { height: 120, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' };

export default function AnomalySeverityBar({ data, isLoading }: { data: AnomalyBreakdownResponse | null; isLoading: boolean }) {
  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.bySeverity.length === 0) return null;

  const sevMap: Record<string, number> = {};
  for (const s of data.bySeverity) sevMap[s.severity] = s.count;

  const ordered = SEV_ORDER.map(s => ({ severity: s, count: sevMap[s] ?? 0 }));

  const chartData = {
    labels: ordered.map(s => s.severity),
    datasets: [{
      data: ordered.map(s => s.count),
      backgroundColor: ordered.map(s => SEV_COLORS[s.severity] + 'cc'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} anomalies` } },
    },
    scales: {
      x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { font: { size: 11, weight: 600 as const }, color: (ctx: any) => SEV_COLORS[SEV_ORDER[ctx.index]] ?? '#94a3b8' } },
    },
  };

  return (
    <div style={{ height: 120 }}>
      <Bar data={chartData} options={options} aria-label="Anomaly severity distribution" />
    </div>
  );
}
