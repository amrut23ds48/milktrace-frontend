'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;
const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
].sort();

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'VILLAGE_COLLECTION_CENTER', district: MAHARASHTRA_DISTRICTS[0], status: 'ACTIVE' }); 

  const loadData = () => {
    setLoading(true);
    adminService.getFacilities()
      .then(setFacilities)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'VILLAGE_COLLECTION_CENTER', district: MAHARASHTRA_DISTRICTS[0], status: 'ACTIVE' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (facility: any) => {
    setEditingId(facility.id);
    setFormData({ name: facility.name, type: facility.type, district: facility.district, status: facility.status });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to soft-delete ${name}?`)) return;
    try {
      await adminService.deleteFacility(id);
      loadData();
    } catch(err) {
      alert(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateFacility(editingId, formData);
      } else {
        await adminService.createFacility({
          ...formData,
          organization_id: '1'
        });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert(err);
    }
  };

  // ── Filtering Logic ──
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q);
      const matchesDistrict = districtFilter ? f.district === districtFilter : true;
      const matchesType = typeFilter ? f.type === typeFilter : true;
      const matchesStatus = statusFilter ? f.status === statusFilter : true;
      return matchesSearch && matchesDistrict && matchesType && matchesStatus;
    });
  }, [facilities, searchQuery, districtFilter, typeFilter, statusFilter]);

  const paginatedFacilities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFacilities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFacilities, currentPage]);

  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, districtFilter, typeFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Facilities Management</h1>
        <button className={styles.addButton} onClick={handleOpenCreate}>+ Add Facility</button>
      </div>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Name or Short ID..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <select className={styles.filterSelect} value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
          <option value="">All Districts</option>
          {MAHARASHTRA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="VILLAGE_COLLECTION_CENTER">Village Center</option>
          <option value="CHILLING_CENTER">Chilling Center</option>
          <option value="PROCESSING_PLANT">Processing Plant</option>
        </select>

        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Short ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedFacilities.map((f) => (
              <tr key={f.id} style={{ opacity: f.status === 'CANCELLED' ? 0.5 : 1 }}>
                <td><code style={{color: '#64748b', fontSize: '0.8rem'}}>{f.id.split('-')[0]}</code></td>
                <td><strong style={{color: '#0f172a'}}>{f.name}</strong></td>
                <td><span className={styles.badge}>{f.type.replace(/_/g, ' ')}</span></td>
                <td>{f.district}</td>
                <td>
                  <span style={{color: f.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.85rem'}}>
                    {f.status}
                  </span>
                </td>
                <td>
                  <div className={styles.flexActions}>
                    <button className={styles.actionBtn} onClick={() => handleOpenEdit(f)} title="Edit">✎</button>
                    {f.status !== 'CANCELLED' && (
                      <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(f.id, f.name)} title="Soft Delete">✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredFacilities.length === 0 && (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '3rem'}}>No facilities found matching your filters.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredFacilities.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFacilities.length)} of {filteredFacilities.length} Facilities
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
            <h2>{editingId ? 'Edit Facility' : 'Create New Facility'}</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              {editingId ? 'Update facility details.' : 'Add a new facility to the organization.'}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Facility Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pune Village Center A" />
              </div>

              <div className={styles.formGroup}>
                <label>Facility Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="VILLAGE_COLLECTION_CENTER">Village Collection Center</option>
                  <option value="CHILLING_CENTER">Chilling Center</option>
                  <option value="PROCESSING_PLANT">Processing Plant</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>District (Maharashtra)</label>
                <select required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                  {MAHARASHTRA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {editingId && (
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="CANCELLED">CANCELLED (Soft Delete)</option>
                  </select>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>{editingId ? 'Save Changes' : 'Create Facility'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
