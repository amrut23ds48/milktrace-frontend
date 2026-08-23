// components/common/ErrorCard.tsx
// ─── Fallback UI for ErrorBoundary ────────────────────────────────────────────

import styles from './ErrorCard.module.css';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorCard({
  title   = 'Failed to load component',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorCardProps) {
  return (
    <div className={styles.card} role="alert">
      <div className={styles.icon} aria-hidden="true">!</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
