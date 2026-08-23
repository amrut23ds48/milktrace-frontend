// types/map.types.ts
// ─── MilkTrace Map Data Shapes ────────────────────────────────────────────────

export type FacilityType =
  | 'VILLAGE_CENTER'
  | 'CHILLING_CENTER'
  | 'DISTRICT_FACILITY'
  | 'BUSINESS';

export type RouteStatus =
  | 'NORMAL'
  | 'IN_TRANSIT'
  | 'ANOMALOUS'
  | 'INVESTIGATING';

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MapFacility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  taluka?: string;
  lat: number;
  lng: number;
  openAnomalies: number;
  riskScore: number;           // 0–100
  dailyVolumeL: number;        // litres/day
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MapRoute {
  id: string;
  fromFacilityId: string;
  toFacilityId: string;
  fromName: string;
  toName: string;
  status: RouteStatus;
  dispatchedL: number;
  receivedL: number;
  riskScore: number;
  alerts: string[];
  lastTransferAt: string;      // ISO
  batchId?: string;
}

/** Stats per district — used to colour the district GeoJSON polygons */
export interface DistrictStats {
  district: string;
  totalAnomalies: number;
  riskBand: RiskBand;
  totalVolumeL: number;
}

export interface MapLayers {
  villageCenters: boolean;
  chillingCenters: boolean;
  districtFacilities: boolean;
  businesses: boolean;
  routes: boolean;
  anomalies: boolean;
}

export interface MapFilters {
  routeStatus: RouteStatus | 'ALL';
  riskBand: RiskBand | 'ALL';
  district: string | 'ALL';
}
