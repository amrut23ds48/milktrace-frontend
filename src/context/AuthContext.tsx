'use client';

// context/AuthContext.tsx
// ─── Authentication Provider ───────────────────────────────────────────────────
// Stores JWT in localStorage for persistence across page reloads.
// The token is attached to every API request via Authorization header.

import React, { createContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, AuthContextValue, LoginResponse } from '../types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const TOKEN_KEY = 'milktrace_token';
const USER_KEY  = 'milktrace_user';

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getInitialToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  };

  const getInitialUser = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  };

  const [user, setUser]   = useState<AuthUser | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  // localStorage is read synchronously in initializers above; never in a loading state
  const isLoading = false;
  const router = useRouter();

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? 'Invalid credentials. Please try again.');
    }

    const data: LoginResponse = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
