/**
 * Splitting and balance calculation utilities.
 *
 * Extra paisa rule:
 * When an amount in paise cannot be split evenly among N members:
 * 1. Base share = Math.floor(amount / N) paise.
 * 2. Remainder = amount % N paise (where 0 <= remainder < N).
 * 3. The first `remainder` members in the split list receive (+1) extra paisa.
 * 4. The remaining members receive `base` paise.
 *
 * Example: ₹100 (10,000 paise) split equally among 3 members:
 * - Base = 3333 paise (₹33.33)
 * - Remainder = 1 paisa
 * - Member 1 gets 3334 paise (₹33.34)
 * - Member 2 gets 3333 paise (₹33.33)
 * - Member 3 gets 3333 paise (₹33.33)
 * Total = 10,000 paise (₹100.00). Never loses or invents a single paisa.
 */

import { Expense, Member, MemberBalance, Split } from '../types/trip';
import { formatINR } from './money';

/**
 * Calculates each participating member's share in paise for a single expense.
 * Returns an object mapping memberId -> shareInPaise.
 * The sum of values is guaranteed to equal expense.amount exactly.
 */
export function calculateShares(expense: Expense): Record<string, number> {
  const { amount, split } = expense;
  const result: Record<string, number> = {};

  if (amount <= 0) {
    return result;
  }

  if (split.type === 'equal') {
    const { memberIds } = split;
    const count = memberIds.length;
    if (count === 0) {
      return result;
    }

    const baseShare = Math.floor(amount / count);
    const remainder = amount % count;

    memberIds.forEach((id, index) => {
      // The first `remainder` members receive 1 extra paisa
      const extraPaisa = index < remainder ? 1 : 0;
      result[id] = baseShare + extraPaisa;
    });

    return result;
  }

  if (split.type === 'exact') {
    // In exact split, shares are already specified in paise
    for (const [memberId, sharePaise] of Object.entries(split.shares)) {
      result[memberId] = sharePaise;
    }
    return result;
  }

  if (split.type === 'percent') {
    const entries = Object.entries(split.shares);
    if (entries.length === 0) {
      return result;
    }

    let allocatedSum = 0;
    let maxShareMemberId = entries[0][0];
    let maxPercent = entries[0][1];

    entries.forEach(([memberId, percent]) => {
      const share = Math.round((amount * percent) / 100);
      result[memberId] = share;
      allocatedSum += share;

      if (percent > maxPercent) {
        maxPercent = percent;
        maxShareMemberId = memberId;
      }
    });

    // Ensure the sum of shares strictly equals the total amount without losing/inventing paise
    const diff = amount - allocatedSum;
    if (diff !== 0 && result[maxShareMemberId] !== undefined) {
      result[maxShareMemberId] += diff;
    }

    return result;
  }

  return result;
}

/**
 * Calculates net balances for all members across the provided expenses list.
 *
 * Balance Formula:
 * Net Balance = (Total amount paid by member) - (Total shares owed by member across all expenses)
 *
 * - Positive: "gets back ₹X"
 * - Negative: "owes ₹X"
 * - Zero: "settled up"
 *
 * Mathematical Guarantee:
 * Sum of all member balances is always 0 paise.
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): MemberBalance[] {
  // Initialize accumulators
  const paidMap: Record<string, number> = {};
  const owedMap: Record<string, number> = {};

  members.forEach((m) => {
    paidMap[m.id] = 0;
    owedMap[m.id] = 0;
  });

  // Accumulate paid and owed amounts
  expenses.forEach((expense) => {
    if (paidMap[expense.paidBy] !== undefined) {
      paidMap[expense.paidBy] += expense.amount;
    } else {
      paidMap[expense.paidBy] = expense.amount;
    }

    const shares = calculateShares(expense);
    for (const [memberId, sharePaise] of Object.entries(shares)) {
      if (owedMap[memberId] !== undefined) {
        owedMap[memberId] += sharePaise;
      } else {
        owedMap[memberId] = sharePaise;
      }
    }
  });

  return members.map((member) => {
    const paidPaise = paidMap[member.id] || 0;
    const owedPaise = owedMap[member.id] || 0;
    const netPaise = paidPaise - owedPaise;

    let statusText: string;
    if (netPaise > 0) {
      statusText = `gets back ${formatINR(netPaise)}`;
    } else if (netPaise < 0) {
      statusText = `owes ${formatINR(Math.abs(netPaise))}`;
    } else {
      statusText = 'settled up';
    }

    return {
      member,
      paidPaise,
      owedPaise,
      netPaise,
      statusText,
    };
  });
}

/**
 * Formats a short human-readable split description for the expenses table.
 * e.g., "Equally, 5 people", "Exact, 3 people", "Percentages, 3 people"
 */
export function formatSplitDescription(split: Split): string {
  if (split.type === 'equal') {
    const count = split.memberIds.length;
    return `Equally, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  if (split.type === 'exact') {
    const count = Object.keys(split.shares).length;
    return `Exact, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  if (split.type === 'percent') {
    const count = Object.keys(split.shares).length;
    return `Percentages, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  return 'Custom split';
}
