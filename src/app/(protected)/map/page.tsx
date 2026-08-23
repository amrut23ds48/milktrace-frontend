'use client';

// app/map/page.tsx
// ─── Maharashtra Milk Map — Phase 8 ───────────────────────────────────────────
// The map is loaded with { ssr: false } because Leaflet depends on the browser DOM.

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import MapLayerControls from '../../../components/map/MapLayerControls';
import MapFilterBar from '../../../components/map/MapFilterBar';
import MapLegend from '../../../components/map/MapLegend';
import RouteDetailPanel from '../../../components/map/RouteDetailPanel';
import { useMapFacilities, useMapRoutes, useDistrictStats } from '../../../hooks/useMapData';
import type { MapFilters, MapLayers, MapRoute } from '../../../types/map.types';
import styles from './map.module.css';

// ── Dynamic import — disables SSR for the Leaflet map ────────────────────────
const MaharashtraMap = dynamic(
  () => import('../../../components/map/MaharashtraMap'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapSkeleton}>
        <div className={styles.skeletonSpinner} aria-hidden="true" />
        <span>Loading Maharashtra map…</span>
      </div>
    ),
  },
);

// ── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_LAYERS: MapLayers = {
  villageCenters:     true,
  chillingCenters:    true,
  districtFacilities: true,
  businesses:         true,
  routes:             true,
  anomalies:          true,
};

const DEFAULT_FILTERS: MapFilters = {
  routeStatus: 'ALL',
  riskBand:    'ALL',
  district:    'ALL',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MapPage() {
  const [layers,  setLayers]  = useState<MapLayers>(DEFAULT_LAYERS);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [selectedRoute, setSelectedRoute] = useState<MapRoute | null>(null);

  const facilities    = useMapFacilities();
  const routes        = useMapRoutes();
  const districtStats = useDistrictStats();

  const toggleLayer = useCallback((key: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateFilter = useCallback((patch: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const openAnomalies = routes.data?.filter((r) => r.status === 'ANOMALOUS' || r.status === 'INVESTIGATING').length ?? 0;
  const inTransit     = routes.data?.filter((r) => r.status === 'IN_TRANSIT').length ?? 0;
  const totalFacilities = facilities.data?.length ?? 0;

  return (
    <div className={styles.page} aria-label="Maharashtra Milk Map">
      {/* Stats strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#6366f1' }} aria-hidden="true" />
          {totalFacilities} Facilities
        </div>
        <span className={styles.statSep}>·</span>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#0ea5e9' }} aria-hidden="true" />
          {inTransit} In Transit
        </div>
        <span className={styles.statSep}>·</span>
        <div className={styles.statItem}>
          <span className={styles.statDot} style={{ background: '#dc2626' }} aria-hidden="true" />
          {openAnomalies} Anomalous Routes
        </div>
        <span className={styles.statSep}>·</span>
        <div className={styles.statItem} style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
          Click any route to view details
        </div>
      </div>

      {/* Filter bar — centered at top */}
      <div style={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 999 }}>
        <MapFilterBar
          filters={filters}
          districts={[]}
          onChange={updateFilter}
          onReset={resetFilters}
        />
      </div>

      {/* Map fills the viewport */}
      <div className={styles.mapWrap} style={{ top: 36 }}>
        {(facilities.isLoading || routes.isLoading) && (
          <div className={styles.mapSkeleton}>
            <div className={styles.skeletonSpinner} aria-hidden="true" />
            <span>Fetching map data…</span>
          </div>
        )}

        {!facilities.isLoading && !routes.isLoading && (
          <MaharashtraMap
            facilities={facilities.data ?? []}
            routes={routes.data ?? []}
            districtStats={districtStats.data ?? []}
            layers={layers}
            filters={filters}
            onRouteClick={setSelectedRoute}
          />
        )}
      </div>

      {/* Layer controls — top right */}
      <div style={{ position: 'absolute', top: 80, right: 0, zIndex: 1001 }}>
        <MapLayerControls layers={layers} onToggle={toggleLayer} />
      </div>

      {/* Legend — bottom left */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 1001 }}>
        <MapLegend />
      </div>

      {/* Route detail panel — slides in from right */}
      <RouteDetailPanel route={selectedRoute} onClose={() => setSelectedRoute(null)} />
    </div>
  );
}
