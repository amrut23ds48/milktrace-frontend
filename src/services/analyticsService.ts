// services/analyticsService.ts

import type {
  VolumeTrendPoint,
  LossRatePoint,
  AnomalyBreakdownResponse,
  DistrictAnomalyData,
  DistrictSummary,
  AnalyticsPeriod,
} from '../types/analytics.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('milktrace_token') ?? '';
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function fetchVolumeTrend(period: AnalyticsPeriod, district = 'ALL'): Promise<VolumeTrendPoint[]> {
  const params = new URLSearchParams({ period, ...(district !== 'ALL' && { district }) });
  return apiFetch<VolumeTrendPoint[]>(`/analytics/volume-trend?${params}`).catch(() => []);
}

export async function fetchLossRate(period: AnalyticsPeriod, district = 'ALL'): Promise<LossRatePoint[]> {
  const params = new URLSearchParams({ period, ...(district !== 'ALL' && { district }) });
  return apiFetch<LossRatePoint[]>(`/analytics/loss-rate?${params}`).catch(() => []);
}

export async function fetchAnomalyBreakdown(period: AnalyticsPeriod): Promise<AnomalyBreakdownResponse> {
  const params = new URLSearchParams({ period });
  return apiFetch<AnomalyBreakdownResponse>(`/analytics/anomaly-breakdown?${params}`).catch(() => ({
    byType: [], bySeverity: [], total: 0,
  }));
}

export async function fetchAnomalyByDistrict(): Promise<DistrictAnomalyData[]> {
  return apiFetch<DistrictAnomalyData[]>('/analytics/anomaly-by-district').catch(() => []);
}

export async function fetchDistrictSummary(): Promise<DistrictSummary[]> {
  return apiFetch<DistrictSummary[]>('/analytics/district-summary').catch(() => []);
}
