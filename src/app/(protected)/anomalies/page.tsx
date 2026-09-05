'use client';

// app/(protected)/anomalies/page.tsx
// ─── Intelligence → Anomalies Page ────────────────────────────────────────────

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const LIMIT = 12;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a',
};

function SeverityBadge({ sev }: { sev?: string }) {
  const c = SEV_COLORS[sev ?? 'LOW'] ?? '#16a34a';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c + '22', color: c, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
      {sev ?? 'LOW'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    OPEN: { background: 'rgba(220,38,38,0.12)', color: '#dc2626' },
    INVESTIGATING: { background: 'rgba(234,88,12,0.12)', color: '#ea580c' },
    RESOLVED: { background: 'rgba(22,163,74,0.12)', color: '#16a34a' },
  };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, ...(map[status] ?? map.OPEN) }}>
      {status}
    </span>
  );
}

export default function AnomaliesPage() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);
  const [selected, setSelected] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('milktrace_token') ?? '' : '';
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (severityFilter !== 'ALL') params.set('severity', severityFilter);
      if (typeFilter !== 'ALL') params.set('entity_type', typeFilter);
      const res = await fetch(`${API_BASE}/anomalies?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const data = json.data ?? json;
      setAnomalies(Array.isArray(data) ? data : []);
      setTotal(json.total ?? data.length);
      setTotalPages(json.totalPages ?? 1);
    } catch {
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter, typeFilter]);

  useEffect(() => { void fetchAnomalies(); }, [fetchAnomalies]);

  useEffect(() => {
    if (preselectedId && anomalies.length > 0) {
      const found = anomalies.find((a: any) => a.id === preselectedId);
      if (found) { setSelectedId(preselectedId); setSelected(found); }
    }
  }, [preselectedId, anomalies]);

  const filtered = search
    ? anomalies.filter((a: any) =>
        a.locationLabel?.toLowerCase().includes(search.toLowerCase()) ||
        a.type?.toLowerCase().includes(search.toLowerCase()) ||
        a.id?.includes(search))
    : anomalies;

  const handleSelect = (a: any) => {
    setSelectedId(a.id);
    setSelected(a);
    window.history.replaceState(null, '', `/anomalies?id=${a.id}`);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>⚠ Anomalies</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>{total} total · Investigation Command Center</p>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 24px', display: 'flex', gap: 8, flexShrink: 0, borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' as const }}>
        <input
          placeholder="Search by location, type or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}
        />
        {[
          { label: 'Status', value: statusFilter, set: setStatusFilter, opts: ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] },
          { label: 'Severity', value: severityFilter, set: setSeverityFilter, opts: ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          { label: 'Type', value: typeFilter, set: setTypeFilter, opts: ['ALL', 'TRANSFER', 'FACILITY', 'BATCH'] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => { f.set(e.target.value); setPage(1); }}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}>
            {f.opts.map(o => <option key={o} value={o}>{o === 'ALL' ? `All ${f.label}s` : o}</option>)}
          </select>
        ))}
      </div>

      {/* Split pane */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left — list */}
        <div style={{ width: 360, flexShrink: 0, borderRight: '1px solid var(--border-color)', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', opacity: 0.4 }}>
                  <div style={{ height: 12, background: 'var(--border-color)', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 10, background: 'var(--border-color)', borderRadius: 4, width: '70%' }} />
                </div>
              ))
            : filtered.length === 0
              ? <div style={{ padding: 24, textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: 14 }}>✓ No anomalies found</div>
              : filtered.map((a: any) => (
                  <div key={a.id} onClick={() => handleSelect(a)} style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                    background: selectedId === a.id ? 'var(--bg-surface-2)' : 'transparent',
                    borderLeft: selectedId === a.id ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <SeverityBadge sev={a.severity} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(a.detectedAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {(a.type ?? '').replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {a.locationLabel}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <StatusBadge status={a.status} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: a.riskScore >= 70 ? '#dc2626' : a.riskScore >= 40 ? '#d97706' : '#16a34a' }}>
                        Risk {a.riskScore}
                      </span>
                    </div>
                  </div>
                ))
          }
          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                ‹ Prev
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                Next ›
              </button>
            </div>
          )}
        </div>

        {/* Right — detail */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: 28 }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 48 }}>⚠</span>
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Select an anomaly to investigate</p>
              <p style={{ fontSize: 13, margin: 0 }}>Click any item in the list on the left</p>
            </div>
          ) : (
            <div style={{ maxWidth: 560 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <SeverityBadge sev={selected.severity} />
                  <StatusBadge status={selected.status} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 4px' }}>
                  {(selected.type ?? '').replace(/_/g, ' ')}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{selected.locationLabel}</p>
              </div>

              <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const }}>Anomaly ID</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ fontSize: 12, flex: 1, wordBreak: 'break-all' as const, color: 'var(--text-primary)' }}>{selected.id}</code>
                  <button onClick={() => copyId(selected.id)}
                    style={{ padding: '3px 10px', borderRadius: 4, border: 'none', background: copied ? '#16a34a' : 'var(--brand-primary)', color: 'white', fontSize: 12, cursor: 'pointer', transition: 'background 0.2s' }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>Risk Score</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: selected.riskScore >= 70 ? '#dc2626' : selected.riskScore >= 40 ? '#d97706' : '#16a34a' }}>
                    {selected.riskScore}
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${selected.riskScore}%`, transition: 'width 0.5s ease',
                    background: selected.riskScore >= 70 ? 'linear-gradient(90deg,#f97316,#dc2626)' : selected.riskScore >= 40 ? 'linear-gradient(90deg,#eab308,#d97706)' : '#16a34a' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Entity Type', value: selected.entityType ?? '—' },
                  { label: 'District', value: selected.district ?? '—' },
                  { label: 'Detected', value: new Date(selected.detectedAt).toLocaleString('en-IN') },
                  { label: 'Assigned To', value: selected.assignedTo ?? 'Unassigned' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {selected.conclusion && (
                <div style={{ padding: 14, background: 'rgba(22,163,74,0.08)', borderRadius: 8, border: '1px solid rgba(22,163,74,0.2)', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Resolution</div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>{selected.conclusion}</p>
                </div>
              )}

              {selected.status !== 'RESOLVED' && (
                <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, marginBottom: 8 }}>Quick Actions</div>
                  <button onClick={() => copyId(selected.id)}
                    style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--brand-primary)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    📋 {copied ? 'Copied!' : 'Copy Anomaly ID'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginBottom: 0 }}>
                    Full investigation workflow (assign officer, update status, write conclusion) coming soon.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
