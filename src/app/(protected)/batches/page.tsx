'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../hooks/useAuth';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function BatchesPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [availableCollections, setAvailableCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Forms
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isDispatchFormOpen, setIsDispatchFormOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    source_facility_id: '',
    destination_facility_id: '',
    collection_ids: [] as string[]
  });

  const [dispatchFormData, setDispatchFormData] = useState({
    vehicle_number: '',
    driver_name: '',
    destination_facility_id: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedBatches, fetchedFacilities] = await Promise.all([
        adminService.getBatches(),
        adminService.getFacilities()
      ]);
      setBatches(fetchedBatches);
      setFacilities(fetchedFacilities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = async () => {
    let defaultSourceId = '';
    if ((user?.role === 'Village Admin' || user?.role === 'Chilling Admin') && user?.facilityId) {
      defaultSourceId = user.facilityId;
    }

    setCreateFormData({
      source_facility_id: defaultSourceId,
      destination_facility_id: '',
      collection_ids: []
    });

    if (defaultSourceId) {
      fetchAvailableCollections(defaultSourceId);
    } else {
      setAvailableCollections([]);
    }

    setIsCreateFormOpen(true);
  };

  const fetchAvailableCollections = async (facilityId: string) => {
    try {
      const collections = await adminService.getCollections({ facility_id: facilityId });
      // Filter out collections that are already in ANY batch
      const batchedCollectionIds = new Set();
      batches.forEach(b => b.items?.forEach((item: any) => batchedCollectionIds.add(item.collection_id)));
      
      const unbatched = collections.filter(c => !batchedCollectionIds.has(c.id) && c.status === 'ACTIVE');
      setAvailableCollections(unbatched);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSourceFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCreateFormData({ ...createFormData, source_facility_id: val, collection_ids: [] });
    if (val) {
      fetchAvailableCollections(val);
    } else {
      setAvailableCollections([]);
    }
  };

  const toggleCollectionSelection = (id: string) => {
    setCreateFormData(prev => {
      const curr = prev.collection_ids;
      if (curr.includes(id)) {
        return { ...prev, collection_ids: curr.filter(x => x !== id) };
      } else {
        return { ...prev, collection_ids: [...curr, id] };
      }
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createFormData.collection_ids.length === 0) {
      alert("Please select at least one collection to batch.");
      return;
    }
    try {
      await adminService.createBatch(createFormData);
      setIsCreateFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  const handleOpenDispatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setDispatchFormData({ vehicle_number: '', driver_name: '', destination_facility_id: '' });
    setIsDispatchFormOpen(true);
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch) return;

    try {
      await adminService.createTransfer({
        batch_id: selectedBatchId,
        source_facility_id: batch.source_facility_id,
        destination_facility_id: batch.destination_facility_id || dispatchFormData.destination_facility_id,
        dispatched_quantity: batch.quantity_liters,
        vehicle_number: dispatchFormData.vehicle_number,
        driver_name: dispatchFormData.driver_name
      });
      setIsDispatchFormOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  // ── Filtering Logic ──
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = b.id.toLowerCase().includes(q);
      const matchesFacility = facilityFilter ? (b.source_facility_id === facilityFilter || b.destination_facility_id === facilityFilter) : true;
      const matchesStatus = statusFilter ? b.status === statusFilter : true;
      return matchesSearch && matchesFacility && matchesStatus;
    });
  }, [batches, searchQuery, facilityFilter, statusFilter]);

  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBatches.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBatches, currentPage]);

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, facilityFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Batches & Transfers</h1>
        <button className={styles.addButton} onClick={handleOpenCreate}>+ Create Batch</button>
      </div>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Batch ID..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <select className={styles.filterSelect} value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)}>
          <option value="">All Facilities</option>
          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="CREATED">Created</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="RECEIVED">Received</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Quantity (L)</th>
              <th>Collections</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedBatches.map((b) => {
              const sourceFacilityName = b.source_facility?.name || facilities.find(f => f.id === b.source_facility_id)?.name || 'Unknown';
              const destFacilityName = b.destination_facility?.name || facilities.find(f => f.id === b.destination_facility_id)?.name || 'Unknown';
              
              return (
              <tr key={b.id}>
                <td><code style={{color: '#64748b', fontSize: '0.8rem'}}>{b.id.split('-')[0]}</code></td>
                <td><strong style={{color: '#0f172a'}}>{sourceFacilityName}</strong></td>
                <td>{destFacilityName}</td>
                <td>{Number(b.quantity_liters).toFixed(2)} L</td>
                <td>{b.items?.length || 0}</td>
                <td>
                  <span style={{
                    color: b.status === 'CREATED' ? '#3b82f6' : b.status === 'RECEIVED' ? '#16a34a' : '#f59e0b',
                    fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <div className={styles.flexActions}>
                    {b.status === 'CREATED' && (
                      <button className={styles.actionBtn} onClick={() => handleOpenDispatch(b.id)} title="Dispatch Transfer" style={{ width: 'auto', padding: '0 0.5rem'}}>
                        Dispatch 🚚
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {!loading && filteredBatches.length === 0 && (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>No batches found.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredBatches.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBatches.length)} of {filteredBatches.length} Batches
            </span>
            <div className={styles.pageButtons}>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <button className={styles.pageButton} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {isCreateFormOpen && (
        <div className={styles.overlay} onClick={() => setIsCreateFormOpen(false)}>
          <div className={styles.slideOver} onClick={e => e.stopPropagation()}>
            <h2>Create New Batch</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              Bundle milk collections into a batch for transfer.
            </p>
            
            <form onSubmit={handleCreateSubmit}>
              <div className={styles.formGroup}>
                <label>Source Facility</label>
                <select 
                  required 
                  value={createFormData.source_facility_id} 
                  onChange={handleSourceFacilityChange}
                  disabled={(user?.role === 'Village Admin' || user?.role === 'Chilling Admin') && !!user?.facilityId}
                >
                  <option value="">Select Source Facility</option>
                  {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Destination Facility (Optional)</label>
                <select 
                  value={createFormData.destination_facility_id} 
                  onChange={e => setCreateFormData({...createFormData, destination_facility_id: e.target.value})}
                >
                  <option value="">Select Destination Facility</option>
                  {facilities.filter(f => f.id !== createFormData.source_facility_id).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              {createFormData.source_facility_id && (
                <div className={styles.formGroup}>
                  <label>Select Collections to Batch</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem' }}>
                    {availableCollections.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem' }}>No unbatched collections available for this facility.</p>
                    ) : availableCollections.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" 
                          checked={createFormData.collection_ids.includes(c.id)}
                          onChange={() => toggleCollectionSelection(c.id)}
                        />
                        <span>Code: {c.collection_code} | Qty: {Number(c.quantity_liters).toFixed(2)}L</span>
                      </label>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {createFormData.collection_ids.length} selected
                  </p>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsCreateFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDispatchFormOpen && (
        <div className={styles.overlay} onClick={() => setIsDispatchFormOpen(false)}>
          <div className={styles.slideOver} onClick={e => e.stopPropagation()}>
            <h2>Dispatch Transfer</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              Dispatch batch {selectedBatchId?.split('-')[0]} via a transfer vehicle.
            </p>
            
            <form onSubmit={handleDispatchSubmit}>
              {batches.find(b => b.id === selectedBatchId) && !batches.find(b => b.id === selectedBatchId)?.destination_facility_id && (
                <div className={styles.formGroup}>
                  <label>Destination Facility</label>
                  <select 
                    required 
                    value={dispatchFormData.destination_facility_id} 
                    onChange={e => setDispatchFormData({...dispatchFormData, destination_facility_id: e.target.value})}
                  >
                    <option value="">Select Destination Facility</option>
                    {facilities.filter(f => f.id !== batches.find(b => b.id === selectedBatchId)?.source_facility_id).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Vehicle Number</label>
                <input required value={dispatchFormData.vehicle_number} onChange={e => setDispatchFormData({...dispatchFormData, vehicle_number: e.target.value})} placeholder="e.g. MH 12 AB 1234" />
              </div>

              <div className={styles.formGroup}>
                <label>Driver Name</label>
                <input required value={dispatchFormData.driver_name} onChange={e => setDispatchFormData({...dispatchFormData, driver_name: e.target.value})} placeholder="e.g. Ramesh" />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsDispatchFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
