'use client';

// components/layout/Header.tsx
// ─── Top Application Header ───────────────────────────────────────────────────

import { useState } from 'react';
import type { DateRange } from '../../types/dashboard.types';
import styles from './Header.module.css';

interface HeaderProps {
  pageTitle?: string;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Today',  value: '1D'  },
  { label: '7 Days', value: '7D'  },
  { label: '30 Days',value: '30D' },
  { label: '90 Days',value: '90D' },
];

export default function Header({ pageTitle = 'Dashboard', dateRange, onDateRangeChange }: HeaderProps) {
  const [search, setSearch] = useState('');

  return (
    <header className={styles.header} aria-label="Application header">
      {/* Page title */}
      <div className={styles.pageTitle}>{pageTitle}</div>

      {/* Global search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          id="global-search"
          type="search"
          className={styles.searchInput}
          placeholder="Search farmers, batches, anomalies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Global search"
        />
      </div>

      {/* Date range picker */}
      <div className={styles.dateRange} role="group" aria-label="Date range filter">
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            id={`date-range-${r.value}`}
            className={`${styles.dateBtn} ${dateRange === r.value ? styles.active : ''}`}
            onClick={() => onDateRangeChange(r.value)}
            aria-pressed={dateRange === r.value}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className={styles.spacer} />

      <div className={styles.controls}>
        {/* Live status */}
        <div className={styles.liveIndicator} title="Data refreshed every 30 seconds">
          <span className={styles.liveDot} aria-hidden="true" />
          <span>Live</span>
        </div>

        {/* Notification bell */}
        <button
          id="notifications-btn"
          className={styles.notifBtn}
          aria-label="Notifications (41 unread)"
          title="Notifications"
        >
          🔔
          <span className={styles.notifDot} aria-hidden="true" />
        </button>

        {/* Org context */}
        <div className={styles.orgPill} aria-label="Current organization">
          <span>🏛</span>
          <span>Maharashtra</span>
        </div>

        {/* Profile */}
        <div
          id="profile-avatar"
          className={styles.avatar}
          role="button"
          tabIndex={0}
          aria-label="User profile"
          title="Super Admin"
        >
          SA
        </div>
      </div>
    </header>
  );
}
