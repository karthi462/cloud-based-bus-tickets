import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Bus,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const PassengerRegister: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Chennai');
  const [termsConsent, setTermsConsent] = useState(false);

  // Fingerprint enrollment state
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [fingerprintTemplateId, setFingerprintTemplateId] = useState('');
  const [isScanningFinger, setIsScanningFinger] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Format Aadhaar with spaces (XXXX XXXX XXXX)
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNumber(formatted);
  };

  // Simulate Biometric Aadhaar-linked Fingerprint Sensor Enrollment
  const handleScanFingerprint = () => {
    if (!aadhaarNumber || aadhaarNumber.replace(/\s+/g, '').length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar Card number first to bind biometric records.');
      return;
    }
    setError('');
    setIsScanningFinger(true);
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanningFinger(false);
      setFingerprintEnrolled(true);
      const generatedTemplate = `FP-BIO-${Math.floor(1000 + Math.random() * 9000)}`;
      setFingerprintTemplateId(generatedTemplate);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '');
    if (cleanAadhaar.length !== 12) {
      setError('Please provide a valid 12-digit Aadhaar number for UIDAI identity verification.');
      return;
    }

    if (!fingerprintEnrolled) {
      setError('Please complete the Fingerprint Biometric Capture to enroll your transit touch-ID.');
      return;
    }

    if (!termsConsent) {
      setError('You must accept the terms of service and transit privacy notice');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        mobileNumber,
        password,
        aadhaarNumber: aadhaarNumber.trim(),
        gender,
        city,
        fingerprintTemplateId: fingerprintTemplateId || `FP-BIO-${Math.floor(1000 + Math.random() * 9000)}`,
        termsConsent,
      });

      if (res.success && res.token) {
        login(res.token, res.user);
        navigate('/passenger');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-brand-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bus className="w-7 h-7 text-white" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-black text-white">Passenger Registration</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enrol Aadhaar-Linked Fingerprint Biometrics & Activate Transit Wallet
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-navy-900 py-8 px-6 sm:px-10 border border-slate-800 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Karthick Ramanathan"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="karthick@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9845012345"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Aadhaar Number Field */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-navy-950 border border-cyan-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Aadhaar Card Number (12 Digits)</span>
                </label>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  UIDAI e-KYC
                </span>
              </div>
              <input
                type="text"
                required
                value={aadhaarNumber}
                onChange={(e) => handleAadhaarChange(e.target.value)}
                placeholder="5489 1234 5678"
                maxLength={14}
                className="w-full px-3 py-2 font-mono tracking-widest text-base rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Your Aadhaar card will be cryptographically bound to your fingerprint biometric token.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Fingerprint Biometric Enrollment Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border-2 border-dashed border-cyan-500/40 text-center relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>Fingerprint Biometric Enrolment</span>
                </span>
                {fingerprintEnrolled ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enrolled</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                    Mandatory
                  </span>
                )}
              </div>

              {fingerprintEnrolled ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-left">
                  <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Biometric Template Generated & Bound</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">
                    Template Ref: <span className="text-cyan-300 font-bold">{fingerprintTemplateId}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    When traveling, simply place your thumb on any conductor's scanner — the system will immediately identify your Aadhaar & transit wallet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Touch sensor to extract biometric ridge minutiae and bind with Aadhaar
                  </p>

                  <button
                    type="button"
                    onClick={handleScanFingerprint}
                    disabled={isScanningFinger}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition"
                  >
                    <Fingerprint className={`w-5 h-5 ${isScanningFinger ? 'animate-pulse text-cyan-200' : ''}`} />
                    <span>{isScanningFinger ? `Scanning Sensor... (${scanProgress}%)` : 'Scan Thumb & Enrol Fingerprint'}</span>
                  </button>

                  {isScanningFinger && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-1.5 transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsConsent}
                onChange={(e) => setTermsConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-normal">
                I consent to Aadhaar e-KYC and CloudBus transit terms. I understand biometric authentication operates via cryptographic tokens with zero raw fingerprint images stored.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account & Enrolling...' : 'Register as Passenger'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/passenger/login" className="text-cyan-400 hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
