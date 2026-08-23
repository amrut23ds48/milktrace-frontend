import { describe, it, expect } from 'vitest';
import { farmerSchema } from '../farmer.schema';

describe('farmerSchema', () => {
  const validData = {
    name: 'Ramesh Jadhav',
    phone: '9876543210',
    village: 'Shirpur',
    district: 'Nashik',
    animalCount: 5,
  };

  it('accepts valid farmer data', () => {
    expect(() => farmerSchema.parse(validData)).not.toThrow();
  });

  it('rejects missing name', () => {
    const result = farmerSchema.safeParse({ ...validData, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name that is too short', () => {
    const result = farmerSchema.safeParse({ ...validData, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone — 9 digits', () => {
    const result = farmerSchema.safeParse({ ...validData, phone: '987654321' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone — starts with wrong digit', () => {
    const result = farmerSchema.safeParse({ ...validData, phone: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('accepts valid phone starting with 6', () => {
    const result = farmerSchema.safeParse({ ...validData, phone: '6012345678' });
    expect(result.success).toBe(true);
  });

  it('rejects negative animal count', () => {
    const result = farmerSchema.safeParse({ ...validData, animalCount: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts zero animal count', () => {
    const result = farmerSchema.safeParse({ ...validData, animalCount: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects animal count above 500', () => {
    const result = farmerSchema.safeParse({ ...validData, animalCount: 501 });
    expect(result.success).toBe(false);
  });
});
