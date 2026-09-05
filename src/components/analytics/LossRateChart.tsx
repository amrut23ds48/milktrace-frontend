'use client';
// components/analytics/LossRateChart.tsx

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { LossRatePoint } from '../../types/analytics.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SKEL_STYLE: React.CSSProperties = { height: 260, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' };

export default function LossRateChart({ data, isLoading }: { data: LossRatePoint[] | null; isLoading: boolean }) {
  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.length === 0) return <div style={{ ...SKEL_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No transfer data available</div>;

  const chartData = {
    labels: data.map(p => p.date.slice(5)),
    datasets: [
      {
        label: 'Loss %',
        data: data.map(p => p.lossPercent),
        backgroundColor: data.map(p => p.lossPercent > 10 ? 'rgba(220,38,38,0.7)' : p.lossPercent > 5 ? 'rgba(217,119,6,0.7)' : 'rgba(234,88,12,0.5)'),
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Spike %',
        data: data.map(p => p.spikePercent),
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const, intersect: false,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8', maxRotation: 0 } },
      y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v: any) => `${v}%` } },
    },
  };

  return (
    <div>
      <div style={{ height: 260 }}>
        <Bar data={chartData} options={options} aria-label="Daily volume loss and spike rate" />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[{ c: 'rgba(234,88,12,0.7)', l: 'Loss % (red = >10%)' }, { c: 'rgba(99,102,241,0.6)', l: 'Volume Spike %' }].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
