import { describe, expect, it } from 'vitest';
import { validateExpenseForm, getTodayDateString } from './validation';
import { ExpenseFormData, Member } from '../types/trip';

describe('Expense Form Validation', () => {
  const members: Member[] = [
    { id: 'm1', name: 'Aarav' },
    { id: 'm2', name: 'Diya' },
    { id: 'm3', name: 'Kabir' },
  ];

  const validForm: ExpenseFormData = {
    description: 'Dinner at shack',
    amountRupees: '1500.00',
    paidBy: 'm1',
    date: getTodayDateString(),
    category: 'Food',
    splitType: 'equal',
    equalMemberIds: ['m1', 'm2', 'm3'],
    exactSharesRupees: {},
    percentShares: {},
  };

  it('validates a correct form successfully', () => {
    const res = validateExpenseForm(validForm, members);
    expect(res.isValid).toBe(true);
    expect(res.parsedAmountPaise).toBe(150000);
    expect(Object.keys(res.errors)).toHaveLength(0);
  });

  it('rejects description longer than 60 characters or empty', () => {
    const emptyDesc = { ...validForm, description: '   ' };
    expect(validateExpenseForm(emptyDesc, members).errors.description).toBe(
      'Description is required.'
    );

    const longDesc = { ...validForm, description: 'a'.repeat(61) };
    expect(validateExpenseForm(longDesc, members).errors.description).toBe(
      'Description must be at most 60 characters.'
    );
  });

  it('rejects negative amounts with exact message "Amount must be more than ₹0"', () => {
    const negAmount = { ...validForm, amountRupees: '-50' };
    const res = validateExpenseForm(negAmount, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.amount).toBe('Amount must be more than ₹0.');
  });

  it('rejects zero amount', () => {
    const zeroAmount = { ...validForm, amountRupees: '0' };
    const res = validateExpenseForm(zeroAmount, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.amount).toBe('Amount must be more than ₹0.');
  });

  it('rejects future date', () => {
    const futureDate = { ...validForm, date: '2099-12-31' };
    const res = validateExpenseForm(futureDate, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.date).toBe('The date cannot be in the future.');
  });

  it('validates equal split requires at least one member', () => {
    const noMembers = { ...validForm, equalMemberIds: [] };
    const res = validateExpenseForm(noMembers, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.split).toBe('Select at least one member for equal split.');
  });

  it('validates exact split sum matching total amount', () => {
    const exactForm: ExpenseFormData = {
      ...validForm,
      amountRupees: '100.00',
      splitType: 'exact',
      exactSharesRupees: {
        m1: '50.00',
        m2: '20.00',
        // missing 30.00
      },
    };
    const res = validateExpenseForm(exactForm, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.split).toContain('left to assign');
  });

  it('validates percentage split must equal 100%', () => {
    const percentForm: ExpenseFormData = {
      ...validForm,
      splitType: 'percent',
      percentShares: {
        m1: '50',
        m2: '40', // 90% total
      },
    };
    const res = validateExpenseForm(percentForm, members);
    expect(res.isValid).toBe(false);
    expect(res.errors.split).toContain('Percentages must equal exactly 100%');
  });
});
