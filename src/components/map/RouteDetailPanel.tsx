// components/map/RouteDetailPanel.tsx
// ─── Slide-in Route Detail Panel ─────────────────────────────────────────────

import type { MapRoute } from '../../types/map.types';
import styles from './RouteDetailPanel.module.css';

interface RouteDetailPanelProps {
  route: MapRoute | null;
  onClose: () => void;
}

type RouteStatus = MapRoute['status'];

function formatL(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K L`;
  return `${n} L`;
}

function statusTagClass(status: RouteStatus): string {
  const map: Record<RouteStatus, string> = {
    NORMAL:        styles.routeTagNormal,
    IN_TRANSIT:    styles.routeTagInTransit,
    ANOMALOUS:     styles.routeTagAnomalous,
    INVESTIGATING: styles.routeTagInvestigating,
  };
  return map[status];
}

function statusLabel(status: RouteStatus): string {
  const map: Record<RouteStatus, string> = {
    NORMAL: 'Normal',
    IN_TRANSIT: 'In Transit',
    ANOMALOUS: 'Anomalous',
    INVESTIGATING: 'Under Investigation',
  };
  return map[status];
}

function riskScoreClass(score: number) {
  if (score >= 60) return { label: styles.riskHigh,   fill: styles.riskFillHigh };
  if (score >= 30) return { label: styles.riskMedium, fill: styles.riskFillMedium };
  return              { label: styles.riskLow,    fill: styles.riskFillLow };
}

export default function RouteDetailPanel({ route, onClose }: RouteDetailPanelProps) {
  if (!route) return null;

  const lossL = route.receivedL > 0 ? route.dispatchedL - route.receivedL : null;
  const lossPct = lossL !== null ? ((lossL / route.dispatchedL) * 100).toFixed(2) : null;
  const riskCls = riskScoreClass(route.riskScore);

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" aria-label="Route detail">
      <div className={styles.panel} id="route-detail-panel">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={`${styles.routeTag} ${statusTagClass(route.status)}`}>
              {statusLabel(route.status)}
            </span>
            <button
              id="route-detail-close"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close route detail"
            >
              ✕
            </button>
          </div>
          <div className={styles.routeId}>{route.fromName} → {route.toName}</div>
          <div className={styles.routeLabel}>Route {route.id.toUpperCase()}{route.batchId ? ` · ${route.batchId}` : ''}</div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Dispatched</div>
              <div className={styles.metricValue}>{formatL(route.dispatchedL)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Received</div>
              <div className={styles.metricValue}>
                {route.receivedL > 0 ? formatL(route.receivedL) : <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>In transit</span>}
              </div>
            </div>
            {lossL !== null && (
              <div className={styles.metric} style={{ gridColumn: '1/-1' }}>
                <div className={styles.metricLabel}>Loss</div>
                <div className={`${styles.metricValue} ${styles.lossValue}`}>
                  {formatL(lossL)}
                </div>
                <div className={styles.metricSub}>{lossPct}% of dispatched volume</div>
              </div>
            )}
          </div>

          {/* Risk Score */}
          <div className={styles.riskSection}>
            <div className={styles.riskHeader}>
              <span className={styles.riskTitle}>Risk Score</span>
              <span className={`${styles.riskScore} ${riskCls.label}`}>{route.riskScore}</span>
            </div>
            <div className={styles.riskBar}>
              <div
                className={`${styles.riskFill} ${riskCls.fill}`}
                style={{ width: `${route.riskScore}%` }}
              />
            </div>
          </div>

          {/* Alerts */}
          <div>
            <div className={styles.sectionTitle}>⚠ Alerts</div>
            {route.alerts.length > 0 ? (
              <ul className={styles.alertList}>
                {route.alerts.map((alert, i) => (
                  <li key={i} className={styles.alertItem}>
                    <span className={styles.alertIcon} aria-hidden="true">•</span>
                    {alert}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noAlerts}>No alerts for this route</p>
            )}
          </div>

          {/* Actions */}
          <div>
            <div className={styles.sectionTitle}>Actions</div>
            <div className={styles.actions}>
              {route.batchId && (
                <button id="action-trace-batch" className={`${styles.actionBtn} ${styles.actionPrimary}`}>
                  🔍 Trace Batch {route.batchId}
                </button>
              )}
              <button id="action-view-from-facility" className={`${styles.actionBtn} ${styles.actionSecondary}`}>
                🏠 View {route.fromName}
              </button>
              <button id="action-view-to-facility" className={`${styles.actionBtn} ${styles.actionSecondary}`}>
                🏭 View {route.toName}
              </button>
              {(route.status === 'ANOMALOUS' || route.status === 'INVESTIGATING') && (
                <button id="action-view-investigation" className={`${styles.actionBtn} ${styles.actionSecondary}`}>
                  📋 View Investigation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
