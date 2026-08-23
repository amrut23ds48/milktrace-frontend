// schemas/collection.schema.ts
// ─── Zod Validation Schema for Milk Collection Entry ──────────────────────────

import { z } from 'zod';

export const collectionSchema = z.object({
  farmerCode: z
    .string()
    .min(1, 'Select a farmer'),
  volumeLiters: z
    .number()
    .positive('Volume must be greater than 0')
    .max(500, 'Volume seems too high — please verify'),
  fatPercent: z
    .number()
    .min(1.0, 'Fat % must be at least 1.0')
    .max(10.0, 'Fat % cannot exceed 10.0'),
  snfPercent: z
    .number()
    .min(6.0, 'SNF % must be at least 6.0')
    .max(10.0, 'SNF % cannot exceed 10.0'),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;
