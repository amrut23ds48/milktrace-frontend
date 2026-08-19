// types/index.ts
// ─── Shared TypeScript Types & Interfaces ─────────────────────────────────────
// All shared TypeScript interfaces and types live here.
// These must mirror backend DTOs/entities closely.
// Never use `any` — if a type is unknown, use `unknown` and narrow it.
//
// Example:
//   export interface Facility {
//     id: string;
//     name: string;
//     organizationId: string;
//   }
