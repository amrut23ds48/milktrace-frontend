// components/map/MapLegend.tsx
// ─── Map Legend Overlay ───────────────────────────────────────────────────────

import styles from './MapLegend.module.css';

export default function MapLegend() {
  return (
    <div className={styles.legend} aria-label="Map legend">
      <div className={styles.title}>Legend</div>

      {/* Facilities */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Facilities</div>
        <div className={styles.item}>
          <div className={styles.markerCircle} style={{ background: '#3b82f6' }} aria-hidden="true" />
          Village Center
        </div>
        <div className={styles.item}>
          <div className={styles.markerDiamond} style={{ background: '#0d9488' }} aria-hidden="true" />
          Chilling Center
        </div>
        <div className={styles.item}>
          <div className={styles.markerSquare} style={{ background: '#6366f1' }} aria-hidden="true" />
          District Facility
        </div>
        <div className={styles.item}>
          <div className={styles.markerTriangle} aria-hidden="true" />
          Business
        </div>
      </div>

      {/* Routes */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Routes</div>
        <div className={styles.item}>
          <div className={styles.routeLine} style={{ background: '#16a34a' }} aria-hidden="true" />
          Normal
        </div>
        <div className={styles.item}>
          <div className={styles.routeLine} style={{ background: '#0ea5e9' }} aria-hidden="true" />
          In Transit
        </div>
        <div className={styles.item}>
          <div className={styles.routeDashed} style={{ borderTopColor: '#dc2626' }} aria-hidden="true" />
          Anomalous
        </div>
        <div className={styles.item}>
          <div className={styles.routeDashed} style={{ borderTopColor: '#d97706' }} aria-hidden="true" />
          Investigating
        </div>
      </div>

      {/* Districts */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Districts</div>
        <div className={styles.item}>
          <div className={styles.districtSwatch} style={{ background: 'rgba(22,163,74,0.15)' }} aria-hidden="true" />
          No anomalies
        </div>
        <div className={styles.item}>
          <div className={styles.districtSwatch} style={{ background: 'rgba(234,179,8,0.25)' }} aria-hidden="true" />
          1–2 anomalies
        </div>
        <div className={styles.item}>
          <div className={styles.districtSwatch} style={{ background: 'rgba(217,119,6,0.25)' }} aria-hidden="true" />
          3–6 anomalies
        </div>
        <div className={styles.item}>
          <div className={styles.districtSwatch} style={{ background: 'rgba(220,38,38,0.25)' }} aria-hidden="true" />
          7+ anomalies
        </div>
      </div>
    </div>
  );
}
