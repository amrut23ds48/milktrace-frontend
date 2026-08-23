// services/mapService.ts
// ─── Map Data Abstractions ────────────────────────────────────────────────────
// Connects to Express.js backend for facility + route data.
// MOCK data used until Phase 6 backend aggregation endpoints are ready.

import type {
  DistrictStats,
  MapFacility,
  MapRoute,
} from '../types/map.types';

// ─── Facilities (15 real Maharashtra coordinates) ─────────────────────────────
// MOCK — replace with: GET /api/v1/facilities?includeCoords=true

const MOCK_FACILITIES: MapFacility[] = [
  // Village Collection Centers
  { id: 'vc-001', name: 'VC-001 Khed',        type: 'VILLAGE_CENTER',    district: 'Pune',        lat: 18.655, lng: 73.897, openAnomalies: 0, riskScore: 12, dailyVolumeL: 480,    status: 'ACTIVE' },
  { id: 'vc-002', name: 'VC-002 Sinnar',      type: 'VILLAGE_CENTER',    district: 'Nashik',      lat: 19.843, lng: 74.003, openAnomalies: 1, riskScore: 38, dailyVolumeL: 310,    status: 'ACTIVE' },
  { id: 'vc-003', name: 'VC-003 Hingna',      type: 'VILLAGE_CENTER',    district: 'Nagpur',      lat: 21.043, lng: 78.987, openAnomalies: 0, riskScore: 8,  dailyVolumeL: 290,    status: 'ACTIVE' },
  { id: 'vc-004', name: 'VC-004 Gangapur',    type: 'VILLAGE_CENTER',    district: 'Aurangabad',  lat: 19.707, lng: 75.008, openAnomalies: 2, riskScore: 67, dailyVolumeL: 560,    status: 'ACTIVE' },
  { id: 'vc-005', name: 'VC-005 Hatkanangale',type: 'VILLAGE_CENTER',    district: 'Kolhapur',    lat: 16.824, lng: 74.143, openAnomalies: 0, riskScore: 15, dailyVolumeL: 390,    status: 'ACTIVE' },
  { id: 'vc-006', name: 'VC-006 Ozar',        type: 'VILLAGE_CENTER',    district: 'Nashik',      lat: 20.097, lng: 73.921, openAnomalies: 3, riskScore: 82, dailyVolumeL: 210,    status: 'ACTIVE' },
  { id: 'vc-007', name: 'VC-007 Amalner',     type: 'VILLAGE_CENTER',    district: 'Jalgaon',     lat: 21.057, lng: 75.062, openAnomalies: 0, riskScore: 20, dailyVolumeL: 340,    status: 'ACTIVE' },

  // Chilling Centers
  { id: 'cc-001', name: 'CC-001 Pune Central',  type: 'CHILLING_CENTER', district: 'Pune',        lat: 18.524, lng: 73.858, openAnomalies: 1, riskScore: 28, dailyVolumeL: 12400,  status: 'ACTIVE' },
  { id: 'cc-002', name: 'CC-002 Nashik',         type: 'CHILLING_CENTER', district: 'Nashik',      lat: 20.005, lng: 73.791, openAnomalies: 2, riskScore: 55, dailyVolumeL: 9800,   status: 'ACTIVE' },
  { id: 'cc-003', name: 'CC-003 Aurangabad',     type: 'CHILLING_CENTER', district: 'Aurangabad',  lat: 19.878, lng: 75.343, openAnomalies: 0, riskScore: 18, dailyVolumeL: 8200,   status: 'ACTIVE' },
  { id: 'cc-004', name: 'CC-004 Kolhapur',       type: 'CHILLING_CENTER', district: 'Kolhapur',    lat: 16.705, lng: 74.244, openAnomalies: 0, riskScore: 10, dailyVolumeL: 11000,  status: 'ACTIVE' },

  // District Facilities
  { id: 'df-001', name: 'DF-001 Nagpur',         type: 'DISTRICT_FACILITY',district: 'Nagpur',     lat: 21.145, lng: 79.088, openAnomalies: 3, riskScore: 72, dailyVolumeL: 48000,  status: 'ACTIVE' },
  { id: 'df-002', name: 'DF-002 Pune Metro',     type: 'DISTRICT_FACILITY',district: 'Pune',       lat: 18.467, lng: 73.743, openAnomalies: 1, riskScore: 34, dailyVolumeL: 65000,  status: 'ACTIVE' },
  { id: 'df-003', name: 'DF-003 Mumbai Hub',     type: 'DISTRICT_FACILITY',district: 'Mumbai City', lat: 19.076, lng: 72.877, openAnomalies: 0, riskScore: 22, dailyVolumeL: 120000, status: 'ACTIVE' },

  // Business
  { id: 'biz-001', name: 'Amul Processing Pune', type: 'BUSINESS',         district: 'Pune',       lat: 18.382, lng: 73.645, openAnomalies: 0, riskScore: 5,  dailyVolumeL: 200000, status: 'ACTIVE' },
];

// ─── Routes (12 routes with mixed statuses) ───────────────────────────────────
// MOCK — replace with: GET /api/v1/transfers?includeRoute=true&limit=50

