/**
 * Trip Splitter - Group Expense Tracker
 */

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { store } from './store';
import { Navbar } from './components/Navbar';
import { ExpensesPage } from './pages/ExpensesPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<ExpensesPage />} />
              <Route path="/expenses/new" element={<AddExpensePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                <strong>Trip Splitter</strong> — Goa Trip with Aarav, Diya, Kabir, Meera, and Rohan
              </p>
              <p className="font-mono text-slate-400">
                All calculations in exact integer paise (1 ₹ = 100 paise)
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </Provider>
  );
}
