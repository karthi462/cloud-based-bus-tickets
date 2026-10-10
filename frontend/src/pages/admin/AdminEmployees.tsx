import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  BadgeCheck,
  Bus,
  User,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export const AdminEmployees: React.FC = () => {
  const [conductors, setConductors] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'CONDUCTORS' | 'BUSES' | 'DRIVERS'>('CONDUCTORS');

  // Modals
  const [showConductorModal, setShowConductorModal] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  // Forms
  const [cForm, setCForm] = useState({ fullName: '', email: '', mobileNumber: '', password: 'conductor123' });
  const [bForm, setBForm] = useState({ busNumber: '', capacity: '45', registrationNumber: '' });
  const [dForm, setDForm] = useState({ fullName: '', licenseNumber: '', phone: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchFleetData();
  }, []);

  const fetchFleetData = async () => {
    try {
      const [cRes, ctxRes] = await Promise.all([
        api.get('/admin/conductors'),
        api.get('/conductor/context'),
      ]);

      if (cRes.success) setConductors(cRes.conductors || []);
      if (ctxRes.success) {
        setDrivers(ctxRes.drivers || []);
        setBuses(ctxRes.buses || []);
      }
    } catch (err) {
      console.error('Failed to load fleet data', err);
    }
  };

  const handleCreateConductor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/admin/conductors', cForm);
      if (res.success) {
        setMsg({ text: 'Conductor employee created successfully', type: 'success' });
        setTimeout(() => {
          setShowConductorModal(false);
          fetchFleetData();
        }, 1000);
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to create conductor', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/admin/buses', bForm);
      if (res.success) {
        setMsg({ text: 'Bus registered successfully', type: 'success' });
        setTimeout(() => {
          setShowBusModal(false);
          fetchFleetData();
        }, 1000);
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to register bus', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/admin/drivers', dForm);
      if (res.success) {
        setMsg({ text: 'Driver registered successfully', type: 'success' });
        setTimeout(() => {
          setShowDriverModal(false);
          fetchFleetData();
        }, 1000);
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to register driver', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Transit Crew & Fleet Assets</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage conductor personnel, bus registration numbers, and licensed transit operators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'CONDUCTORS' && (
            <button
              onClick={() => {
                setMsg(null);
                setShowConductorModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Conductor</span>
            </button>
          )}
          {activeTab === 'BUSES' && (
            <button
              onClick={() => {
                setMsg(null);
                setShowBusModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bus</span>
            </button>
          )}
          {activeTab === 'DRIVERS' && (
            <button
              onClick={() => {
                setMsg(null);
                setShowDriverModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CONDUCTORS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'CONDUCTORS'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Conductors ({conductors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('BUSES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'BUSES'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Buses ({buses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'DRIVERS'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Drivers ({drivers.length})</span>
        </button>
      </div>

      {/* Tab 1: Conductors Table */}
      {activeTab === 'CONDUCTORS' && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Assigned Bus</th>
                <th className="py-3 px-4">Assigned Route</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {conductors.map((c) => (
                <tr key={c.employeeId} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.employeeId}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{c.fullName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.mobileNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">{c.assignedBusId || 'Unassigned'}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.assignedRouteId || 'Unassigned'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Buses Table */}
      {activeTab === 'BUSES' && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bus ID</th>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Seating Capacity</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {buses.map((b) => (
                <tr key={b.busId} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{b.busId}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{b.busNumber}</td>
                  <td className="py-3.5 px-4 text-slate-300">{b.capacity} Passengers</td>
                  <td className="py-3.5 px-4 text-slate-400">{b.registrationNumber}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Drivers Table */}
      {activeTab === 'DRIVERS' && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Driver ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Commercial License</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4 text-right">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {drivers.map((d) => (
                <tr key={d.driverId} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{d.driverId}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{d.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">{d.licenseNumber}</td>
                  <td className="py-3.5 px-4 text-slate-300">{d.phone}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Conductor */}
      {showConductorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowConductorModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Create Conductor Account</h3>
            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-xs ${msg.type === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleCreateConductor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={cForm.fullName}
                  onChange={(e) => setCForm({ ...cForm, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Employee Email</label>
                <input
                  type="email"
                  required
                  value={cForm.email}
                  onChange={(e) => setCForm({ ...cForm, email: e.target.value })}
                  placeholder="conductor@cloudbus.gov"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={cForm.mobileNumber}
                  onChange={(e) => setCForm({ ...cForm, mobileNumber: e.target.value })}
                  placeholder="9845012345"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={cForm.password}
                  onChange={(e) => setCForm({ ...cForm, password: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-2"
              >
                Create Conductor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Bus */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowBusModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Register New Bus</h3>
            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-xs ${msg.type === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleRegisterBus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bus Number</label>
                <input
                  type="text"
                  required
                  value={bForm.busNumber}
                  onChange={(e) => setBForm({ ...bForm, busNumber: e.target.value })}
                  placeholder="e.g. KA-01-F-6033"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Passenger Capacity</label>
                <input
                  type="number"
                  required
                  value={bForm.capacity}
                  onChange={(e) => setBForm({ ...bForm, capacity: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-2"
              >
                Register Bus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Driver */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDriverModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Register Transit Driver</h3>
            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-xs ${msg.type === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleRegisterDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={dForm.fullName}
                  onChange={(e) => setDForm({ ...dForm, fullName: e.target.value })}
                  placeholder="e.g. Suresh Gowda"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Commercial License Number</label>
                <input
                  type="text"
                  required
                  value={dForm.licenseNumber}
                  onChange={(e) => setDForm({ ...dForm, licenseNumber: e.target.value })}
                  placeholder="DL-KA01-20180001"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={dForm.phone}
                  onChange={(e) => setDForm({ ...dForm, phone: e.target.value })}
                  placeholder="9845100001"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-2"
              >
                Register Driver
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
