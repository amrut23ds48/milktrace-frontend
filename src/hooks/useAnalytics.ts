// hooks/useAnalytics.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsPeriod } from '../types/analytics.types';
import {
  fetchVolumeTrend,
  fetchLossRate,
  fetchAnomalyBreakdown,
  fetchAnomalyByDistrict,
  fetchDistrictSummary,
} from '../services/analyticsService';

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { void run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}

export function useVolumeTrend(period: AnalyticsPeriod, district: string) {
  return useAsync(() => fetchVolumeTrend(period, district), [period, district]);
}

export function useLossRate(period: AnalyticsPeriod, district: string) {
  return useAsync(() => fetchLossRate(period, district), [period, district]);
}

export function useAnomalyBreakdown(period: AnalyticsPeriod) {
  return useAsync(() => fetchAnomalyBreakdown(period), [period]);
}

export function useAnomalyByDistrict() {
  return useAsync(() => fetchAnomalyByDistrict(), []);
}

export function useDistrictSummary() {
  return useAsync(() => fetchDistrictSummary(), []);
}
