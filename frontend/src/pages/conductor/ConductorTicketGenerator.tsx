import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Driver, Bus, Route, RouteStop, Ticket } from '../../types';
import { DemoFingerprintModal } from '../../components/DemoFingerprintModal';
import { DigitalTicketModal } from '../../components/DigitalTicketModal';
import {
  Bus as BusIcon,
  User,
  Fingerprint,
  MapPin,
  CreditCard,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  QrCode,
} from 'lucide-react';

export const ConductorTicketGenerator: React.FC = () => {
  const { user } = useAuth();

  // Operational Context
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedBusNumber, setSelectedBusNumber] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // Passenger & Authentication
  const [passengerId, setPassengerId] = useState<string>('CB-PASS-1001');
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(false);
  const [authProof, setAuthProof] = useState<string>('');
  const [passengerData, setPassengerData] = useState<any>(null);
  const [showDemoBioModal, setShowDemoBioModal] = useState<boolean>(false);

  // Stops & Fare
  const [boardingStopId, setBoardingStopId] = useState<string>('');
  const [destinationStopId, setDestinationStopId] = useState<string>('');
  const [farePreview, setFarePreview] = useState<{ fare: number; distanceKm: number } | null>(null);
  const [fareError, setFareError] = useState<string>('');

  // Generation & Modals
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>('');
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      const res = await api.get('/conductor/context');
      if (res.success) {
        setDrivers(res.drivers || []);
        setBuses(res.buses || []);
        setRoutes(res.routes || []);

        if (res.drivers && res.drivers.length > 0) setSelectedDriverId(res.drivers[0].driverId);
        if (res.buses && res.buses.length > 0) setSelectedBusNumber(res.buses[0].busNumber);
        if (res.routes && res.routes.length > 0) {
          const r = res.routes[0];
          setSelectedRouteId(r.routeId);
          if (r.stops && r.stops.length >= 2) {
            setBoardingStopId(r.stops[0].stopId);
            setDestinationStopId(r.stops[1].stopId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load operational context', err);
    }
  };

  // When route changes, update default stops
  const handleRouteChange = (rId: string) => {
    setSelectedRouteId(rId);
    const r = routes.find((x) => x.routeId === rId);
    if (r && r.stops && r.stops.length >= 2) {
      setBoardingStopId(r.stops[0].stopId);
      setDestinationStopId(r.stops[1].stopId);
    }
  };

  // Calculate fare preview whenever route or stops change
  useEffect(() => {
    if (selectedRouteId && boardingStopId && destinationStopId) {
      setFareError('');
      api
        .get(
          `/tickets/fare-preview?routeId=${selectedRouteId}&boardingStopId=${boardingStopId}&destinationStopId=${destinationStopId}`
        )
        .then((res) => {
          if (res.success) {
            setFarePreview({ fare: res.fare, distanceKm: res.distanceKm });
          } else {
            setFareError(res.message);
            setFarePreview(null);
          }
        })
        .catch((err) => {
          setFareError(err.message || 'Invalid stop selection');
          setFarePreview(null);
        });
    }
  }, [selectedRouteId, boardingStopId, destinationStopId]);

  const activeRoute = routes.find((r) => r.routeId === selectedRouteId);
  const routeStops = activeRoute?.stops || [];

  const handleBiometricSuccess = (pData: any, proof: string) => {
    setIsAuthVerified(true);
    setAuthProof(proof);
    setPassengerData(pData);
  };

  const handleIssueTicket = async () => {
    setGenerationError('');
    if (!isAuthVerified) {
      setGenerationError('Passenger biometric authentication must be verified before issuing ticket');
      return;
    }
    if (!farePreview) {
      setGenerationError('Please select valid boarding and destination stops');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await api.post('/tickets/generate', {
        conductorEmployeeId: user?.employeeId || 'CB-EMP-2001',
        driverId: selectedDriverId,
        busNumber: selectedBusNumber,
        routeId: selectedRouteId,
        passengerId,
        boardingStopId,
        destinationStopId,
        authVerified: true,
        authMethod: 'SIMULATED_FINGERPRINT',
        authProof,
      });

      if (res.success && res.ticket) {
        setGeneratedTicket(res.ticket);
        // Refresh passenger data to reflect new wallet/credit balance
        api.get(`/conductor/lookup-passenger/${passengerId}`).then((r) => {
          if (r.success) setPassengerData(r.passenger);
        });
      } else {
        setGenerationError(res.message || 'Ticket generation failed');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Transaction rejected');
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine payment method preview
  const willUseCredit =
    passengerData && farePreview && passengerData.walletBalance < farePreview.fare;
  const creditSufficient =
    passengerData &&
    farePreview &&
    passengerData.outstandingCredit + farePreview.fare <= passengerData.creditLimit;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-semibold mb-2">
          <BusIcon className="w-3.5 h-3.5 mr-1" />
          <span>Point-of-Sale Transit Terminal</span>
        </div>
        <h1 className="text-3xl font-black text-white">Issue Transit Ticket</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step biometric validation, route fare calculation, and atomic ticket generation.
        </p>
      </div>

      {generationError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{generationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Equipment & Driver Selection */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Bus Equipment & Operating Crew</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Bus Number</label>
                <select
                  value={selectedBusNumber}
                  onChange={(e) => setSelectedBusNumber(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                >
                  {buses.map((b) => (
                    <option key={b.busId} value={b.busNumber}>
                      {b.busNumber} ({b.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Assigned Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {drivers.map((d) => (
                    <option key={d.driverId} value={d.driverId}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Active Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.routeNumber} — {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Passenger Biometric Authentication */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Passenger Biometric Verification</span>
              </div>
              {isAuthVerified && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  AUTHENTICATED
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Passenger ID</label>
                <input
                  type="text"
                  value={passengerId}
                  onChange={(e) => {
                    setPassengerId(e.target.value);
                    setIsAuthVerified(false);
                    setPassengerData(null);
                  }}
                  placeholder="e.g. CB-PASS-1001"
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowDemoBioModal(true)}
                  className={`w-full py-2 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md ${
                    isAuthVerified
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-600/30'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isAuthVerified ? 'Re-scan Fingerprint' : 'Simulate Biometric Scan'}</span>
                </button>
              </div>
            </div>

            {/* Quick Passenger Selector for Classroom Test */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[11px]">
              <span className="text-slate-500">Quick Test Passenger:</span>
              <button
                type="button"
                onClick={() => {
                  setPassengerId('CB-PASS-1001');
                  setIsAuthVerified(false);
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                CB-PASS-1001 (Funded)
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => {
                  setPassengerId('CB-PASS-1002');
                  setIsAuthVerified(false);
                }}
                className="text-amber-400 hover:underline font-mono"
              >
                CB-PASS-1002 (Zero Bal)
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => {
                  setPassengerId('CB-PASS-1003');
                  setIsAuthVerified(false);
                }}
                className="text-rose-400 hover:underline font-mono"
              >
                CB-PASS-1003 (₹190 Owed)
              </button>
            </div>
          </div>

          {/* Step 3: Boarding & Destination Stop Selection */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Select Journey Stops</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Boarding Stop</label>
                <select
                  value={boardingStopId}
                  onChange={(e) => setBoardingStopId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  {routeStops.map((s) => (
                    <option key={s.stopId} value={s.stopId}>
                      {s.sequenceIndex}. {s.stopName} ({s.distanceFromStartKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Destination Stop</label>
                <select
                  value={destinationStopId}
                  onChange={(e) => setDestinationStopId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  {routeStops.map((s) => (
                    <option key={s.stopId} value={s.stopId}>
                      {s.sequenceIndex}. {s.stopName} ({s.distanceFromStartKm} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {fareError && (
              <p className="text-xs text-rose-400 font-medium">{fareError}</p>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Summary & Fare Breakdown */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Transaction Preview
            </h3>

            {/* Passenger Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger Financial Status</span>
              {passengerData ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <strong className="text-white">{passengerData.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wallet Balance:</span>
                    <strong className="text-emerald-400 font-bold">₹{passengerData.walletBalance}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outstanding Credit:</span>
                    <strong className="text-amber-400 font-bold">₹{passengerData.outstandingCredit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Credit Buffer:</span>
                    <strong className="text-cyan-400 font-bold">₹{passengerData.availableCredit}</strong>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Authenticate passenger to inspect wallet balance and credit eligibility.
                </p>
              )}
            </div>

            {/* Fare Breakdown */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Calculated Distance:</span>
                <strong className="text-white font-mono">
                  {farePreview ? `${farePreview.distanceKm} km` : '—'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Route Base Fare:</span>
                <span className="text-slate-400">₹10 + ₹2.5/km</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Fare:</span>
                <span className="text-3xl font-black text-white">
                  ₹{farePreview?.fare ?? 0}
                </span>
              </div>
            </div>

            {/* Payment Method Resolution Notice */}
            {farePreview && passengerData && (
              <div
                className={`p-3 rounded-xl border text-xs leading-normal ${
                  willUseCredit
                    ? creditSufficient
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-rose-950/60 border-rose-800 text-rose-300'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                }`}
              >
                {willUseCredit ? (
                  creditSufficient ? (
                    <div>
                      <strong className="block font-bold">⚠️ Insufficient Wallet Balance</strong>
                      Fare of ₹{farePreview.fare} will be charged to Emergency Travel Credit. Remaining credit eligibility will become ₹
                      {passengerData.availableCredit - farePreview.fare}.
                    </div>
                  ) : (
                    <div>
                      <strong className="block font-bold">⛔ Credit Limit Exceeded</strong>
                      Transaction of ₹{farePreview.fare} rejected: Would exceed max limit of ₹
                      {passengerData.creditLimit}. Outstanding: ₹{passengerData.outstandingCredit}.
                    </div>
                  )
                ) : (
                  <div>
                    <strong className="block font-bold">✓ Funded via Wallet</strong>
                    Fare of ₹{farePreview.fare} will be deducted from passenger wallet. Remaining balance: ₹
                    {passengerData.walletBalance - farePreview.fare}.
                  </div>
                )}
              </div>
            )}

            {/* Issue Ticket Action Button */}
            <button
              onClick={handleIssueTicket}
              disabled={isGenerating || !isAuthVerified || !farePreview || (willUseCredit && !creditSufficient)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              <span>{isGenerating ? 'Signing & Storing Pass...' : 'Generate & Issue Ticket'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Fingerprint Modal */}
      <DemoFingerprintModal
        isOpen={showDemoBioModal}
        onClose={() => setShowDemoBioModal(false)}
        passengerId={passengerId}
        onVerificationSuccess={handleBiometricSuccess}
      />

      {/* Generated Ticket Pass Display Modal */}
      <DigitalTicketModal
        ticket={generatedTicket}
        isOpen={!!generatedTicket}
        onClose={() => setGeneratedTicket(null)}
      />
    </div>
  );
};
