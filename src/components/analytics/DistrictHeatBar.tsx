'use client';
// components/analytics/DistrictHeatBar.tsx

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DistrictAnomalyData } from '../../types/analytics.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const SKEL_STYLE: React.CSSProperties = { height: 260, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' };

function riskColor(score: number) {
  if (score >= 70) return '#dc2626cc';
  if (score >= 50) return '#ea580ccc';
  if (score >= 30) return '#d97706cc';
  return '#16a34acc';
}

export default function DistrictHeatBar({ data, isLoading }: { data: DistrictAnomalyData[] | null; isLoading: boolean }) {
  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.length === 0) return <div style={{ ...SKEL_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No district anomaly data</div>;

  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 12);

  const chartData = {
    labels: sorted.map(d => d.district),
    datasets: [
      {
        label: 'Anomaly Count',
        data: sorted.map(d => d.count),
        backgroundColor: sorted.map(d => riskColor(d.avgRiskScore)),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.raw} anomalies`,
          afterLabel: (ctx: any) => `Avg risk: ${sorted[ctx.dataIndex]?.avgRiskScore ?? '—'}`,
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
    },
  };

  const dynamicH = Math.max(240, sorted.length * 32);

  return (
    <div>
      <div style={{ height: dynamicH }}>
        <Bar data={chartData} options={options} aria-label="Anomaly count by district" />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
        {[{ c: '#dc2626', l: 'High risk (≥70)' }, { c: '#ea580c', l: 'Med-high (50-69)' }, { c: '#d97706', l: 'Medium (30-49)' }, { c: '#16a34a', l: 'Low (<30)' }].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
