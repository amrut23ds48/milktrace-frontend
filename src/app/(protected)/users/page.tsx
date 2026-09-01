'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import styles from '../Admin.module.css';

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleId: '', facilityId: '', status: 'ACTIVE' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getUsers(),
      adminService.getRoles(),
      adminService.getFacilities()
    ]).then(([uRes, rRes, fRes]) => {
      setUsers(uRes);
      setRoles(rRes);
      setFacilities(fRes);
      if (rRes.length > 0 && !editingId) setFormData(prev => ({ ...prev, roleId: rRes[0].id }));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '', facilityId: '', status: 'ACTIVE' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({ 
      name: user.name, 
      email: user.email || '', 
      password: '', // Leave empty unless changing
      roleId: user.role?.id || roles[0]?.id || '', 
      facilityId: user.facility?.id || '',
      status: user.status || 'ACTIVE'
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to suspend user ${name}?`)) return;
    try {
      await adminService.deleteUser(id);
      loadData();
    } catch(err) {
      alert(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // If password is empty, don't send it to update
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await adminService.updateUser(editingId, payload);
      } else {
        await adminService.createUser({
          ...formData,
          organizationId: '1',
          facilityId: formData.facilityId || undefined
        });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      alert(err);
    }
  };

  // ── Filtering Logic ──
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (u.name && u.name.toLowerCase().includes(q)) || 
                            (u.email && u.email.toLowerCase().includes(q)) || 
                            (u.phone && u.phone.includes(q)) ||
                            (u.id && u.id.toLowerCase().includes(q));
      
      const matchesRole = roleFilter ? u.role?.id === roleFilter : true;
      const matchesFacility = facilityFilter ? u.facility?.id === facilityFilter : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;
      
      return matchesSearch && matchesRole && matchesFacility && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, facilityFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, facilityFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <button className={styles.addButton} onClick={handleOpenCreate}>+ Add User</button>
      </div>

      <div className={styles.controlsContainer}>
        <input 
          type="text" 
          placeholder="Search by Name, Email, or Short ID..." 
          className={styles.searchBar}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <select className={styles.filterSelect} value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)}>
          <option value="">All Facilities (Includes Global)</option>
          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
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
              <th>Short ID</th>
              <th>Name</th>
              <th>Email / Phone</th>
              <th>Role</th>
              <th>Assigned Facility</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>Loading...</td></tr>
            ) : paginatedUsers.map((u) => (
              <tr key={u.id} style={{ opacity: u.status === 'SUSPENDED' ? 0.6 : 1 }}>
                <td><code style={{color: '#64748b', fontSize: '0.8rem'}}>{u.id.split('-')[0]}</code></td>
                <td><strong style={{color: '#0f172a'}}>{u.name}</strong></td>
                <td>{u.email || u.phone || '-'}</td>
                <td><span className={styles.badge}>{u.role?.name || '-'}</span></td>
                <td>{u.facility?.name || <em style={{color: '#94a3b8'}}>Global Scope</em>}</td>
                <td>
                  <span style={{color: u.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.85rem'}}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className={styles.flexActions}>
                    <button className={styles.actionBtn} onClick={() => handleOpenEdit(u)} title="Edit">✎</button>
                    {u.status === 'ACTIVE' && (
                      <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(u.id, u.name)} title="Suspend">✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '3rem'}}>No users found matching your filters.</td></tr>
            )}
          </tbody>
        </table>

        {!loading && filteredUsers.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} Users
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
            <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
              {editingId ? 'Update user roles and access.' : 'Grant a user access to the system.'}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ramesh Kumar" />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ramesh@example.com" />
              </div>

              {!editingId && (
                <div className={styles.formGroup}>
                  <label>Temporary Password</label>
                  <input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 8 characters" />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>System Role</label>
                <select required value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Assign to Facility (Optional)</label>
                <select value={formData.facilityId} onChange={e => setFormData({...formData, facilityId: e.target.value})}>
                  <option value="">-- No Facility (Global) --</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.district})</option>
                  ))}
                </select>
              </div>
              
              {editingId && (
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>{editingId ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
