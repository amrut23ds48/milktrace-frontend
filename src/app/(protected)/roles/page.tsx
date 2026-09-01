'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getRoles(),
      adminService.getPermissions()
    ]).then(([r, p]) => {
      setRoles(r);
      setPermissions(p);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createRole({
        ...formData,
        permission_ids: Array.from(selectedPerms)
      });
      setIsFormOpen(false);
      setFormData({ name: '', description: '' });
      setSelectedPerms(new Set());
      loadData();
    } catch (err) {
      alert(err);
    }
  };

  const togglePermission = (id: string) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  // ── Filtering Logic ──
  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (r.name && r.name.toLowerCase().includes(q)) || 
                            (r.id && r.id.toLowerCase().includes(q));
      
      let matchesSystem = true;
      if (systemFilter === 'SYSTEM') matchesSystem = r.is_system_role === true;
      if (systemFilter === 'CUSTOM') matchesSystem = r.is_system_role === false;

      return matchesSearch && matchesSystem;
    });
  }, [roles, searchQuery, systemFilter]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage]);

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, systemFilter]);

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const map: Record<string, any[]> = {};
    permissions.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [permissions]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>System Roles & Permissions</h1>
        <button className={styles.addButton} onClick={() => setIsFormOpen(true)}>+ Create Role</button>
      </div>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Role Name or Short ID..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <select className={styles.filterSelect} value={systemFilter} onChange={e => setSystemFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="SYSTEM">System Roles</option>
          <option value="CUSTOM">Custom Roles</option>
        </select>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Short ID</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Permissions Count</th>
              <th>System Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedRoles.map((r) => (
              <tr key={r.id}>
                <td><code style={{color: '#64748b', fontSize: '0.8rem'}}>{r.id.split('-')[0]}</code></td>
                <td><strong style={{color: '#0f172a'}}>{r.name}</strong></td>
                <td>{r.description || <em style={{color: '#94a3b8'}}>No description</em>}</td>
                <td><span className={styles.badge}>{r.permissions?.length || 0} perms</span></td>
                <td>{r.is_system_role ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {!loading && filteredRoles.length === 0 && (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '3rem'}}>No roles found matching your filters.</td></tr>
            )}
          </tbody>
        </table>
        
        {!loading && filteredRoles.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRoles.length)} of {filteredRoles.length} Roles
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
            <h2>Create Custom Role</h2>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Define a new organizational role with granular permissions.</p>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Role Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Audit Manager" />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description of responsibilities" />
              </div>

              <div className={styles.formGroup}>
                <label>Assign Permissions</label>
                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className={styles.permissionCategory}>
                      <h4>{category}</h4>
                      <div className={styles.permissionsGrid}>
                        {perms.map(p => (
                          <label key={p.id} className={styles.checkboxLabel}>
                            <input 
                              type="checkbox" 
                              checked={selectedPerms.has(p.id)} 
                              onChange={() => togglePermission(p.id)} 
                            />
                            {p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
