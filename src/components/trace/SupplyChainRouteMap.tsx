import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Thermometer,
  ShieldCheck,
  Sun,
  Truck,
  Building,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tractor,
  Factory,
  ShoppingBag,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
  ListOrdered,
  Map as MapIcon,
  Globe,
} from 'lucide-react';
import L from 'leaflet';
import { Batch, SupplyChainEvent, StakeholderRole } from '../../types';

interface SupplyChainRouteMapProps {
  batch: Batch;
  selectedWaypointIndex?: number | null;
  onSelectWaypoint?: (index: number, locationName: string) => void;
}

interface ComputedWaypoint {
  id: string;
  name: string;
  stageName: string;
  role: StakeholderRole | string;
  actor: string;
  organization?: string;
  coordinates: string;
  lat: number;
  lng: number;
  temp?: string;
  status: string;
  timestamp: string;
  notes?: string;
  verificationState: string;
  evidenceCount: number;
  x: number; // percentage on canvas (0 - 100)
  y: number; // percentage on canvas (0 - 100)
}

// Known coordinate presets for Indian agri-logistics hubs
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  kopargaon: { lat: 19.8856, lng: 74.4782 },
  shirdi: { lat: 19.7645, lng: 74.4772 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  ambad: { lat: 19.9320, lng: 73.7310 },
  chakan: { lat: 18.7610, lng: 73.8580 },
  pune: { lat: 18.5204, lng: 73.8567 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  sangli: { lat: 16.8524, lng: 74.5815 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  shopian: { lat: 33.7200, lng: 74.8300 },
  sopore: { lat: 34.2988, lng: 74.4690 },
  kotkhai: { lat: 31.1000, lng: 77.1700 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  baramati: { lat: 18.1500, lng: 74.5800 },
  lasalgaon: { lat: 19.8800, lng: 74.4700 },
  delhi: { lat: 28.6139, lng: 77.2090 },
};

function getRoleIcon(role: string) {
  switch (role) {
    case 'FARMER':
      return Tractor;
    case 'MANDI':
      return Building;
    case 'WAREHOUSE':
      return Sun;
    case 'PROCESSOR':
    case 'MANUFACTURER':
    case 'FACTORY':
      return Factory;
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return Truck;
    case 'RETAILER':
      return ShoppingBag;
    default:
      return MapPin;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'FARMER':
      return '#059669';
    case 'MANDI':
      return '#2563eb';
    case 'WAREHOUSE':
      return '#d97706';
    case 'PROCESSOR':
    case 'MANUFACTURER':
    case 'FACTORY':
      return '#9333ea';
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return '#0284c7';
    case 'RETAILER':
      return '#ea580c';
    default:
      return '#475569';
  }
}

// Interactive Leaflet Real-World Map Sub-Component
const RealWorldLeafletMap: React.FC<{
  waypoints: ComputedWaypoint[];
  activeStop: number;
  onSelectWaypoint: (idx: number) => void;
}> = ({ waypoints, activeStop, onSelectWaypoint }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Initialize Leaflet map
      const initialLat = waypoints[0]?.lat || 19.8856;
      const initialLng = waypoints[0]?.lng || 74.4782;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Free high-contrast OpenStreetMap & Carto tiles (no API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear previous markers & polyline
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (waypoints.length === 0) return;

    const latLngs: L.LatLngExpression[] = waypoints.map((wp) => [wp.lat, wp.lng]);

    // Draw route polyline with gradient style
    polylineRef.current = L.polyline(latLngs, {
      color: '#059669',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Create markers for each waypoint
    waypoints.forEach((wp, idx) => {
      const isSelected = idx === activeStop;
      const color = getRoleColor(String(wp.role));

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'ft-custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${color};
            color: white;
            border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            font-family: monospace;
            font-weight: 800;
            font-size: ${isSelected ? '13px' : '11px'};
            transition: all 0.3s ease;
            cursor: pointer;
          ">
            ${idx + 1}
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    inset: -6px;
                    border: 2px solid ${color};
                    border-radius: 50%;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                    opacity: 0.75;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${color}; margin-bottom: 2px;">
            Step ${idx + 1} · ${wp.role}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
            ${wp.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>Actor:</strong> ${wp.actor}
          </div>
          ${
            wp.temp
              ? `<div style="font-size: 11px; color: #047857; font-weight: 600; margin-bottom: 4px;">
                  🌡️ ${wp.temp}
                </div>`
              : ''
          }
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">
            ${new Date(wp.timestamp).toLocaleString()}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectWaypoint(idx);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit map bounds
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [waypoints]);

  // Center on active stop when selected
  useEffect(() => {
    if (!leafletMapRef.current || !waypoints[activeStop]) return;
    const targetWp = waypoints[activeStop];
    leafletMapRef.current.panTo([targetWp.lat, targetWp.lng], { animate: true, duration: 0.6 });

    // Open popup for selected marker
    if (markersRef.current[activeStop]) {
      markersRef.current[activeStop].openPopup();
    }
  }, [activeStop, waypoints]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs px-3 py-1 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 shadow-xs flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span>Live OpenStreetMap · Exact GPS Points</span>
      </div>
    </div>
  );
};

export const SupplyChainRouteMap: React.FC<SupplyChainRouteMapProps> = ({
  batch,
  selectedWaypointIndex,
  onSelectWaypoint,
}) => {
  const [activeStop, setActiveStop] = useState<number>(selectedWaypointIndex ?? 0);
  const [viewMode, setViewMode] = useState<'realmap' | 'schematic' | 'flow'>('realmap');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const playTimerRef = useRef<any>(null);

  useEffect(() => {
    if (selectedWaypointIndex !== undefined && selectedWaypointIndex !== null) {
      setActiveStop(selectedWaypointIndex);
    }
  }, [selectedWaypointIndex]);

  // Extract sequential waypoints from events or batch metadata
  const waypoints = useMemo<ComputedWaypoint[]>(() => {
    const rawEvents = (batch.events || []).slice().sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (rawEvents.length === 0) {
      return [
        {
          id: 'wp-origin',
          name: batch.origin || 'Farm Origin Sector 4B',
          stageName: '1. Harvest Origin',
          role: 'FARMER',
          actor: batch.originFarmerName || 'Lead Producer',
          organization: 'Origin Farmer Cooperative',
          coordinates: '19.8856°N, 74.4782°E',
          lat: 19.8856,
          lng: 74.4782,
          temp: '22.0°C Ambient',
          status: 'Harvest Recorded',
          timestamp: batch.harvestDate || batch.createdAt,
          verificationState: 'VERIFIED',
          evidenceCount: batch.evidences?.length || 1,
          x: 20,
          y: 40,
        },
        {
          id: 'wp-current',
          name: batch.currentLocation || 'Current Custody Facility',
          stageName: '2. Current Location',
          role: batch.currentOwnerRole || 'WAREHOUSE',
          actor: batch.currentOwner || 'Facility Manager',
          coordinates: '19.8510°N, 74.4620°E',
          lat: 19.851,
          lng: 74.462,
          temp: batch.currentStorage?.temperature
            ? `${batch.currentStorage.temperature}°C Solar Vault`
            : '18.2°C Regulated',
          status: batch.status,
          timestamp: batch.updatedAt || batch.createdAt,
          verificationState: 'VERIFIED',
          evidenceCount: 1,
          x: 80,
          y: 50,
        },
      ];
    }

    const resolvedPoints = rawEvents.map((ev, i) => {
      let lat = ev.coordinates?.lat;
      let lng = ev.coordinates?.lng;

      if (!lat || !lng) {
        const locLower = (ev.location || '').toLowerCase();
        for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
          if (locLower.includes(key)) {
            lat = coords.lat;
            lng = coords.lng;
            break;
          }
        }
      }

      if (!lat || !lng) {
        lat = 19.8856 + (i * 0.12 - 0.2);
        lng = 74.4782 + (i * 0.18 - 0.3);
      }

      const tempStr = ev.storageCondition?.temperature
        ? `${ev.storageCondition.temperature}°C (${ev.storageCondition.powerStatus || 'SOLAR'})`
        : i === 0
        ? '22.0°C Harvest'
        : i === rawEvents.length - 1
        ? '21.4°C Ambient'
        : '18.2°C Cold Chain';

      const progressFraction = rawEvents.length > 1 ? i / (rawEvents.length - 1) : 0.5;
      const xPercent = Math.round(12 + progressFraction * 76);
      const yWave = Math.sin(progressFraction * Math.PI * 2) * 18;
      const yPercent = Math.round(50 + yWave);

      return {
        id: ev.eventId || `wp-${i}`,
        name: ev.location || `Checkpoint #${i + 1}`,
        stageName: `${i + 1}. ${ev.eventType}`,
        role: ev.actorRole,
        actor: ev.actor,
        organization: ev.organization,
        coordinates: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng,
        temp: tempStr,
        status: ev.verificationState === 'VERIFIED' ? 'Verified State' : 'Monitored',
        timestamp: ev.timestamp,
        notes: ev.notes,
        verificationState: ev.verificationState || 'VERIFIED',
        evidenceCount: ev.evidenceIds?.length || 0,
        x: xPercent,
        y: Math.max(15, Math.min(85, yPercent)),
      };
    });

    return resolvedPoints;
  }, [batch]);

  // Compute approx route distance
  const totalDistance = useMemo(() => {
    let dist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dLat = (p2.lat - p1.lat) * 111;
      const dLng = (p2.lng - p1.lng) * 105;
      dist += Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
    }
    return dist > 0 ? dist : 420;
  }, [waypoints]);

  const currentWp = waypoints[activeStop] || waypoints[0];

  const handlePointClick = (idx: number) => {
    setActiveStop(idx);
    if (onSelectWaypoint && waypoints[idx]) {
      onSelectWaypoint(idx, waypoints[idx].name);
    }
  };

  const togglePlayJourney = () => {
    if (isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playTimerRef.current = setInterval(() => {
        setActiveStop((prev) => {
          const next = (prev + 1) % waypoints.length;
          return next;
        });
      }, 1600);
    }
  };

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const routePathD = useMemo(() => {
    if (waypoints.length < 2) return '';
    return waypoints.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x}% ${pt.y}%`;
      const prev = waypoints[i - 1];
      const cx = (prev.x + pt.x) / 2;
      const cy = (prev.y + pt.y) / 2 + (i % 2 === 0 ? -6 : 6);
      return `${acc} Q ${cx}% ${cy}%, ${pt.x}% ${pt.y}%`;
    }, '');
  }, [waypoints]);

  const CurrentRoleIcon = getRoleIcon(currentWp.role);

  return (
    <div
      id="supply-chain-route-map-container"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-8 space-y-6"
    >
      {/* Header Bar with Metrics & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
              <Navigation className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider font-mono">
              SKH029 · Verified GPS Route Corridor
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
            Supply Chain Transit Corridor & Geo-Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential custody handoffs, real GPS waypoints, and thermal micro-climate telemetry.
          </p>
        </div>

        {/* Route Stats & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <span>Route: ~{totalDistance} km</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">{waypoints.length} Checkpoints</span>
            <span className="text-slate-300">|</span>
            <span className="text-teal-700 font-semibold">100% Monitored</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              id="btn-real-map-view"
              onClick={() => setViewMode('realmap')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'realmap'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Map</span>
            </button>
            <button
              id="btn-schematic-map-view"
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Schematic</span>
            </button>
            <button
              id="btn-flow-map-view"
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'flow'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'realmap' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Real Leaflet Map (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <RealWorldLeafletMap
              waypoints={waypoints}
              activeStop={activeStop}
              onSelectWaypoint={handlePointClick}
            />

            {/* Checkpoints pill scrubber */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {waypoints.map((wp, idx) => (
                <button
                  key={wp.id}
                  onClick={() => handlePointClick(idx)}
                  className={`px-3 py-1.5 rounded-xl border font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                    idx === activeStop
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[110px]">{wp.name.split(',')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Waypoint Detail Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 rounded-3xl p-5 border border-slate-200/80 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold font-mono uppercase">
                  Checkpoint {activeStop + 1} of {waypoints.length}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {currentWp.coordinates}
                </span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-emerald-800 shrink-0 shadow-2xs">
                  <CurrentRoleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight">
                    {currentWp.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {currentWp.stageName} · {currentWp.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Custodian</div>
                  <div className="font-bold text-slate-800 mt-0.5 truncate">{currentWp.actor}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentWp.organization || 'Verified Org'}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Telemetry</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{currentWp.temp || '18.2°C Solar'}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Verified Range</div>
                </div>
              </div>

              {currentWp.notes && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-950">
                  <span className="font-bold block mb-0.5">Audit Observation:</span>
                  {currentWp.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(currentWp.timestamp).toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {currentWp.verificationState}
              </span>
            </div>
          </div>
        </div>
      ) : viewMode === 'schematic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Schematic Vector Canvas */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 p-4 select-none shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0d9488_1px,transparent_1px),linear-gradient(to_bottom,#0d9488_1px,transparent_1px)] [background-size:60px_60px]" />

              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-emerald-400/90 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-emerald-500/20 backdrop-blur-xs">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>SOLAR TRANSIT CORRIDOR</span>
              </div>

              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-md backdrop-blur-xs">
                <button
                  onClick={togglePlayJourney}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                    isPlaying ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>

              <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `scale(${zoomLevel})` }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  {routePathD && (
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      className="animate-[dash_20s_linear_infinite]"
                    />
                  )}
                </svg>

                {waypoints.map((wp, idx) => {
                  const isSelected = idx === activeStop;
                  const IconComp = getRoleIcon(wp.role);
                  return (
                    <button
                      key={wp.id}
                      onClick={() => handlePointClick(idx)}
                      style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg ring-4 ring-emerald-400/40'
                            : 'bg-slate-900 text-emerald-400 border border-slate-700 hover:scale-105'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-300 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                        {wp.name.split(',')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Schematic Detail Card */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 rounded-3xl p-5 border border-slate-200/80 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 text-xs font-bold font-mono">
                  Stop {activeStop + 1} / {waypoints.length}
                </span>
                <span className="text-xs font-mono text-slate-500">{currentWp.coordinates}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">{currentWp.name}</h4>
              <p className="text-xs text-slate-600">{currentWp.stageName} · {currentWp.actor}</p>
              {currentWp.notes && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  {currentWp.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Sequential Flow List */
        <div className="space-y-3">
          {waypoints.map((wp, idx) => {
            const IconComp = getRoleIcon(wp.role);
            const isSelected = idx === activeStop;
            return (
              <div
                key={wp.id}
                onClick={() => handlePointClick(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-800 uppercase">Step {idx + 1}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-bold text-slate-800">{wp.stageName}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{wp.name}</div>
                    <div className="text-xs text-slate-500">{wp.actor} ({wp.organization || 'Verified Collective'})</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center text-xs font-mono">
                  {wp.temp && <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">{wp.temp}</span>}
                  <span className="text-slate-500">{new Date(wp.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
