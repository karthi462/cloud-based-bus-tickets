import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LocationSharingProps {
  busId: string;
  busNumber: string;
  routeId?: string;
  routeName?: string;
}

export const ConductorLocationSharing: React.FC<LocationSharingProps> = ({
  busId,
  busNumber,
  routeId,
  routeName,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'locating' | 'sharing' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const sendLocation = async (pos: GeolocationPosition) => {
    try {
      const { latitude, longitude, accuracy, speed: rawSpeed, heading } = pos.coords;
      const speedKmh = rawSpeed ? Math.round(rawSpeed * 3.6) : 0;

      await api.post('/location/update', {
        busId,
        busNumber,
        routeId: routeId || 'R-101',
        routeName: routeName || 'Main Route',
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        speed: speedKmh,
        heading: heading ?? 0,
        passengerCount: 0,
        nextStop: 'Next Stop',
        status: 'ACTIVE',
      });

      setLastLocation({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });
      setSpeed(speedKmh);
      setUpdateCount((c) => c + 1);
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      setErrorMsg('GPS not available on this device');
      setStatus('error');
      return;
    }

    setStatus('locating');
    setErrorMsg('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
        setStatus('sharing');
        sendLocation(pos);
      },
      (err) => {
        setErrorMsg(
          err.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to get GPS signal. Move to open area.'
        );
        setStatus('error');
        setIsSharing(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Also send every 10 seconds as backup
    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocation(lastPositionRef.current);
      }
    }, 10000);

    setIsSharing(true);
  };

  const stopSharing = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await api.post('/location/stop', { busId });
    } catch (_) {}

    setIsSharing(false);
    setStatus('idle');
    setLastLocation(null);
    setUpdateCount(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-slate-900 border border-cyan-800/40 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isSharing ? 'bg-emerald-600/20 border border-emerald-500' : 'bg-slate-800 border border-slate-700'
          }`}>
            <Navigation className={`w-4 h-4 ${isSharing ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Live Location Sharing
            </span>
            <span className="text-[11px] text-slate-500">
              Bus: <strong className="text-white font-mono">{busNumber}</strong>
            </span>
          </div>
        </div>

        {/* Live indicator */}
        {isSharing && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="mb-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
        {status === 'idle' && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <WifiOff className="w-4 h-4" />
            <span>Location sharing is off. Passengers cannot track this bus.</span>
          </div>
        )}
        {status === 'locating' && (
          <div className="flex items-center space-x-2 text-xs text-amber-400 animate-pulse">
            <MapPin className="w-4 h-4" />
            <span>Acquiring GPS signal...</span>
          </div>
        )}
        {status === 'sharing' && lastLocation && (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <Wifi className="w-4 h-4" />
              <span>Broadcasting live to passengers</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                <div className="font-mono text-cyan-300 font-bold">{lastLocation.lat.toFixed(5)}</div>
                <div className="text-slate-500 mt-0.5">Latitude</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                <div className="font-mono text-cyan-300 font-bold">{lastLocation.lng.toFixed(5)}</div>
                <div className="text-slate-500 mt-0.5">Longitude</div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                <div className="font-mono text-amber-300 font-bold">{speed} km/h</div>
                <div className="text-slate-500 mt-0.5">Speed</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Accuracy: ±{lastLocation.accuracy}m</span>
              <span>Updates sent: <strong className="text-cyan-400">{updateCount}</strong></span>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-start space-x-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={isSharing ? stopSharing : startSharing}
        disabled={status === 'locating'}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 ${
          isSharing
            ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-700/30'
            : status === 'locating'
            ? 'bg-amber-700/50 text-amber-300 cursor-wait'
            : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-700/30'
        }`}
      >
        <Navigation className="w-4 h-4" />
        <span>
          {isSharing
            ? 'Stop Location Sharing'
            : status === 'locating'
            ? 'Getting GPS...'
            : 'Start Location Sharing'}
        </span>
      </button>

      <p className="text-[10px] text-slate-500 text-center mt-2">
        {isSharing
          ? 'Passengers can now see this bus on the live map'
          : 'Enable so passengers can track this bus in real time'}
      </p>
    </div>
  );
};
