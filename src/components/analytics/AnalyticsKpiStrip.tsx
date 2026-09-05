'use client';
// components/analytics/AnalyticsKpiStrip.tsx
import type { VolumeTrendPoint, LossRatePoint, AnomalyBreakdownResponse, DistrictAnomalyData } from '../../types/analytics.types';

interface Props {
  volumeData: VolumeTrendPoint[] | null;
  lossData: LossRatePoint[] | null;
  anomalyData: AnomalyBreakdownResponse | null;
  districtData: DistrictAnomalyData[] | null;
  isLoading: boolean;
}

function formatL(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K L`;
  return `${n} L`;
}

function Kpi({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 160, padding: '16px 20px',
      background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-color)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsKpiStrip({ volumeData, lossData, anomalyData, districtData, isLoading }: Props) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1, minWidth: 160, height: 80, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-color)', opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  const totalCollected = volumeData?.reduce((s, p) => s + p.collected, 0) ?? 0;
  const avgLoss = lossData && lossData.length > 0
    ? (lossData.reduce((s, p) => s + p.lossPercent, 0) / lossData.length).toFixed(1)
    : '0.0';
  const totalAnomalies = anomalyData?.total ?? 0;
  const highRiskDistricts = districtData?.filter(d => d.avgRiskScore >= 70).length ?? 0;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Kpi label="Total Volume Collected" value={formatL(totalCollected)} sub="Over selected period" />
      <Kpi label="Avg Daily Loss" value={`${avgLoss}%`} sub="Dispatched vs received" color={parseFloat(avgLoss) > 5 ? '#dc2626' : '#16a34a'} />
      <Kpi label="Total Anomalies" value={String(totalAnomalies)} sub="Detected in period" color={totalAnomalies > 20 ? '#dc2626' : totalAnomalies > 10 ? '#d97706' : 'var(--text-primary)'} />
      <Kpi label="High-Risk Districts" value={String(highRiskDistricts)} sub="Avg risk score ≥ 70" color={highRiskDistricts > 3 ? '#dc2626' : '#d97706'} />
    </div>
  );
}
