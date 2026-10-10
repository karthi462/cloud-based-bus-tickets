import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  CheckCircle,
  X,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';

export const AdminPassengers: React.FC = () => {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Credit Limit Modal State
  const [editingPassenger, setEditingPassenger] = useState<any | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/passengers');
      if (res.success) {
        setPassengers(res.passengers || []);
      }
    } catch (err) {
      console.error('Failed to load passengers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (passenger: any) => {
    const nextStatus = passenger.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change ${passenger.fullName}'s status to ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/admin/passengers/${passenger.passengerId}/status`, {
        status: nextStatus,
      });
      if (res.success) {
        fetchPassengers();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleSaveCreditLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger) return;

    setIsUpdatingLimit(true);
    setModalMsg(null);

    try {
      const parsed = parseFloat(newCreditLimit);
      const res = await api.patch(`/admin/passengers/${editingPassenger.passengerId}/credit-limit`, {
        newLimit: parsed,
      });

      if (res.success) {
        setModalMsg('Credit limit updated successfully');
        setTimeout(() => {
          setEditingPassenger(null);
          fetchPassengers();
        }, 1000);
      } else {
        setModalMsg(res.message);
      }
    } catch (err: any) {
      setModalMsg(err.message || 'Failed to update credit limit');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const filtered = passengers.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.passengerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Passenger Accounts & Credit Limits</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage passenger identities, suspend accounts, and configure individual travel credit limits.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Passenger ID, Name, or Email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline-block">
          Total Registered: <strong>{passengers.length}</strong>
        </span>
      </div>

      {/* Passenger Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Passenger ID</th>
                <th className="py-3 px-4">Full Name & Contact</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Outstanding Credit</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Biometrics</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((p) => (
                <tr key={p.passengerId} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{p.passengerId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{p.fullName}</div>
                    <div className="text-[10px] text-slate-500">{p.email} | {p.mobileNumber}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">₹{p.walletBalance}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">₹{p.outstandingCredit}</td>
                  <td className="py-3 px-4 text-white">
                    <span className="font-semibold">₹{p.creditLimit}</span>
                    <button
                      onClick={() => {
                        setEditingPassenger(p);
                        setNewCreditLimit(p.creditLimit.toString());
                        setModalMsg(null);
                      }}
                      className="ml-2 text-purple-400 hover:text-purple-300 inline-flex items-center"
                      title="Edit Credit Limit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                        p.biometricEnrolled
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Fingerprint className="w-3 h-3 mr-1" />
                      {p.biometricEnrolled ? 'Enrolled' : 'None'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        p.status === 'ACTIVE'
                          ? 'border-rose-800 text-rose-400 hover:bg-rose-950/40'
                          : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                    >
                      {p.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Limit Modal */}
      {editingPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingPassenger(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Configure Credit Limit</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set max emergency travel credit for <strong>{editingPassenger.fullName}</strong> ({editingPassenger.passengerId}).
            </p>

            {modalMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 text-xs">
                {modalMsg}
              </div>
            )}

            <form onSubmit={handleSaveCreditLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Credit Limit (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={editingPassenger.outstandingCredit || 0}
                    max="1000"
                    required
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Cannot be lower than current outstanding: ₹{editingPassenger.outstandingCredit}
                </span>
              </div>

              <button
                type="submit"
                disabled={isUpdatingLimit}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-1.5"
              >
                {isUpdatingLimit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Credit Limit</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
