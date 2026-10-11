import { describe, expect, it } from 'vitest';
import { calculateBalances, calculateShares } from './splits';
import { Expense, Member } from '../types/trip';

describe('Splits & Balance Calculation', () => {
  const members: Member[] = [
    { id: 'm1', name: 'Aarav' },
    { id: 'm2', name: 'Diya' },
    { id: 'm3', name: 'Kabir' },
    { id: 'm4', name: 'Meera' },
    { id: 'm5', name: 'Rohan' },
  ];

  it('splits ₹100 equally between 3 members without losing or inventing a paisa (₹33.34 + ₹33.33 + ₹33.33)', () => {
    // ₹100 is 10000 paise split between 3 people (m1, m2, m3)
    const expense: Expense = {
      id: 'test_100',
      description: 'Equal split test',
      amount: 10000,
      paidBy: 'm1',
      date: '2026-03-12',
      category: 'Food',
      split: {
        type: 'equal',
        memberIds: ['m1', 'm2', 'm3'],
      },
    };

    const shares = calculateShares(expense);

    expect(shares['m1']).toBe(3334); // First member receives remainder paisa (+1)
    expect(shares['m2']).toBe(3333);
    expect(shares['m3']).toBe(3333);

    // Exact sum must equal 10000 paise (₹100)
    const totalPaise = (shares['m1'] || 0) + (shares['m2'] || 0) + (shares['m3'] || 0);
    expect(totalPaise).toBe(10000);
  });

  it('calculates exact split properly', () => {
    const expense: Expense = {
      id: 'test_exact',
      description: 'Scuba',
      amount: 1050000,
      paidBy: 'm3',
      date: '2026-03-13',
      category: 'Activities',
      split: {
        type: 'exact',
        shares: { m3: 350000, m4: 350000, m5: 350000 },
      },
    };

    const shares = calculateShares(expense);
    expect(shares['m3']).toBe(350000);
    expect(shares['m4']).toBe(350000);
    expect(shares['m5']).toBe(350000);
    expect(shares['m1']).toBeUndefined();
  });

  it('calculates percent split and reconciles rounding differences', () => {
    const expense: Expense = {
      id: 'test_percent',
      description: 'Cab',
      amount: 149999,
      paidBy: 'm1',
      date: '2026-03-15',
      category: 'Travel',
      split: {
        type: 'percent',
        shares: { m1: 33.33, m2: 33.33, m3: 33.34 },
      },
    };

    const shares = calculateShares(expense);
    const sum = Object.values(shares).reduce((a, b) => a + b, 0);
    expect(sum).toBe(149999);
  });

  it('guarantees that balances across all members sum to exactly ₹0', () => {
    const sampleExpenses: Expense[] = [
      {
        id: 'e1',
        description: 'Villa booking',
        amount: 2400000,
        paidBy: 'm1',
        date: '2026-03-12',
        category: 'Stay',
        split: { type: 'equal', memberIds: ['m1', 'm2', 'm3', 'm4', 'm5'] },
      },
      {
        id: 'e2',
        description: 'Beach dinner',
        amount: 325000,
        paidBy: 'm2',
        date: '2026-03-12',
        category: 'Food',
        split: { type: 'equal', memberIds: ['m1', 'm2', 'm3', 'm4'] },
      },
      {
        id: 'e3',
        description: 'Scuba diving',
        amount: 1050000,
        paidBy: 'm3',
        date: '2026-03-13',
        category: 'Activities',
        split: {
          type: 'exact',
          shares: { m3: 350000, m4: 350000, m5: 350000 },
        },
      },
    ];

    const balances = calculateBalances(members, sampleExpenses);

    const netSum = balances.reduce((acc, curr) => acc + curr.netPaise, 0);
    expect(netSum).toBe(0);

    // Verify statusText formatting
    balances.forEach((b) => {
      if (b.netPaise > 0) {
        expect(b.statusText).toContain('gets back');
      } else if (b.netPaise < 0) {
        expect(b.statusText).toContain('owes');
      } else {
        expect(b.statusText).toBe('settled up');
      }
    });
  });

  it('handles case where payer is not part of the split', () => {
    // e.g., m1 pays for groceries for m2 and m3 only
    const expense: Expense = {
      id: 'payer_outside',
      description: 'Groceries for friends',
      amount: 20000, // ₹200.00
      paidBy: 'm1',
      date: '2026-03-14',
      category: 'Food',
      split: {
        type: 'equal',
        memberIds: ['m2', 'm3'],
      },
    };

    const balances = calculateBalances(members, [expense]);
    const m1 = balances.find((b) => b.member.id === 'm1');
    const m2 = balances.find((b) => b.member.id === 'm2');
    const m3 = balances.find((b) => b.member.id === 'm3');

    expect(m1?.netPaise).toBe(20000); // gets back ₹200.00
    expect(m2?.netPaise).toBe(-10000); // owes ₹100.00
    expect(m3?.netPaise).toBe(-10000); // owes ₹100.00

    const netSum = balances.reduce((acc, curr) => acc + curr.netPaise, 0);
    expect(netSum).toBe(0);
  });
});
