'use client';
// components/analytics/AnomalyTypeDonut.tsx

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { AnomalyBreakdownResponse } from '../../types/analytics.types';

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_COLORS = [
  '#6366f1', '#0ea5e9', '#16a34a', '#dc2626', '#d97706',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

const SKEL_STYLE: React.CSSProperties = { height: 240, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' };

function fmtType(t: string) {
  return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function AnomalyTypeDonut({ data, isLoading }: { data: AnomalyBreakdownResponse | null; isLoading: boolean }) {
  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.byType.length === 0) return <div style={{ ...SKEL_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No anomalies in period</div>;

  const sorted = [...data.byType].sort((a, b) => b.count - a.count);

  const chartData = {
    labels: sorted.map(t => fmtType(t.type)),
    datasets: [{
      data: sorted.map(t => t.count),
      backgroundColor: sorted.map((_, i) => TYPE_COLORS[i % TYPE_COLORS.length]),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} events` } },
    },
  };

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: 200, height: 200, flexShrink: 0 }}>
        <Doughnut data={chartData} options={options} aria-label="Anomaly type breakdown donut chart" />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map((t, i) => (
          <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[i % TYPE_COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtType(t.type)}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 24, textAlign: 'right' }}>{t.count}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-color)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
          Total: {data.total} anomalies
        </div>
      </div>
    </div>
  );
}
