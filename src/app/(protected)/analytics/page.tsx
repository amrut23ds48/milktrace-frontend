'use client';
// app/(protected)/analytics/page.tsx
// ─── Intelligence → Analytics ─────────────────────────────────────────────────

import { useState } from 'react';
import type { AnalyticsPeriod } from '../../../types/analytics.types';
import {
  useVolumeTrend, useLossRate, useAnomalyBreakdown,
  useAnomalyByDistrict, useDistrictSummary,
} from '../../../hooks/useAnalytics';

import AnalyticsKpiStrip from '../../../components/analytics/AnalyticsKpiStrip';
import VolumeTrendChart from '../../../components/analytics/VolumeTrendChart';
import LossRateChart from '../../../components/analytics/LossRateChart';
import AnomalyTypeDonut from '../../../components/analytics/AnomalyTypeDonut';
import AnomalySeverityBar from '../../../components/analytics/AnomalySeverityBar';
import DistrictHeatBar from '../../../components/analytics/DistrictHeatBar';
import DistrictSummaryTable from '../../../components/analytics/DistrictSummaryTable';

const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
  { label: '7 Days', value: '7D' },
  { label: '30 Days', value: '30D' },
  { label: '90 Days', value: '90D' },
];

const TABS = ['Overview', 'Volume & Flow', 'Anomalies', 'Districts'] as const;
type Tab = typeof TABS[number];

// ─── Reusable panel wrapper ────────────────────────────────────────────────────
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-color)', padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30D');
  const [district, setDistrict] = useState('ALL');
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const volumeTrend = useVolumeTrend(period, district);
  const lossRate = useLossRate(period, district);
  const anomalyBreakdown = useAnomalyBreakdown(period);
  const anomalyByDistrict = useAnomalyByDistrict();
  const districtSummary = useDistrictSummary();

  // Build district list from summaryData
  const districtOptions = ['ALL', ...(districtSummary.data?.map(d => d.district) ?? [])];

  const isAnyLoading = volumeTrend.isLoading || lossRate.isLoading || anomalyBreakdown.isLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Page Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          📈 Analytics
        </h1>

        {/* Controls bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          {/* Period toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-body, #0f0f1a)', borderRadius: 8, padding: 3, gap: 2 }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)} style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: period === p.value ? 'var(--brand-primary)' : 'transparent',
                color: period === p.value ? 'white' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>{p.label}</button>
            ))}
          </div>

          {/* District filter */}
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13,
          }}>
            {districtOptions.map(d => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
            ))}
          </select>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* ─── OVERVIEW TAB ──────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <>
            <AnalyticsKpiStrip
              volumeData={volumeTrend.data}
              lossData={lossRate.data}
              anomalyData={anomalyBreakdown.data}
              districtData={anomalyByDistrict.data}
              isLoading={isAnyLoading}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
              <Panel title="📊 Volume Trend">
                <VolumeTrendChart data={volumeTrend.data} isLoading={volumeTrend.isLoading} />
              </Panel>
              <Panel title="⚠ Anomaly Types">
                <AnomalyTypeDonut data={anomalyBreakdown.data} isLoading={anomalyBreakdown.isLoading} />
              </Panel>
            </div>
          </>
        )}

        {/* ─── VOLUME & FLOW TAB ─────────────────────────────────────────── */}
        {activeTab === 'Volume & Flow' && (
          <>
            <Panel title={`📊 Milk Volume Trend — ${period}${district !== 'ALL' ? ` · ${district}` : ''}`}>
              <VolumeTrendChart data={volumeTrend.data} isLoading={volumeTrend.isLoading} />
            </Panel>
            <Panel title={`📉 Volume Loss & Spike Rate — ${period}${district !== 'ALL' ? ` · ${district}` : ''}`}>
              <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Orange bars = volume lost in transit. Purple bars = volume gain (possible water adulteration).
              </div>
              <LossRateChart data={lossRate.data} isLoading={lossRate.isLoading} />
            </Panel>
          </>
        )}

        {/* ─── ANOMALIES TAB ─────────────────────────────────────────────── */}
        {activeTab === 'Anomalies' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
              <Panel title="🔵 Anomaly Type Breakdown">
                <AnomalyTypeDonut data={anomalyBreakdown.data} isLoading={anomalyBreakdown.isLoading} />
              </Panel>
              <Panel title="🔴 Severity Distribution">
                <AnomalySeverityBar data={anomalyBreakdown.data} isLoading={anomalyBreakdown.isLoading} />
                {anomalyBreakdown.data && (
                  <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    {anomalyBreakdown.data.total} total anomalies in selected period
                  </div>
                )}
              </Panel>
            </div>
            <Panel title="🗺 Anomalies by District (all-time)">
              <DistrictHeatBar data={anomalyByDistrict.data} isLoading={anomalyByDistrict.isLoading} />
            </Panel>
          </>
        )}

        {/* ─── DISTRICTS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'Districts' && (
          <>
            <Panel title="🗺 District Risk Heatmap (by anomaly count)">
              <DistrictHeatBar data={anomalyByDistrict.data} isLoading={anomalyByDistrict.isLoading} />
            </Panel>
            <Panel title="📋 District Performance Summary">
              <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                Click column headers to sort. Discrepancy Rate = discrepant transfers / total transfers.
              </div>
              <DistrictSummaryTable data={districtSummary.data} isLoading={districtSummary.isLoading} />
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
