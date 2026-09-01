// services/adminService.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let token = 'mock-jwt-token';
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('milktrace_token');
    if (stored) token = stored;
  }
  
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options?.headers as any)
  };
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    let errStr = res.statusText;
    try {
      const body = await res.json();
      if (body.error) errStr = body.error;
    } catch (e) {}
    throw new Error(`API Error: ${errStr}`);
  }
  
  return res.json() as Promise<T>;
}

export const adminService = {
  getRoles: () => apiFetch<any[]>('/roles'),
  getPermissions: () => apiFetch<any[]>('/roles/permissions'),
  createRole: (data: any) => apiFetch<any>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  getFacilities: () => apiFetch<any[]>('/facilities'),
  createFacility: (data: any) => apiFetch<any>('/facilities', { method: 'POST', body: JSON.stringify(data) }),
  updateFacility: (id: string, data: any) => apiFetch<any>(`/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFacility: (id: string) => apiFetch<any>(`/facilities/${id}`, { method: 'DELETE' }),
  getUsers: () => apiFetch<any[]>('/users'),
  createUser: (data: any) => apiFetch<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => apiFetch<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch<any>(`/users/${id}`, { method: 'DELETE' }),
};
