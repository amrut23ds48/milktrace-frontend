// hooks/useDashboard.ts
// ─── Dashboard Data-Fetching Hooks ────────────────────────────────────────────
// Each hook returns { data, isLoading, error, refetch }.
// Uses plain useState/useEffect — no external state library required.

'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type {
  AnomalyEvent,
  DateRange,
  KpiMetrics,
  TopRiskFacility,
  VolumeTrendPoint,
} from '../types/dashboard.types';

// ─── Shared state shape ───────────────────────────────────────────────────────

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function makeInitialState<T>(): AsyncState<T> {
  return { data: null, isLoading: true, error: null };
}

async function runFetch<T>(
  fetcher: () => Promise<T>,
  setState: React.Dispatch<React.SetStateAction<AsyncState<T>>>,
) {
  setState((s) => ({ ...s, isLoading: true, error: null }));
  try {
    const data = await fetcher();
    setState({ data, isLoading: false, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    setState({ data: null, isLoading: false, error: message });
  }
}

// ─── Public hooks ─────────────────────────────────────────────────────────────

export function useKpiMetrics() {
  const [state, setState] = useState<AsyncState<KpiMetrics>>(makeInitialState);
  const refetch = useCallback(() => { void runFetch(() => dashboardService.fetchKpiMetrics(), setState); }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { ...state, refetch };
}

export function useRecentAnomalies(limit = 8) {
  const [state, setState] = useState<AsyncState<AnomalyEvent[]>>(makeInitialState);
  const refetch = useCallback(() => { void runFetch(() => dashboardService.fetchRecentAnomalies(limit), setState); }, [limit]);
  useEffect(() => { refetch(); }, [refetch]);
  return { ...state, refetch };
}

export function useVolumeTrend(dateRange: DateRange = '7D') {
  const days = { '1D': 1, '7D': 7, '30D': 30, '90D': 90 }[dateRange];
  const [state, setState] = useState<AsyncState<VolumeTrendPoint[]>>(makeInitialState);
  const refetch = useCallback(() => { void runFetch(() => dashboardService.fetchVolumeTrend(days), setState); }, [days]);
  useEffect(() => { refetch(); }, [refetch]);
  return { ...state, refetch };
}

export function useTopRiskFacilities() {
  const [state, setState] = useState<AsyncState<TopRiskFacility[]>>(makeInitialState);
  const refetch = useCallback(() => { void runFetch(() => dashboardService.fetchTopRiskFacilities(), setState); }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { ...state, refetch };
}
