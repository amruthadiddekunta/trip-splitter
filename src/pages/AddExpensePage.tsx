import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addExpense } from '../store/expensesSlice';
import { ExpenseForm } from '../components/ExpenseForm';
import { Expense } from '../types/trip';

export const AddExpensePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const members = useAppSelector((state) => state.expenses.members);

  const handleSave = (expense: Expense) => {
    dispatch(addExpense(expense));
    // Takes user to Expenses with message that it was added
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ExpenseForm members={members} onSave={handleSave} />
    </div>
  );
};
