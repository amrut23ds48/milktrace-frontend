import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dashboardService } from '../dashboardService';

describe('dashboardService', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // dashboardService currently uses mock data directly without calling fetch.
  // We test that it resolves the expected mock data structures for now.
  // In the future, when apiFetch is fully integrated, these tests can easily
  // be adapted to assert fetch is called correctly.

  describe('fetchKpiMetrics', () => {
    it('returns the mock KPI metrics', async () => {
      const data = await dashboardService.fetchKpiMetrics();
      expect(data).toHaveProperty('milkCollectedToday');
      expect(data).toHaveProperty('activeFarmers');
    });
  });

  describe('fetchRecentAnomalies', () => {
    it('returns the requested number of anomalies', async () => {
      const limit = 3;
      const data = await dashboardService.fetchRecentAnomalies(limit);
      expect(data).toHaveLength(limit);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('type');
    });
  });

  describe('fetchVolumeTrend', () => {
    it('returns data for 7 days', async () => {
      const data = await dashboardService.fetchVolumeTrend(7);
      expect(data).toHaveLength(7);
      expect(data[0]).toHaveProperty('collected');
    });

    it('returns data for 30 days', async () => {
      const data = await dashboardService.fetchVolumeTrend(30);
      expect(data).toHaveLength(30);
    });
  });

  describe('fetchTopRiskFacilities', () => {
    it('returns top risk facilities mock data', async () => {
      const data = await dashboardService.fetchTopRiskFacilities();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('riskScore');
    });
  });
});
