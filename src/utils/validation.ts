/**
 * Form validation functions for Trip Splitter.
 * Independent of React or UI components.
 */

import { ExpenseCategory, ExpenseFormData, FormValidationErrors, Member } from '../types/trip';
import { formatINR, parseRupeesToPaise } from './money';

const MAX_RUPEES = 1000000; // ₹10,00,000

/**
 * Returns today's local date in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const VALID_CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Stay', 'Activities', 'Other'];

export function validateExpenseForm(
  data: ExpenseFormData,
  members: Member[]
): {
  isValid: boolean;
  errors: FormValidationErrors;
  parsedAmountPaise: number;
} {
  const errors: FormValidationErrors = {};
  const memberShareErrors: Record<string, string> = {};

  // 1. Description: required, at most 60 characters
  const trimmedDesc = data.description.trim();
  if (!trimmedDesc) {
    errors.description = 'Description is required.';
  } else if (trimmedDesc.length > 60) {
    errors.description = 'Description must be at most 60 characters.';
  }

  // 2. Amount: required, > ₹0 and <= ₹10,00,000, max 2 decimals. Negative shows "Amount must be more than ₹0"
  let parsedAmountPaise = 0;
  const trimmedAmount = data.amountRupees.trim();
  if (!trimmedAmount) {
    errors.amount = 'Amount is required.';
  } else {
    // Check decimal places format
    const decimalMatch = /^-?\d+(\.\d+)?$/.test(trimmedAmount);
    if (!decimalMatch) {
      errors.amount = 'Please enter a valid amount.';
    } else {
      const parts = trimmedAmount.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        errors.amount = 'Amount can have at most 2 decimal places.';
      } else {
        const numRupees = parseFloat(trimmedAmount);
        if (numRupees <= 0) {
          errors.amount = 'Amount must be more than ₹0.';
        } else if (numRupees > MAX_RUPEES) {
          errors.amount = 'Amount cannot exceed ₹10,00,000.';
        } else {
          const paise = parseRupeesToPaise(trimmedAmount);
          if (paise === null || paise <= 0) {
            errors.amount = 'Amount must be more than ₹0.';
          } else {
            parsedAmountPaise = paise;
          }
        }
      }
    }
  }

  // 3. Paid by: required
  if (!data.paidBy || !members.some((m) => m.id === data.paidBy)) {
    errors.paidBy = 'Please select who paid for this expense.';
  }

  // 4. Date: required, cannot be in future
  if (!data.date) {
    errors.date = 'Date is required.';
  } else {
    const today = getTodayDateString();
    if (data.date > today) {
      errors.date = 'The date cannot be in the future.';
    }
  }

  // 5. Category: required
  if (!data.category || !VALID_CATEGORIES.includes(data.category as ExpenseCategory)) {
    errors.category = 'Please choose a category.';
  }

  // 6. Split validation based on splitType
  if (data.splitType === 'equal') {
    if (data.equalMemberIds.length === 0) {
      errors.split = 'Select at least one member for equal split.';
    }
  } else if (data.splitType === 'exact') {
    let assignedPaiseTotal = 0;
    let hasShareError = false;

    members.forEach((m) => {
      const rawVal = data.exactSharesRupees[m.id]?.trim() ?? '';
      if (rawVal === '') {
        // Unentered means 0
        return;
      }

      const match = /^-?\d+(\.\d+)?$/.test(rawVal);
      if (!match) {
        memberShareErrors[m.id] = 'Must be a valid number';
        hasShareError = true;
        return;
      }

      const parts = rawVal.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        memberShareErrors[m.id] = 'Max 2 decimals';
        hasShareError = true;
        return;
      }

      const num = parseFloat(rawVal);
      if (num < 0) {
        memberShareErrors[m.id] = 'Must be ₹0 or more';
        hasShareError = true;
        return;
      }

      const paise = parseRupeesToPaise(rawVal);
      if (paise !== null) {
        assignedPaiseTotal += paise;
      }
    });

    if (!hasShareError && parsedAmountPaise > 0) {
      const diff = parsedAmountPaise - assignedPaiseTotal;
      if (diff > 0) {
        errors.split = `${formatINR(diff)} left to assign.`;
      } else if (diff < 0) {
        errors.split = `${formatINR(Math.abs(diff))} over assigned amount.`;
      }
    }
  } else if (data.splitType === 'percent') {
    let percentSum = 0;
    let hasPercentError = false;

    members.forEach((m) => {
      const rawVal = data.percentShares[m.id]?.trim() ?? '';
      if (rawVal === '') {
        // Unentered means 0%
        return;
      }

      const match = /^-?\d+(\.\d+)?$/.test(rawVal);
      if (!match) {
        memberShareErrors[m.id] = 'Must be a valid number';
        hasPercentError = true;
        return;
      }

      const parts = rawVal.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        memberShareErrors[m.id] = 'Max 2 decimals';
        hasPercentError = true;
        return;
      }

      const num = parseFloat(rawVal);
      if (num < 0 || num > 100) {
        memberShareErrors[m.id] = 'Must be between 0 and 100';
        hasPercentError = true;
        return;
      }

      percentSum += Math.round(num * 100);
    });

    if (!hasPercentError) {
      // Sum must equal exactly 100.00% (10000 in hundredths)
      if (percentSum !== 10000) {
        const currentSum = (percentSum / 100).toFixed(2);
        errors.split = `Percentages must equal exactly 100% (currently ${currentSum}%).`;
      }
    }
  }

  if (Object.keys(memberShareErrors).length > 0) {
    errors.memberShares = memberShareErrors;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    parsedAmountPaise,
  };
}
