// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useKpiMetrics, useRecentAnomalies } from '../useDashboard';
import { dashboardService } from '../../services/dashboardService';
import type { KpiMetrics, AnomalyEvent } from '../../types/dashboard.types';

// Mock the dashboardService
vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    fetchKpiMetrics: vi.fn(),
    fetchRecentAnomalies: vi.fn(),
    fetchVolumeTrend: vi.fn(),
    fetchTopRiskFacilities: vi.fn(),
  },
}));

describe('useDashboard hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useKpiMetrics', () => {
    it('should start in a loading state', () => {
      // Mock to never resolve immediately
      vi.mocked(dashboardService.fetchKpiMetrics).mockReturnValue(new Promise(() => {}));
      
      const { result } = renderHook(() => useKpiMetrics());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should transition to success state with data', async () => {
      const mockData = { milkCollectedToday: 1000 } as unknown as KpiMetrics;
      vi.mocked(dashboardService.fetchKpiMetrics).mockResolvedValue(mockData);
      
      const { result } = renderHook(() => useKpiMetrics());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should transition to error state if fetch fails', async () => {
      vi.mocked(dashboardService.fetchKpiMetrics).mockRejectedValue(new Error('Network Error'));
      
      const { result } = renderHook(() => useKpiMetrics());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network Error');
    });
  });

  describe('useRecentAnomalies', () => {
    it('should pass the limit parameter correctly', async () => {
      const mockData = [{ id: '1' }] as unknown as AnomalyEvent[];
      vi.mocked(dashboardService.fetchRecentAnomalies).mockResolvedValue(mockData);
      
      renderHook(() => useRecentAnomalies(3));
      
      await waitFor(() => {
        expect(dashboardService.fetchRecentAnomalies).toHaveBeenCalledWith(3);
      });
    });
  });
});