const MOCK_ROUTES: MapRoute[] = [
  { id: 'rt-001', fromFacilityId: 'vc-001', toFacilityId: 'cc-001', fromName: 'VC-001 Khed',         toName: 'CC-001 Pune Central', status: 'NORMAL',       dispatchedL: 480,   receivedL: 474,   riskScore: 12, alerts: [],                                        lastTransferAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'rt-002', fromFacilityId: 'vc-002', toFacilityId: 'cc-002', fromName: 'VC-002 Sinnar',       toName: 'CC-002 Nashik',       status: 'ANOMALOUS',    dispatchedL: 310,   receivedL: 267,   riskScore: 74, alerts: ['Quantity deviation >10%', 'Repeated anomaly'],  lastTransferAt: new Date(Date.now() - 1 * 3600000).toISOString(), batchId: 'BAT-MH-2026-000182' },
  { id: 'rt-003', fromFacilityId: 'vc-003', toFacilityId: 'df-001', fromName: 'VC-003 Hingna',       toName: 'DF-001 Nagpur',       status: 'NORMAL',       dispatchedL: 290,   receivedL: 286,   riskScore: 8,  alerts: [],                                        lastTransferAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'rt-004', fromFacilityId: 'vc-004', toFacilityId: 'cc-003', fromName: 'VC-004 Gangapur',     toName: 'CC-003 Aurangabad',   status: 'INVESTIGATING',dispatchedL: 560,   receivedL: 501,   riskScore: 67, alerts: ['SNF deviation', 'Transfer discrepancy'],   lastTransferAt: new Date(Date.now() - 30 * 60000).toISOString(),  batchId: 'BAT-MH-2026-000178' },
  { id: 'rt-005', fromFacilityId: 'vc-005', toFacilityId: 'cc-004', fromName: 'VC-005 Hatkanangale', toName: 'CC-004 Kolhapur',     status: 'NORMAL',       dispatchedL: 390,   receivedL: 385,   riskScore: 15, alerts: [],                                        lastTransferAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'rt-006', fromFacilityId: 'vc-006', toFacilityId: 'cc-002', fromName: 'VC-006 Ozar',         toName: 'CC-002 Nashik',       status: 'ANOMALOUS',    dispatchedL: 210,   receivedL: 168,   riskScore: 82, alerts: ['Fat % below threshold', 'Repeated anomaly', 'Above-normal loss'], lastTransferAt: new Date(Date.now() - 45 * 60000).toISOString(), batchId: 'BAT-MH-2026-000182' },
  { id: 'rt-007', fromFacilityId: 'vc-007', toFacilityId: 'cc-003', fromName: 'VC-007 Amalner',      toName: 'CC-003 Aurangabad',   status: 'IN_TRANSIT',   dispatchedL: 340,   receivedL: 0,     riskScore: 20, alerts: [],                                        lastTransferAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: 'rt-008', fromFacilityId: 'cc-001', toFacilityId: 'df-002', fromName: 'CC-001 Pune Central',  toName: 'DF-002 Pune Metro',   status: 'IN_TRANSIT',   dispatchedL: 12400, receivedL: 0,     riskScore: 28, alerts: [],                                        lastTransferAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'rt-009', fromFacilityId: 'cc-002', toFacilityId: 'df-003', fromName: 'CC-002 Nashik',        toName: 'DF-003 Mumbai Hub',   status: 'NORMAL',       dispatchedL: 9800,  receivedL: 9654,  riskScore: 55, alerts: [],                                        lastTransferAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'rt-010', fromFacilityId: 'cc-003', toFacilityId: 'df-002', fromName: 'CC-003 Aurangabad',    toName: 'DF-002 Pune Metro',   status: 'NORMAL',       dispatchedL: 8200,  receivedL: 8077,  riskScore: 18, alerts: [],                                        lastTransferAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'rt-011', fromFacilityId: 'cc-004', toFacilityId: 'df-002', fromName: 'CC-004 Kolhapur',      toName: 'DF-002 Pune Metro',   status: 'NORMAL',       dispatchedL: 11000, receivedL: 10890, riskScore: 10, alerts: [],                                        lastTransferAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'rt-012', fromFacilityId: 'df-002', toFacilityId: 'biz-001', fromName: 'DF-002 Pune Metro',   toName: 'Amul Processing',     status: 'NORMAL',       dispatchedL: 65000, receivedL: 64200, riskScore: 34, alerts: [],                                        lastTransferAt: new Date(Date.now() - 8 * 3600000).toISOString() },
];

// ─── District anomaly stats (for polygon colour-coding) ───────────────────────
const MOCK_DISTRICT_STATS: DistrictStats[] = [
  { district: 'Nashik',      totalAnomalies: 9,  riskBand: 'HIGH',     totalVolumeL: 420000 },
  { district: 'Pune',        totalAnomalies: 4,  riskBand: 'MEDIUM',   totalVolumeL: 820000 },
  { district: 'Nagpur',      totalAnomalies: 6,  riskBand: 'HIGH',     totalVolumeL: 310000 },
  { district: 'Aurangabad',  totalAnomalies: 3,  riskBand: 'MEDIUM',   totalVolumeL: 290000 },
  { district: 'Kolhapur',    totalAnomalies: 1,  riskBand: 'LOW',      totalVolumeL: 480000 },
  { district: 'Jalgaon',     totalAnomalies: 0,  riskBand: 'LOW',      totalVolumeL: 190000 },
  { district: 'Mumbai City', totalAnomalies: 0,  riskBand: 'LOW',      totalVolumeL: 980000 },
  { district: 'Amravati',    totalAnomalies: 2,  riskBand: 'MEDIUM',   totalVolumeL: 140000 },
  { district: 'Solapur',     totalAnomalies: 1,  riskBand: 'LOW',      totalVolumeL: 210000 },
];

export async function fetchMapFacilities(): Promise<MapFacility[]> {
  return Promise.resolve(MOCK_FACILITIES);
}

export async function fetchMapRoutes(): Promise<MapRoute[]> {
  return Promise.resolve(MOCK_ROUTES);
}

export async function fetchDistrictStats(): Promise<DistrictStats[]> {
  return Promise.resolve(MOCK_DISTRICT_STATS);
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
