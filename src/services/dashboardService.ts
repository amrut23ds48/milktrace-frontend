// services/dashboardService.ts
import type {
  AnomalyEvent,
  KpiMetrics,
  TopRiskFacility,
  VolumeTrendPoint,
} from '../types/dashboard.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  let token = 'mock-jwt-token';
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('milktrace_token'); // was 'token' — now matches AuthContext
    if (stored) token = stored;
  }
  
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchKpiMetrics(): Promise<KpiMetrics> {
  try {
    const [collections, batches, farmers, facilities, anomalies] = await Promise.all([
      apiFetch<any[]>('/collections').catch(() => []),
      apiFetch<any[]>('/batches').catch(() => []),
      apiFetch<any[]>('/farmers').catch(() => []),
      apiFetch<any[]>('/facilities').catch(() => []),
      apiFetch<any[]>('/anomalies').catch(() => []),
    ]);

    const today = new Date().toDateString();
    const milkCollectedToday = collections
      .filter(c => new Date(c.collection_timestamp).toDateString() === today)
      .reduce((sum, c) => sum + Number(c.quantity_liters), 0);

    const milkInTransit = batches
      .filter(b => b.status === 'IN_TRANSIT' || b.status === 'DISPATCHED')
      .reduce((sum, b) => sum + Number(b.quantity_liters), 0);

    const milkDelivered = batches
      .filter(b => b.status === 'RECEIVED')
      .reduce((sum, b) => sum + Number(b.quantity_liters), 0);

    const activeRoutes = batches.filter(b => b.status === 'IN_TRANSIT' || b.status === 'DISPATCHED').length;
    const activeFarmers = farmers.filter(f => f.registration_status === 'APPROVED' || f.registration_status === 'PENDING').length;
    const activeCollectionCenters = facilities.filter(f => f.type === 'VILLAGE_COLLECTION_CENTER').length;

    const openAnomalies = anomalies.filter(a => a.status === 'ACTIVE').length;
    const highRiskIncidents = anomalies.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;

    return {
      milkCollectedToday,
      milkCollectedChange: 0,
      milkInTransit,
      milkInTransitChange: 0,
      milkDelivered,
      milkDeliveredChange: 0,
      activeFarmers,
      activeFarmersChange: 0,
      activeCollectionCenters,
      activeCollectionCentersChange: 0,
      activeRoutes,
      activeRoutesChange: 0,
      openAnomalies,
      openAnomaliesChange: 0,
      highRiskIncidents,
      highRiskIncidentsChange: 0,
    };
  } catch (err) {
    console.error('Failed to fetch KPI metrics', err);
    throw err;
  }
}

export async function fetchRecentAnomalies(limit = 8): Promise<AnomalyEvent[]> {
  // New API returns { data, total, page, limit, totalPages }
  const response = await apiFetch<{ data: any[] } | any[]>(`/anomalies?limit=${limit}&page=1`).catch(() => ({ data: [] }));
  const items = Array.isArray(response) ? response : (response as { data: any[] }).data ?? [];
  return items.map(a => ({
    id: a.id,
    type: a.type ?? a.anomaly_type,
    entityType: a.entityType ?? a.entity_type,
    entityId: a.entityId ?? a.entity_id,
    location: a.locationLabel ?? `${a.entity_type}: ${a.entity_id}`,
    locationLabel: a.locationLabel ?? `${a.entity_type}: ${a.entity_id}`,
    district: a.district ?? null,
    severity: a.severity,
    riskScore: a.riskScore ?? a.risk_score,
    detectedAt: a.detectedAt ?? a.created_at,
    status: a.status === 'ACTIVE' ? 'OPEN' : (a.status ?? 'OPEN'),
    assignedTo: a.assignedTo ?? null,
    assignedToId: a.assignedToId ?? null,
    investigationId: a.investigationId ?? null,
    conclusion: a.conclusion ?? null,
  }));
}

export async function fetchVolumeTrend(days: number): Promise<VolumeTrendPoint[]> {
  const collections = await apiFetch<any[]>('/collections').catch(() => []);
  const points: VolumeTrendPoint[] = [];
  const now = Date.now();
  
  for (let i = 0; i < days; i++) {
    const d = new Date(now - (days - 1 - i) * 86400000);
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    
    const dayCollections = collections.filter(c => new Date(c.collection_timestamp).toDateString() === d.toDateString());
    const collected = dayCollections.reduce((sum, c) => sum + Number(c.quantity_liters), 0);
    
    points.push({
      date: dateStr,
      collected,
      dispatched: Math.round(collected * 0.94), // Mocked relative
      received: Math.round(collected * 0.91), // Mocked relative
    });
  }
  return points;
}

export async function fetchTopRiskFacilities(): Promise<TopRiskFacility[]> {
  const facilities = await apiFetch<any[]>('/facilities').catch(() => []);
  return facilities.slice(0, 5).map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    district: f.district,
    riskScore: Math.floor(Math.random() * 100), // Random for now until aggregation
    openAnomalies: 0,
  }));
}

export const dashboardService = {
  fetchKpiMetrics,
  fetchRecentAnomalies,
  fetchVolumeTrend,
  fetchTopRiskFacilities,
};
