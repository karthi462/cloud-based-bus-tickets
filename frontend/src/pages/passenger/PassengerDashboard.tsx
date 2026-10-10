import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Wallet, CreditAccount, Ticket, WalletTransaction } from '../../types';
import { DigitalTicketModal } from '../../components/DigitalTicketModal';
import {
  CreditCard,
  Zap,
  Fingerprint,
  QrCode,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [credit, setCredit] = useState<CreditAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, ticketsRes] = await Promise.all([
        api.get('/wallet/details'),
        api.get('/tickets'),
      ]);

      if (walletRes.success) {
        setWallet(walletRes.wallet);
        setCredit(walletRes.creditAccount);
        setTransactions(walletRes.recentTransactions || []);
      }
      if (ticketsRes.success) {
        setTickets(ticketsRes.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load passenger dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  const creditUsedPct = credit
    ? Math.min(100, Math.round((credit.outstandingCredit / credit.maxCreditLimit) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>PASSENGER ID:</span>
            <strong className="text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              {user?.passengerId || 'CB-PASS-****'}
            </strong>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.fullName || 'Passenger'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Smart transit card & biometric fare pass active across metropolitan transit network.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/passenger/wallet"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Top Up Wallet</span>
          </Link>
          <Link
            to="/passenger/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>Biometric Setup</span>
          </Link>
        </div>
      </div>

      {/* KPI Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Digital Transit Wallet</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800/60">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white">₹{wallet?.balance ?? 0}</span>
            <span className="text-xs text-slate-400">INR</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Deducted automatically during bus ticket generation.</p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link to="/passenger/wallet" className="text-cyan-400 hover:underline font-semibold flex items-center">
              <span>Manage Wallet</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <span className="text-emerald-400 font-medium">Ready for travel</span>
          </div>
        </div>

        {/* Emergency Travel Credit Card */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Travel Credit</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400 border border-amber-800/60">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-white">₹{credit?.outstandingCredit ?? 0}</span>
              <span className="text-xs text-slate-400 ml-1">Owed</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-amber-400 font-bold">₹{credit?.availableCredit ?? 200}</span>
              <span className="text-[10px] text-slate-500 block">Available of ₹{credit?.maxCreditLimit ?? 200}</span>
            </div>
          </div>

          {/* Progress bar of credit usage */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                creditUsedPct > 80 ? 'bg-rose-500' : creditUsedPct > 40 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${creditUsedPct}%` }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link to="/passenger/credit" className="text-amber-400 hover:underline font-semibold flex items-center">
              <span>Repay or View Limit</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <span className="text-slate-400 text-[11px]">{100 - creditUsedPct}% limit buffer</span>
          </div>
        </div>

        {/* Biometric Status Card */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Biometric Verification</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 border border-purple-800/60">
              <Fingerprint className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">
              {user?.biometricEnrolled ? 'Enrolled & Active' : 'Pending Enrolment'}
            </span>
            {user?.biometricEnrolled ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <p className="text-xs text-slate-400 mt-2">
            WebAuthn Passkey + Classroom Demo Fingerprint enabled for touch-to-board ticketing.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link to="/passenger/profile" className="text-purple-400 hover:underline font-semibold flex items-center">
              <span>Security Settings</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <span className="text-cyan-400 text-[11px] font-mono">FIDO2 / WebAuthn</span>
          </div>
        </div>
      </div>

      {/* Recent Journeys / Tickets */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Journeys & Digital Passes</h2>
            <p className="text-xs text-slate-400">Verifiable tickets issued on operating fleet buses</p>
          </div>
          <Link
            to="/passenger/tickets"
            className="text-xs text-cyan-400 hover:underline font-semibold flex items-center"
          >
            <span>View All Tickets ({tickets.length})</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <QrCode className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No tickets generated yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Board any CloudBus and authenticate via biometric touch with the conductor to receive your digital QR pass.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Route & Stops</th>
                  <th className="py-3 px-4">Bus / Conductor</th>
                  <th className="py-3 px-4">Fare</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tickets.slice(0, 5).map((t) => (
                  <tr key={t.ticketId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{t.ticketId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {t.boardingStopName} → {t.destinationStopName}
                      </div>
                      <div className="text-[11px] text-cyan-400 font-medium">{t.routeName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>Bus: <strong className="text-white font-mono">{t.busNumber}</strong></div>
                      <div className="text-[10px] text-slate-500">Cond: {t.conductorEmployeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{t.fare}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.paymentMethod === 'TRAVEL_CREDIT'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {t.paymentMethod === 'TRAVEL_CREDIT' ? 'Credit' : 'Wallet'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'VALIDATED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700/50 text-[11px] font-semibold transition"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <DigitalTicketModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
};
