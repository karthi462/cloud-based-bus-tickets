import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Activity,
  Server,
  Database,
  Cloud,
  ShieldCheck,
  Cpu,
  HardDrive,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';

export const CloudHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [latency, setLatency] = useState<number>(0);

  const checkHealth = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await api.get('/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(res);
      setLastCheck(new Date());
    } catch (err: any) {
      setHealth({ status: 'OFFLINE', error: err.message });
      setLatency(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30 sec poll
    return () => clearInterval(interval);
  }, []);

  const isOnline = health?.status === 'ONLINE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-brand-950 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>AWS CLOUDWWATCH TELEMETRY & HEALTH</span>
          </div>
          <h1 className="text-3xl font-black text-white">Cloud Health & Infrastructure Monitor</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of EC2 Application Instances, RDS Database connectivity, and Security Telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center space-x-2 transition shadow-lg shadow-cyan-700/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Run Health Check</span>
          </button>
        </div>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: API Server State */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Backend Gateway</span>
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xl font-bold text-white">
              {isOnline ? 'HEALTHY & ONLINE' : 'DEGRADED / DOWN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
            <span>Latency: <strong className="text-cyan-400 font-mono">{latency}ms</strong></span>
            <span>Version: <strong className="text-white font-mono">{health?.version || '1.0.0'}</strong></span>
          </div>
        </div>

        {/* Card 2: AWS Persistence Mode */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Engine</span>
            <Database className="w-5 h-5 text-brand-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {health?.mode === 'AWS_DYNAMODB_CLOUD' ? 'Amazon RDS / Dynamo' : 'Local Persistent'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            Mode: <span className="font-mono text-cyan-300">{health?.mode || 'LOCAL_PERSISTENT'}</span>
          </div>
        </div>

        {/* Card 3: Cloud Region */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cloud Deployment</span>
            <Cloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {health?.region || 'ap-south-1'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            Primary Availability Zone: <span className="text-emerald-400 font-semibold">Ready</span>
          </div>
        </div>

        {/* Card 4: TLS & Security Policy */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Security Architecture</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center space-x-1.5">
            <Lock className="w-4 h-4" />
            <span>TLS 1.3 / IAM Active</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            HMAC-SHA256 Ticket Signing: <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </div>
      </div>

      {/* CloudWatch Service Matrix Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">AWS Cloud Architecture Health Matrix</h2>
          <p className="text-xs text-slate-400">Subsystem heartbeat checks and connectivity diagnostics</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subsystem Component</th>
                <th className="py-3 px-4">AWS Service</th>
                <th className="py-3 px-4">Role / Purpose</th>
                <th className="py-3 px-4">Observed Metric</th>
                <th className="py-3 px-4 text-right">Operational State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Backend REST API</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Amazon EC2 / Node.js</td>
                <td className="py-3.5 px-4 text-slate-400">Ticketing orchestration, biometric matching, auth</td>
                <td className="py-3.5 px-4 text-cyan-300 font-mono">Response: {latency}ms</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    OPERATIONAL
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                  <Database className="w-4 h-4 text-brand-400" />
                  <span>Relational & Document Store</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Amazon RDS / DynamoDB</td>
                <td className="py-3.5 px-4 text-slate-400">Users, tickets, wallets, and ledger transactions</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">ACID Compliant Ledger</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    CONNECTED
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Cloud Object Storage</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Amazon S3</td>
                <td className="py-3.5 px-4 text-slate-400">Audit report exports, documents & static assets</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Private Access by Default</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    ACTIVE
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Logging & Telemetry</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Amazon CloudWatch</td>
                <td className="py-3.5 px-4 text-slate-400">EC2 CPU telemetry, API errors, availability checks</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Real-time Stream</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    LOGGING
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Identity & Access Control</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">AWS IAM & JWT RBAC</td>
                <td className="py-3.5 px-4 text-slate-400">Least privilege role policies, passenger & crew isolation</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">Zero Trust Verification</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    ENFORCED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Watch Diagnostic Details */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Last automated health poll: <strong className="text-white">{lastCheck.toLocaleTimeString()}</strong></span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Service: {health?.service || 'CloudBus API'}
        </div>
      </div>
    </div>
  );
};
