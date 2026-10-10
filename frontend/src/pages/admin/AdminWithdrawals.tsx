import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { WithdrawalRequest } from '../../types';
import { ArrowDownLeft, CheckCircle, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

export const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedReq, setSelectedReq] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/wallet/withdrawals');
      if (res.success) {
        setWithdrawals(res.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to load withdrawals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setIsProcessing(true);
    setMsg(null);

    try {
      const res = await api.post(`/wallet/withdrawals/${selectedReq.withdrawalId}/process`, {
        action: actionType,
        reason,
      });

      if (res.success) {
        setMsg(`Withdrawal ${actionType === 'APPROVE' ? 'Approved' : 'Rejected'} successfully`);
        setTimeout(() => {
          setSelectedReq(null);
          fetchWithdrawals();
        }, 1000);
      }
    } catch (err: any) {
      alert(err.message || 'Processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white">Passenger Withdrawal Review</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review refund and withdrawal payout requests against passenger transit wallets.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        {withdrawals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No withdrawal requests on record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Passenger ID</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Payout Account / UPI</th>
                  <th className="py-3 px-4">Requested At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {withdrawals.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">{w.withdrawalId}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{w.passengerId}</td>
                    <td className="py-3.5 px-4 font-black text-white text-sm">₹{w.amount}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{w.bankDetails}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(w.requestedAt).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReq(w);
                              setActionType('APPROVE');
                              setReason('Approved and transferred to beneficiary bank account');
                              setMsg(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-700/50 text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReq(w);
                              setActionType('REJECT');
                              setReason('Rejected by administrator policy review');
                              setMsg(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-700/50 text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">{w.reviewedBy || 'Processed'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {actionType === 'APPROVE' ? 'Approve Withdrawal Request' : 'Reject Withdrawal Request'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Payout of <strong>₹{selectedReq.amount}</strong> to passenger {selectedReq.passengerId}.
            </p>

            {msg && (
              <div className="mb-4 p-3 rounded-xl bg-purple-950 text-purple-300 text-xs">
                {msg}
              </div>
            )}

            <form onSubmit={handleProcess} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Review Note / Audit Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-2.5 rounded-xl text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm {actionType === 'APPROVE' ? 'Approval & Wallet Deduction' : 'Rejection'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
