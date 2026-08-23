// schemas/farmer.schema.ts
// ─── Zod Validation Schema for Farmer Registration ────────────────────────────

import { z } from 'zod';

export const farmerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  village: z
    .string()
    .min(2, 'Village name is required'),
  district: z
    .string()
    .min(2, 'District is required'),
  animalCount: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(500, 'Value seems too high'),
});

export type FarmerFormData = z.infer<typeof farmerSchema>;
