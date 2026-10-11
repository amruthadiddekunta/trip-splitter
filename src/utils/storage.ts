/**
 * LocalStorage synchronization utilities for Trip Splitter.
 */

import sampleData from '../data/sample-data.json';
import { Expense, Member } from '../types/trip';

const STORAGE_KEY_EXPENSES = 'trip_splitter_expenses_v1';
const STORAGE_KEY_MEMBERS = 'trip_splitter_members_v1';

export function loadInitialData(): { members: Member[]; expenses: Expense[] } {
  try {
    const rawExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const rawMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);

    const members: Member[] = rawMembers
      ? (JSON.parse(rawMembers) as Member[])
      : (sampleData.members as Member[]);

    const expenses: Expense[] = rawExpenses
      ? (JSON.parse(rawExpenses) as Expense[])
      : (sampleData.expenses as Expense[]);

    return { members, expenses };
  } catch {
    // If parsing fails or localStorage is disabled, fallback cleanly to sample data
    return {
      members: sampleData.members as Member[],
      expenses: sampleData.expenses as Expense[],
    };
  }
}

export function saveExpensesToStorage(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses to localStorage', error);
  }
}

export function saveMembersToStorage(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (error) {
    console.error('Failed to save members to localStorage', error);
  }
}
