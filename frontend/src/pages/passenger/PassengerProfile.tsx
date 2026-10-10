import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { startRegistration } from '@simplewebauthn/browser';
import {
  User,
  Fingerprint,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Smartphone,
  RefreshCw,
  KeyRound,
  Lock,
} from 'lucide-react';

export const PassengerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEnrollingWebAuthn, setIsEnrollingWebAuthn] = useState(false);
  const [isEnrollingDemo, setIsEnrollingDemo] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleEnrollWebAuthn = async () => {
    setMessage(null);
    setIsEnrollingWebAuthn(true);

    try {
      // Step 1: Request options from server
      const optRes = await api.get('/biometrics/register-options');
      if (!optRes.success || !optRes.options) {
        throw new Error(optRes.message || 'Failed to initialize WebAuthn ceremony');
      }

      // Step 2: Prompt device authenticator (fingerprint / Windows Hello / Face ID / Passkey)
      const attResp = await startRegistration({ optionsJSON: optRes.options });

      // Step 3: Verify with server
      const verRes = await api.post('/biometrics/register-verify', { response: attResp });
      if (verRes.success) {
        setMessage({ text: 'Hardware biometric passkey enrolled successfully!', type: 'success' });
        await refreshUser();
      } else {
        throw new Error(verRes.message || 'Server verification failed');
      }
    } catch (err: any) {
      console.warn('WebAuthn registration canceled or not supported on this device/origin:', err);
      setMessage({
        text: `Device authenticator notice: ${err.message || 'Passkey ceremony could not be completed.'} You can use the Classroom Simulated Fingerprint mode below.`,
        type: 'error',
      });
    } finally {
      setIsEnrollingWebAuthn(false);
    }
  };

  const handleEnrollDemoMode = async () => {
    setMessage(null);
    setIsEnrollingDemo(true);

    try {
      const res = await api.post('/biometrics/demo-enrol');
      if (res.success) {
        setMessage({
          text: 'DEMO — Simulated Fingerprint Profile activated for this account.',
          type: 'success',
        });
        await refreshUser();
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to enable demo biometrics', type: 'error' });
    } finally {
      setIsEnrollingDemo(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white">Profile & Biometric Security</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage identity parameters and WebAuthn FIDO2 authentication credentials
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
              : 'bg-amber-950/80 border border-amber-800 text-amber-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center">
          <User className="w-4 h-4 text-cyan-400 mr-2" />
          <span>Registered Identity Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Passenger Reference ID</span>
            <span className="font-mono font-bold text-cyan-400 text-sm mt-0.5 block">
              {user?.passengerId || 'Pending'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Full Legal Name</span>
            <span className="font-semibold text-white text-sm mt-0.5 block">{user?.fullName}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Registered Email</span>
            <span className="font-medium text-slate-300 mt-0.5 block">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Account Status</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">ACTIVE / VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Biometric Credentials */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <Fingerprint className="w-5 h-5 text-cyan-400 mr-2" />
              <span>Biometric Passkey Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supports device sensors (Touch ID, Windows Hello Fingerprint, Android biometrics)
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              user?.biometricEnrolled
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {user?.biometricEnrolled ? 'Biometrics Enrolled' : 'Not Yet Enrolled'}
          </span>
        </div>

        {/* Option 1: Genuine WebAuthn Passkey */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <strong className="text-white text-xs">Standard WebAuthn / FIDO2 Passkey</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              Uses your operating system's built-in biometric sensor to register a public-key credential.
            </p>
          </div>
          <button
            onClick={handleEnrollWebAuthn}
            disabled={isEnrollingWebAuthn}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition flex items-center space-x-1.5 flex-shrink-0"
          >
            {isEnrollingWebAuthn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEnrollingWebAuthn ? 'Prompting Device...' : 'Enrol Device Passkey'}</span>
          </button>
        </div>

        {/* Option 2: Classroom Demonstration Mode */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <strong className="text-white text-xs">Classroom Demonstration Fingerprint Profile</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              Enables terminal verification in classroom environments without dedicated biometric hardware.
            </p>
          </div>
          <button
            onClick={handleEnrollDemoMode}
            disabled={isEnrollingDemo}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition flex items-center space-x-1.5 flex-shrink-0"
          >
            {isEnrollingDemo && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEnrollingDemo ? 'Activating...' : 'Activate Demo Profile'}</span>
          </button>
        </div>

        {/* Security & Privacy Disclaimers */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Biometric Privacy & Cryptographic Standards Compliance</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
            <li>Raw biological fingerprint imagery is NEVER stored, uploaded, or transmitted.</li>
            <li>Biometric matching occurs strictly within device secure enclaves via WebAuthn challenge-response.</li>
            <li>The cloud database stores only public-key credential metadata, counter indices, and signature IDs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
