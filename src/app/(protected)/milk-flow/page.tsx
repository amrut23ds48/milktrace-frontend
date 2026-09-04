'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function CollectionsPage() {
  const { user } = useAuth();
  const isVillageAdmin = user?.role === 'Village Admin';
  const isSuperAdmin = user?.role === 'Super Admin';

  const [activeTab, setActiveTab] = useState(isVillageAdmin ? 0 : 1);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 1: Today's Entry
  const [formData, setFormData] = useState({
    farmer_id: '',
    session: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
    quantity_liters: '',
    fat_percent: '',
    snf_percent: '',
    density: '',
    temperature: '',
    water_estimate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [todayCollections, setTodayCollections] = useState<any[]>([]);
  
  // Tab 2: History
  const [collections, setCollections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [currentPage, setCurrentPage] = useState(1);

  // Tab 3: Summary
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryFacility, setSummaryFacility] = useState('');
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Cancel logic
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadBaseData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 0 && isVillageAdmin) {
      loadTodayEntry();
    } else if (activeTab === 1) {
      loadHistory();
    } else if (activeTab === 2) {
      if (summaryFacility) {
        loadSummary();
      }
    }
  }, [activeTab, facilityFilter, dateFilter, sessionFilter, statusFilter, summaryFacility, summaryDate]);

  const loadBaseData = async () => {
    try {
      const [facRes, farmRes] = await Promise.all([
        adminService.getFacilities(),
        adminService.getFarmers()
      ]);
      const villageCenters = facRes.filter((f: any) => f.type === 'VILLAGE_COLLECTION_CENTER');
      setFacilities(villageCenters);
      setFarmers(farmRes.filter((f: any) => f.registration_status === 'APPROVED'));

      if (isVillageAdmin && user?.facilityId) {
        setFacilityFilter(user.facilityId);
        setSummaryFacility(user.facilityId);
      } else if (villageCenters.length > 0) {
        setFacilityFilter('');
        setSummaryFacility(villageCenters[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTodayEntry = async () => {
    if (!user?.facilityId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await adminService.getCollections({ 
        facility_id: user.facilityId, 
        date: today,
        session: formData.session 
      });
      setTodayCollections(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (facilityFilter) params.facility_id = facilityFilter;
      if (dateFilter) params.date = dateFilter;
      if (sessionFilter) params.session = sessionFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getCollections(params);
      setCollections(res);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!summaryFacility) return;
    setSummaryLoading(true);
    try {
      const res = await adminService.getDailySummary(summaryFacility, summaryDate);
      setDailySummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.facilityId) {
      alert("No facility assigned.");
      return;
    }
    setSubmitting(true);
    try {
      const collection_code = `COL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000 + 1000)}`;
      
      const payload = {
        collection_code,
        farmer_id: formData.farmer_id,
        facility_id: user.facilityId,
        operator_id: user.id || '1',
        session: formData.session,
        quantity_liters: parseFloat(formData.quantity_liters),
        collection_timestamp: new Date().toISOString(),
        quality: (formData.fat_percent || formData.snf_percent) ? {
          fat_percent: formData.fat_percent ? parseFloat(formData.fat_percent) : undefined,
          snf_percent: formData.snf_percent ? parseFloat(formData.snf_percent) : undefined,
          density: formData.density ? parseFloat(formData.density) : undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          water_estimate: formData.water_estimate ? parseFloat(formData.water_estimate) : undefined,
        } : undefined
      };
      
      await adminService.createCollection(payload);
      
      const fName = farmers.find(f => f.id === formData.farmer_id)?.name || 'Farmer';
      alert(`✅ Recorded ${payload.quantity_liters} L from ${fName}`);
      
      setFormData(prev => ({ ...prev, farmer_id: '', quantity_liters: '', fat_percent: '', snf_percent: '', density: '', temperature: '', water_estimate: '' }));
      loadTodayEntry();
    } catch (err: any) {
      alert(err.message || 'Failed to record collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCollection = async () => {
    if (!cancelId || !cancelReason) return;
    try {
      await adminService.cancelCollection(cancelId, cancelReason);
      setCancelId(null);
      setCancelReason('');
      loadHistory();
      if (activeTab === 0) loadTodayEntry();
    } catch (err: any) {
      alert(err.message || "Failed to cancel");
    }
  };

  const todayTotalVol = todayCollections.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + Number(c.quantity_liters), 0);
  const todayFarmers = new Set(todayCollections.filter(c => c.status === 'ACTIVE').map(c => c.farmer_id)).size;
  let todayFatSum = 0, todaySnfSum = 0, todayVolWithQ = 0;
  todayCollections.filter(c => c.status === 'ACTIVE').forEach(c => {
    if (c.quality_measurements?.[0]) {
      const q = c.quality_measurements[0];
      if (q.fat_percent && q.snf_percent) {
        todayFatSum += Number(c.quantity_liters) * Number(q.fat_percent);
        todaySnfSum += Number(c.quantity_liters) * Number(q.snf_percent);
        todayVolWithQ += Number(c.quantity_liters);
      }
    }
  });

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(c => {
      return (c.collection_code?.toLowerCase().includes(q)) || 
             (c.farmer?.name?.toLowerCase().includes(q)) ||
             (c.farmer?.farmer_code?.toLowerCase().includes(q));
    });
  }, [collections, searchQuery]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Milk Flow</h1>
      </div>

      <div className={styles.tabsContainer}>
        {isVillageAdmin && (
          <div className={`${styles.tab} ${activeTab === 0 ? styles.tabActive : ''}`} onClick={() => setActiveTab(0)}>
            Today's Entry
          </div>
        )}
        <div className={`${styles.tab} ${activeTab === 1 ? styles.tabActive : ''}`} onClick={() => setActiveTab(1)}>
          Collection History
        </div>
        <div className={`${styles.tab} ${activeTab === 2 ? styles.tabActive : ''}`} onClick={() => setActiveTab(2)}>
          Daily Summary
        </div>
      </div>

      {activeTab === 0 && (
        <div>
          {isSuperAdmin ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
              ℹ️ Collections are recorded by Village Admins at each center. Switch to <strong>Collection History</strong> to view records.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className={styles.card} style={{ flex: '2', padding: '1.5rem', minWidth: '300px' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: '#0f172a' }}>Quick Entry</h2>
                <form onSubmit={handleSubmitEntry}>
                  <div className={styles.formGroup}>
                    <label>Select Farmer *</label>
                    <select required value={formData.farmer_id} onChange={e => setFormData({...formData, farmer_id: e.target.value})}>
                      <option value="" disabled>-- Search/Select a Farmer --</option>
                      {farmers.filter(f => f.collection_center_id === user?.facilityId).map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.farmer_code})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                      <label>Session</label>
                      <select required value={formData.session} onChange={e => { setFormData({...formData, session: e.target.value}); loadTodayEntry(); }}>
                        <option value="MORNING">Morning (AM)</option>
                        <option value="EVENING">Evening (PM)</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Volume (L) *</label>
                      <input type="number" step="0.1" min="0.1" required value={formData.quantity_liters} onChange={e => setFormData({...formData, quantity_liters: e.target.value})} placeholder="e.g. 15.5" />
                    </div>
                  </div>

                  <h4 style={{ margin: '1rem 0 0.5rem', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase' }}>Quality (Optional)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                      <label>Fat %</label>
                      <input type="number" step="0.1" min="2.0" max="9.0" value={formData.fat_percent} onChange={e => setFormData({...formData, fat_percent: e.target.value})} placeholder="4.2" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>SNF %</label>
                      <input type="number" step="0.1" min="6.0" max="11.0" value={formData.snf_percent} onChange={e => setFormData({...formData, snf_percent: e.target.value})} placeholder="8.5" />
                    </div>
                  </div>

                  {Number(formData.water_estimate) > 5 && (
                    <div style={{ padding: '0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      ⚠️ High added water estimate detected.
                    </div>
                  )}

                  <button type="submit" className={styles.addButton} disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                    {submitting ? 'Saving...' : 'Record Collection'}
                  </button>
                </form>
              </div>

              <div className={styles.card} style={{ flex: '1', padding: '1.5rem', background: '#f8fafc', minWidth: '250px' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: '#0f172a' }}>Today's {formData.session}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Farmers Entered</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{todayFarmers}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Volume</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2563eb' }}>{todayTotalVol.toFixed(1)} L</div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Avg Fat</div>
                      <div style={{ fontWeight: 600 }}>{todayVolWithQ > 0 ? (todayFatSum / todayVolWithQ).toFixed(2) : '-'}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Avg SNF</div>
                      <div style={{ fontWeight: 600 }}>{todayVolWithQ > 0 ? (todaySnfSum / todayVolWithQ).toFixed(2) : '-'}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <div className={styles.controlsContainer}>
            <input type="text" placeholder="Search Slip Code, Farmer..." className={styles.searchBar} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            
            {isSuperAdmin && (
              <select className={styles.filterSelect} value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)}>
                <option value="">All Facilities</option>
                {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            
            <input type="date" className={styles.filterSelect} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            
            <select className={styles.filterSelect} value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
              <option value="">All Sessions</option>
              <option value="MORNING">Morning</option>
              <option value="EVENING">Evening</option>
            </select>

            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Cancelled</option>
            </select>
          </div>

          <div className={styles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Receipt / Date</th>
                    <th>Farmer</th>
                    <th>Volume</th>
                    <th>Quality</th>
                    {isSuperAdmin && <th>Risk</th>}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
                  ) : paginatedHistory.map(c => {
                    const quality = c.quality_measurements?.[0];
                    return (
                      <tr key={c.id}>
                        <td>
                          <span className={styles.badge} style={{ background: '#f8fafc', color: '#475569', fontFamily: 'monospace' }}>
                            {c.collection_code.substring(0, 13)}...
                          </span><br/>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(c.collection_timestamp).toLocaleDateString()} {c.session === 'MORNING' ? '🌅' : '🌙'}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{c.farmer?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.farmer?.farmer_code}</div>
                        </td>
                        <td><strong style={{ color: '#2563eb' }}>{c.quantity_liters} L</strong></td>
                        <td>
                          {quality ? (
                            <div style={{ fontSize: '0.9rem' }}>
                              <span style={{ color: '#16a34a' }}>Fat: {quality.fat_percent}%</span><br/>
                              <span style={{ color: '#16a34a' }}>SNF: {quality.snf_percent}%</span>
                            </div>
                          ) : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No data</span>}
                        </td>
                        {isSuperAdmin && (
                          <td>
                            <span className={styles.badge} style={{ background: '#f8fafc', color: '#64748b' }}>-</span>
                          </td>
                        )}
                        <td>
                          <span className={styles.badge} style={{ background: c.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: c.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.status === 'ACTIVE' && isVillageAdmin && (
                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => setCancelId(c.id)} title="Cancel Collection">
                              ⛔
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {!loading && filteredHistory.length === 0 && (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredHistory.length > 0 && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <div className={styles.pageButtons}>
                  <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
                  <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <div className={styles.controlsContainer}>
            <select className={styles.filterSelect} value={summaryFacility} onChange={e => setSummaryFacility(e.target.value)} disabled={isVillageAdmin}>
              <option value="" disabled>Select Facility</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input type="date" className={styles.filterSelect} value={summaryDate} onChange={e => setSummaryDate(e.target.value)} />
          </div>

          {summaryLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading summary...</div>
          ) : dailySummary && dailySummary.totalLiters > 0 ? (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statTitle}>Total Volume</div>
                  <div className={styles.statValue}>{dailySummary.totalLiters.toFixed(1)} L</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statTitle}>Farmers</div>
                  <div className={styles.statValue}>{dailySummary.farmerCount}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statTitle}>Avg Fat</div>
                  <div className={styles.statValue}>{dailySummary.avgFat ? dailySummary.avgFat.toFixed(2) + '%' : '-'}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statTitle}>Avg SNF</div>
                  <div className={styles.statValue}>{dailySummary.avgSnf ? dailySummary.avgSnf.toFixed(2) + '%' : '-'}</div>
                </div>
              </div>

              <div className={styles.card} style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Session Breakdown</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>🌅 Morning</td>
                      <td><strong>{dailySummary.morningLiters.toFixed(1)} L</strong></td>
                    </tr>
                    <tr>
                      <td>🌙 Evening</td>
                      <td><strong>{dailySummary.eveningLiters.toFixed(1)} L</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              No collections recorded for this date.
            </div>
          )}
        </div>
      )}

      {cancelId && (
        <div className={styles.overlay} onClick={() => setCancelId(null)}>
          <div className={styles.slideOver} style={{ maxWidth: '400px', height: 'auto', margin: 'auto', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
            <h2>Cancel Collection</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Are you sure you want to cancel this collection? This action cannot be fully undone (it will be marked as SUSPENDED).
            </p>
            <div className={styles.formGroup}>
              <label>Reason for Cancellation *</label>
              <input type="text" required value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="e.g. Incorrect volume entered" autoFocus />
            </div>
            <div className={styles.formActions} style={{ marginTop: '1.5rem', paddingTop: '0' }}>
              <button className={styles.cancelButton} onClick={() => setCancelId(null)}>Close</button>
              <button className={styles.submitButton} onClick={handleCancelCollection} style={{ background: '#ef4444' }} disabled={!cancelReason}>Cancel Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
