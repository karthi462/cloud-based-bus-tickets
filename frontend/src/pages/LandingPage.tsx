import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Bus,
  Fingerprint,
  CreditCard,
  Cloud,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealthStatus(res))
      .catch(() => setHealthStatus({ status: 'OFFLINE' }));
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-navy-950 relative overflow-hidden">
      {/* Cinematic Smart City Highway Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: `url('/assets/backgrounds/smart-city-highway.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/90 to-navy-950 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* System Cloud Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-700/50 text-xs font-mono text-cyan-400 mb-6 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Smart Biometric Transit Cloud</span>
              <span className="text-slate-500">|</span>
              <span>{healthStatus?.status === 'ONLINE' ? 'Systems Active' : 'Connecting...'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              CloudBus{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-emerald-400 bg-clip-text text-transparent">
                Transit Network
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Touch-to-ride smart ticketing with Aadhaar biometric validation, contactless digital wallet deductions, and automatic emergency travel credit safety net.
            </p>

            {/* Main Role Portals Navigation Cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {/* Passenger Card */}
              <Link
                to="/passenger/login"
                className="group p-5 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Passenger Portal</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage transit wallet, view Aadhaar pass, and track emergency travel credit.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Sign in as Commuter</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Conductor Card */}
              <Link
                to="/conductor/login"
                className="group p-5 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-amber-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition">
                    <Bus className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Conductor Terminal</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Touch-to-Identify biometric scanner and 3-tap rapid ticket issuance.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>Access Terminal</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Admin Card */}
              <Link
                to="/admin/login"
                className="group p-5 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-purple-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Authority Console</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Transit telemetry, fare matrix, route configuration, and security audits.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>Administrator Sign In</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-white">Engineering Innovations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Built for scale, fault tolerance, and everyday commuter convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition">
            <Fingerprint className="w-8 h-8 text-cyan-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Aadhaar Touch-ID Biometrics</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              1:N Touch-to-Identify matches ridge minutiae in milliseconds. Zero raw biological images stored.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition">
            <Zap className="w-8 h-8 text-amber-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Emergency Travel Credit</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Automated safety net with a configurable ₹200 buffer so stranded passengers can always reach home safely.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-sm">Verifiable QR Passes</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              HMAC-SHA256 digitally signed bus tickets with anti-tamper validation and duplicate use prevention.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition">
            <Cloud className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="font-bold text-white text-sm">AWS Cloud Native</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Designed for Amazon API Gateway, AWS Lambda serverless execution, and Amazon DynamoDB transactional persistence.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-navy-900/60 backdrop-blur-md text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <p>© 2026 CloudBus — Smart Fingerprint Ticketing & Travel Credit System.</p>
          <div className="flex space-x-6 mt-2 sm:mt-0 text-slate-400">
            <Link to="/passenger/login" className="hover:text-cyan-400">Passenger</Link>
            <Link to="/conductor/login" className="hover:text-amber-400">Conductor</Link>
            <Link to="/admin/login" className="hover:text-purple-400">Administrator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
