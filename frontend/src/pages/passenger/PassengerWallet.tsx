import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Wallet, WalletTransaction, WithdrawalRequest } from '../../types';
import {
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  X,
  RefreshCw,
} from 'lucide-react';

export const PassengerWallet: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [topUpMsg, setTopUpMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [bankDetails, setBankDetails] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const [detailsRes, withdrawRes] = await Promise.all([
        api.get('/wallet/details'),
        api.get('/wallet/withdrawals'),
      ]);

      if (detailsRes.success) {
        setWallet(detailsRes.wallet);
        setTransactions(detailsRes.recentTransactions || []);
      }
      if (withdrawRes.success) {
        setWithdrawals(withdrawRes.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to fetch wallet info', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpMsg(null);
    setIsProcessingTopUp(true);

    try {
      const parsed = parseFloat(topUpAmount);
      // Unique idempotency key to prevent double wallet credits
      const idempotencyKey = `TOPUP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const res = await api.post('/wallet/topup', {
        amount: parsed,
        paymentMethod: 'Simulated Payment Gateway (Demo)',
        idempotencyKey,
      });

      if (res.success) {
        setTopUpMsg({ text: res.message || 'Wallet top-up successful!', type: 'success' });
        setTimeout(() => {
          setShowTopUpModal(false);
          fetchWalletData();
        }, 1200);
      } else {
        setTopUpMsg({ text: res.message || 'Top-up failed', type: 'error' });
      }
    } catch (err: any) {
      setTopUpMsg({ text: err.message || 'Error processing payment order', type: 'error' });
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    setIsProcessingWithdraw(true);

    try {
      const parsed = parseFloat(withdrawAmount);
      const res = await api.post('/wallet/withdraw', {
        amount: parsed,
        bankDetails,
      });

      if (res.success) {
        setWithdrawMsg({ text: res.message || 'Withdrawal request submitted', type: 'success' });
        setTimeout(() => {
          setShowWithdrawModal(false);
          fetchWalletData();
        }, 1200);
      } else {
        setWithdrawMsg({ text: res.message || 'Withdrawal request rejected', type: 'error' });
      }
    } catch (err: any) {
      setWithdrawMsg({ text: err.message || 'Withdrawal error', type: 'error' });
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header and Balance Banner */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Transit Stored Value</span>
          <h1 className="text-3xl font-black text-white mt-1">Digital Wallet & Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditable double-entry transaction record. Never permits negative balances.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 min-w-48">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Available Funds</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-black text-white">₹{wallet?.balance ?? 0}</span>
              <span className="text-xs text-slate-400">INR</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTopUpAmount('100');
                setTopUpMsg(null);
                setShowTopUpModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Money</span>
            </button>
            <button
              onClick={() => {
                setWithdrawAmount('50');
                setWithdrawMsg(null);
                setShowWithdrawModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
            >
              <ArrowDownLeft className="w-4 h-4 text-rose-400" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Withdrawals Notification (if any) */}
      {withdrawals.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Withdrawal Requests Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {withdrawals.map((w) => (
              <div key={w.withdrawalId} className="p-3 rounded-lg bg-navy-900 border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">₹{w.amount}</span>
                  <span className="text-[10px] text-slate-500">{new Date(w.requestedAt).toLocaleDateString()}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    w.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : w.status === 'REJECTED'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Ledger Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Immutable Transaction Ledger</h2>
          <p className="text-xs text-slate-400">Complete audit history of wallet credits and fare debits</p>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Before</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">After</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'ADD_MONEY';
                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-300">{tx.transactionId}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCredit
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{tx.description}</td>
                      <td className="py-3 px-4 text-slate-400">₹{tx.balanceBefore}</td>
                      <td className={`py-3 px-4 font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">₹{tx.balanceAfter}</td>
                      <td className="py-3 px-4 text-emerald-400">{tx.status}</td>
                      <td className="py-3 px-4 text-slate-500 text-right">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-3">
              DEMO — Simulated Payment Gateway
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Add Money to Transit Wallet</h3>
            <p className="text-xs text-slate-400 mb-5">
              Secure development simulation. Simulates payment order and atomic wallet crediting.
            </p>

            {topUpMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  topUpMsg.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/80 border border-rose-800 text-rose-400'
                }`}
              >
                {topUpMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{topUpMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Amount (INR)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['50', '100', '200', '500'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopUpAmount(preset)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        topUpAmount === preset
                          ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Min ₹10, Max ₹5000 per transaction</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="text-white font-semibold">₹{wallet?.balance ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Balance After Top-up:</span>
                  <span className="text-cyan-400 font-bold">
                    ₹{(wallet?.balance ?? 0) + (parseFloat(topUpAmount) || 0)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingTopUp}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2"
              >
                {isProcessingTopUp && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isProcessingTopUp ? 'Simulating Payment...' : `Complete Top-up of ₹${topUpAmount}`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Request Funds Withdrawal</h3>
            <p className="text-xs text-slate-400 mb-5">
              Subject to transit authority refund & withdrawal policy. Funds must be verified by administrator before transfer.
            </p>

            {withdrawMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  withdrawMsg.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/80 border border-rose-800 text-rose-400'
                }`}
              >
                {withdrawMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{withdrawMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Withdrawal Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="50"
                    max={wallet?.balance || 50}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Available to withdraw: ₹{wallet?.balance ?? 0} (Min ₹50)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Account or UPI ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI: name@okaxis or A/C 987654321, IFSC HDFC0001"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingWithdraw || (wallet?.balance ?? 0) < parseFloat(withdrawAmount)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-2"
              >
                {isProcessingWithdraw && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isProcessingWithdraw ? 'Submitting Request...' : `Submit Withdrawal for ₹${withdrawAmount}`}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
