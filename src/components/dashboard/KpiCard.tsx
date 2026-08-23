// components/dashboard/KpiCard.tsx
// ─── Single KPI Metric Card ────────────────────────────────────────────────

import styles from './KpiCard.module.css';

type Variant = 'default' | 'warning' | 'danger' | 'info';

interface KpiCardProps {
  id: string;
  label: string;
  icon: string;
  value: string;
  change: number;        // percentage, positive = up
  context?: string;      // e.g. "vs previous 7 days"
  variant?: Variant;
}

export function KpiCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={`${styles.skelLabel} skeleton`} />
      <div className={`${styles.skelValue} skeleton`} />
      <div className={`${styles.skelTrend} skeleton`} />
    </div>
  );
}

export default function KpiCard({
  id,
  label,
  icon,
  value,
  change,
  context = 'vs previous period',
  variant = 'default',
}: KpiCardProps) {
  const isUp   = change > 0;
  const isDown = change < 0;

  // For anomalies / risk, "up" is bad — handled via variant
  const trendClass = isUp
    ? (variant === 'danger' || variant === 'warning' ? styles.trendDown : styles.trendUp)
    : isDown
    ? (variant === 'danger' || variant === 'warning' ? styles.trendUp  : styles.trendDown)
    : styles.trendFlat;

  const arrow = isUp ? '↑' : isDown ? '↓' : '→';

  return (
    <article id={id} className={`${styles.card} ${styles[variant]}`} aria-label={`${label}: ${value}`}>
      <div className={styles.label}>
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.trend}>
        <span className={trendClass} aria-hidden="true">{arrow}</span>
        <span className={trendClass}>{Math.abs(change).toFixed(1)}%</span>
        <span className={styles.trendContext}>{context}</span>
      </div>
    </article>
  );
}
