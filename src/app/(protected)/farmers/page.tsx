'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;
const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
].sort();

export default function FarmersPage() {
  const { user } = useAuth();
  // We identify Village Admin strictly by role name in our mock setup
  const isVillageAdmin = user?.role?.name === 'Village Admin';

  const [farmers, setFarmers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Comprehensive form data
  const [formData, setFormData] = useState({ 
    farmer_code: '', 
    name: '', 
    phone: '', 
    aadhar_number: '',
    village: '', 
    district: MAHARASHTRA_DISTRICTS[0], 
    collection_center_id: '',
    registration_status: 'PENDING',
    animals: [] as { identifier: string; species: string; breed: string; sex: string; approximate_age: number }[]
  }); 

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getFarmers(),
      adminService.getFacilities()
    ]).then(([fRes, facRes]) => {
      setFarmers(fRes);
      // Only keep Village Collection Centers for farmer onboarding
      const villageCenters = facRes.filter((f: any) => f.type === 'VILLAGE_COLLECTION_CENTER');
      setFacilities(villageCenters);
      
      // If Village Admin, lock their filter to the first village center for the mock
      if (isVillageAdmin && villageCenters.length > 0) {
        setFacilityFilter(villageCenters[0].id);
      }
      
      if (villageCenters.length > 0 && !editingId) {
        setFormData(prev => ({ ...prev, collection_center_id: villageCenters[0].id }));
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    const generatedCode = `F-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    setFormData({ 
      farmer_code: generatedCode, 
      name: '', 
      phone: '', 
      aadhar_number: '',
      village: '', 
      district: MAHARASHTRA_DISTRICTS[0], 
      collection_center_id: facilities[0]?.id || '',
      registration_status: 'PENDING',
      animals: []
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (farmer: any) => {
    setEditingId(farmer.id);
    setFormData({ 
      farmer_code: farmer.farmer_code, 
      name: farmer.name, 
      phone: farmer.phone || '', 
      aadhar_number: farmer.aadhar_number || '',
      village: farmer.village || '', 
      district: farmer.district || MAHARASHTRA_DISTRICTS[0], 
      collection_center_id: farmer.collection_center_id,
      registration_status: farmer.registration_status,
      animals: farmer.animals || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to suspend farmer ${name}?`)) return;
    try {
      await adminService.deleteFarmer(id);
      loadData();
    } catch(err) {
      alert(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateFarmer(editingId, formData);
      } else {
        await adminService.createFarmer(formData);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert(err);
    }
  };

  // Animal Array Helpers
  const addAnimal = () => {
    setFormData(prev => ({
      ...prev,
      animals: [...prev.animals, { identifier: '', species: 'COW', breed: '', sex: 'FEMALE', approximate_age: 3 }]
    }));
  };

  const updateAnimal = (index: number, field: string, value: string | number) => {
    const updated = [...formData.animals];
    (updated[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, animals: updated }));
  };

  const removeAnimal = (index: number) => {
    const updated = formData.animals.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, animals: updated }));
  };

  // ── Filtering Logic ──
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (f.name && f.name.toLowerCase().includes(q)) || 
                            (f.farmer_code && f.farmer_code.toLowerCase().includes(q)) ||
                            (f.phone && f.phone.includes(q)) ||
                            (f.aadhar_number && f.aadhar_number.includes(q)) ||
                            (f.id && f.id.toLowerCase().includes(q));
                            
      const matchesFacility = facilityFilter ? f.collection_center_id === facilityFilter : true;
      const matchesStatus = statusFilter ? f.registration_status === statusFilter : true;
      return matchesSearch && matchesFacility && matchesStatus;
    });
  }, [farmers, searchQuery, facilityFilter, statusFilter]);

  const paginatedFarmers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFarmers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFarmers, currentPage]);

  const totalPages = Math.ceil(filteredFarmers.length / ITEMS_PER_PAGE);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, facilityFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Farmer Onboarding</h1>
        <button className={styles.addButton} onClick={handleOpenCreate}>+ Register Farmer</button>
      </div>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Name, Phone, Aadhar, Farmer Code or Short ID..." 
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

        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Farmer Code</th>
              <th>Name</th>
              <th>Contact & KYC</th>
              <th>Cattle Count</th>
              <th>Collection Center</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedFarmers.map((f) => {
              const assignedFacility = facilities.find(fac => fac.id === f.collection_center_id);
              return (
                <tr key={f.id} style={{ opacity: f.registration_status === 'SUSPENDED' ? 0.6 : 1 }}>
                  <td>
                    <span className={styles.badge}>{f.farmer_code}</span><br/>
                    <code style={{color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'inline-block'}}>{f.id.split('-')[0]}</code>
                  </td>
                  <td><strong style={{color: '#0f172a'}}>{f.name}</strong></td>
                  <td>
                    <div>{f.phone || 'No Phone'}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>Aadhar: {f.aadhar_number || 'N/A'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{f.animals?.length || 0}</span> Registered
                  </td>
                  <td>{assignedFacility ? assignedFacility.name : <em style={{color: '#94a3b8'}}>Unknown</em>}</td>
                  <td>
                    <span style={{
                      color: f.registration_status === 'APPROVED' ? '#16a34a' : (f.registration_status === 'PENDING' ? '#d97706' : '#dc2626'), 
                      fontWeight: 600, 
                      fontSize: '0.85rem'
                    }}>
                      {f.registration_status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.flexActions}>
                      <button className={styles.actionBtn} onClick={() => handleOpenEdit(f)} title="Edit">✎</button>
                      {f.registration_status !== 'SUSPENDED' && (
                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(f.id, f.name)} title="Suspend">✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && filteredFarmers.length === 0 && (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>No farmers found matching your filters.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredFarmers.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFarmers.length)} of {filteredFarmers.length} Farmers
            </span>
            <div className={styles.pageButtons}>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className={styles.overlay} onClick={() => setIsFormOpen(false)}>
          <div className={styles.slideOver} onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
            <h2>{editingId ? 'Edit Farmer' : 'Register New Farmer'}</h2>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
              {editingId ? 'Update farmer details and verification status.' : 'Onboard a new milk producer to a Village Collection Center.'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* SECTION 1: KYC */}
              <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#1e293b' }}>1. KYC Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Farmer Code</label>
                  <input required value={formData.farmer_code} onChange={e => setFormData({...formData, farmer_code: e.target.value})} placeholder="e.g. F-12345" />
                </div>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Tukaram Patil" />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. +91 9876543210" />
                </div>
                <div className={styles.formGroup}>
                  <label>Aadhar Number</label>
                  <input value={formData.aadhar_number} onChange={e => setFormData({...formData, aadhar_number: e.target.value})} placeholder="1234-5678-9012" />
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem', color: '#1e293b' }}>2. Location & Assignment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Village</label>
                  <input required value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="e.g. Shirpur" />
                </div>
                <div className={styles.formGroup}>
                  <label>District (Maharashtra)</label>
                  <select required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                    {MAHARASHTRA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                  <label>Assigned Village Center</label>
                  <select 
                    required 
                    value={formData.collection_center_id} 
                    onChange={e => setFormData({...formData, collection_center_id: e.target.value})}
                    disabled={isVillageAdmin} // Lock dropdown for village admins
                  >
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  {isVillageAdmin && <small style={{color: '#64748b'}}>Locked to your assigned facility.</small>}
                </div>
              </div>

              {/* SECTION 3: CATTLE REGISTRY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>3. Cattle Registry</h3>
                <button type="button" onClick={addAnimal} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  + Add Animal
                </button>
              </div>
              
              {formData.animals.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                  No cattle registered yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.animals.map((animal, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <button type="button" onClick={() => removeAnimal(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Tag / Identifier</label>
                          <input required value={animal.identifier} onChange={e => updateAnimal(idx, 'identifier', e.target.value)} placeholder="e.g. TAG-001" style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Species</label>
                          <select required value={animal.species} onChange={e => updateAnimal(idx, 'species', e.target.value)} style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                            <option value="COW">Cow</option>
                            <option value="BUFFALO">Buffalo</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Breed</label>
                          <input value={animal.breed} onChange={e => updateAnimal(idx, 'breed', e.target.value)} placeholder="e.g. HF, Gir" style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Age (Years)</label>
                          <input type="number" min="0" value={animal.approximate_age} onChange={e => updateAnimal(idx, 'approximate_age', parseInt(e.target.value))} style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STATUS & ACTIONS */}
              {editingId && (
                <div className={styles.formGroup} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <label>Registration Status</label>
                  <select required value={formData.registration_status} onChange={e => setFormData({...formData, registration_status: e.target.value})}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              )}

              <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>{editingId ? 'Save Changes' : 'Register Farmer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
