// components/dashboard/AnomalyList.tsx
// ─── Recent Anomalies Compact Table ───────────────────────────────────────

import type { AnomalyEvent, AnomalyStatus } from '../../types/dashboard.types';
import styles from './AnomalyList.module.css';

interface AnomalyListProps {
  data: AnomalyEvent[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
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
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <span aria-hidden="true">⚠</span>
          Recent Anomalies
        </h2>
        <button id="anomaly-view-all" className={styles.viewAll} aria-label="View all anomalies">
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
                <th scope="col">ID</th>
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
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : data && data.length > 0
                  ? data.map((a) => (
                      <tr key={a.id} id={`anomaly-row-${a.id}`} tabIndex={0} aria-label={`Anomaly ${a.id}`}>
                        <td><strong>{a.id}</strong></td>
                        <td>{a.type}</td>
                        <td>{a.location}</td>
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
        </div>
      )}
    </div>
  );
}
