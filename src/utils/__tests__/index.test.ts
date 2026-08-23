import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatLitres, formatCount, timeAgo, clamp } from '../index';

describe('Utility Functions', () => {
  describe('formatLitres', () => {
    it('formats values under 1,000 correctly', () => {
      expect(formatLitres(500)).toBe('500 L');
      expect(formatLitres(999)).toBe('999 L');
    });

    it('formats values >= 1,000 and < 1,000,000 with K', () => {
      expect(formatLitres(1000)).toBe('1.0K L');
      expect(formatLitres(1500)).toBe('1.5K L');
      expect(formatLitres(999900)).toBe('999.9K L');
    });

    it('formats values >= 1,000,000 with M', () => {
      expect(formatLitres(1000000)).toBe('1.00M L');
      expect(formatLitres(1820000)).toBe('1.82M L');
      expect(formatLitres(2000000)).toBe('2.00M L');
    });
  });

  describe('formatCount', () => {
    it('formats counts under 1,000 correctly', () => {
      expect(formatCount(0)).toBe('0');
      expect(formatCount(999)).toBe('999');
    });

    it('formats counts >= 1,000 with K', () => {
      expect(formatCount(1000)).toBe('1.0K');
      expect(formatCount(12500)).toBe('12.5K');
    });
  });

  describe('clamp', () => {
    it('returns the value if it is within bounds', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('returns the min if the value is below min', () => {
      expect(clamp(0, 1, 10)).toBe(1);
    });

    it('returns the max if the value is above max', () => {
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('timeAgo', () => {
    beforeEach(() => {
      // Lock Date.now() to a specific timestamp (2024-01-01T12:00:00.000Z)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats minutes ago correctly', () => {
      const tenMinsAgo = new Date('2024-01-01T11:50:00.000Z').toISOString();
      expect(timeAgo(tenMinsAgo)).toBe('10 min ago');
      
      const justNow = new Date('2024-01-01T11:59:30.000Z').toISOString();
      expect(timeAgo(justNow)).toBe('0 min ago');
    });

    it('formats hours ago correctly', () => {
      const twoHoursAgo = new Date('2024-01-01T10:00:00.000Z').toISOString();
      expect(timeAgo(twoHoursAgo)).toBe('2h ago');
      
      const almostOneDay = new Date('2023-12-31T12:30:00.000Z').toISOString(); // 23h 30m ago
      expect(timeAgo(almostOneDay)).toBe('23h ago');
    });

    it('formats days ago correctly', () => {
      const twoDaysAgo = new Date('2023-12-30T12:00:00.000Z').toISOString();
      expect(timeAgo(twoDaysAgo)).toBe('2d ago');
    });
  });
});
