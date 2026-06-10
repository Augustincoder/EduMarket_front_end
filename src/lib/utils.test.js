// src/lib/utils.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatPrice, getInitials, deadlineCountdown, timeAgo, formatPriceRange } from './utils';

describe('Utility functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formatPrice formats currency correctly', () => {
    const formatted = formatPrice(50000);
    expect(formatted.replace(/\s/g, ' ')).toMatch(/50\s*000/);
  });

  it('formatPriceRange formats correctly', () => {
    const range = formatPriceRange(10000, 20000);
    expect(range.replace(/\s/g, ' ')).toMatch(/10\s*000 — 20\s*000 so'm/);
    
    const same = formatPriceRange(50000, 50000);
    expect(same.replace(/\s/g, ' ')).toMatch(/50\s*000 so'm/);
  });

  it('getInitials returns initials for names', () => {
    expect(getInitials('Alisher Navoiy')).toBe('AN');
    expect(getInitials('Zuxra')).toBe('Z');
    expect(getInitials('')).toBe('?');
  });

  it('deadlineCountdown formats remaining time', () => {
    const now = new Date('2026-06-10T12:00:00Z').getTime();
    vi.setSystemTime(now);

    const inTwoDays = new Date(now + 2 * 86400000 + 1000).toISOString();
    expect(deadlineCountdown(inTwoDays)).toBe('2 kun');

    const inFiveHours = new Date(now + 5 * 3600000 + 1000).toISOString();
    expect(deadlineCountdown(inFiveHours)).toBe('5 soat');

    const past = new Date(now - 10000).toISOString();
    expect(deadlineCountdown(past)).toBe("Muddati o'/tgan");
  });

  it('timeAgo formats elapsed time', () => {
    const now = new Date('2026-06-10T12:00:00Z').getTime();
    vi.setSystemTime(now);

    expect(timeAgo(new Date(now - 30000).toISOString())).toBe('Hozirgina');
    expect(timeAgo(new Date(now - 15 * 60000).toISOString())).toBe('15 daqiqa oldin');
    expect(timeAgo(new Date(now - 5 * 3600000).toISOString())).toBe('5 soat oldin');
    expect(timeAgo(new Date(now - 3 * 86400000).toISOString())).toBe('3 kun oldin');
  });
});
