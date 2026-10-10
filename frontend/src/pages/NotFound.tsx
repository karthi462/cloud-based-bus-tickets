import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
        <Bus className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Transit Stop Not Found</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The destination or transit module you requested does not exist on the CloudBus network.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Main Terminal</span>
      </Link>
    </div>
  );
};
