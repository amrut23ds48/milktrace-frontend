'use client';
// components/analytics/VolumeTrendChart.tsx

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { VolumeTrendPoint } from '../../types/analytics.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

function formatL(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M L`;
  return `${(n / 1_000).toFixed(0)}K L`;
}

const SKEL_STYLE: React.CSSProperties = { height: 260, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' };

export default function VolumeTrendChart({ data, isLoading }: { data: VolumeTrendPoint[] | null; isLoading: boolean }) {
  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.length === 0) return <div style={{ ...SKEL_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No data for selected period</div>;

  const chartData = {
    labels: data.map(p => p.date.slice(5)), // MM-DD
    datasets: [
      { label: 'Collected', data: data.map(p => p.collected), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5 },
      { label: 'Dispatched', data: data.map(p => p.dispatched), borderColor: '#0ea5e9', backgroundColor: 'transparent', borderWidth: 2, borderDash: [4, 3], fill: false, tension: 0.4, pointRadius: 2, pointHoverRadius: 4 },
      { label: 'Received', data: data.map(p => p.received), borderColor: '#16a34a', backgroundColor: 'transparent', borderWidth: 2, borderDash: [2, 3], fill: false, tension: 0.4, pointRadius: 2, pointHoverRadius: 4 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const, intersect: false,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${formatL(ctx.raw)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8', maxRotation: 0 } },
      y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v: any) => formatL(Number(v)) } },
    },
    interaction: { mode: 'index' as const, intersect: false },
  };

  return (
    <div>
      <div style={{ height: 260 }}>
        <Line data={chartData} options={options} aria-label="Milk volume trend" />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        {[{ c: '#6366f1', l: 'Collected' }, { c: '#0ea5e9', l: 'Dispatched' }, { c: '#16a34a', l: 'Received' }].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
