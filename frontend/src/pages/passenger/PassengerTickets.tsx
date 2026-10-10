import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Ticket } from '../../types';
import { DigitalTicketModal } from '../../components/DigitalTicketModal';
import { QrCode, Search, Filter, Bus, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const PassengerTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tickets');
      if (res.success) {
        setTickets(res.tickets || []);
        setFilteredTickets(res.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...tickets];

    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(term) ||
          t.routeName.toLowerCase().includes(term) ||
          t.boardingStopName.toLowerCase().includes(term) ||
          t.destinationStopName.toLowerCase().includes(term) ||
          t.busNumber.toLowerCase().includes(term)
      );
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, tickets]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Transit Passes & Journey History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verifiable digital tickets issued via biometric conductor authentication
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Stop, Route, or Ticket ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Ticket Statuses</option>
            <option value="ISSUED">ISSUED</option>
            <option value="VALIDATED">VALIDATED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 text-slate-400">
          <QrCode className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No tickets match your query</p>
          <p className="text-xs text-slate-500 mt-1">Generate a ticket with the conductor or adjust search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((t) => (
            <div
              key={t.ticketId}
              className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-mono font-bold text-cyan-400">{t.ticketId}</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.paymentMethod === 'TRAVEL_CREDIT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {t.paymentMethod === 'TRAVEL_CREDIT' ? 'Travel Credit' : 'Digital Wallet'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'VALIDATED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase block">From</span>
                    <span className="text-xs font-bold text-white flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1 flex-shrink-0" />
                      {t.boardingStopName}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 mx-2 flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">To</span>
                    <span className="text-xs font-bold text-white flex items-center justify-end mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1 flex-shrink-0" />
                      {t.destinationStopName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-slate-300">Bus: {t.busNumber}</span>
                  <span className="text-white font-black text-sm">Fare: ₹{t.fare}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  {new Date(t.issuedAt).toLocaleDateString()} {new Date(t.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Display QR Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      <DigitalTicketModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
};
