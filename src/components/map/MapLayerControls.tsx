// components/map/MapLayerControls.tsx
// ─── Floating Layer Toggle Panel ──────────────────────────────────────────────

import type { MapLayers } from '../../types/map.types';
import styles from './MapLayerControls.module.css';

interface MapLayerControlsProps {
  layers: MapLayers;
  onToggle: (key: keyof MapLayers) => void;
}

const LAYER_ITEMS: { key: keyof MapLayers; label: string; color: string }[] = [
  { key: 'villageCenters',    label: '● Village Centers',    color: '#3b82f6' },
  { key: 'chillingCenters',   label: '◆ Chilling Centers',   color: '#0d9488' },
  { key: 'districtFacilities',label: '■ District Facilities', color: '#6366f1' },
  { key: 'businesses',        label: '▲ Businesses',         color: '#f97316' },
  { key: 'routes',            label: '── Milk Routes',       color: '#94a3b8' },
  { key: 'anomalies',         label: '⚠ Anomaly Pulse',      color: '#dc2626' },
];

export default function MapLayerControls({ layers, onToggle }: MapLayerControlsProps) {
  return (
    <div className={styles.panel} aria-label="Map layer controls">
      <div className={styles.title}>Layers</div>
      {LAYER_ITEMS.map(({ key, label, color }) => (
        <div
          key={key}
          id={`layer-toggle-${key}`}
          className={styles.item}
          role="checkbox"
          aria-checked={layers[key]}
          tabIndex={0}
          onClick={() => onToggle(key)}
          onKeyDown={(e) => e.key === 'Enter' && onToggle(key)}
        >
          <div className={`${styles.checkbox} ${layers[key] ? styles.checked : ''}`}>
            {layers[key] && <span className={styles.checkmark}>✓</span>}
          </div>
          <span className={styles.dot} style={{ background: color }} aria-hidden="true" />
          {label}
        </div>
      ))}
    </div>
  );
}
