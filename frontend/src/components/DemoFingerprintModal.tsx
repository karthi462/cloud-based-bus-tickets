import React, { useState } from 'react';
import { Fingerprint, CheckCircle, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface DemoFingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengerId: string;
  onVerificationSuccess: (passengerData: any, proof: string) => void;
}

export const DemoFingerprintModal: React.FC<DemoFingerprintModalProps> = ({
  isOpen,
  onClose,
  passengerId,
  onVerificationSuccess,
}) => {
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleStartScan = async () => {
    if (!passengerId) {
      setErrorMessage('Please enter or select a valid Passenger ID first');
      setScanState('FAILED');
      return;
    }

    setScanState('SCANNING');
    setErrorMessage('');
    setProgressMsg('Requesting cryptographic biometric challenge token...');

    try {
      // Step 1: Fetch challenge from server
      const challengeRes = await api.get(`/biometrics/demo-challenge/${passengerId}`);
      if (!challengeRes.success) {
        throw new Error(challengeRes.message || 'Biometric challenge rejected');
      }

      setProgressMsg('Scanning simulated biometric ridge features (Classroom Protocol)...');

      // Add educational 1.2s delay for visual simulation feedback
      await new Promise((r) => setTimeout(r, 1200));

      setProgressMsg('Verifying HMAC server challenge with CloudBus Authority...');

      // Step 2: Verify challenge with backend
      const verifyRes = await api.post('/biometrics/demo-verify', {
        passengerId,
        challenge: challengeRes.challenge,
      });

      if (verifyRes.success && verifyRes.verified) {
        setScanState('SUCCESS');
        setProgressMsg('Biometric authentication verified successfully!');
        setTimeout(() => {
          onVerificationSuccess(verifyRes.passenger, challengeRes.challenge);
          onClose();
        }, 1200);
      } else {
        throw new Error(verifyRes.message || 'Biometric match rejected');
      }
    } catch (err: any) {
      setScanState('FAILED');
      setErrorMessage(err.message || 'Simulated biometric match verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Demo Badge */}
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          DEMO — Simulated Fingerprint Authentication
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Biometric Verification Terminal</h3>
        <p className="text-xs text-slate-400 mb-6 font-mono">Passenger ID: {passengerId || 'Not Specified'}</p>

        {/* Interactive Fingerprint Reader Graphic */}
        <div className="relative mx-auto w-40 h-40 mb-6 flex items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
              scanState === 'SCANNING'
                ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] bg-cyan-950/30'
                : scanState === 'SUCCESS'
                ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-emerald-950/30'
                : scanState === 'FAILED'
                ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] bg-rose-950/30'
                : 'border-slate-700 bg-slate-800/40 hover:border-cyan-500/50 cursor-pointer'
            }`}
            onClick={scanState === 'IDLE' || scanState === 'FAILED' ? handleStartScan : undefined}
          >
            {/* Animated Laser Scanning Beam */}
            {scanState === 'SCANNING' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 transform -translate-y-1/2 shadow-[0_0_15px_#22d3ee]" />
            )}

            {scanState === 'SUCCESS' ? (
              <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
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
        <div className="min-h-12 mb-6 flex items-center justify-center">
          {scanState === 'SCANNING' && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{progressMsg}</span>
            </div>
          )}
          {scanState === 'SUCCESS' && (
            <p className="text-emerald-400 text-sm font-semibold">{progressMsg}</p>
          )}
          {scanState === 'FAILED' && (
            <p className="text-rose-400 text-xs font-medium">{errorMessage}</p>
          )}
          {scanState === 'IDLE' && (
            <p className="text-xs text-slate-400">
              Click the fingerprint sensor above or the button below to simulate biometric verification.
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {scanState !== 'SCANNING' && scanState !== 'SUCCESS' && (
            <button
              onClick={handleStartScan}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
            >
              {scanState === 'FAILED' ? 'Retry Biometric Scan' : 'Simulate Fingerprint Scan'}
            </button>
          )}

          {/* Academic Privacy Notice */}
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed text-left">
            <span className="font-semibold text-slate-300 block mb-0.5">Privacy Notice & Security Guarantee:</span>
            In compliance with transport biometric standards, this application stores only cryptographic public-key credential tokens. No raw fingerprint images or biological data are ever stored or transmitted.
          </div>
        </div>
      </div>
    </div>
  );
};
