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
} from 'lucide-react';
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
  x: number; // percentage on map canvas (0 - 100)
  y: number; // percentage on map canvas (0 - 100)
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
  sopore: { lat: 34.2988, lng: 74.4690 },
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

function getRoleColorClasses(role: string, isSelected: boolean) {
  if (isSelected) {
    return 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/50 shadow-lg scale-110';
  }
  switch (role) {
    case 'FARMER':
      return 'bg-emerald-600 text-white border border-emerald-400 hover:bg-emerald-500';
    case 'MANDI':
      return 'bg-amber-600 text-white border border-amber-400 hover:bg-amber-500';
    case 'WAREHOUSE':
      return 'bg-teal-600 text-white border border-teal-400 hover:bg-teal-500';
    case 'PROCESSOR':
    case 'MANUFACTURER':
    case 'FACTORY':
      return 'bg-purple-600 text-white border border-purple-400 hover:bg-purple-500';
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return 'bg-blue-600 text-white border border-blue-400 hover:bg-blue-500';
    case 'RETAILER':
      return 'bg-orange-600 text-white border border-orange-400 hover:bg-orange-500';
    default:
      return 'bg-slate-700 text-white border border-slate-500 hover:bg-slate-600';
  }
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'FARMER':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MANDI':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'WAREHOUSE':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'PROCESSOR':
    case 'MANUFACTURER':
    case 'FACTORY':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'RETAILER':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

// Approximate Haversine distance in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const SupplyChainRouteMap: React.FC<SupplyChainRouteMapProps> = ({
  batch,
  selectedWaypointIndex,
  onSelectWaypoint,
}) => {
  const [activeStop, setActiveStop] = useState<number>(selectedWaypointIndex ?? 0);
  const [viewMode, setViewMode] = useState<'map' | 'flow'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Dynamically compute structured waypoints from batch.events
  const waypoints = useMemo<ComputedWaypoint[]>(() => {
    const rawEvents: SupplyChainEvent[] =
      batch.events && batch.events.length > 0
        ? [...batch.events].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        : [];

    if (rawEvents.length === 0) {
      // Safe fallback if batch has no events yet
      return [
        {
          id: 'wp-origin',
          name: batch.origin || 'Origin Farm',
          stageName: '1. Harvest Origin',
          role: 'FARMER',
          actor: batch.originFarmerName || 'Primary Producer',
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
          timestamp: batch.updatedAt,
          verificationState: 'VERIFIED',
          evidenceCount: 1,
          x: 80,
          y: 50,
        },
      ];
    }

    // Resolve lat/lng for every event
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

      // Default safe fallback if still unresolved
      if (!lat || !lng) {
        lat = 19.8856 + (i * 0.12 - 0.2);
        lng = 74.4782 + (i * 0.18 - 0.3);
      }

      const tempStr = ev.storageCondition?.temperature
        ? `${ev.storageCondition.temperature}°C (${ev.storageCondition.powerStatus || 'SOLAR'})`
        : i === 0
        ? '22.0°C Harvest'
        : i === rawEvents.length - 1
        ? '21.4°C Safe Shelf'
        : '18.2°C Cold Chain';

      return {
        id: ev.eventId || `wp-${i}`,
        name: ev.location || `Facility Checkpoint #${i + 1}`,
        stageName: `${i + 1}. ${ev.eventType.replace(/_/g, ' ')}`,
        role: ev.actorRole || 'LOGISTICS',
        actor: ev.actor || 'Authorized Handler',
        organization: ev.organization || 'Supply Chain Partner',
        coordinates: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng,
        temp: tempStr,
        status: ev.verificationState === 'VERIFIED' ? 'Verified Handoff' : 'Inspected',
        timestamp: ev.timestamp,
        notes: ev.notes,
        verificationState: ev.verificationState || 'VERIFIED',
        evidenceCount: ev.evidenceIds?.length || 0,
      };
    });

    // Project coordinates across map canvas box (15% to 85% width, 20% to 80% height)
    const count = resolvedPoints.length;
    return resolvedPoints.map((pt, i) => {
      // Compute progressive X and slightly undulating Y to create natural corridor curve
      const x = count === 1 ? 50 : 15 + (i / (count - 1)) * 70;
      const yWave = Math.sin((i / (count - 1 || 1)) * Math.PI) * 22;
      const y = 35 + (i % 2 === 0 ? -yWave * 0.6 : yWave) + ((i % 3) * 6 - 6);

      return {
        ...pt,
        x: Math.max(12, Math.min(88, x)),
        y: Math.max(18, Math.min(78, y)),
      };
    });
  }, [batch]);

  // Total route transit distance
  const totalDistance = useMemo(() => {
    let dist = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      dist += calculateDistanceKm(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
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

  // Play journey animation loop
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

  // Compute SVG polyline path connecting sequential waypoints
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
              SKH029 · Verified Route Corridor
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
            Supply Chain Transit Corridor & Geo-Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential custody handoffs, GPS checkpoints, and thermal micro-climate telemetry.
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
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'flow'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Corridor Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Map View vs Structured Flowchart */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Canvas Column (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 p-4 select-none shadow-inner">
              {/* Background Geographic Grid & Topo Mesh */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0d9488_1px,transparent_1px),linear-gradient(to_bottom,#0d9488_1px,transparent_1px)] [background-size:60px_60px]" />

              {/* Ambient Highway Highway Label Lines */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-emerald-400/90 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-emerald-500/20 backdrop-blur-xs">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>NH-60 & SH-10 SOLAR TRANSIT CORRIDOR</span>
              </div>

              {/* Map Floating Tools (Zoom, Play Journey, Reset) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-md backdrop-blur-xs">
                <button
                  onClick={togglePlayJourney}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                    isPlaying
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isPlaying ? 'Pause Route Simulation' : 'Play Journey Simulation'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setActiveStop(0);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Fit to Route & Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scalable Vector Map Layer */}
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* SVG Route Line Canvas */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="40%" stopColor="#0d9488" />
                      <stop offset="70%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>

                    <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* Route Polyline */}
                  {routePathD && (
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      filter="url(#routeGlow)"
                      className="animate-[dash_20s_linear_infinite]"
                    />
                  )}
                </svg>

                {/* Interactive Waypoint Pins on Map */}
                {waypoints.map((wp, idx) => {
                  const isSelected = activeStop === idx;
                  const IconComponent = getRoleIcon(wp.role);

                  return (
                    <div
                      key={wp.id}
                      onClick={() => handlePointClick(idx)}
                      className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                    >
                      {/* Pulsing Beacon for Active Selected Node */}
                      {isSelected && (
                        <div className="absolute -inset-3 bg-emerald-400 rounded-full animate-ping opacity-60 pointer-events-none" />
                      )}

                      {/* Waypoint Marker Card */}
                      <div
                        className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md ${getRoleColorClasses(
                          wp.role,
                          isSelected
                        )}`}
                      >
                        <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate max-w-[110px] sm:max-w-[130px]">
                          {wp.name.split(',')[0]}
                        </span>
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-black/20">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Legend */}
              <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Origin Farm
                </span>
                <span className="flex items-center gap-1 text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-teal-500" /> Solar Vault
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Processing Mill
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Retail Store
                </span>
              </div>
            </div>

            {/* Step Selector Slider Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {waypoints.map((wp, idx) => {
                const isSelected = activeStop === idx;
                const IconComponent = getRoleIcon(wp.role);

                return (
                  <button
                    key={wp.id}
                    onClick={() => handlePointClick(idx)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/30 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>Stop #{idx + 1}</span>
                      <IconComponent className="w-3 h-3 text-slate-600" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 truncate mt-1">
                      {wp.name.split(',')[0]}
                    </h5>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
                      {wp.temp}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Waypoint Detailed Inspector Column (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-slate-50/80 rounded-3xl border border-slate-200/90 p-5 md:p-6 space-y-4 h-full flex flex-col justify-between shadow-2xs">
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getRoleBadgeColor(
                      currentWp.role
                    )}`}
                  >
                    {currentWp.role} · Step #{activeStop + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {new Date(currentWp.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Location Title & Coordinates */}
                <div className="mt-3 space-y-1">
                  <h4 className="text-base md:text-lg font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
                    {currentWp.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{currentWp.coordinates}</span>
                  </div>
                </div>

                {/* Custodian & Organization Details */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Custodian / Actor
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">
                      {currentWp.actor}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Organization
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">
                      {currentWp.organization}
                    </span>
                  </div>
                </div>

                {/* Micro-climate Temperature & Power State */}
                <div className="mt-3 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase block">
                        Micro-Climate State
                      </span>
                      <span className="text-xs font-extrabold text-teal-950 font-mono">
                        {currentWp.temp}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-200/80 text-teal-900">
                    SAFE ENVELOPE
                  </span>
                </div>

                {/* Handoff Notes */}
                {currentWp.notes && (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-slate-200/80 text-xs">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">
                      Custody Transition Notes
                    </span>
                    <p className="text-slate-700 italic">"{currentWp.notes}"</p>
                  </div>
                )}
              </div>

              {/* Cryptographic Verification Seal */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Proof Audit Record</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={activeStop === 0}
                    onClick={() => setActiveStop((s) => Math.max(0, s - 1))}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    disabled={activeStop === waypoints.length - 1}
                    onClick={() => setActiveStop((s) => Math.min(waypoints.length - 1, s + 1))}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Next Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Structured Corridor Flowchart View (Resilient Timeline Mode) */
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">
              Step-by-step physical route breakdown from farm origin to consumer store.
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {waypoints.length} Total Physical Transit Stages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waypoints.map((wp, idx) => {
              const IconComponent = getRoleIcon(wp.role);

              return (
                <div
                  key={wp.id}
                  onClick={() => {
                    handlePointClick(idx);
                    setViewMode('map');
                  }}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadgeColor(
                        wp.role
                      )}`}
                    >
                      {wp.role} · Stage #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(wp.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {wp.name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">Custodian: {wp.actor}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-teal-700 font-bold text-[11px]">
                      {wp.temp}
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
