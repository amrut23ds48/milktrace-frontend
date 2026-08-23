'use client';

// hooks/useAuth.ts
// ─── Auth hook ────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
