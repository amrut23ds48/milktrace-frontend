import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../useAuth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children);
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetAllMocks();
  });

  it('starts unauthenticated with no stored session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Wait for the initial isLoading to settle
    await act(async () => {});
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login() sets isAuthenticated to true on success', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', phone: null, role: 'SUPER_ADMIN', organizationId: 'org-1', facilityId: null };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'mock-jwt', user: mockUser }),
    } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Test');
  });

  it('login() throws on 401 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await expect(
      act(async () => {
        await result.current.login('bad@test.com', 'wrongpass');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout() clears authentication state', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', phone: null, role: 'SUPER_ADMIN', organizationId: 'org-1', facilityId: null };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'mock-jwt', user: mockUser }),
    } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
