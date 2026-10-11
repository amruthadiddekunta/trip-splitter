import { describe, expect, it } from 'vitest';
import { formatINR, parseRupeesToPaise } from './money';

describe('Money utility functions', () => {
  it('formats amounts in Indian numbering system', () => {
    // ₹1,00,000.00 is 10000000 paise
    const formatted1Lakh = formatINR(10000000);
    expect(formatted1Lakh).toMatch(/1,00,000\.00/);

    // Negative format
    const formattedNegative = formatINR(-125050);
    expect(formattedNegative).toMatch(/-.*1,250\.50/);

    // Small paisa format
    const formattedSmall = formatINR(3333);
    expect(formattedSmall).toMatch(/33\.33/);
  });

  it('correctly converts rupee strings with up to 2 decimals to integer paise', () => {
    expect(parseRupeesToPaise('100')).toBe(10000);
    expect(parseRupeesToPaise('1250.50')).toBe(125050);
    expect(parseRupeesToPaise('0.05')).toBe(5);
    expect(parseRupeesToPaise('0')).toBe(0);
  });

  it('rejects invalid inputs or more than 2 decimals', () => {
    expect(parseRupeesToPaise('')).toBeNull();
    expect(parseRupeesToPaise('abc')).toBeNull();
    expect(parseRupeesToPaise('10.555')).toBeNull();
  });
});
