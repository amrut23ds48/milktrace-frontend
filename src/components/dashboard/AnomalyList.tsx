// components/dashboard/AnomalyList.tsx
// ─── Recent Anomalies Compact Table ───────────────────────────────────────

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AnomalyEvent, AnomalyStatus } from '../../types/dashboard.types';
import styles from './AnomalyList.module.css';

interface AnomalyListProps {
  data: AnomalyEvent[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PAGE_SIZE = 5;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function riskClass(score: number): string {
  if (score >= 70) return styles.riskHigh;
  if (score >= 40) return styles.riskMedium;
  return styles.riskLow;
}

function statusClass(status: AnomalyStatus): string {
  const map: Record<AnomalyStatus, string> = {
    OPEN:          styles.statusOpen,
    INVESTIGATING: styles.statusInvestigating,
    RESOLVED:      styles.statusResolved,
  };
  return map[status];
}

function statusLabel(status: AnomalyStatus): string {
  const map: Record<AnomalyStatus, string> = {
    OPEN: 'Open',
    INVESTIGATING: 'Investigating',
    RESOLVED: 'Resolved',
  };
  return map[status];
}

function severityBadgeStyle(sev?: string): React.CSSProperties {
  const colors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#d97706',
    LOW: '#16a34a',
  };
  const c = colors[sev ?? 'LOW'] ?? '#16a34a';
  return {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '4px',
    background: c + '22',
    color: c,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };
}

function SkeletonRow() {
  return (
    <tr className={styles.skelRow}>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i}><div className="skeleton" /></td>
      ))}
    </tr>
  );
}

export default function AnomalyList({ data, isLoading, error, onRetry }: AnomalyListProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const totalPages = data ? Math.ceil(data.length / PAGE_SIZE) : 1;
  const pageData = data ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <span aria-hidden="true">⚠</span>
          Recent Anomalies
        </h2>
        <button
          id="anomaly-view-all"
          className={styles.viewAll}
          aria-label="View all anomalies"
          onClick={() => router.push('/anomalies')}
        >
          View All →
        </button>
      </div>

      {error && !isLoading && (
        <div className={styles.errorState}>
          <p>Unable to load anomalies.</p>
          <button id="anomaly-retry" className={styles.retryBtn} onClick={onRetry}>Retry</button>
        </div>
      )}

      {!error && (
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Recent anomaly events">
            <thead>
              <tr>
                <th scope="col">Severity</th>
                <th scope="col">Type</th>
                <th scope="col">Location</th>
                <th scope="col">Risk</th>
                <th scope="col">Detected</th>
                <th scope="col">Status</th>
                <th scope="col">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                : pageData.length > 0
                  ? pageData.map((a) => (
                      <tr
                        key={a.id}
                        id={`anomaly-row-${a.id}`}
                        tabIndex={0}
                        aria-label={`Anomaly ${a.id}`}
                        onClick={() => router.push(`/anomalies?id=${a.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span style={severityBadgeStyle(a.severity)}>
                            {a.severity ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{a.type.replace(/_/g, ' ')}</td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.locationLabel ?? a.location}
                        </td>
                        <td>
                          <div className={styles.riskCell}>
                            <span style={{ fontWeight: 700, minWidth: 24 }}>{a.riskScore}</span>
                            <div className={styles.riskBar} aria-hidden="true">
                              <div
                                className={`${styles.riskFill} ${riskClass(a.riskScore)}`}
                                style={{ width: `${a.riskScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.timeAgo} title={new Date(a.detectedAt).toLocaleString()}>
                            {timeAgo(a.detectedAt)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${statusClass(a.status)}`}>
                            {statusLabel(a.status)}
                          </span>
                        </td>
                        <td style={{ color: a.assignedTo ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {a.assignedTo ?? '—'}
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.emptyState}>✓ No anomalies detected</div>
                        </td>
                      </tr>
                    )
              }
            </tbody>
          </table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
              >‹</button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
              >›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
