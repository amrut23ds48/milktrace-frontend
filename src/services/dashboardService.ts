// services/dashboardService.ts
// ─── Dashboard API Abstractions ───────────────────────────────────────────────
// Connects to the Express.js backend at /api/v1.
// Where aggregation endpoints don't exist yet, uses clearly-marked mock data
// so the UI is fully functional while the backend catches up.

import type {
  AnomalyEvent,
  KpiMetrics,
  TopRiskFacility,
  VolumeTrendPoint,
} from '../types/dashboard.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    // Cache for 30 s in Next.js App Router
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── KPI Metrics ──────────────────────────────────────────────────────────────
// TODO: replace mock with real aggregation endpoint when Phase 5+ is complete.

export async function fetchKpiMetrics(): Promise<KpiMetrics> {
  // MOCK — backend doesn't have a /metrics aggregation endpoint yet.
  // Remove and replace with: apiFetch<KpiMetrics>('/dashboard/metrics')
  return Promise.resolve({
    milkCollectedToday: 1_820_000,
    milkCollectedChange: 6.4,
    milkInTransit: 340_000,
    milkInTransitChange: -2.1,
    milkDelivered: 1_410_000,
    milkDeliveredChange: 4.8,
    activeFarmers: 12_480,
    activeFarmersChange: 1.2,
    activeCollectionCenters: 238,
    activeCollectionCentersChange: 0,
    activeRoutes: 74,
    activeRoutesChange: -3.8,
    openAnomalies: 41,
    openAnomaliesChange: 17.1,
    highRiskIncidents: 7,
    highRiskIncidentsChange: 40.0,
  });
}

// ─── Recent Anomalies ─────────────────────────────────────────────────────────
// TODO: replace mock with real /anomalies endpoint when Phase 6 is complete.

export async function fetchRecentAnomalies(limit = 8): Promise<AnomalyEvent[]> {
  // MOCK — replace with: apiFetch<AnomalyEvent[]>(`/anomalies?limit=${limit}&sort=detectedAt:desc`)
  const mock: AnomalyEvent[] = [
    { id: 'A-182', type: 'Combined', location: 'VC-018 → CC-004', riskScore: 86, detectedAt: new Date(Date.now() - 12 * 60000).toISOString(), status: 'INVESTIGATING', assignedTo: 'Officer 04' },
    { id: 'A-181', type: 'Quantity', location: 'CC-011 → DF-002', riskScore: 74, detectedAt: new Date(Date.now() - 34 * 60000).toISOString(), status: 'OPEN', assignedTo: null },
    { id: 'A-180', type: 'Quality', location: 'VC-027', riskScore: 63, detectedAt: new Date(Date.now() - 68 * 60000).toISOString(), status: 'OPEN', assignedTo: 'Officer 02' },
    { id: 'A-179', type: 'Transfer', location: 'DF-005 → BIZ-009', riskScore: 58, detectedAt: new Date(Date.now() - 120 * 60000).toISOString(), status: 'INVESTIGATING', assignedTo: 'Officer 01' },
    { id: 'A-178', type: 'Volume', location: 'CC-003 → DF-001', riskScore: 45, detectedAt: new Date(Date.now() - 240 * 60000).toISOString(), status: 'OPEN', assignedTo: null },
    { id: 'A-177', type: 'SNF Deviation', location: 'VC-042', riskScore: 41, detectedAt: new Date(Date.now() - 360 * 60000).toISOString(), status: 'OPEN', assignedTo: null },
    { id: 'A-176', type: 'Combined', location: 'VC-009 → CC-002', riskScore: 38, detectedAt: new Date(Date.now() - 480 * 60000).toISOString(), status: 'RESOLVED', assignedTo: 'Officer 03' },
    { id: 'A-175', type: 'Quantity', location: 'CC-007 → DF-003', riskScore: 32, detectedAt: new Date(Date.now() - 600 * 60000).toISOString(), status: 'RESOLVED', assignedTo: 'Officer 01' },
  ];
  return Promise.resolve(mock.slice(0, limit));
}

// ─── Volume Trend ─────────────────────────────────────────────────────────────
// TODO: replace mock with real time-series aggregation endpoint.

export async function fetchVolumeTrend(days: number): Promise<VolumeTrendPoint[]> {
  // MOCK — replace with: apiFetch<VolumeTrendPoint[]>(`/collections/trend?days=${days}`)
  const points: VolumeTrendPoint[] = [];
  const now = Date.now();
  const labels = days <= 7
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => {
        const d = new Date(now - (days - 1 - i) * 86400000);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });

  for (let i = 0; i < Math.min(days, labels.length); i++) {
    const base = 1_700_000 + Math.sin(i * 0.8) * 200_000 + Math.random() * 80_000;
    points.push({
      date: labels[i]!,
      collected: Math.round(base),
      dispatched: Math.round(base * 0.94),
      received: Math.round(base * 0.91),
    });
  }
  return Promise.resolve(points);
}

// ─── Top Risk Facilities ──────────────────────────────────────────────────────
// Attempts real API call; falls back to mock if it fails.

export async function fetchTopRiskFacilities(): Promise<TopRiskFacility[]> {
  // MOCK — replace with: apiFetch<TopRiskFacility[]>('/facilities?sort=riskScore:desc&limit=5')
  const mock: TopRiskFacility[] = [
    { id: 'fac-001', name: 'Pune District Facility', type: 'District', district: 'Pune', riskScore: 82, openAnomalies: 9 },
    { id: 'fac-002', name: 'Nashik Chilling Center', type: 'Chilling', district: 'Nashik', riskScore: 74, openAnomalies: 6 },
    { id: 'fac-003', name: 'Aurangabad VC-018', type: 'Village', district: 'Aurangabad', riskScore: 68, openAnomalies: 5 },
    { id: 'fac-004', name: 'Kolhapur CC-011', type: 'Chilling', district: 'Kolhapur', riskScore: 61, openAnomalies: 4 },
    { id: 'fac-005', name: 'Nagpur DF-002', type: 'District', district: 'Nagpur', riskScore: 55, openAnomalies: 3 },
  ];
  return Promise.resolve(mock);
}

export const dashboardService = {
  fetchKpiMetrics,
  fetchRecentAnomalies,
  fetchVolumeTrend,
  fetchTopRiskFacilities,
};
