// utils/index.ts
// ─── Pure Helper Functions ────────────────────────────────────────────────────
// Only pure, side-effect-free utility functions live here.
// No API calls, no React hooks, no global state.

/** Format a litre value into a human-readable string (e.g. 1.82M L, 340K L) */
export function formatLitres(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M L`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K L`;
  return `${n} L`;
}

/** Format a count into a compact string (e.g. 12.5K) */
export function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Humanise an ISO timestamp as "X min ago", "Xh ago", "Xd ago" */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
