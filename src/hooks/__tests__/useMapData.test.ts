// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapFacilities, useMapRoutes, useDistrictStats } from '../useMapData';
import { mapService } from '../../services/mapService';
import type { MapFacility } from '../../types/map.types';

vi.mock('../../services/mapService', () => ({
  mapService: {
    fetchMapFacilities: vi.fn(),
    fetchMapRoutes: vi.fn(),
    fetchDistrictStats: vi.fn(),
  },
}));

describe('useMapData hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useMapFacilities', () => {
    it('should transition to success state', async () => {
      const mockData = [{ id: '1' }] as unknown as MapFacility[];
      vi.mocked(mapService.fetchMapFacilities).mockResolvedValue(mockData);

      const { result } = renderHook(() => useMapFacilities());
      
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mapService.fetchMapFacilities).mockRejectedValue(new Error('Failed load'));
      
      const { result } = renderHook(() => useMapFacilities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed load');
      expect(result.current.data).toBeNull();
    });
  });

  describe('useMapRoutes', () => {
    it('should load routes', async () => {
      vi.mocked(mapService.fetchMapRoutes).mockResolvedValue([]);
      const { result } = renderHook(() => useMapRoutes());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual([]);
    });
  });

  describe('useDistrictStats', () => {
    it('should load stats', async () => {
      vi.mocked(mapService.fetchDistrictStats).mockResolvedValue([]);
      const { result } = renderHook(() => useDistrictStats());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual([]);
    });
  });
});
