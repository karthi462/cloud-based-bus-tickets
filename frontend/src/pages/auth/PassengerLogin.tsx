import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Bus, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const PassengerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login/passenger', { email, password });
      if (res.success && res.token) {
        login(res.token, res.user);
        navigate('/passenger');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate passenger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (type: 'FUNDED' | 'EMERGENCY' | 'NEARLIMIT') => {
    if (type === 'FUNDED') {
      setEmail('passenger@cloudbus.com');
      setPassword('pass123');
    } else if (type === 'EMERGENCY') {
      setEmail('emergency@cloudbus.com');
      setPassword('pass123');
    } else {
      setEmail('nearlimit@cloudbus.com');
      setPassword('pass123');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bus className="w-7 h-7 text-white" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-black text-white">Passenger Sign In</h2>
        <p className="mt-1 text-xs text-slate-400">Access your digital transit wallet and journey passes</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-navy-900 py-8 px-6 sm:px-10 border border-slate-800 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. passenger@cloudbus.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
              Quick Test Autofill
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('FUNDED')}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 truncate"
              >
                ₹100 Wallet
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('EMERGENCY')}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 truncate"
              >
                ₹0 Emergency
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('NEARLIMIT')}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-rose-300 border border-slate-700 truncate"
              >
                ₹190 Limit
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            New passenger?{' '}
            <Link to="/passenger/register" className="text-cyan-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
