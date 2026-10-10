import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white">403 Forbidden</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Restricted Access Module</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        Your authenticated user role does not possess permissions to access this administrative or operational area.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Permitted Portal</span>
      </Link>
    </div>
  );
};
