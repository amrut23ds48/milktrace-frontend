// components/dashboard/TopRiskFacilities.tsx
// ─── Top Risk Facilities Ranked Panel ─────────────────────────────────────

import type { TopRiskFacility } from '../../types/dashboard.types';
import styles from './TopRiskFacilities.module.css';

interface TopRiskFacilitiesProps {
  data: TopRiskFacility[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function riskScoreClass(score: number) {
  if (score >= 70) return { label: styles.scoreHigh, gauge: styles.gaugeFillHigh };
  if (score >= 40) return { label: styles.scoreMedium, gauge: styles.gaugeFillMedium };
  return { label: styles.scoreLow, gauge: styles.gaugeFillLow };
}

function SkeletonItem() {
  return (
    <li className={styles.skelItem}>
      <div className={`${styles.skelName} skeleton`} />
      <div className={`${styles.skelScore} skeleton`} />
    </li>
  );
}

export default function TopRiskFacilities({ data, isLoading, error, onRetry }: TopRiskFacilitiesProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <span aria-hidden="true">🔴</span>
          Top Risk Facilities
        </h2>
      </div>

      {isLoading && (
        <ul className={styles.list} aria-label="Loading top risk facilities">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
        </ul>
      )}

      {error && !isLoading && (
        <div className={styles.errorState}>
          <p>Unable to load facility data.</p>
          <button id="top-risk-retry" className={styles.retryBtn} onClick={onRetry}>Retry</button>
        </div>
      )}

      {!isLoading && !error && data && data.length === 0 && (
        <div className={styles.emptyState}>✓ No high-risk facilities</div>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <ul className={styles.list} aria-label="Top risk facilities">
          {data.map((facility, idx) => {
            const cls = riskScoreClass(facility.riskScore);
            return (
              <li
                key={facility.id}
                id={`risk-facility-${facility.id}`}
                className={styles.item}
                tabIndex={0}
                aria-label={`${facility.name}, risk score ${facility.riskScore}`}
              >
                <span className={styles.rank}>#{idx + 1}</span>
                <div className={styles.info}>
                  <div className={styles.facilityName}>{facility.name}</div>
                  <div className={styles.facilityMeta}>{facility.type} · {facility.district}</div>
                </div>
                <div className={styles.scoreWrap}>
                  <span className={`${styles.score} ${cls.label}`}>{facility.riskScore}</span>
                  <div className={styles.gauge} aria-hidden="true">
                    <div
                      className={`${styles.gaugeFill} ${cls.gauge}`}
                      style={{ width: `${facility.riskScore}%` }}
                    />
                  </div>
                  <span className={styles.anomalyCount}>
                    {facility.openAnomalies} open
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
