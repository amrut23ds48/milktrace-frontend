// components/map/MapFilterBar.tsx
// ─── Map Filter Bar (Route Status / Risk Band / District) ─────────────────────

import type { MapFilters } from '../../types/map.types';
import styles from './MapFilterBar.module.css';

interface MapFilterBarProps {
  filters: MapFilters;
  districts: string[];
  onChange: (updated: Partial<MapFilters>) => void;
  onReset: () => void;
}

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana',
  'Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna',
  'Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded',
  'Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad',
  'Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha',
  'Washim','Yavatmal',
];

export default function MapFilterBar({ filters, districts, onChange, onReset }: MapFilterBarProps) {
  const isFiltered =
    filters.routeStatus !== 'ALL' ||
    filters.riskBand !== 'ALL' ||
    filters.district !== 'ALL';

  return (
    <div className={styles.bar} role="group" aria-label="Map filters">
      <span className={styles.label}>Filter:</span>

      <select
        id="filter-route-status"
        className={styles.select}
        value={filters.routeStatus}
        onChange={(e) => onChange({ routeStatus: e.target.value as MapFilters['routeStatus'] })}
        aria-label="Route status filter"
      >
        <option value="ALL">All Statuses</option>
        <option value="NORMAL">Normal</option>
        <option value="IN_TRANSIT">In Transit</option>
        <option value="ANOMALOUS">Anomalous</option>
        <option value="INVESTIGATING">Investigating</option>
      </select>

      <div className={styles.divider} aria-hidden="true" />

      <select
        id="filter-risk-band"
        className={styles.select}
        value={filters.riskBand}
        onChange={(e) => onChange({ riskBand: e.target.value as MapFilters['riskBand'] })}
        aria-label="Risk level filter"
      >
        <option value="ALL">All Risk Levels</option>
        <option value="CRITICAL">Critical (80+)</option>
        <option value="HIGH">High (50–79)</option>
        <option value="MEDIUM">Medium (25–49)</option>
        <option value="LOW">Low (&lt;25)</option>
      </select>

      <div className={styles.divider} aria-hidden="true" />

      <select
        id="filter-district"
        className={styles.select}
        value={filters.district}
        onChange={(e) => onChange({ district: e.target.value })}
        aria-label="District filter"
      >
        <option value="ALL">All Districts</option>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {isFiltered && (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <button
            id="filter-reset"
            className={styles.resetBtn}
            onClick={onReset}
            aria-label="Reset all filters"
          >
            ✕ Reset
          </button>
        </>
      )}
    </div>
  );
}
