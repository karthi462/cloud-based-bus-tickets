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
  Zap,
  MapPin,
  Shield,
  Activity,
  ChevronRight,
  CheckCircle2,
  Lock,
  Smartphone,
  QrCode,
  Gauge,
  Sparkles,
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
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: `url('/assets/backgrounds/smart-city-highway.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/90 to-navy-950 pointer-events-none" />

      {/* Sub-Header Navigation */}
      <header className="relative z-20 border-b border-slate-800/60 bg-navy-900/60 backdrop-blur-md sticky top-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-6 text-slate-300 font-medium">
            <a href="#home" className="hover:text-cyan-400 transition">Home</a>
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition">How It Works</a>
            <a href="#security" className="hover:text-cyan-400 transition">Security</a>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/passenger/login"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/passenger/register"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold shadow-md shadow-cyan-600/20 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-16 pb-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Cloud System Telemetry Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-700/50 text-xs font-mono text-cyan-400 mb-6 shadow-xl">
            <span className={`w-2 h-2 rounded-full ${healthStatus?.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Smart Biometric Transit Cloud</span>
            <span className="text-slate-500">|</span>
            <span>{healthStatus?.status === 'ONLINE' ? 'AWS Systems Operational' : 'Connecting to API Gateway...'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Smarter Journeys.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-emerald-400 bg-clip-text text-transparent">
              Seamless Ticketing.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            The next-generation cloud transport system. Touch-to-ride Aadhaar biometric verification, instant wallet deductions, and guaranteed emergency travel credit.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/passenger/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white text-sm font-bold shadow-xl shadow-cyan-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Enrol as Commuter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/conductor/login"
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 text-sm font-bold border border-amber-800/60 shadow-lg transition flex items-center space-x-2"
            >
              <Bus className="w-4 h-4 text-amber-400" />
              <span>Conductor Terminal</span>
            </Link>
          </div>

          {/* Role Portal Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
            {/* Passenger Portal */}
            <Link
              to="/passenger/login"
              className="group p-6 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Passenger Portal</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Digital transit wallet, Aadhaar Smart Pass, live bus GPS tracking, and automatic travel credit.
                </p>
              </div>
              <div className="mt-5 flex items-center text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>Sign In as Passenger</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Conductor Terminal */}
            <Link
              to="/conductor/login"
              className="group p-6 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-amber-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Conductor POS</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Biometric touch-to-identify scanner, live GPS broadcast, and server-calculated rapid ticketing.
                </p>
              </div>
              <div className="mt-5 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Open Conductor Console</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Admin Console */}
            <Link
              to="/admin/login"
              className="group p-6 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-slate-800 hover:border-purple-500/80 shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg">Authority Console</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Fleet telemetry, fare matrix configuration, CloudWatch monitoring, and security audit logs.
                </p>
              </div>
              <div className="mt-5 flex items-center text-xs font-bold text-purple-400 group-hover:text-purple-300">
                <span>Access Authority Admin</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-b border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold">Capabilities</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Engineered for Massive Scale</h2>
          <p className="text-sm text-slate-400 mt-2">
            Every layer designed to prevent fraud, ensure zero-downtime transit, and protect passenger safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Aadhaar Touch-ID Biometrics</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              1:N fingerprint search matches minutiae points in sub-100ms. No raw biometric images stored; only encrypted SHA-256 hashes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Emergency Travel Credit</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Automated safety net with up to ₹200 buffer. If wallet balance drops to zero, passengers are never stranded and can safely complete trips.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Verifiable QR Passes</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              HMAC-SHA256 tamper-proof cryptographic signatures with offline verification capabilities and single-use validation flags.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Live Bus GPS Tracking</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time interactive OpenStreetMap Leaflet tracker showing active buses, speed, next stops, and arrival times.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4">
              <Cloud className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">AWS Cloud Architecture</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Hosted on Amazon EC2, Amazon RDS PostgreSQL, Amazon S3 for report persistence, and Amazon CloudWatch for telemetry.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Double-Entry Financial Ledger</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ACID-compliant atomic wallet transactions with idempotency tokens to mathematically eliminate double deductions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-b border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold">Process</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">How CloudBus Works</h2>
          <p className="text-sm text-slate-400 mt-2">
            Frictionless boarding from passenger enrollment to ticket validation in 3 steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm flex items-center justify-center mb-4">1</div>
            <h3 className="text-lg font-bold text-white mb-2">Enrol Biometric Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Passenger registers with 12-digit Aadhaar and scans their thumb once. A cryptographic biometric hash is safely generated.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center mb-4">2</div>
            <h3 className="text-lg font-bold text-white mb-2">Touch Sensor on Bus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Board the bus and touch thumb to the conductor's scanner. Identity, wallet balance, and Aadhaar card are fetched automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">3</div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Ticket & Safety Net</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fare is deducted from wallet or emergency travel credit buffer. A verifiable HMAC QR ticket pass is generated immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-b border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold">Trust & Integrity</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Enterprise Security & Compliance</h2>
          <p className="text-sm text-slate-400 mt-2">
            Adhering to Indian UIDAI and AWS Well-Architected Security Pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 text-left">
            <Lock className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="font-bold text-white text-sm mb-1">Zero Raw Biometric Storage</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complies with UIDAI guidelines. Biometric scans are transformed into mathematical coordinate templates. Raw fingerprint images are never saved to disk.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 text-left">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="font-bold text-white text-sm mb-1">AWS IAM Least Privilege</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fine-grained IAM execution roles for Amazon EC2 and backend services. Credentials are dynamically fetched through instance metadata.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 text-left">
            <Activity className="w-6 h-6 text-purple-400 mb-3" />
            <h4 className="font-bold text-white text-sm mb-1">Immutable Audit Trails</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All financial top-ups, ticket issuances, credit repayments, and role transitions are permanently recorded in the administrative audit log.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-navy-900/60 backdrop-blur-md text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Bus className="w-4 h-4 text-cyan-400" />
            <p className="font-medium text-slate-400">© 2026 CloudBus — Smart Fingerprint Ticketing & Travel Credit System.</p>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/passenger/login" className="hover:text-cyan-400 transition">Passenger Portal</Link>
            <Link to="/conductor/login" className="hover:text-amber-400 transition">Conductor Terminal</Link>
            <Link to="/admin/login" className="hover:text-purple-400 transition">Authority Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
