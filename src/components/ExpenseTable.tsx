import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Filter,
  Receipt,
  Trash2,
  User,
  PieChart,
  Inbox,
} from 'lucide-react';
import { Expense, ExpenseCategory, Member } from '../types/trip';
import { formatINR } from '../utils/money';
import { formatSplitDescription } from '../utils/splits';
import { VALID_CATEGORIES } from '../utils/validation';
import { ConfirmDialog } from './ConfirmDialog';

interface ExpenseTableProps {
  expenses: Expense[];
  members: Member[];
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  members,
  onDeleteExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Map member id to member name
  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [members]);

  // Sort newest date first, filter by category
  const filteredExpenses = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    if (selectedCategory === 'ALL') {
      return sorted;
    }
    return sorted.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  // Total of expenses currently shown
  const currentTotalPaise = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const getCategoryBadgeClass = (category: ExpenseCategory) => {
    switch (category) {
      case 'Food':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Travel':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Stay':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Activities':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Toolbar & Category Filter */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-base">
            <Receipt className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>Recorded Expenses</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-1">
              {filteredExpenses.length}
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="category-filter"
              className="text-xs font-medium text-slate-500 flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Category:</span>
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total of currently shown expenses */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-sm font-medium self-start md:self-auto">
          <span className="text-emerald-700 text-xs">Total shown:</span>
          <strong className="font-semibold text-emerald-950 font-mono">
            {formatINR(currentTotalPaise)}
          </strong>
        </div>
      </div>

      {/* Empty State */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No expenses found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            {selectedCategory === 'ALL'
              ? 'No expenses have been added to this trip yet. Click "Add Expense" to get started!'
              : `There are currently no expenses in the "${selectedCategory}" category.`}
          </p>
          {selectedCategory !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              Show all categories
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">
                    Date
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Description
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Category
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Paid by
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Split
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Amount
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((expense) => {
                  const payerName = memberMap.get(expense.paidBy) || expense.paidBy;
                  const splitDescription = formatSplitDescription(expense.split);

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {expense.date}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {expense.description}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getCategoryBadgeClass(
                            expense.category
                          )}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                        {payerName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {splitDescription}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-semibold text-slate-900 font-mono">
                        {formatINR(expense.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(expense)}
                          aria-label={`Delete expense: ${expense.description}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (for screen width down to 360px) */}
          <div className="md:hidden divide-y divide-slate-200 border-t border-slate-200">
            {filteredExpenses.map((expense) => {
              const payerName = memberMap.get(expense.paidBy) || expense.paidBy;
              const splitDescription = formatSplitDescription(expense.split);

              return (
                <div key={`card-${expense.id}`} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {expense.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          {expense.date}
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeClass(
                            expense.category
                          )}`}
                        >
                          {expense.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono text-base">
                        {formatINR(expense.amount)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpenseToDelete(expense)}
                        aria-label={`Delete expense: ${expense.description}`}
                        className="mt-1 text-slate-400 hover:text-red-600 p-1 text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>
                        Paid by: <strong className="text-slate-800">{payerName}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{splitDescription}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={expenseToDelete !== null}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.description}" (${
          expenseToDelete ? formatINR(expenseToDelete.amount) : ''
        })? This will immediately recalculate all member balances.`}
        confirmLabel="Delete Expense"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
