import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from './format';

describe('format helpers', () => {
  it('formats currency in IDR without decimals', () => {
    expect(formatCurrency(32000)).toBe('Rp\u00a032.000');
    expect(formatCurrency(125000)).toBe('Rp\u00a0125.000');
  });

  it('formats ISO or date strings to readable date', () => {
    expect(formatDateDisplay('2025-03-06')).toBe('06 March 2025');
    expect(formatDateDisplay('2025-03-06T09:00:00.000Z')).toBe('06 March 2025');
  });

  it('formats time display or falls back to em dash', () => {
    expect(formatTimeDisplay('14:30')).toBe('14:30');
    expect(formatTimeDisplay(undefined)).toBe('—');
  });
});
