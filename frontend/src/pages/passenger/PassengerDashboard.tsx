import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Wallet, CreditAccount, Ticket } from '../../types';
import { DigitalTicketModal } from '../../components/DigitalTicketModal';
import {
  CreditCard,
  Zap,
  Fingerprint,
  QrCode,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Smartphone,
  Gauge,
  PlusCircle,
  MapPin,
} from 'lucide-react';

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [credit, setCredit] = useState<CreditAccount | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quickAmountNotice, setQuickAmountNotice] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [walletRes, creditRes, ticketsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/credit/account'),
        api.get('/tickets/my-tickets'),
      ]);

      if (walletRes.success) setWallet(walletRes.wallet);
      if (creditRes.success) setCredit(creditRes.creditAccount);
      if (ticketsRes.success) setTickets(ticketsRes.tickets || []);
    } catch (err) {
      console.error('Failed to load passenger dashboard data', err);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      const res = await api.post('/wallet/add-money', {
        amount,
        paymentReference: `UPI-QUICK-${Date.now()}`,
      });
      if (res.success) {
        setQuickAmountNotice(`₹${amount} added successfully via UPI!`);
        setTimeout(() => setQuickAmountNotice(''), 3000);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Quick top-up failed');
    }
  };

  const creditUsedPct = credit
    ? Math.min(100, Math.round((credit.outstandingCredit / credit.maxCreditLimit) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Background with Biometric Aurora glassmorphism */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none -z-10"
        style={{ backgroundImage: `url('/assets/backgrounds/biometric-aurora.jpg')` }}
      />

      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 via-slate-900/90 to-navy-900/90 backdrop-blur-xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>PASSENGER ID:</span>
            <strong className="text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              {user?.passengerId || 'CB-PASS-****'}
            </strong>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.fullName || 'Passenger'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aadhaar Smart Card & Biometric Transit Pass Active
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/passenger/track-bus"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Track Bus</span>
          </Link>
          <Link
            to="/passenger/wallet"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Transit Wallet</span>
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

      {quickAmountNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{quickAmountNotice}</span>
        </div>
      )}

      {/* Everyday Commuter Visual Cards: Aadhaar Smart Card + Emergency Fuel Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Aadhaar Smart Transit Card (Col span 2) */}
        <div className="lg:col-span-2 rounded-3xl p-7 bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          {/* Subtle holographic foil strip effect */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header: Indian Flag Strip + UIDAI / CloudBus Emblem */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Republic of India • Transit ID</span>
                <span className="text-sm font-black text-white tracking-wide">Aadhaar Smart Transit Pass</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>e-KYC Verified</span>
              </span>
            </div>
          </div>

          {/* Card Center: Chip & Masked Aadhaar */}
          <div className="my-3 flex items-center justify-between relative z-10">
            <div>
              <span className="text-[11px] text-slate-400 block">Aadhaar Linked Number</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest mt-0.5 block">
                {user?.aadhaarNumber ? user.aadhaarNumber : '5489 1234 1001'}
              </span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">{user?.fullName || 'Karthick Ramanathan'}</span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Live Transit Balance</span>
              <div className="flex items-baseline justify-end space-x-1">
                <span className="text-4xl font-black text-emerald-400">₹{wallet?.balance ?? 0}</span>
                <span className="text-xs text-slate-400 font-mono">INR</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-medium mt-0.5 block">Touch thumb on bus scanner to ride</span>
            </div>
          </div>

          {/* 1-Click Quick Recharge Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Tap UPI Recharge:</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuickAdd(50)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition"
              >
                +₹50
              </button>
              <button
                onClick={() => handleQuickAdd(100)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition"
              >
                +₹100
              </button>
              <button
                onClick={() => handleQuickAdd(200)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition"
              >
                +₹200
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Emergency Travel Credit Fuel Gauge (Col span 1) */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-navy-900 to-slate-900 border border-amber-800/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Emergency Travel Credit</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">₹200 Max Safety Net</span>
            </div>

            {/* Visual Fuel Gauge Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center my-2 space-y-2">
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Commuter Safety Meter</span>
              </div>
              <div className="text-3xl font-black text-white">
                ₹{credit?.availableCredit ?? 200}{' '}
                <span className="text-xs text-emerald-400 font-bold">Available</span>
              </div>
              
              {/* Traffic light bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    creditUsedPct > 80 ? 'bg-rose-500' : creditUsedPct > 40 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${100 - creditUsedPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Used: <strong className="text-amber-400">₹{credit?.outstandingCredit ?? 0}</strong></span>
                <span>Buffer: <strong className="text-emerald-400">{100 - creditUsedPct}%</strong></span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal mt-2">
              If your wallet ever runs dry, CloudBus automatically advances up to ₹200 so you are never left stranded.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link to="/passenger/credit" className="text-amber-400 hover:underline font-semibold flex items-center">
              <span>Repay or Adjust Buffer</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Journeys / Tickets */}
      <div className="p-6 rounded-2xl bg-navy-900/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Journeys & Digital Passes</h2>
            <p className="text-xs text-slate-400">Verifiable tickets issued via biometric bus touch</p>
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
              Board any bus and touch your finger on the conductor's scanner to automatically generate your QR ticket pass.
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
