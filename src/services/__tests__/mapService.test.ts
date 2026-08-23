import { describe, it, expect } from 'vitest';
import { mapService } from '../mapService';

describe('mapService', () => {
  describe('fetchMapFacilities', () => {
    it('returns mock facilities', async () => {
      const data = await mapService.fetchMapFacilities();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('lat');
      expect(data[0]).toHaveProperty('lng');
    });
  });

  describe('fetchMapRoutes', () => {
    it('returns mock routes', async () => {
      const data = await mapService.fetchMapRoutes();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('fromFacilityId');
    });
  });

  describe('fetchDistrictStats', () => {
    it('returns mock district stats', async () => {
      const data = await mapService.fetchDistrictStats();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('riskBand');
    });
  });

  describe('buildFacilityIndex', () => {
    it('builds a map index by facility id', async () => {
      const facilities = await mapService.fetchMapFacilities();
      const index = mapService.buildFacilityIndex(facilities);
      
      expect(index).toBeInstanceOf(Map);
      expect(index.get(facilities[0]!.id)).toEqual(facilities[0]);
    });
  });
});
