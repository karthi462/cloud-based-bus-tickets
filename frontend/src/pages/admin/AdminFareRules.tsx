import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DollarSign, CheckCircle, RefreshCw, Calculator, Save } from 'lucide-react';

export const AdminFareRules: React.FC = () => {
  const [form, setForm] = useState({
    baseFare: '10',
    perKmRate: '2.5',
    minimumFare: '10',
    maximumFare: '80',
  });
  const [simKm, setSimKm] = useState('16');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFareRules();
  }, []);

  const fetchFareRules = async () => {
    try {
      const res = await api.get('/admin/fare-rules');
      if (res.success && res.fareRules) {
        setForm({
          baseFare: res.fareRules.baseFare.toString(),
          perKmRate: res.fareRules.perKmRate.toString(),
          minimumFare: res.fareRules.minimumFare.toString(),
          maximumFare: res.fareRules.maximumFare.toString(),
        });
      }
    } catch (err) {
      console.error('Failed to load fare rules', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await api.put('/admin/fare-rules', {
        baseFare: parseFloat(form.baseFare),
        perKmRate: parseFloat(form.perKmRate),
        minimumFare: parseFloat(form.minimumFare),
        maximumFare: parseFloat(form.maximumFare),
      });

      if (res.success) {
        setMsg('Fare rules successfully saved and deployed across system.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update fare rules');
    } finally {
      setIsSaving(false);
    }
  };

  // Simulated calculation
  const b = parseFloat(form.baseFare) || 0;
  const r = parseFloat(form.perKmRate) || 0;
  const km = parseFloat(simKm) || 0;
  const minF = parseFloat(form.minimumFare) || 0;
  const maxF = parseFloat(form.maximumFare) || 0;
  let simFare = Math.round(b + km * r);
  if (simFare < minF) simFare = minF;
  if (simFare > maxF) simFare = maxF;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white">Route Pricing & Fare Configuration</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic fare distance rules computed server-side for all routes.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules Form */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center">
            <DollarSign className="w-4 h-4 text-emerald-400 mr-2" />
            <span>Pricing Rules Parameters</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Base Boarding Fare (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={form.baseFare}
                  onChange={(e) => setForm({ ...form, baseFare: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Per-Kilometer Distance Rate (INR/km)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.perKmRate}
                  onChange={(e) => setForm({ ...form, perKmRate: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Fare</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    value={form.minimumFare}
                    onChange={(e) => setForm({ ...form, minimumFare: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Maximum Fare Cap</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    value={form.maximumFare}
                    onChange={(e) => setForm({ ...form, maximumFare: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-1.5 mt-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Updating Rules...' : 'Save & Deploy Fare Table'}</span>
            </button>
          </form>
        </div>

        {/* Live Fare Calculator Sandbox */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center">
            <Calculator className="w-4 h-4 text-cyan-400 mr-2" />
            <span>Interactive Fare Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400">
            Preview what passengers will be charged based on travel distance.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Simulated Distance (km)</label>
              <input
                type="range"
                min="1"
                max="35"
                value={simKm}
                onChange={(e) => setSimKm(e.target.value)}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-slate-400 font-mono mt-1">
                <span>1 km</span>
                <span className="text-white font-bold">{simKm} km</span>
                <span>35 km</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Formula:</span>
                <span className="font-mono text-cyan-300">₹{b} + ({simKm}km × ₹{r})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Unclamped Raw:</span>
                <span className="font-mono">₹{(b + km * r).toFixed(1)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Calculated Passenger Fare:</span>
                <span className="text-3xl font-black text-emerald-400">₹{simFare}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
