// app/(protected)/layout.tsx
// ─── Protected Route Group Layout ─────────────────────────────────────────────
// All pages under (protected)/ require authentication.
// This layout applies RouteGuard + AppShell.

import AppShell from '../../components/layout/AppShell';
import RouteGuard from '../../components/auth/RouteGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
