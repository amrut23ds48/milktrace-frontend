// app/not-found.tsx
// ─── Custom 404 Page ──────────────────────────────────────────────────────────
// Rendered by Next.js App Router whenever a route has no matching page.
// Displays within the AppShell (Sidebar + Header still visible) so the UI
// doesn't feel broken. Explains that most pages are coming in future phases.

import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found — MilkTrace',
};

// Nav items that are planned but not yet built — shown in the note
const PLANNED_PAGES: Record<string, string> = {
  '/milk-flow':  'Phase 8',
  '/map':        'Phase 8',
  '/farmers':    'Phase 9',
  '/batches':    'Phase 9',
  '/facilities': 'Phase 9',
  '/anomalies':  'Phase 9',
  '/analytics':  'Phase 10',
  '/audit-logs': 'Phase 10',
  '/users':      'Phase 10',
  '/roles':      'Phase 10',
  '/businesses': 'Phase 10',
  '/baselines':  'Phase 10',
  '/system':     'Phase 10',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.icon} aria-hidden="true">🗂</div>

      <span className={styles.code}>404 — Not Found</span>

      <h1 className={styles.heading}>This page hasn&apos;t been built yet</h1>

      <p className={styles.sub}>
        MilkTrace is being developed in sequential phases.
        The dashboard is live — the rest of the pages are coming soon.
      </p>

      <div className={styles.actions}>
        <Link id="not-found-dashboard-link" href="/dashboard" className={styles.btnPrimary}>
          ⊞ Go to Dashboard
        </Link>
        <Link id="not-found-back-link" href="javascript:history.back()" className={styles.btnSecondary}>
          ← Go Back
        </Link>
      </div>

      <div className={styles.phaseNote}>
        <strong>Planned pages by phase:</strong>
        <br />
        {Object.entries(PLANNED_PAGES).map(([path, phase]) => (
          <span key={path} style={{ marginRight: 12 }}>
            <code>{path}</code> ({phase})
          </span>
        ))}
      </div>
    </div>
  );
}
