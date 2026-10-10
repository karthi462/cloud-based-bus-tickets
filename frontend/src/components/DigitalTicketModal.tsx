import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '../types';
import { X, CheckCircle, ShieldCheck, Printer, ArrowRight, Bus, User, MapPin } from 'lucide-react';

interface DigitalTicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({ ticket, isOpen, onClose }) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden text-slate-100 print:border-none print:shadow-none print:text-black">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/20 transition print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-cyan-200 mb-1">
            <Bus className="w-4 h-4" />
            <span>CloudBus Transport Authority</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Verified Transit Pass</h2>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs text-white/90 font-mono">
            <span>TICKET ID: {ticket.ticketId}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold ${
                ticket.status === 'VALIDATED'
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-white text-brand-900'
              }`}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5 bg-navy-900">
          {/* Stops Flow */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Boarding</span>
                <span className="text-sm font-bold text-white flex items-center mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1 flex-shrink-0" />
                  {ticket.boardingStopName}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 mx-2 flex-shrink-0" />
              <div className="flex-1 text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destination</span>
                <span className="text-sm font-bold text-white flex items-center justify-end mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1 flex-shrink-0" />
                  {ticket.destinationStopName}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
              <span>Route: <strong className="text-cyan-300">{ticket.routeName}</strong></span>
              <span>Bus: <strong className="text-white font-mono">{ticket.busNumber}</strong></span>
            </div>
          </div>

          {/* Operational Personnel & Passenger */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Passenger</span>
              <span className="font-semibold text-slate-200 block truncate">{ticket.passengerName}</span>
              <span className="text-[10px] text-cyan-400 font-mono">{ticket.passengerId}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Conductor Employee</span>
              <span className="font-semibold text-slate-200 block truncate">{ticket.conductorName}</span>
              <span className="text-[10px] text-amber-400 font-mono">{ticket.conductorEmployeeId}</span>
            </div>
          </div>

          {/* Fare & Payment Method */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/70 border border-slate-700">
            <div>
              <span className="text-xs text-slate-400 block">Total Fare</span>
              <span className="text-2xl font-black text-white">₹{ticket.fare}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-1">Payment Method</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center ${
                  ticket.paymentMethod === 'TRAVEL_CREDIT'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {ticket.paymentMethod === 'TRAVEL_CREDIT' ? '⚠️ Emergency Travel Credit' : '💳 Digital Wallet'}
              </span>
            </div>
          </div>

          {/* Verifiable QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner">
            <div className="p-2 bg-white rounded-lg">
              <QRCodeSVG
                value={ticket.qrCodeData}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700 text-[11px] font-medium mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed by CloudBus Authority</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
              Sig: {ticket.signature.substring(0, 24)}...
            </span>
          </div>

          {/* Timestamp & Footer */}
          <div className="text-center text-[11px] text-slate-500">
            Issued at: {new Date(ticket.issuedAt).toLocaleString()}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
