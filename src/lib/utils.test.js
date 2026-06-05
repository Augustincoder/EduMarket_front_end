// src/lib/utils.test.js
import { describe, it, expect } from 'vitest';
import { formatPrice, getInitials } from './utils';

describe('Utility functions', () => {
  it('formatPrice formats currency correctly', () => {
    // uz-UZ locale uses space (or non-breaking space) as separator
    const formatted = formatPrice(50000);
    expect(formatted.replace(/\s/g, ' ')).toBe('50 000');
  });

  it('getInitials returns initials for names', () => {
    expect(getInitials('Alisher Navoiy')).toBe('AN');
    expect(getInitials('Zuxra')).toBe('Z');
    expect(getInitials('')).toBe('?');
  });
});
