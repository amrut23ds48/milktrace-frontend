'use client';

// hooks/useMapData.ts
// ─── Map data-fetching hooks ──────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { mapService } from '../services/mapService';
import type { DistrictStats, MapFacility, MapRoute } from '../types/map.types';
import { useAuth } from './useAuth';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
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

function makeInit<T>(): AsyncState<T> {
  return { data: null, isLoading: true, error: null };
}

export function useMapFacilities() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<MapFacility[]>>(makeInit);
  const refetch = useCallback(() => { void runFetch(() => mapService.fetchMapFacilities(token), setState); }, [token]);
  useEffect(() => { if(token) refetch(); }, [refetch, token]);
  return { ...state, refetch };
}

export function useMapRoutes() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<MapRoute[]>>(makeInit);
  const refetch = useCallback(() => { void runFetch(() => mapService.fetchMapRoutes(token), setState); }, [token]);
  useEffect(() => { if(token) refetch(); }, [refetch, token]);
  return { ...state, refetch };
}

export function useDistrictStats() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<DistrictStats[]>>(makeInit);
  const refetch = useCallback(() => { void runFetch(() => mapService.fetchDistrictStats(token), setState); }, [token]);
  useEffect(() => { if(token) refetch(); }, [refetch, token]);
  return { ...state, refetch };
}
