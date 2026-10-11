import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, PlusCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearLastAddedMessage, deleteExpense } from '../store/expensesSlice';
import { MemberBalances } from '../components/MemberBalances';
import { ExpenseTable } from '../components/ExpenseTable';

export const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members, expenses, lastAddedExpenseDescription } = useAppSelector(
    (state) => state.expenses
  );

  const handleDeleteExpense = (id: string) => {
    dispatch(deleteExpense(id));
  };

  const handleDismissAlert = () => {
    dispatch(clearLastAddedMessage());
  };

  return (
    <div className="space-y-6">
      {/* Success banner after adding an expense */}
      {lastAddedExpenseDescription && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">
              Expense <strong className="font-semibold">"{lastAddedExpenseDescription}"</strong> was added successfully!
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismissAlert}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Goa Trip Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Splitvilla stay, shacks, scuba dive & cab rides between Aarav, Diya, Kabir, Meera, and Rohan.
          </p>
        </div>

        <Link
          to="/expenses/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>Add New Expense</span>
        </Link>
      </div>

      {/* Balances Section */}
      <MemberBalances members={members} expenses={expenses} />

      {/* Expenses Table Section */}
      <ExpenseTable
        expenses={expenses}
        members={members}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};
