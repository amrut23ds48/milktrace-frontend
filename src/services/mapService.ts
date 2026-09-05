// services/mapService.ts
// ─── Map Data Abstractions ────────────────────────────────────────────────────
// Connects to Express.js backend for facility + route data.

import type {
  DistrictStats,
  MapFacility,
  MapRoute,
} from '../types/map.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function fetchWithAuth(url: string, token: string | null) {
  if (!token) throw new Error('Unauthorized');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchMapFacilities(token: string | null = null): Promise<MapFacility[]> {
  return fetchWithAuth(`${API_BASE}/map/facilities`, token);
}

export async function fetchMapRoutes(token: string | null = null): Promise<MapRoute[]> {
  return fetchWithAuth(`${API_BASE}/map/routes`, token);
}

export async function fetchDistrictStats(token: string | null = null): Promise<DistrictStats[]> {
  return fetchWithAuth(`${API_BASE}/map/district-stats`, token);
}

/** Build a lookup map from facilityId → MapFacility */
export function buildFacilityIndex(facilities: MapFacility[]): Map<string, MapFacility> {
  return new Map(facilities.map((f) => [f.id, f]));
}

export const mapService = {
  fetchMapFacilities,
  fetchMapRoutes,
  fetchDistrictStats,
  buildFacilityIndex,
};
