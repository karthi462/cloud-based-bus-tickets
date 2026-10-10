import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types';
import { QrCode, ShieldCheck, CheckCircle, AlertCircle, RefreshCw, Bus, MapPin } from 'lucide-react';

export const ConductorTicketValidator: React.FC = () => {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setError('');
    setValidationResult(null);
    setIsValidating(true);

    try {
      const res = await api.post('/tickets/validate', {
        ticketId: ticketId.trim(),
        conductorEmployeeId: user?.employeeId || 'CB-EMP-2001',
      });

      if (res.success) {
        setValidationResult(res);
      } else {
        setError(res.message || 'Validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error validating ticket pass');
    } finally {
      setIsValidating(false);
    }
  };

  const ticket: Ticket | undefined = validationResult?.ticket;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>Fare Inspector & Ticket Verification Module</span>
        </div>
        <h1 className="text-3xl font-black text-white">Validate Transit Pass</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verifies HMAC-SHA256 signature, prevents ticket duplication, and marks pass as VALIDATED.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Scan or Enter Ticket ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. TKT-B1A2C3D4"
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isValidating}
                className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
              >
                {isValidating && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isValidating ? 'Verifying...' : 'Validate Pass'}</span>
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>

      {/* Validation Result Box */}
      {validationResult && ticket && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-5 animate-fade-in">
          {/* Result Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              validationResult.alreadyValidated
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <strong className="block text-sm font-bold">
                  {validationResult.alreadyValidated ? 'TICKET ALREADY VALIDATED' : 'TICKET VALID & CONFIRMED'}
                </strong>
                <span className="text-xs">{validationResult.message}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-navy-900/80 border border-slate-700 text-white">
              {ticket.status}
            </span>
          </div>

          {/* Ticket Information */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-4 text-xs">
            <div className="flex justify-between items-baseline pb-2 border-b border-slate-700/60">
              <span className="font-mono text-cyan-400 font-bold text-sm">{ticket.ticketId}</span>
              <span className="text-white font-bold text-base">₹{ticket.fare}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Boarding</span>
                <span className="font-bold text-white mt-0.5 block">{ticket.boardingStopName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Destination</span>
                <span className="font-bold text-white mt-0.5 block">{ticket.destinationStopName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">Passenger</span>
                <span className="font-medium">{ticket.passengerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Bus Number</span>
                <span className="font-mono font-bold text-white">{ticket.busNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Payment Method</span>
                <span className="font-bold text-cyan-300">{ticket.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
