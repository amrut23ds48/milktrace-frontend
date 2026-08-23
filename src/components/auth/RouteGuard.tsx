'use client';

// components/auth/RouteGuard.tsx
// ─── Protects pages that require authentication ────────────────────────────────
// Shows a loading state while session is being restored, then redirects
// unauthenticated users to /login.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-page)',
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect in progress
  }

  return <>{children}</>;
}
