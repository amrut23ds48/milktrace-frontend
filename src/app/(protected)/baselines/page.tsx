'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function AnimalBaselinesPage() {
  const { user } = useAuth();
  const isVillageAdmin = user?.role?.name === 'Village Admin';

  const [animals, setAnimals] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Baselines Form
  const [formData, setFormData] = useState({ 
    expected_daily_yield: '',
    expected_fat: '',
    expected_snf: '',
    animal_info: null as any
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getAnimals(),
      adminService.getFacilities()
    ]).then(([aRes, facRes]) => {
      setAnimals(aRes);
      
      const villageCenters = facRes.filter((f: any) => f.type === 'VILLAGE_COLLECTION_CENTER');
      setFacilities(villageCenters);
      
      // If Village Admin, lock their filter to their own facility
      // Our mock logic uses the first village center for the Village Admin
      if (isVillageAdmin && villageCenters.length > 0) {
        setFacilityFilter(villageCenters[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (animal: any) => {
    setEditingId(animal.id);
    setFormData({ 
      expected_daily_yield: animal.expected_daily_yield ? animal.expected_daily_yield.toString() : '',
      expected_fat: animal.expected_fat ? animal.expected_fat.toString() : '',
      expected_snf: animal.expected_snf ? animal.expected_snf.toString() : '',
      animal_info: animal
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const payload = {
        expected_daily_yield: formData.expected_daily_yield ? parseFloat(formData.expected_daily_yield) : null,
        expected_fat: formData.expected_fat ? parseFloat(formData.expected_fat) : null,
        expected_snf: formData.expected_snf ? parseFloat(formData.expected_snf) : null,
      };
      
      await adminService.updateAnimalBaselines(editingId, payload);
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert(err);
    }
  };

  // ── Filtering Logic ──
  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const q = searchQuery.toLowerCase();
      const farmerName = a.farmer?.name?.toLowerCase() || '';
      const farmerCode = a.farmer?.farmer_code?.toLowerCase() || '';
      
      const matchesSearch = (a.identifier && a.identifier.toLowerCase().includes(q)) || 
                            (farmerName.includes(q)) ||
                            (farmerCode.includes(q)) ||
                            (a.id && a.id.toLowerCase().includes(q));
                            
      const matchesFacility = facilityFilter ? a.farmer?.collection_center_id === facilityFilter : true;
      const matchesSpecies = speciesFilter ? a.species === speciesFilter : true;
      const matchesStatus = statusFilter ? a.status === statusFilter : true;
      
      return matchesSearch && matchesFacility && matchesSpecies && matchesStatus;
    });
  }, [animals, searchQuery, facilityFilter, speciesFilter, statusFilter]);

  const paginatedAnimals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnimals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAnimals, currentPage]);

  const totalPages = Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, facilityFilter, speciesFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Animal Baselines</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Track expected yield and quality parameters for individual cattle to support anomaly detection.
      </p>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Tag ID, Farmer Name, Farmer Code..." 
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

        <select className={styles.filterSelect} value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)}>
          <option value="">All Species</option>
          <option value="COW">Cow</option>
          <option value="BUFFALO">Buffalo</option>
        </select>
        
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tag / Identifier</th>
              <th>Species & Breed</th>
              <th>Owner (Farmer)</th>
              <th>Baseline Yield (L)</th>
              <th>Baseline Fat %</th>
              <th>Baseline SNF %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedAnimals.map((a) => {
              return (
                <tr key={a.id} style={{ opacity: a.status === 'SUSPENDED' ? 0.6 : 1 }}>
                  <td>
                    <span className={styles.badge} style={{ background: '#e0e7ff', color: '#3730a3' }}>{a.identifier}</span><br/>
                    <code style={{color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'inline-block'}}>{a.id.split('-')[0]}</code>
                  </td>
                  <td>
                    <strong style={{color: '#0f172a'}}>{a.species}</strong><br/>
                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>{a.breed || 'Unknown Breed'} • {a.approximate_age || '?'} Yrs</span>
                  </td>
                  <td>
                    <div>{a.farmer?.name || 'Unknown'}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{a.farmer?.farmer_code}</div>
                  </td>
                  <td>
                    {a.expected_daily_yield ? <span style={{ fontWeight: 600, color: '#334155' }}>{a.expected_daily_yield} L</span> : <span style={{color: '#cbd5e1'}}>--</span>}
                  </td>
                  <td>
                    {a.expected_fat ? <span style={{ fontWeight: 600, color: '#334155' }}>{a.expected_fat}%</span> : <span style={{color: '#cbd5e1'}}>--</span>}
                  </td>
                  <td>
                    {a.expected_snf ? <span style={{ fontWeight: 600, color: '#334155' }}>{a.expected_snf}%</span> : <span style={{color: '#cbd5e1'}}>--</span>}
                  </td>
                  <td>
                    <div className={styles.flexActions}>
                      <button className={styles.actionBtn} style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#f8fafc', border: '1px solid #cbd5e1' }} onClick={() => handleOpenEdit(a)} title="Update Baselines">
                        Set Baselines
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && filteredAnimals.length === 0 && (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>No animals found matching your filters.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredAnimals.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAnimals.length)} of {filteredAnimals.length} Animals
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
          <div className={styles.slideOver} onClick={e => e.stopPropagation()}>
            <h2>Update Animal Baselines</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              Set expected daily yield and quality for anomaly detection.
            </p>
            
            {formData.animal_info && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{formData.animal_info.identifier}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {formData.animal_info.species} • {formData.animal_info.breed || 'No Breed'}
                  <br/>
                  Owner: {formData.animal_info.farmer?.name}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Expected Daily Yield (Liters)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  value={formData.expected_daily_yield} 
                  onChange={e => setFormData({...formData, expected_daily_yield: e.target.value})} 
                  placeholder="e.g. 10.5" 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Expected Fat %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="20"
                  value={formData.expected_fat} 
                  onChange={e => setFormData({...formData, expected_fat: e.target.value})} 
                  placeholder="e.g. 3.5" 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Expected SNF %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  max="20"
                  value={formData.expected_snf} 
                  onChange={e => setFormData({...formData, expected_snf: e.target.value})} 
                  placeholder="e.g. 8.5" 
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>Save Baselines</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
