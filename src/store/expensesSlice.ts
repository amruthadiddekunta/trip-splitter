/**
 * Redux Toolkit slice for managing trip members and expenses.
 * Reducers are strictly pure functions with zero side effects.
 * Persistence to localStorage is handled outside reducers via listener middleware.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import sampleData from '../data/sample-data.json';
import { Expense, Member } from '../types/trip';
import { loadInitialData } from '../utils/storage';

export interface ExpensesState {
  members: Member[];
  expenses: Expense[];
  lastAddedExpenseDescription: string | null;
}

const initialData = loadInitialData();

const initialState: ExpensesState = {
  members: initialData.members,
  expenses: initialData.expenses,
  lastAddedExpenseDescription: null,
};

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
      state.lastAddedExpenseDescription = action.payload.description;
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((expense) => expense.id !== action.payload);
    },
    clearLastAddedMessage: (state) => {
      state.lastAddedExpenseDescription = null;
    },
    resetToSampleData: (state) => {
      state.members = sampleData.members as Member[];
      state.expenses = sampleData.expenses as Expense[];
      state.lastAddedExpenseDescription = null;
    },
  },
});

export const { addExpense, deleteExpense, clearLastAddedMessage, resetToSampleData } =
  expensesSlice.actions;

export default expensesSlice.reducer;
