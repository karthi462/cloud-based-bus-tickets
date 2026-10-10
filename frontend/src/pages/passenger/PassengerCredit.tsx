import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { CreditAccount, Wallet } from '../../types';
import { Zap, CheckCircle, AlertCircle, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react';

export const PassengerCredit: React.FC = () => {
  const [credit, setCredit] = useState<CreditAccount | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [isRepaying, setIsRepaying] = useState<boolean>(false);
  const [repayMsg, setRepayMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/wallet/details');
      if (res.success) {
        setCredit(res.creditAccount);
        setWallet(res.wallet);
        if (res.creditAccount && res.creditAccount.outstandingCredit > 0) {
          setRepayAmount(res.creditAccount.outstandingCredit.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load credit details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepayMsg(null);
    setIsRepaying(true);

    try {
      const parsed = parseFloat(repayAmount);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('Please enter a valid repayment amount');
      }

      const res = await api.post('/wallet/credit/repay', {
        amount: parsed,
        source: 'WALLET',
      });

      if (res.success) {
        setRepayMsg({ text: res.message || 'Credit repaid successfully!', type: 'success' });
        fetchData();
      } else {
        setRepayMsg({ text: res.message || 'Repayment failed', type: 'error' });
      }
    } catch (err: any) {
      setRepayMsg({ text: err.message || 'Error processing credit repayment', type: 'error' });
    } finally {
      setIsRepaying(false);
    }
  };

  const outstanding = credit?.outstandingCredit ?? 0;
  const maxLimit = credit?.maxCreditLimit ?? 200;
  const available = credit?.availableCredit ?? (maxLimit - outstanding);
  const usedPct = Math.min(100, Math.round((outstanding / maxLimit) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>Internal Emergency Travel Credit Mechanism</span>
        </div>
        <h1 className="text-3xl font-black text-white">Emergency Travel Credit</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          A safety net for commuters: If your wallet runs out of funds, CloudBus extends automated travel credit up to ₹{maxLimit} without disruption to your journey.
        </p>
      </div>

      {/* Credit Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outstanding Credit Owed */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Outstanding Credit
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400">₹{outstanding}</span>
            <span className="text-xs text-slate-400">INR Owed</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {outstanding === 0 ? 'No credit owed. All travel settled.' : 'Due upon next wallet top-up.'}
          </span>
        </div>

        {/* Remaining Credit Eligibility */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Remaining Eligibility
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400">₹{available}</span>
            <span className="text-xs text-slate-400">of ₹{maxLimit} Limit</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Available buffer for zero-balance journeys.
          </span>
        </div>

        {/* Account Credit Status */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Credit Account Status
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-black text-white">{credit?.status || 'ACTIVE'}</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs text-cyan-400 mt-2 block">
            Zero interest policy applied.
          </span>
        </div>
      </div>

      {/* Usage Meter */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Emergency Credit Buffer Used: {usedPct}%</span>
          <span className="text-slate-400 font-mono">₹{outstanding} / ₹{maxLimit}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              usedPct >= 90 ? 'bg-rose-500' : usedPct >= 50 ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Notice: Transactions that would push outstanding credit beyond ₹{maxLimit} are automatically rejected.
        </p>
      </div>

      {/* Repayment Module */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Repay Outstanding Credit</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deducts from your available wallet balance (Current Balance: ₹{wallet?.balance ?? 0}) to restore credit limit buffer.
          </p>
        </div>

        {repayMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              repayMsg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                : 'bg-rose-950/80 border border-rose-800 text-rose-400'
            }`}
          >
            {repayMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{repayMsg.text}</span>
          </div>
        )}

        {outstanding === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <strong className="text-white block">No Outstanding Balance</strong>
              You have settled all previous travel credits. Your full ₹{maxLimit} credit limit is available if needed.
            </div>
          </div>
        ) : (
          <form onSubmit={handleRepay} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Repayment Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  max={outstanding}
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Maximum to settle: ₹{outstanding}</span>
            </div>

            <button
              type="submit"
              disabled={isRepaying || (wallet?.balance ?? 0) < parseFloat(repayAmount || '0')}
              className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition flex items-center space-x-2"
            >
              {isRepaying && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {(wallet?.balance ?? 0) < parseFloat(repayAmount || '0')
                  ? 'Insufficient Wallet Balance (Please Top Up First)'
                  : `Repay ₹${repayAmount || 0} from Wallet`}
              </span>
            </button>
          </form>
        )}

        {/* Academic Policy Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Academic Credit Policy Governance</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Emergency travel credit is strictly an internal transport concession to guarantee passenger mobility during emergencies. No commercial bank loan or interest is involved. Once outstanding credit reaches ₹{maxLimit}, additional travel requires prior balance repayment.
          </p>
        </div>
      </div>
    </div>
  );
};
