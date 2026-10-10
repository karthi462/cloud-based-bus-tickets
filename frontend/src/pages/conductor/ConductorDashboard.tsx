import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types';
import { DigitalTicketModal } from '../../components/DigitalTicketModal';
import {
  Bus,
  BadgeCheck,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ConductorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [context, setContext] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConductorData();
  }, []);

  const fetchConductorData = async () => {
    setIsLoading(true);
    try {
      const [ctxRes, tktRes] = await Promise.all([
        api.get('/conductor/context'),
        api.get('/tickets'),
      ]);

      if (ctxRes.success) setContext(ctxRes);
      if (tktRes.success) setTickets(tktRes.tickets || []);
    } catch (err) {
      console.error('Failed to load conductor operational data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const todayTickets = tickets.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return t.issuedAt.startsWith(today);
  });

  const shiftRevenue = todayTickets.reduce((sum, t) => sum + t.fare, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Conductor Dispatch Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <BadgeCheck className="w-4 h-4" />
            <span>OPERATING CREW:</span>
            <strong className="text-white px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
              {user?.employeeId || 'CB-EMP-****'}
            </strong>
          </div>
          <h1 className="text-2xl font-black text-white">Conductor Operations Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fleet ticketing console with biometric verification and cryptographic QR pass validation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/conductor/generate-ticket"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Ticket</span>
          </Link>
          <Link
            to="/conductor/validate-ticket"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Validate Ticket</span>
          </Link>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Equipment</span>
          <div className="text-lg font-bold text-white font-mono">
            {context?.conductor?.assignedBusId || 'KA-01-F-4022'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Route: {context?.conductor?.assignedRouteId || 'R-101'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tickets Issued Today</span>
          <div className="text-2xl font-black text-amber-400">{todayTickets.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Active on this shift</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Shift Fare Volume</span>
          <div className="text-2xl font-black text-emerald-400">₹{shiftRevenue}</div>
          <span className="text-xs text-slate-400 mt-1 block">Collected via wallet & credit</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Terminal Status</span>
          <div className="flex items-center space-x-1.5 mt-1 text-emerald-400 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE & SYNCED</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cloud API Gateway linked</span>
        </div>
      </div>

      {/* Recent Issued Tickets */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Tickets Issued by Conductor</h2>
            <p className="text-xs text-slate-400">Real-time transit passes generated on current vehicle</p>
          </div>
          <Link
            to="/conductor/generate-ticket"
            className="text-xs text-amber-400 hover:underline font-semibold flex items-center"
          >
            <span>Open Ticketing Terminal</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No tickets issued yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Stops</th>
                  <th className="py-3 px-4">Fare</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tickets.slice(0, 6).map((t) => (
                  <tr key={t.ticketId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{t.ticketId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{t.passengerName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{t.passengerId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.boardingStopName} → {t.destinationStopName}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">₹{t.fare}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.paymentMethod === 'TRAVEL_CREDIT'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {t.paymentMethod === 'TRAVEL_CREDIT' ? 'Credit' : 'Wallet'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'VALIDATED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-700/50 text-[11px] font-semibold transition"
                      >
                        Inspect QR
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
