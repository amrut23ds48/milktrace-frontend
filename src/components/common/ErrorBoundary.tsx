// components/common/ErrorBoundary.tsx
// ─── React Error Boundary ──────────────────────────────────────────────────────
// Catches render errors in child components so one failed widget
// cannot crash the entire application.

import React from 'react';

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this could be sent to Sentry/similar
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
