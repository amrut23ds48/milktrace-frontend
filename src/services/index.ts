// services/index.ts
// ─── API Abstraction Layer ────────────────────────────────────────────────────
// All backend API calls are made from this layer ONLY.
// Components and hooks must never call fetch() directly.
// Return typed responses; never expose raw HTTP details.
//
// Example:
//   export async function fetchFacilities(): Promise<Facility[]> {
//     const res = await fetch('/api/v1/facilities');
//     if (!res.ok) throw new Error('Failed to fetch facilities');
//     return res.json();
//   }
