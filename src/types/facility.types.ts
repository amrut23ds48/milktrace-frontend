// types/facility.types.ts
// ─── Facility Drill-Down Data Shapes ──────────────────────────────────────────

export type FacilityType = 'VILLAGE_CENTER' | 'CHILLING_CENTER' | 'DISTRICT_FACILITY' | 'BUSINESS';
export type FacilityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface FacilityDetail {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  address: string | null;
  status: FacilityStatus;
  riskScore: number;
  openAnomalies: number;
  dailyVolumeL: number;
}

export interface FacilityVolumeTrendPoint {
  date: string;
  volumeL: number;
}

export interface FacilityActiveRoute {
  routeId: string;
  destination: string;
  dispatchedL: number;
  receivedL: number;
  status: string;
  riskScore: number;
  lastTransferAt: string;
}
