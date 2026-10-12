import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { MapPin, RefreshCw, Bus, Navigation, AlertCircle, Wifi, Clock } from 'lucide-react';

interface BusLocation {
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  conductorEmployeeId: string;
  conductorName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  passengerCount: number;
  nextStop: string;
  status: 'ACTIVE' | 'IDLE' | 'STOPPED';
  updatedAt: string;
}

export const BusTracker: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState('');

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Dynamically import Leaflet to avoid SSR issues
      const L = await import('leaflet');

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!isMounted || !mapRef.current) return;

      // Default center: Chennai, India (or India center)
      const map = L.map(mapRef.current, {
        center: [13.0827, 80.2707], // Chennai
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch bus locations from API
  const fetchBuses = useCallback(async () => {
    try {
      const res = await api.get('/location/all');
      if (res.success) {
        setBuses(res.buses || []);
        setLastRefresh(new Date());
        setError('');
        updateMapMarkers(res.buses || []);
      }
    } catch (err: any) {
      setError('Could not connect to tracking server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Leaflet markers on the map
  const updateMapMarkers = async (busData: BusLocation[]) => {
    if (!mapInstanceRef.current) return;

    const L = await import('leaflet');

    // Remove markers for buses no longer in list
    for (const [busId, marker] of markersRef.current.entries()) {
      if (!busData.find((b) => b.busId === busId)) {
        marker.remove();
        markersRef.current.delete(busId);
      }
    }

    // Add/update markers
    for (const bus of busData) {
      const isActive = bus.status === 'ACTIVE';

      // Custom bus icon SVG
      const svgIcon = `
        <div style="
          background: ${isActive ? '#10b981' : '#f59e0b'};
          border: 2px solid ${isActive ? '#6ee7b7' : '#fcd34d'};
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 12px ${isActive ? '#10b98170' : '#f59e0b70'};
          font-size: 18px;
        ">🚌</div>
      `;

      const icon = L.divIcon({
        html: svgIcon,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popupContent = `
        <div style="font-family: monospace; min-width: 180px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">🚌 ${bus.busNumber}</div>
          <div style="color: #6b7280; font-size: 11px;">${bus.routeName}</div>
          <hr style="margin: 6px 0; border-color: #374151;">
          <div style="font-size: 11px;"><b>Speed:</b> ${bus.speed} km/h</div>
          <div style="font-size: 11px;"><b>Next Stop:</b> ${bus.nextStop}</div>
          <div style="font-size: 11px;"><b>Conductor:</b> ${bus.conductorName}</div>
          <div style="font-size: 11px; margin-top: 4px;">
            <span style="
              background: ${isActive ? '#065f46' : '#78350f'};
              color: ${isActive ? '#6ee7b7' : '#fcd34d'};
              padding: 2px 6px; border-radius: 4px;
            ">${bus.status}</span>
          </div>
        </div>
      `;

      if (markersRef.current.has(bus.busId)) {
        const existing = markersRef.current.get(bus.busId);
        existing.setLatLng([bus.latitude, bus.longitude]);
        existing.setIcon(icon);
        existing.setPopupContent(popupContent);
      } else {
        const marker = L.marker([bus.latitude, bus.longitude], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedBus(bus);
        });

        markersRef.current.set(bus.busId, marker);
      }
    }

    // Auto-fit bounds if buses exist
    if (busData.length > 0) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.3));
    }
  };

  // Initial fetch + auto refresh every 15 seconds
  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 15000);
    return () => clearInterval(interval);
  }, [fetchBuses]);

  // Center map on selected bus
  const centerOnBus = (bus: BusLocation) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([bus.latitude, bus.longitude], 15);
      const marker = markersRef.current.get(bus.busId);
      if (marker) marker.openPopup();
    }
    setSelectedBus(bus);
  };

  const timeSince = (dateStr: string) => {
    const seconds = Math.round((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.round(seconds / 60)}m ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none -z-10"
        style={{ backgroundImage: `url('/assets/backgrounds/smart-city-highway.jpg')` }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 via-slate-900/90 to-navy-900/90 backdrop-blur-xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Navigation className="w-4 h-4" />
            <span>CLOUDBUS LIVE TRACKER</span>
          </div>
          <h1 className="text-2xl font-black text-white">Live Bus Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GPS positions of all active buses on your route
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Refreshes every 15s</span>
          </div>
          <button
            onClick={fetchBuses}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-cyan-700/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ height: '480px' }}>
            {/* Leaflet CSS */}
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          </div>

          {/* Stats bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center space-x-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-white">{buses.filter(b => b.status === 'ACTIVE').length}</strong> buses active
              </span>
            </div>
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Bus List Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white px-1">Active Buses ({buses.length})</h2>

          {loading && buses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-navy-900/80 border border-slate-800 text-center text-slate-400 text-sm">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-cyan-400" />
              Loading live bus data...
            </div>
          ) : buses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-navy-900/80 border border-slate-800 text-center">
              <Bus className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No buses are currently live</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Buses appear here when conductors enable location sharing on their device.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {buses.map((bus) => (
                <button
                  key={bus.busId}
                  onClick={() => centerOnBus(bus)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedBus?.busId === bus.busId
                      ? 'bg-cyan-950/60 border-cyan-700 shadow-lg shadow-cyan-700/20'
                      : 'bg-navy-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🚌</span>
                      <span className="font-bold text-white font-mono">{bus.busNumber}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bus.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {bus.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-1">{bus.routeName}</div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                    <span>📍 Next: {bus.nextStop}</span>
                    <span>⚡ {bus.speed} km/h</span>
                    <span>👤 {bus.conductorName}</span>
                    <span>🕐 {timeSince(bus.updatedAt)}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-cyan-400 font-mono">
                    {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-1">Map Legend</div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>Active — Moving, GPS broadcasting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Idle — Signal lost &gt;2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
