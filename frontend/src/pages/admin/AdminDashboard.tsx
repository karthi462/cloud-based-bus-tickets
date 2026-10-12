import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  Bus,
  BadgeCheck,
  TrendingUp,
  CreditCard,
  Zap,
  ShieldAlert,
  ArrowDownLeft,
  ChevronRight,
  Shield,
  Layers,
  FileText,
  DollarSign,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = analytics?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-purple-950/40 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>CLOUD TRANSIT AUTHORITY</span>
          </div>
          <h1 className="text-3xl font-black text-white">System Administration Console</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, role-based access control, fleet allocations & financial ledger auditing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/passengers"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Passengers
          </Link>
          <Link
            to="/admin/employees"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Fleet & Crew
          </Link>
          <Link
            to="/admin/fare-rules"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Fare Rules
          </Link>
          <Link
            to="/admin/withdrawals"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Withdrawals
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Audit Logs
          </Link>
          <Link
            to="/admin/cloud-health"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cloud Health</span>
          </Link>
        </div>
      </div>

      {/* KPI 8-Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Total Passengers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.totalRegisteredPassengers ?? 0}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered in cloud registry</span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Active Fleet</span>
            <Bus className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.activeBuses ?? 0} <span className="text-xs font-normal text-slate-500">Buses</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {metrics?.activeConductors ?? 0} Conductors on Duty
          </span>
        </div>

        {/* Metric 3: Ticket Revenue (strictly distinguished from wallet top-ups!) */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Total Ticket Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{metrics?.totalTicketRevenue ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            ₹{metrics?.todayTicketRevenue ?? 0} issued today
          </span>
        </div>

        {/* Metric 4: Wallet Top-ups */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Wallet Top-ups</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">
            ₹{metrics?.totalWalletTopUps ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Stored-value float</span>
        </div>

        {/* Metric 5: Outstanding Travel Credit */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Outstanding Credit</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            ₹{metrics?.totalOutstandingCredit ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Simulated credit owed</span>
        </div>

        {/* Metric 6: Tickets Generated Today */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Passes Today</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.ticketsGeneratedToday ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {metrics?.totalTicketsGenerated ?? 0} all-time passes
          </span>
        </div>

        {/* Metric 7: Pending Withdrawals */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Pending Withdrawals</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {metrics?.pendingWithdrawalsCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Awaiting admin review</span>
        </div>

        {/* Metric 8: Failed Auth Attempts */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase font-bold">Failed Auth Attempts</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.failedAuthAttempts ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Recorded in security log</span>
        </div>
      </div>

      {/* Recent Ticketing Activity Feed */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Live System Transit Feed</h2>
            <p className="text-xs text-slate-400">Stream of recently issued digital passenger passes</p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-purple-400 hover:underline font-semibold flex items-center">
            <span>View Full Audit Log</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {(!analytics?.recentTicketingActivity || analytics.recentTicketingActivity.length === 0) ? (
          <div className="py-10 text-center text-xs text-slate-500">No ticketing activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Journey</th>
                  <th className="py-3 px-4">Bus & Conductor</th>
                  <th className="py-3 px-4">Fare</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {analytics.recentTicketingActivity.map((t: any) => (
                  <tr key={t.ticketId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{t.ticketId}</td>
                    <td className="py-3 px-4 text-slate-200">
                      <div>{t.passengerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t.passengerId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.boardingStopName} → {t.destinationStopName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-mono text-white">{t.busNumber}</span> ({t.conductorEmployeeId})
                    </td>
                    <td className="py-3 px-4 font-black text-white">₹{t.fare}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.paymentMethod === 'TRAVEL_CREDIT'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-right">
                      {new Date(t.issuedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
