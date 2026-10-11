import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  Expense,
  ExpenseCategory,
  ExpenseFormData,
  FormValidationErrors,
  Member,
  Split,
  SplitType,
} from '../types/trip';
import { formatINR, parseRupeesToPaise } from '../utils/money';
import { getTodayDateString, VALID_CATEGORIES, validateExpenseForm } from '../utils/validation';

interface ExpenseFormProps {
  members: Member[];
  onSave: (expense: Expense) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ members, onSave }) => {
  const navigate = useNavigate();

  // Initialize form state
  const [formData, setFormData] = useState<ExpenseFormData>(() => {
    // By default, select all members for equal split
    const allMemberIds = members.map((m) => m.id);
    const initialExact: Record<string, string> = {};
    const initialPercent: Record<string, string> = {};

    members.forEach((m) => {
      initialExact[m.id] = '';
      initialPercent[m.id] = '';
    });

    return {
      description: '',
      amountRupees: '',
      paidBy: members[0]?.id || '',
      date: getTodayDateString(),
      category: 'Food',
      splitType: 'equal',
      equalMemberIds: allMemberIds,
      exactSharesRupees: initialExact,
      percentShares: initialPercent,
    };
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Field change handlers
  const handleInputChange = (field: keyof ExpenseFormData, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (hasSubmitted) {
        // Re-validate on change once user has attempted submit
        const validation = validateExpenseForm(updated, members);
        setErrors(validation.errors);
      }
      return updated;
    });
  };

  const handleEqualMemberToggle = (memberId: string) => {
    setFormData((prev) => {
      const exists = prev.equalMemberIds.includes(memberId);
      const updatedIds = exists
        ? prev.equalMemberIds.filter((id) => id !== memberId)
        : [...prev.equalMemberIds, memberId];

      const updated = { ...prev, equalMemberIds: updatedIds };
      if (hasSubmitted) {
        const validation = validateExpenseForm(updated, members);
        setErrors(validation.errors);
      }
      return updated;
    });
  };

  const handleExactShareChange = (memberId: string, val: string) => {
    setFormData((prev) => {
      const updatedExact = { ...prev.exactSharesRupees, [memberId]: val };
      const updated = { ...prev, exactSharesRupees: updatedExact };
      if (hasSubmitted) {
        const validation = validateExpenseForm(updated, members);
        setErrors(validation.errors);
      }
      return updated;
    });
  };

  const handlePercentShareChange = (memberId: string, val: string) => {
    setFormData((prev) => {
      const updatedPercent = { ...prev.percentShares, [memberId]: val };
      const updated = { ...prev, percentShares: updatedPercent };
      if (hasSubmitted) {
        const validation = validateExpenseForm(updated, members);
        setErrors(validation.errors);
      }
      return updated;
    });
  };

  // Helper calculation for exact split progress
  const parsedAmountPaise = parseRupeesToPaise(formData.amountRupees) || 0;

  const currentExactAssignedPaise = Object.values(formData.exactSharesRupees).reduce(
    (sum, val) => {
      const p = parseRupeesToPaise(val);
      return sum + (p !== null && p > 0 ? p : 0);
    },
    0
  );

  const exactRemainingPaise = parsedAmountPaise - currentExactAssignedPaise;

  // Helper calculation for percent split progress
  const currentPercentTotal = Object.values(formData.percentShares).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) || num < 0 ? 0 : num);
  }, 0);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validation = validateExpenseForm(formData, members);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Construct Split object
    let split: Split;
    if (formData.splitType === 'equal') {
      split = {
        type: 'equal',
        memberIds: formData.equalMemberIds,
      };
    } else if (formData.splitType === 'exact') {
      const shares: Record<string, number> = {};
      members.forEach((m) => {
        const paise = parseRupeesToPaise(formData.exactSharesRupees[m.id] || '0') || 0;
        if (paise > 0) {
          shares[m.id] = paise;
        }
      });
      split = {
        type: 'exact',
        shares,
      };
    } else {
      const shares: Record<string, number> = {};
      members.forEach((m) => {
        const p = parseFloat(formData.percentShares[m.id] || '0');
        if (!isNaN(p) && p > 0) {
          shares[m.id] = p;
        }
      });
      split = {
        type: 'percent',
        shares,
      };
    }

    const newExpense: Expense = {
      id: 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      description: formData.description.trim(),
      amount: validation.parsedAmountPaise,
      paidBy: formData.paidBy,
      date: formData.date,
      category: formData.category as ExpenseCategory,
      split,
    };

    onSave(newExpense);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-7"
    >
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Add Trip Expense
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Record a shared expense and select how it should be split among the group.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Field */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="expense-description"
              className="block text-sm font-semibold text-slate-800"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {formData.description.length}/60 chars
            </span>
          </div>
          <input
            id="expense-description"
            type="text"
            maxLength={60}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="e.g. Villa booking, Beach shack dinner, Scuba session"
            aria-describedby={errors.description ? 'desc-error' : undefined}
            aria-invalid={!!errors.description}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
              errors.description
                ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                : 'border-slate-300 focus:ring-emerald-500 hover:border-slate-400'
            }`}
          />
          {errors.description && (
            <p
              id="desc-error"
              className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Amount in INR */}
        <div>
          <label
            htmlFor="expense-amount"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Amount in ₹ (up to 2 decimals) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
              ₹
            </div>
            <input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              value={formData.amountRupees}
              onChange={(e) => handleInputChange('amountRupees', e.target.value)}
              placeholder="e.g. 2400.00"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              aria-invalid={!!errors.amount}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-colors focus:outline-hidden focus:ring-2 ${
                errors.amount
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500 hover:border-slate-400'
              }`}
            />
          </div>
          {errors.amount && (
            <p
              id="amount-error"
              className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.amount}</span>
            </p>
          )}
        </div>

        {/* Paid by Member */}
        <div>
          <label
            htmlFor="expense-paid-by"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Paid by <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="expense-paid-by"
              value={formData.paidBy}
              onChange={(e) => handleInputChange('paidBy', e.target.value)}
              aria-describedby={errors.paidBy ? 'paidby-error' : undefined}
              aria-invalid={!!errors.paidBy}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm appearance-none bg-white transition-colors focus:outline-hidden focus:ring-2 cursor-pointer ${
                errors.paidBy
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500 hover:border-slate-400'
              }`}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          {errors.paidBy && (
            <p
              id="paidby-error"
              className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.paidBy}</span>
            </p>
          )}
        </div>

        {/* Date Field */}
        <div>
          <label
            htmlFor="expense-date"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="expense-date"
            type="date"
            max={getTodayDateString()}
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            aria-describedby={errors.date ? 'date-error' : undefined}
            aria-invalid={!!errors.date}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-hidden focus:ring-2 ${
              errors.date
                ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                : 'border-slate-300 focus:ring-emerald-500 hover:border-slate-400'
            }`}
          />
          {errors.date && (
            <p
              id="date-error"
              className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.date}</span>
            </p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <label
            htmlFor="expense-category"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="expense-category"
              value={formData.category}
              onChange={(e) =>
                handleInputChange('category', e.target.value as ExpenseCategory)
              }
              aria-describedby={errors.category ? 'cat-error' : undefined}
              aria-invalid={!!errors.category}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm appearance-none bg-white transition-colors focus:outline-hidden focus:ring-2 cursor-pointer ${
                errors.category
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500 hover:border-slate-400'
              }`}
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          {errors.category && (
            <p
              id="cat-error"
              className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>
      </div>

      {/* Split Section */}
      <fieldset className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 space-y-5">
        <legend className="px-2 text-sm font-bold text-slate-800">
          Split Expense <span className="text-red-500">*</span>
        </legend>

        {/* Split Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Select split type:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                type: 'equal' as SplitType,
                title: 'Equally',
                desc: 'Split among selected members',
              },
              {
                type: 'exact' as SplitType,
                title: 'Exact Amounts',
                desc: 'Enter ₹ amount for each',
              },
              {
                type: 'percent' as SplitType,
                title: 'Percentages',
                desc: 'Enter % for each member',
              },
            ].map((option) => (
              <label
                key={option.type}
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.splitType === option.type
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="splitType"
                    value={option.type}
                    checked={formData.splitType === option.type}
                    onChange={() => handleInputChange('splitType', option.type)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold">{option.title}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 pl-6">
                  {option.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Equal Split Selection */}
        {formData.splitType === 'equal' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Choose members who share this expense:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleInputChange(
                    'equalMemberIds',
                    formData.equalMemberIds.length === members.length
                      ? []
                      : members.map((m) => m.id)
                  )
                }
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                {formData.equalMemberIds.length === members.length
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {members.map((m) => {
                const isSelected = formData.equalMemberIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleEqualMemberToggle(m.id)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <span>{m.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Exact Split Inputs */}
        {formData.splitType === 'exact' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Enter amount in ₹ for each member:
              </span>
              {parsedAmountPaise > 0 && (
                <span
                  className={`font-semibold font-mono ${
                    exactRemainingPaise === 0
                      ? 'text-emerald-600'
                      : exactRemainingPaise > 0
                      ? 'text-amber-700'
                      : 'text-red-600'
                  }`}
                >
                  {exactRemainingPaise === 0
                    ? 'All assigned ✓'
                    : exactRemainingPaise > 0
                    ? `${formatINR(exactRemainingPaise)} left to assign`
                    : `${formatINR(Math.abs(exactRemainingPaise))} over assigned amount`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((m) => {
                const fieldError = errors.memberShares?.[m.id];
                return (
                  <div key={m.id} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor={`exact-${m.id}`}
                        className="text-xs font-semibold text-slate-800"
                      >
                        {m.name}
                      </label>
                      <span className="text-[11px] text-slate-400">in ₹</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                        ₹
                      </div>
                      <input
                        id={`exact-${m.id}`}
                        type="text"
                        inputMode="decimal"
                        value={formData.exactSharesRupees[m.id] || ''}
                        onChange={(e) => handleExactShareChange(m.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-6 pr-3 py-1.5 text-xs font-mono rounded-lg border transition-colors focus:outline-hidden focus:ring-2 ${
                          fieldError
                            ? 'border-red-400 bg-red-50/40 focus:ring-red-500'
                            : 'border-slate-300 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    {fieldError && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Percent Split Inputs */}
        {formData.splitType === 'percent' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Enter percentage share for each member:
              </span>
              <span
                className={`font-semibold font-mono ${
                  currentPercentTotal === 100
                    ? 'text-emerald-600'
                    : currentPercentTotal < 100
                    ? 'text-amber-700'
                    : 'text-red-600'
                }`}
              >
                Total: {currentPercentTotal.toFixed(2)}% / 100%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((m) => {
                const fieldError = errors.memberShares?.[m.id];
                return (
                  <div key={m.id} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor={`percent-${m.id}`}
                        className="text-xs font-semibold text-slate-800"
                      >
                        {m.name}
                      </label>
                      <span className="text-[11px] text-slate-400">%</span>
                    </div>
                    <div className="relative">
                      <input
                        id={`percent-${m.id}`}
                        type="text"
                        inputMode="decimal"
                        value={formData.percentShares[m.id] || ''}
                        onChange={(e) => handlePercentShareChange(m.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-3 pr-7 py-1.5 text-xs font-mono rounded-lg border transition-colors focus:outline-hidden focus:ring-2 ${
                          fieldError
                            ? 'border-red-400 bg-red-50/40 focus:ring-red-500'
                            : 'border-slate-300 focus:ring-emerald-500'
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                        %
                      </div>
                    </div>
                    {fieldError && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Split Error */}
        {errors.split && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errors.split}</span>
          </div>
        )}
      </fieldset>

      {/* Action Buttons: Save & Cancel */}
      <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-400 cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>Save Expense</span>
        </button>
      </div>
    </form>
  );
};
