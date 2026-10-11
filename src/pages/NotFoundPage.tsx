import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        Page not found
      </h1>
      <p className="text-slate-500 mt-2 max-w-md text-sm">
        The page you are looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to Expenses</span>
      </Link>
    </div>
  );
};
