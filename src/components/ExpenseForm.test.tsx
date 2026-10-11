import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ExpenseForm } from './ExpenseForm';
import { Member } from '../types/trip';

const mockMembers: Member[] = [
  { id: 'm1', name: 'Aarav' },
  { id: 'm2', name: 'Diya' },
  { id: 'm3', name: 'Kabir' },
];

describe('ExpenseForm component', () => {
  it('displays validation errors when saving with empty required fields', () => {
    const handleSave = vi.fn();

    render(
      <BrowserRouter>
        <ExpenseForm members={mockMembers} onSave={handleSave} />
      </BrowserRouter>
    );

    const saveButton = screen.getByRole('button', { name: /save expense/i });
    fireEvent.click(saveButton);

    // Shows errors for required fields
    expect(screen.getByText(/description is required/i)).toBeDefined();
    expect(screen.getByText(/amount is required/i)).toBeDefined();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('shows error when amount is negative', () => {
    const handleSave = vi.fn();

    render(
      <BrowserRouter>
        <ExpenseForm members={mockMembers} onSave={handleSave} />
      </BrowserRouter>
    );

    const descInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount in ₹/i);
    const saveButton = screen.getByRole('button', { name: /save expense/i });

    fireEvent.change(descInput, { target: { value: 'Snacks' } });
    fireEvent.change(amountInput, { target: { value: '-150' } });
    fireEvent.click(saveButton);

    expect(screen.getByText(/amount must be more than ₹0/i)).toBeDefined();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('submits valid form and calls onSave with proper expense payload', () => {
    const handleSave = vi.fn();

    render(
      <BrowserRouter>
        <ExpenseForm members={mockMembers} onSave={handleSave} />
      </BrowserRouter>
    );

    const descInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount in ₹/i);
    const saveButton = screen.getByRole('button', { name: /save expense/i });

    fireEvent.change(descInput, { target: { value: 'Goa Shack Lunch' } });
    fireEvent.change(amountInput, { target: { value: '1500.50' } });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedExpense = handleSave.mock.calls[0][0];
    expect(savedExpense.description).toBe('Goa Shack Lunch');
    expect(savedExpense.amount).toBe(150050); // ₹1,500.50 in paise
    expect(savedExpense.split.type).toBe('equal');
  });
});
