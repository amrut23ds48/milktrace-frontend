'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function CollectionsPage() {
  const { user } = useAuth();
  const isVillageAdmin = user?.role === 'Village Admin';

  const [collections, setCollections] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data Entry Form
  const [formData, setFormData] = useState({
    farmer_id: '',
    session: 'MORNING',
    quantity_liters: '',
    fat_percent: '',
    snf_percent: '',
    density: '',
    temperature: '',
    water_estimate: ''
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getCollections(),
      adminService.getFarmers(),
      adminService.getFacilities()
    ]).then(([colRes, farmRes, facRes]) => {
      setCollections(colRes);
      setFarmers(farmRes.filter((f: any) => f.registration_status === 'APPROVED'));
      
      const villageCenters = facRes.filter((f: any) => f.type === 'VILLAGE_COLLECTION_CENTER');
      setFacilities(villageCenters);
      
      if (isVillageAdmin && villageCenters.length > 0) {
        setFacilityFilter(villageCenters[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      farmer_id: '',
      session: new Date().getHours() < 12 ? 'MORNING' : 'EVENING',
      quantity_liters: '',
      fat_percent: '',
      snf_percent: '',
      density: '',
      temperature: '',
      water_estimate: ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Auto-generate a secure random receipt code
      const collection_code = `COL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000 + 1000)}`;
      
      // Determine Facility ID (Mock logic: if Super Admin, use first facility for demo purposes)
      let targetFacilityId = user?.facilityId;
      if (!targetFacilityId && facilities.length > 0) {
        targetFacilityId = facilities[0].id;
      }
      
      if (!targetFacilityId) throw new Error("No Facility assigned to operator.");

      const payload = {
        collection_code,
        farmer_id: formData.farmer_id,
        facility_id: targetFacilityId,
        operator_id: user?.id || '1',
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
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtering Logic ──
  const filteredCollections = useMemo(() => {
    return collections.filter(c => {
      const q = searchQuery.toLowerCase();
      const farmerName = c.farmer?.name?.toLowerCase() || '';
      const farmerCode = c.farmer?.farmer_code?.toLowerCase() || '';
      
      const matchesSearch = (c.collection_code && c.collection_code.toLowerCase().includes(q)) || 
                            (farmerName.includes(q)) ||
                            (farmerCode.includes(q));
                            
      const matchesFacility = facilityFilter ? c.facility_id === facilityFilter : true;
      const matchesSession = sessionFilter ? c.session === sessionFilter : true;
      
      return matchesSearch && matchesFacility && matchesSession;
    });
  }, [collections, searchQuery, facilityFilter, sessionFilter]);

  const paginatedCollections = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCollections.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCollections, currentPage]);

  const totalPages = Math.ceil(filteredCollections.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, facilityFilter, sessionFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Milk Flow Operations</h1>
        <button className={styles.createButton} onClick={handleOpenCreate}>+ Record Collection</button>
      </div>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Log daily milk collections, accurately calculate volumes, and register quality measurements.
      </p>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search Slip Code, Farmer Name or ID..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <select 
          className={styles.filterSelect} 
          value={facilityFilter} 
          onChange={e => setFacilityFilter(e.target.value)}
          disabled={isVillageAdmin} // Village Admin cannot view other centers
        >
          <option value="">All Village Centers</option>
          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <select className={styles.filterSelect} value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
          <option value="">All Sessions</option>
          <option value="MORNING">Morning</option>
          <option value="EVENING">Evening</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Receipt / Slip</th>
              <th>Date & Session</th>
              <th>Farmer</th>
              <th>Volume (Liters)</th>
              <th>Quality (Fat/SNF)</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '3rem'}}>Loading collections...</td></tr>
            ) : paginatedCollections.map((c) => {
              const quality = c.quality_measurements?.[0]; // Get the first measurement
              
              return (
                <tr key={c.id}>
                  <td>
                    <span className={styles.badge} style={{ background: '#f0fdf4', color: '#166534' }}>{c.collection_code}</span>
                  </td>
                  <td>
                    <strong style={{color: '#0f172a'}}>{new Date(c.collection_timestamp).toLocaleDateString()}</strong><br/>
                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>{c.session}</span>
                  </td>
                  <td>
                    <div>{c.farmer?.name || 'Unknown'}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{c.farmer?.farmer_code}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.1rem' }}>{c.quantity_liters} L</span>
                  </td>
                  <td>
                    {quality ? (
                      <div>
                        <span style={{fontWeight: 600, color: '#334155'}}>{quality.fat_percent}% Fat</span><br/>
                        <span style={{fontSize: '0.85rem', color: '#64748b'}}>{quality.snf_percent}% SNF</span>
                      </div>
                    ) : (
                      <span style={{color: '#cbd5e1'}}>No Quality Data</span>
                    )}
                  </td>
                  <td>
                    <span style={{fontSize: '0.9rem', color: '#475569'}}>{c.facility?.name}</span>
                  </td>
                </tr>
              )
            })}
            {!loading && filteredCollections.length === 0 && (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '3rem'}}>No milk collections found.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredCollections.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCollections.length)} of {filteredCollections.length} Collections
            </span>
            <div className={styles.pageButtons}>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className={styles.overlay} onClick={() => !submitting && setIsFormOpen(false)}>
          <div className={styles.slideOver} onClick={e => e.stopPropagation()}>
            <h2>Record Milk Collection</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              Enter the daily milk poured by a farmer and the associated quality metrics.
            </p>
            
            <form onSubmit={handleSubmit}>
              
              <div className={styles.formGroup}>
                <label>Select Farmer *</label>
                <select 
                  required
                  value={formData.farmer_id} 
                  onChange={e => setFormData({...formData, farmer_id: e.target.value})}
                >
                  <option value="" disabled>-- Select a Farmer --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.farmer_code})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Collection Session *</label>
                <select 
                  required
                  value={formData.session} 
                  onChange={e => setFormData({...formData, session: e.target.value})}
                >
                  <option value="MORNING">Morning (AM)</option>
                  <option value="EVENING">Evening (PM)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Volume / Quantity (Liters) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1"
                  required
                  value={formData.quantity_liters} 
                  onChange={e => setFormData({...formData, quantity_liters: e.target.value})} 
                  placeholder="e.g. 15.5" 
                />
              </div>
              
              <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid #e2e8f0'}}/>
              <h4 style={{marginBottom: '1rem', color: '#1e293b'}}>Quality Testing (Optional)</h4>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className={styles.formGroup}>
                  <label>Fat %</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    max="20"
                    value={formData.fat_percent} 
                    onChange={e => setFormData({...formData, fat_percent: e.target.value})} 
                    placeholder="e.g. 4.2" 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>SNF %</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    max="20"
                    value={formData.snf_percent} 
                    onChange={e => setFormData({...formData, snf_percent: e.target.value})} 
                    placeholder="e.g. 8.5" 
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className={styles.formGroup}>
                  <label>Added Water %</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    max="100"
                    value={formData.water_estimate} 
                    onChange={e => setFormData({...formData, water_estimate: e.target.value})} 
                    placeholder="e.g. 0" 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Temperature (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0"
                    value={formData.temperature} 
                    onChange={e => setFormData({...formData, temperature: e.target.value})} 
                    placeholder="e.g. 24" 
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Record Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
