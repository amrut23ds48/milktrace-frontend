'use client';

// components/map/MaharashtraMap.tsx
// ─── Core Leaflet Map Component ───────────────────────────────────────────────
// Must be loaded with dynamic(() => import(...), { ssr: false }) — Leaflet
// requires window/DOM which is unavailable during Next.js SSR.

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Polyline,
  Marker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { MapFacility, MapFilters, MapLayers, MapRoute } from '../../types/map.types';
import type { DistrictStats } from '../../types/map.types';
import { mapService } from '../../services/mapService';
import styles from './MaharashtraMap.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAHARASHTRA_CENTER: [number, number] = [19.7515, 75.7139];
const DEFAULT_ZOOM = 7;

const ROUTE_COLORS: Record<string, string> = {
  NORMAL:       '#16a34a',
  IN_TRANSIT:   '#0ea5e9',
  ANOMALOUS:    '#dc2626',
  INVESTIGATING:'#d97706',
};

const ROUTE_DASH: Record<string, string | undefined> = {
  NORMAL:       undefined,
  IN_TRANSIT:   undefined,
  ANOMALOUS:    '8 6',
  INVESTIGATING:'8 6',
};

// ─── Volume → line weight ─────────────────────────────────────────────────────
function routeWeight(litres: number): number {
  if (litres <= 0) return 2;
  return Math.min(8, Math.max(2, Math.log2(litres / 500) * 1.5 + 2));
}

// ─── District fill colour ─────────────────────────────────────────────────────
function districtFillColor(anomalies: number): string {
  if (anomalies >= 7) return 'rgba(220,38,38,0.18)';
  if (anomalies >= 3) return 'rgba(217,119,6,0.15)';
  if (anomalies >= 1) return 'rgba(234,179,8,0.12)';
  return 'rgba(22,163,74,0.08)';
}

// ─── Custom DivIcons ──────────────────────────────────────────────────────────
function makeIcon(type: MapFacility['type'], isAnomalous: boolean) {
  const classMap = {
    VILLAGE_CENTER:    'mt-marker-village',
    CHILLING_CENTER:   'mt-marker-chilling',
    DISTRICT_FACILITY: 'mt-marker-district',
    BUSINESS:          'mt-marker-business',
  };
  const cls = `${classMap[type]}${isAnomalous ? ' mt-marker-pulse' : ''}`;
  const size = type === 'DISTRICT_FACILITY' ? 16 : 14;
  return L.divIcon({
    className: cls,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [size / 2, 0],
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Tracks current zoom level and calls back */
function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoom((e.target as L.Map).getZoom()),
  });
  return null;
}

// ─── Prop types ───────────────────────────────────────────────────────────────
interface MaharashtraMapProps {
  facilities: MapFacility[];
  routes: MapRoute[];
  districtStats: DistrictStats[];
  layers: MapLayers;
  filters: MapFilters;
  onRouteClick: (route: MapRoute) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MaharashtraMap({
  facilities,
  routes,
  districtStats,
  layers,
  filters,
  onRouteClick,
}: MaharashtraMapProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const facilityIndex = useMemo(
    () => mapService.buildFacilityIndex(facilities),
    [facilities],
  );

  // Load district GeoJSON
  useEffect(() => {
    fetch('/geojson/maharashtra.json')
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => setGeoJson(data))
      .catch(() => {/* silently degrade — tiles still show geography */});
  }, []);

  // Build district stats lookup
  const statsIndex = new Map(districtStats.map((s) => [s.district, s]));

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const visibleRoutes = routes.filter((r) => {
    if (!layers.routes) return false;
    if (filters.routeStatus !== 'ALL' && r.status !== filters.routeStatus) return false;
    if (filters.riskBand !== 'ALL') {
      const band =
        r.riskScore >= 80 ? 'CRITICAL' :
        r.riskScore >= 50 ? 'HIGH' :
        r.riskScore >= 25 ? 'MEDIUM' : 'LOW';
      if (band !== filters.riskBand) return false;
    }
    return true;
  });

