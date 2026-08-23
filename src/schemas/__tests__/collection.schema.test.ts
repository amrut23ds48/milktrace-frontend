import { describe, it, expect } from 'vitest';
import { collectionSchema } from '../collection.schema';

describe('collectionSchema', () => {
  const validData = {
    farmerCode: 'F-001',
    volumeLiters: 24.5,
    fatPercent: 6.2,
    snfPercent: 8.9,
  };

  it('accepts valid collection data', () => {
    expect(() => collectionSchema.parse(validData)).not.toThrow();
  });

  it('rejects missing farmerCode', () => {
    const result = collectionSchema.safeParse({ ...validData, farmerCode: '' });
    expect(result.success).toBe(false);
  });

  it('rejects zero volume', () => {
    const result = collectionSchema.safeParse({ ...validData, volumeLiters: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative volume', () => {
    const result = collectionSchema.safeParse({ ...validData, volumeLiters: -5 });
    expect(result.success).toBe(false);
  });

  it('accepts minimum fat boundary (1.0%)', () => {
    const result = collectionSchema.safeParse({ ...validData, fatPercent: 1.0 });
    expect(result.success).toBe(true);
  });

  it('accepts maximum fat boundary (10.0%)', () => {
    const result = collectionSchema.safeParse({ ...validData, fatPercent: 10.0 });
    expect(result.success).toBe(true);
  });

  it('rejects fat below minimum (0.9%)', () => {
    const result = collectionSchema.safeParse({ ...validData, fatPercent: 0.9 });
    expect(result.success).toBe(false);
  });

  it('rejects fat above maximum (10.1%)', () => {
    const result = collectionSchema.safeParse({ ...validData, fatPercent: 10.1 });
    expect(result.success).toBe(false);
  });

  it('rejects snf below minimum (5.9%)', () => {
    const result = collectionSchema.safeParse({ ...validData, snfPercent: 5.9 });
    expect(result.success).toBe(false);
  });

  it('accepts minimum snf boundary (6.0%)', () => {
    const result = collectionSchema.safeParse({ ...validData, snfPercent: 6.0 });
    expect(result.success).toBe(true);
  });

  it('rejects snf above maximum (10.1%)', () => {
    const result = collectionSchema.safeParse({ ...validData, snfPercent: 10.1 });
    expect(result.success).toBe(false);
  });
});
