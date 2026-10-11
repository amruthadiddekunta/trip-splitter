/**
 * Core type definitions for Trip Splitter.
 */

export type ExpenseCategory = 'Food' | 'Travel' | 'Stay' | 'Activities' | 'Other';

export interface Member {
  id: string;
  name: string;
}

export type SplitType = 'equal' | 'exact' | 'percent';

export interface EqualSplit {
  type: 'equal';
  memberIds: string[];
}

export interface ExactSplit {
  type: 'exact';
  /** Member ID to share in paise (integer) */
  shares: Record<string, number>;
}

export interface PercentSplit {
  type: 'percent';
  /** Member ID to percentage value (e.g. 33.33, 50) */
  shares: Record<string, number>;
}

export type Split = EqualSplit | ExactSplit | PercentSplit;

export interface Expense {
  id: string;
  description: string;
  /** Amount in paise (e.g., ₹1,250.50 is 125050) */
  amount: number;
  paidBy: string;
  /** ISO Date format YYYY-MM-DD */
  date: string;
  category: ExpenseCategory;
  split: Split;
}

export interface MemberBalance {
  member: Member;
  paidPaise: number;
  owedPaise: number;
  netPaise: number;
  statusText: string;
}

export interface ExpenseFormData {
  description: string;
  amountRupees: string;
  paidBy: string;
  date: string;
  category: ExpenseCategory | '';
  splitType: SplitType;
  equalMemberIds: string[];
  exactSharesRupees: Record<string, string>;
  percentShares: Record<string, string>;
}

export interface FormValidationErrors {
  description?: string;
  amount?: string;
  paidBy?: string;
  date?: string;
  category?: string;
  split?: string;
  memberShares?: Record<string, string>;
}