  const visibleFacilities = facilities.filter((f) => {
    if (filters.district !== 'ALL' && f.district !== filters.district) return false;
    const typeLayerMap: Record<MapFacility['type'], keyof MapLayers> = {
      VILLAGE_CENTER:    'villageCenters',
      CHILLING_CENTER:   'chillingCenters',
      DISTRICT_FACILITY: 'districtFacilities',
      BUSINESS:          'businesses',
    };
    return layers[typeLayerMap[f.type]];
  });

  // ── GeoJSON style function ────────────────────────────────────────────────────
  const geoJsonStyle = (feature?: GeoJSON.Feature): L.PathOptions => {
    const district = (feature?.properties as { district?: string })?.district ?? '';
    const stats = statsIndex.get(district);
    const anomalies = stats?.totalAnomalies ?? 0;
    return {
      fillColor: districtFillColor(anomalies),
      fillOpacity: 1,
      color: '#94a3b8',
      weight: 1,
      opacity: 0.6,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const district = (feature.properties as { district?: string })?.district ?? '';
    const stats = statsIndex.get(district);
    const anomalyText = stats
      ? `${stats.totalAnomalies} anomal${stats.totalAnomalies === 1 ? 'y' : 'ies'}`
      : 'No data';
    (layer as L.Path).bindTooltip(
      `<strong>${district}</strong><br/>${anomalyText}`,
      { sticky: true, className: 'mt-route-tooltip' },
    );
  };

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={MAHARASHTRA_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.leafletMap}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Base tile layer — CartoDB Positron (light, minimal, free) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={18}
        />

        {/* Zoom watcher */}
        <ZoomWatcher onZoom={setZoom} />

        {/* District GeoJSON layer */}
        {geoJson && (
          <GeoJSON
            key={JSON.stringify(districtStats)}
            data={geoJson}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Route Polylines — shown at zoom ≥ 8 or when filter is active */}
        {(zoom >= 7) && visibleRoutes.map((route) => {
          const from = facilityIndex.get(route.fromFacilityId);
          const to   = facilityIndex.get(route.toFacilityId);
          if (!from || !to) return null;

          const positions: [number, number][] = [
            [from.lat, from.lng],
            [to.lat,   to.lng],
          ];

          const color  = ROUTE_COLORS[route.status] ?? '#94a3b8';
          const dash   = ROUTE_DASH[route.status];
          const weight = routeWeight(route.dispatchedL);
          const loss   = route.receivedL > 0
            ? `${((1 - route.receivedL / route.dispatchedL) * 100).toFixed(1)}% loss`
            : 'In transit';

          return (
            <Polyline
              key={route.id}
              positions={positions}
              pathOptions={{
                color,
                weight,
                dashArray: dash,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onRouteClick(route),
                mouseover: (e) => e.target.setStyle({ opacity: 1, weight: weight + 1.5 }),
                mouseout:  (e) => e.target.setStyle({ opacity: 0.85, weight }),
              }}
            >
              <Tooltip
                sticky
                className="mt-route-tooltip"
                direction="top"
              >
                <strong>{route.fromName} → {route.toName}</strong>
                <br />{route.status.replace('_', ' ')} · Risk {route.riskScore} · {loss}
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Facility Markers — shown at zoom ≥ 8 */}
        {zoom >= 7 && visibleFacilities.map((facility) => {
          const isAnomalous = facility.openAnomalies > 0 && layers.anomalies;
          const icon = makeIcon(facility.type, isAnomalous);
          const typeLabel = {
            VILLAGE_CENTER:    '● Village Center',
            CHILLING_CENTER:   '◆ Chilling Center',
            DISTRICT_FACILITY: '■ District Facility',
            BUSINESS:          '▲ Business',
          }[facility.type];

          return (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={icon}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                className="mt-route-tooltip"
              >
                <strong>{facility.name}</strong>
                <br />{typeLabel} · {facility.district}
                <br />Risk {facility.riskScore} · {facility.openAnomalies} open anomal{facility.openAnomalies === 1 ? 'y' : 'ies'}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
