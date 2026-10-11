import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, PlusCircle, ReceiptText, RotateCcw } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { resetToSampleData } from '../store/expensesSlice';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleReset = () => {
    if (window.confirm('Reset all expenses to the initial Goa trip sample data?')) {
      dispatch(resetToSampleData());
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Compass className="w-6 h-6 text-slate-950" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Trip Splitter
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Goa 🌴
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">
                Fair & paisa-perfect group expense tracker
              </p>
            </div>
          </div>

          {/* Navigation links & action */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <ReceiptText className="w-4 h-4" aria-hidden="true" />
                <span>Expenses</span>
              </NavLink>

              <NavLink
                to="/expenses/new"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                <span>Add Expense</span>
              </NavLink>
            </nav>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 transition-colors hidden md:flex items-center gap-1.5"
              title="Reset data to initial Goa trip sample"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
