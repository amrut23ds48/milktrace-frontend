'use client';

// components/layout/AppShell.tsx
// ─── Root Layout Wrapper ──────────────────────────────────────────────────────
// Combines Sidebar + Header. Manages dateRange state at shell level
// so Header and all dashboard panels share the same filter.

import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { DateRange } from '../../types/dashboard.types';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7D');

  return (
    <div className={styles.shell}>
      <Sidebar />
      <Header
        pageTitle={pageTitle}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Inject dateRange into children via a context if needed in future phases */}
          {children}
        </div>
      </main>
    </div>
  );
}
