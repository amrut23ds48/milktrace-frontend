'use client';
// components/analytics/DistrictSummaryTable.tsx

import { useState } from 'react';
import type { DistrictSummary } from '../../types/analytics.types';

type SortKey = keyof Omit<DistrictSummary, 'district'>;

const SKEL_STYLE: React.CSSProperties = { height: 260, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' };

function formatL(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K L`;
  return `${n} L`;
}

export default function DistrictSummaryTable({ data, isLoading }: { data: DistrictSummary[] | null; isLoading: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>('totalCollectedL');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  if (isLoading) return <div style={SKEL_STYLE} />;
  if (!data || data.length === 0) return <div style={{ ...SKEL_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No district data</div>;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...data].sort((a, b) => {
    const v = sortDir === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * v;
  });

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      onClick={() => handleSort(k)}
      style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: sortKey === k ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {label} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>District</th>
            <Th label="Volume" k="totalCollectedL" />
            <Th label="Transfers" k="totalTransfers" />
            <Th label="Discrepancies" k="discrepancies" />
            <Th label="Discrepancy Rate" k="discrepancyRate" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr key={row.district} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.district}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatL(row.totalCollectedL)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.totalTransfers.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: row.discrepancies > 0 ? '#dc2626' : 'var(--text-muted)', fontWeight: row.discrepancies > 0 ? 700 : 400 }}>
                {row.discrepancies}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                  background: row.discrepancyRate >= 10 ? '#dc262622' : row.discrepancyRate >= 5 ? '#d9770622' : '#16a34a22',
                  color: row.discrepancyRate >= 10 ? '#dc2626' : row.discrepancyRate >= 5 ? '#d97706' : '#16a34a',
                }}>
                  {row.discrepancyRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
