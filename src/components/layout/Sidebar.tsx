'use client';

// components/layout/Sidebar.tsx
// ─── Fixed Left Navigation Sidebar ───────────────────────────────────────────

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',  icon: '⊞' },
  { label: 'Milk Flow',   href: '/milk-flow',  icon: '⟳' },
  { label: 'Map',         href: '/map',         icon: '◎' },
  { label: 'Farmers',     href: '/farmers',     icon: '👤' },
  { label: 'Batches',     href: '/batches',     icon: '⬡' },
  { label: 'Facilities',  href: '/facilities',  icon: '🏭' },
  { label: 'Anomalies',   href: '/anomalies',   icon: '⚠', badge: 41 },
  { label: 'Analytics',   href: '/analytics',   icon: '📈' },
  { label: 'Audit Logs',  href: '/audit-logs',  icon: '📋' },
];

const adminNav: NavItem[] = [
  { label: 'Users',          href: '/users',          icon: '👥' },
  { label: 'Roles & Perms',  href: '/roles',           icon: '🔑' },
  { label: 'Businesses',     href: '/businesses',      icon: '🏢' },
  { label: 'Animal Baselines', href: '/baselines',     icon: '🐄' },
  { label: 'System Config',  href: '/system',          icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon} aria-hidden="true">🥛</div>
        <div>
          <div className={styles.logoText}>MilkTrace</div>
          <div className={styles.logoSub}>Maharashtra</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <div className={styles.navSectionLabel}>Operations</div>
          {primaryNav.map((item) => {
            // Filter logic
            if (user?.role === 'Village Admin' && !['Milk Flow', 'Farmers'].includes(item.label)) {
              return null;
            }
            if (user?.role === 'Chilling Admin' && !['Batches', 'Facilities'].includes(item.label)) {
              return null;
            }
            const superAdminOnlyItems = ['Map', 'Anomalies', 'Analytics', 'Audit Logs'];
            if (superAdminOnlyItems.includes(item.label) && user?.role !== 'Super Admin') {
              return null;
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && (
                  <span className={styles.navBadge} aria-label={`${item.badge} open`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {user?.role === 'Super Admin' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Super Admin</div>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        {/* User info */}
        {user && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{typeof user.role === 'string' ? user.role : (user.role as any)?.name ?? 'User'}</div>
            </div>
          </div>
        )}
        <button
          id="sidebar-logout-btn"
          className={styles.logoutBtn}
          onClick={logout}
          title="Sign out"
        >
          <span aria-hidden="true">⎋</span> Sign Out
        </button>
        <p className={styles.version}>MilkTrace v0.1.0 · Phase 8</p>
      </div>
    </aside>
  );
}
