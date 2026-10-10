import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface DemoFingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (passengerData: any, proof: string) => void;
}

export const DemoFingerprintModal: React.FC<DemoFingerprintModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('FP-THUMB-1001');
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [matchedPassenger, setMatchedPassenger] = useState<any>(null);

  if (!isOpen) return null;

  const handleStartScan = async (templateToUse?: string) => {
    const activeTemplate = templateToUse || selectedTemplate;
    setScanState('SCANNING');
    setErrorMessage('');
    setMatchedPassenger(null);
    setProgressMsg('Optical minutiae capture: Scanning ridge endings & bifurcations...');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setProgressMsg('Searching biometric database (1:N Aadhaar biometric index match)...');

      // Call 1:N Touch-to-Identify endpoint
      const res = await api.post('/biometrics/touch-identify', {
        fingerprintTemplateId: activeTemplate,
      });

      if (res.success && res.verified && res.passenger) {
        setScanState('SUCCESS');
        setMatchedPassenger(res.passenger);
        setProgressMsg(`Fingerprint match verified: ${res.passenger.fullName}`);
        setTimeout(() => {
          onVerificationSuccess(res.passenger, activeTemplate);
          onClose();
        }, 1300);
      } else {
        throw new Error(res.message || 'No enrolled passenger matches this fingerprint scan');
      }
    } catch (err: any) {
      setScanState('FAILED');
      setErrorMessage(err.message || 'Fingerprint biometric match failed: Unrecognized scan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Demo Badge */}
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cyan-400" />
          <span>Biometric Sensor Terminal — Touch-to-Identify</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1">Place Finger on Sensor</h3>
        <p className="text-xs text-slate-400 mb-5">
          Automatic 1:N Identification — Resolves Aadhaar profile, wallet, and credit limit with zero typing
        </p>

        {/* Interactive Fingerprint Reader Graphic */}
        <div className="relative mx-auto w-40 h-40 mb-4 flex items-center justify-center">
          <div
            className={`w-36 h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
              scanState === 'SCANNING'
                ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] bg-cyan-950/40'
                : scanState === 'SUCCESS'
                ? 'border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.5)] bg-emerald-950/40'
                : scanState === 'FAILED'
                ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.5)] bg-rose-950/40'
                : 'border-slate-700 bg-slate-800/60 hover:border-cyan-500/60 cursor-pointer'
            }`}
            onClick={scanState === 'IDLE' || scanState === 'FAILED' ? () => handleStartScan() : undefined}
          >
            {/* Animated Laser Scanning Beam */}
            {scanState === 'SCANNING' && (
              <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse top-1/2 transform -translate-y-1/2 shadow-[0_0_20px_#22d3ee]" />
            )}

            {scanState === 'SUCCESS' ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            ) : scanState === 'FAILED' ? (
              <AlertCircle className="w-16 h-16 text-rose-400" />
            ) : (
              <Fingerprint
                className={`w-20 h-20 transition-colors duration-300 ${
                  scanState === 'SCANNING'
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              />
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="min-h-12 mb-4 flex flex-col items-center justify-center">
          {scanState === 'SCANNING' && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{progressMsg}</span>
            </div>
          )}
          {scanState === 'SUCCESS' && matchedPassenger && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-left w-full space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-bold text-xs flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{matchedPassenger.fullName}</span>
                </span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-mono">
                  {matchedPassenger.passengerId}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aadhaar: <strong className="text-white font-mono">{matchedPassenger.aadhaarNumber || 'Verified'}</strong></span>
              </div>
            </div>
          )}
          {scanState === 'FAILED' && (
            <p className="text-rose-400 text-xs font-medium bg-rose-950/40 p-2.5 rounded-lg border border-rose-900 w-full">
              {errorMessage}
            </p>
          )}
          {scanState === 'IDLE' && (
            <p className="text-xs text-slate-400">
              Touch the fingerprint scanner pad or pick a test finger below to scan:
            </p>
          )}
        </div>

        {/* Fingerprint Selector buttons (Simulating different passenger fingers) */}
        <div className="mb-4 pt-3 border-t border-slate-800 text-left">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Finger to Place on Sensor:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate('FP-THUMB-1001');
                handleStartScan('FP-THUMB-1001');
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                selectedTemplate === 'FP-THUMB-1001'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                <span>Karthick's Thumb</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Aadhaar: 5489 1234 1001</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Balance: ₹250 (Funded)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTemplate('FP-THUMB-1002');
                handleStartScan('FP-THUMB-1002');
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                selectedTemplate === 'FP-THUMB-1002'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                <span>Vikram's Thumb</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Aadhaar: 7823 4567 1002</div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Balance: ₹0 (Uses Credit)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTemplate('FP-THUMB-1003');
                handleStartScan('FP-THUMB-1003');
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                selectedTemplate === 'FP-THUMB-1003'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
                <span>Sneha's Thumb</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Aadhaar: 9012 3456 1003</div>
              <div className="text-[10px] text-rose-400 font-semibold mt-0.5">Credit: ₹190 (Limit test)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTemplate('FP-UNKNOWN-999');
                handleStartScan('FP-UNKNOWN-999');
              }}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-400 hover:border-rose-700 hover:text-rose-300 text-left transition"
            >
              <div className="font-bold flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5 text-rose-500" />
                <span>Unregistered Finger</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">No Aadhaar match</div>
              <div className="text-[10px] text-rose-400 font-semibold mt-0.5">Test rejection</div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        {scanState !== 'SCANNING' && scanState !== 'SUCCESS' && (
          <button
            onClick={() => handleStartScan()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{scanState === 'FAILED' ? 'Re-scan Fingerprint' : 'Capture & Identify Passenger'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
