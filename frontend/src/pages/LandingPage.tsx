import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bus,
  Fingerprint,
  CreditCard,
  Cloud,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealthStatus(res))
      .catch(() => setHealthStatus({ status: 'OFFLINE' }));
  }, []);

  const handleQuickLogin = async (role: 'PASSENGER' | 'CONDUCTOR' | 'ADMIN', creds: any, label: string) => {
    setIsLoggingIn(label);
    try {
      let endpoint = '/auth/login/passenger';
      if (role === 'CONDUCTOR') endpoint = '/auth/login/conductor';
      if (role === 'ADMIN') endpoint = '/auth/login/admin';

      const res = await api.post(endpoint, creds);
      if (res.success && res.token) {
        login(res.token, res.user);
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'CONDUCTOR') navigate('/conductor');
        else navigate('/passenger');
      }
    } catch (err: any) {
      alert(err.message || 'Quick login failed');
    } finally {
      setIsLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-navy-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(12,142,233,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* System Cloud Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-mono text-cyan-400 mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AWS Cloud Serverless Architecture</span>
              <span className="text-slate-500">|</span>
              <span>{healthStatus?.mode || 'Local Persistent Mode'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              CloudBus{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-brand-300 bg-clip-text text-transparent">
                Transit System
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Next-generation cloud-native transit platform with WebAuthn & biometric authentication, role-based operations, digital wallets, and automated emergency travel credit.
            </p>

            {/* Main Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/passenger/login"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Passenger Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/conductor/login"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold border border-amber-800/60 transition flex items-center space-x-2"
              >
                <span>Conductor Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admin/login"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 font-semibold border border-purple-800/60 transition flex items-center space-x-2"
              >
                <span>Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Classroom Demo 1-Click Access Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Sparkles className="w-5 h-5 text-amber-400 mr-2" />
              Academic Demo & One-Click Portals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly test and inspect distinct user roles and scenarios without manual password entry.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-seeded test scenarios loaded</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passenger Cards */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  PASSENGER #1
                </span>
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white text-base">Karthick Ramanathan</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">CB-PASS-1001 (Funded)</p>
              <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Wallet Balance:</span>
                  <strong className="text-emerald-400 font-bold">₹100</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Emergency Credit:</span>
                  <strong className="text-slate-400">₹0 / ₹200</strong>
                </div>
                <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-700/40">
                  Scenario: Standard travel with wallet balance deduction.
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleQuickLogin('PASSENGER', { email: 'passenger@cloudbus.com', password: 'pass123' }, 'P1')
              }
              disabled={isLoggingIn === 'P1'}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
            >
              {isLoggingIn === 'P1' ? 'Authenticating...' : 'Sign In as Passenger #1'}
            </button>
          </div>

          {/* Passenger Emergency Credit Card */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60">
                  PASSENGER #2 (EMERGENCY)
                </span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-base">Vikram Singh</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">CB-PASS-1002 (Zero Balance)</p>
              <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Wallet Balance:</span>
                  <strong className="text-rose-400 font-bold">₹0</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Available Credit:</span>
                  <strong className="text-amber-400 font-bold">₹200 Available</strong>
                </div>
                <div className="text-[11px] text-amber-300 pt-1 border-t border-slate-700/40">
                  Scenario: Zero balance automatically advances emergency travel credit.
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleQuickLogin('PASSENGER', { email: 'emergency@cloudbus.com', password: 'pass123' }, 'P2')
              }
              disabled={isLoggingIn === 'P2'}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition"
            >
              {isLoggingIn === 'P2' ? 'Authenticating...' : 'Sign In as Passenger #2'}
            </button>
          </div>

          {/* Conductor Card */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                  CONDUCTOR TERMINAL
                </span>
                <Bus className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white text-base">Rajesh Kumar</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">CB-EMP-2001</p>
              <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Assigned Bus:</span>
                  <strong className="text-white font-mono">KA-01-F-4022</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Route:</span>
                  <strong className="text-cyan-300">R-101 (Majestic - E-City)</strong>
                </div>
                <div className="text-[11px] text-indigo-300 pt-1 border-t border-slate-700/40">
                  Generates tickets with biometric scan & validates QR passes.
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                handleQuickLogin('CONDUCTOR', { employeeId: 'CB-EMP-2001', password: 'conductor123' }, 'C1')
              }
              disabled={isLoggingIn === 'C1'}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              {isLoggingIn === 'C1' ? 'Authenticating...' : 'Launch Conductor Terminal'}
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <Fingerprint className="w-8 h-8 text-cyan-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Biometric Authentication</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Standard WebAuthn passkey protocol and classroom simulation. Zero raw fingerprint images stored.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <CreditCard className="w-8 h-8 text-amber-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Emergency Travel Credit</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Configurable travel credit safety net (₹200 limit) for passengers when wallet balance is insufficient.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Verifiable QR Ticketing</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cryptographically signed HMAC-SHA256 digital tickets with anti-tamper and duplicate validation checks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <Cloud className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="font-bold text-white text-sm">AWS Serverless Architecture</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Built for API Gateway, AWS Lambda, DynamoDB transactional writes, CloudWatch, and S3/CloudFront.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-navy-900/40 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 CloudBus — Smart Fingerprint Ticketing & Travel Credit System. Academic Project.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0 text-slate-400">
            <Link to="/admin/login" className="hover:text-cyan-400">Admin Login</Link>
            <Link to="/conductor/login" className="hover:text-cyan-400">Conductor Login</Link>
            <Link to="/passenger/login" className="hover:text-cyan-400">Passenger Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
