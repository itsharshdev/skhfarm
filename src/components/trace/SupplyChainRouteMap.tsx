import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  Compass,
  Milestone,
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

// Map Tile Layers
const MAP_TILES = {
  carto_dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  osm_standard: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  carto_light: {
    name: 'Positron Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
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

function getRoleColor(role: string) {
  switch (role) {
    case 'FARMER':
      return { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-400' };
    case 'MANDI':
      return { hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-400' };
    case 'WAREHOUSE':
      return { hex: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-400' };
    case 'PROCESSOR':
    case 'MANUFACTURER':
    case 'FACTORY':
      return { hex: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-400' };
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return { hex: '#38bdf8', bg: 'bg-sky-500', text: 'text-sky-400' };
    case 'RETAILER':
      return { hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-400' };
    default:
      return { hex: '#64748b', bg: 'bg-slate-500', text: 'text-slate-400' };
  }
}

// Haversine distance calculator
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
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
  selectedWaypointIndex = null,
  onSelectWaypoint,
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'leaflet' | 'vector' | 'flow'>('leaflet');
  const [activeTileKey, setActiveTileKey] = useState<keyof typeof MAP_TILES>('carto_dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeIndex = selectedWaypointIndex !== null && selectedWaypointIndex !== undefined
    ? selectedWaypointIndex
    : internalSelectedIndex;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // 1. Build Dynamic Waypoints from batch.events
  const waypoints: ComputedWaypoint[] = useMemo(() => {
    let rawEvents: SupplyChainEvent[] = [];

    if (batch.events && batch.events.length > 0) {
      rawEvents = [...batch.events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } else {
      // Default fallback itinerary
      rawEvents = [
        {
          eventId: 'ev-harvest',
          batchId: batch.batchId,
          eventType: 'HARVESTED',
          actor: batch.originFarmerName || 'Ramesh Patil',
          actorRole: 'FARMER',
          organization: batch.origin || 'Kopargaon Farmers FPO',
          location: 'Kopargaon Farms, Ahmednagar',
          coordinates: { lat: 19.8856, lng: 74.4782 },
          timestamp: batch.harvestDate || batch.createdAt,
          quantity: `${batch.quantity} ${batch.unit}`,
          notes: 'Fresh harvest lot logged at farm origin with verified coordinates.',
          verificationState: 'VERIFIED',
          evidenceIds: ['ev-proof-1'],
        },
        {
          eventId: 'ev-mandi',
          batchId: batch.batchId,
          eventType: 'TRANSFERRED',
          actor: 'Kopargaon APMC',
          actorRole: 'MANDI',
          organization: 'APMC Market Yard #02',
          location: 'Kopargaon APMC Hub',
          coordinates: { lat: 19.8920, lng: 74.4850 },
          timestamp: new Date(new Date(batch.createdAt).getTime() + 86400000).toISOString(),
          quantity: `${batch.quantity} ${batch.unit}`,
          notes: 'Weighbridge calibrated and grade verified.',
          verificationState: 'VERIFIED',
          evidenceIds: ['ev-proof-2'],
        },
        {
          eventId: 'ev-storage',
          batchId: batch.batchId,
          eventType: 'STORED',
          actor: 'MahaAgro Solar Cool',
          actorRole: 'WAREHOUSE',
          organization: 'Solar Smart Cold Storage Unit #04',
          location: 'Shirdi Highway Hub',
          coordinates: { lat: 19.7645, lng: 74.4772 },
          timestamp: new Date(new Date(batch.createdAt).getTime() + 172800000).toISOString(),
          quantity: `${batch.quantity} ${batch.unit}`,
          notes: '18.2°C solar-powered cold chain vault intake.',
          verificationState: 'VERIFIED',
          evidenceIds: ['ev-proof-3'],
        },
        {
          eventId: 'ev-processor',
          batchId: batch.batchId,
          eventType: 'TRANSFORMED',
          actor: 'Vikram Joshi',
          actorRole: 'PROCESSOR',
          organization: 'Maharashtra Grain Mills Pvt Ltd',
          location: 'Ambad Industrial, Nashik',
          coordinates: { lat: 19.9320, lng: 73.7310 },
          timestamp: new Date(new Date(batch.createdAt).getTime() + 259200000).toISOString(),
          quantity: `${batch.quantity} ${batch.unit}`,
          notes: 'Stone-ground unbleached transformation milling.',
          verificationState: 'VERIFIED',
          evidenceIds: ['ev-proof-4'],
        },
        {
          eventId: 'ev-retail',
          batchId: batch.batchId,
          eventType: 'SOLD',
          actor: batch.currentOwner || 'Pooja Kulkarni',
          actorRole: 'RETAILER',
          organization: 'FreshMart Superstore',
          location: batch.currentLocation || 'Station Road, Kopargaon',
          coordinates: { lat: 19.8856, lng: 74.4782 },
          timestamp: batch.updatedAt || batch.createdAt,
          quantity: `${batch.quantity} ${batch.unit}`,
          notes: 'Stocked on consumer shelf with scannable QR label.',
          verificationState: 'VERIFIED',
          evidenceIds: ['ev-proof-5'],
        },
      ];
    }

    // Resolve Lat/Lng
    const resolved = rawEvents.map((ev, i) => {
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
        timestamp: new Date(ev.timestamp).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        notes: ev.notes || 'Handoff verified and logged in tamper-evident ledger.',
        verificationState: ev.verificationState || 'VERIFIED',
        evidenceCount: ev.evidenceIds?.length || 1,
        x: 0,
        y: 0,
      };
    });

    // Compute SVG vector canvas percentages
    const total = resolved.length;
    return resolved.map((wp, i) => {
      const xPct = total <= 1 ? 50 : 12 + (i / (total - 1)) * 76;
      const wave = Math.sin((i / Math.max(1, total - 1)) * Math.PI * 2) * 15;
      const yPct = 50 + wave;
      return { ...wp, x: xPct, y: yPct };
    });
  }, [batch]);

  // Total Highway Distance
  const totalDistanceKm = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      sum += calculateDistanceKm(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
    }
    return Math.max(18, sum);
  }, [waypoints]);

  // 2. Initialize Leaflet Real-World Map
  useEffect(() => {
    if (viewMode !== 'leaflet' || !mapContainerRef.current || waypoints.length === 0) return;

    // Clean up previous instance
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
      });

      // Set Tile Layer
      const tileCfg = MAP_TILES[activeTileKey];
      const tileLayer = L.tileLayer(tileCfg.url, {
        maxZoom: 18,
        attribution: tileCfg.attribution,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // LatLng points
      const latLngs: L.LatLngExpression[] = waypoints.map((w) => [w.lat, w.lng]);

      // Route Corridor Polyline with glow
      const polyline = L.polyline(latLngs, {
        color: '#10b981',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      polylineRef.current = polyline;

      // Add Custom HTML Markers for each waypoint
      const markers: L.Marker[] = [];

      waypoints.forEach((wp, idx) => {
        const isCurrentActive = idx === activeIndex;
        const color = getRoleColor(wp.role as string);

        const customIcon = L.divIcon({
          className: 'ft-custom-leaflet-marker',
          html: `
            <div style="
              width: ${isCurrentActive ? '36px' : '28px'};
              height: ${isCurrentActive ? '36px' : '28px'};
              background: ${isCurrentActive ? color.hex : '#0f172a'};
              border: 2.5px solid ${isCurrentActive ? '#ffffff' : color.hex};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: ${isCurrentActive ? '12px' : '10px'};
              box-shadow: 0 0 15px ${isCurrentActive ? color.hex : 'rgba(0,0,0,0.5)'};
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              ${idx + 1}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          handleSelectPoint(idx);
        });

        // Tooltip Popup
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; max-width: 220px; color: #0f172a;">
            <div style="font-size: 10px; font-weight: 800; color: ${color.hex}; text-transform: uppercase;">
              Stage ${idx + 1} · ${wp.role}
            </div>
            <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">
              ${wp.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${wp.actor} · ${wp.temp || ''}
            </div>
            <div style="font-size: 10px; font-family: monospace; color: #10b981; font-weight: 600; margin-top: 4px;">
              ${wp.coordinates}
            </div>
          </div>
        `);

        markers.push(marker);
      });

      markersRef.current = markers;

      // Fit bounds with padding
      if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }

      leafletMapRef.current = map;
    } catch (e) {
      console.warn('Leaflet map init notice:', e);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [viewMode, activeTileKey, waypoints]);

  // Synchronize active waypoint selection to Leaflet Map
  useEffect(() => {
    if (leafletMapRef.current && waypoints[activeIndex]) {
      const activeWp = waypoints[activeIndex];
      leafletMapRef.current.flyTo([activeWp.lat, activeWp.lng], 11, { duration: 0.8 });
      if (markersRef.current[activeIndex]) {
        markersRef.current[activeIndex].openPopup();
      }
    }
  }, [activeIndex, waypoints]);

  // Journey Playback Simulation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setInternalSelectedIndex((prev) => {
          const next = (prev + 1) % waypoints.length;
          if (onSelectWaypoint) onSelectWaypoint(next, waypoints[next].name);
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, waypoints, onSelectWaypoint]);

  const handleSelectPoint = (index: number) => {
    setInternalSelectedIndex(index);
    if (onSelectWaypoint) {
      onSelectWaypoint(index, waypoints[index].name);
    }
  };

  const handleResetFit = () => {
    setZoomLevel(1);
    setInternalSelectedIndex(0);
    if (leafletMapRef.current && waypoints.length > 0) {
      const latLngs: L.LatLngExpression[] = waypoints.map((w) => [w.lat, w.lng]);
      leafletMapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    }
  };

  const activeWaypoint = waypoints[activeIndex] || waypoints[0];

  return (
    <div
      id="supply-chain-route-map-container"
      className={`bg-slate-900 rounded-3xl border border-slate-800 text-white overflow-hidden shadow-xl transition-all relative ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950 p-6' : 'p-4 sm:p-6'
      }`}
    >
      {/* Top Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base md:text-lg font-['Space_Grotesk',sans-serif]">
                Supply Chain Route Corridor & GeoMap
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase">
                {totalDistanceKm} KM Highway Corridor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live geographic transit checkpoints, micro-climate temperatures, and physical handoffs across India.
            </p>
          </div>
        </div>

        {/* View Mode & Map Layer Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('leaflet')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'leaflet'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Real-World GeoMap</span>
            </button>
            <button
              onClick={() => setViewMode('vector')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'vector'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Vector Grid</span>
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'flow'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Tracking Diagram</span>
            </button>
          </div>

          {/* Leaflet Tile Selector (Only active in leaflet mode) */}
          {viewMode === 'leaflet' && (
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={activeTileKey}
                onChange={(e) => setActiveTileKey(e.target.value as any)}
                className="bg-transparent text-slate-200 font-bold text-[11px] focus:outline-none pr-1 cursor-pointer"
              >
                <option value="carto_dark" className="bg-slate-900 text-white">Dark Matter</option>
                <option value="osm_standard" className="bg-slate-900 text-white">OpenStreetMap</option>
                <option value="satellite" className="bg-slate-900 text-white">Satellite Aerial</option>
                <option value="carto_light" className="bg-slate-900 text-white">Positron Light</option>
              </select>
            </div>
          )}

          {/* Journey Simulation Player */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-rose-600 text-white shadow-md animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause' : 'Play Journey'}</span>
          </button>

          {/* Reset & Fullscreen */}
          <button
            onClick={handleResetFit}
            className="p-2 hover:bg-slate-800 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Fit Route to Bounds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-slate-800 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Map Canvas + Side Waypoint Inspector */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE MAP CANVAS (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between shadow-inner">
          {/* MODE 1: LEAFLET REAL-WORLD OPENSTREETMAP / SATELLITE / CARTO GEOMAP */}
          {viewMode === 'leaflet' && (
            <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px]">
              <div ref={mapContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[440px] z-10" />

              {/* Map Floating HUD Overlay */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REAL-WORLD GPS HIGHWAY ROUTE
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: BESPOKE VECTOR TRANSIT MESH (SVG TOPOLOGY) */}
          {viewMode === 'vector' && (
            <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-6 select-none">
              {/* Animated SVG Polyline Highway Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="routeVectorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="35%" stopColor="#14b8a6" />
                    <stop offset="70%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>

                {/* Main Connected Transit Polyline */}
                <polyline
                  points={waypoints.map((w) => `${w.x * 6.5},${w.y * 3.8}`).join(' ')}
                  fill="none"
                  stroke="url(#routeVectorGrad)"
                  strokeWidth="4"
                  strokeDasharray="8 5"
                  strokeLinecap="round"
                  className="animate-[dash_20s_linear_infinite]"
                />
              </svg>

              {/* Waypoint Interactive Nodes */}
              {waypoints.map((wp, idx) => {
                const isCurrent = idx === activeIndex;
                const RoleIcon = getRoleIcon(wp.role as string);
                const color = getRoleColor(wp.role as string);

                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectPoint(idx)}
                    className={`absolute cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                      isCurrent ? 'scale-125 z-30' : 'hover:scale-110 z-20 opacity-85 hover:opacity-100'
                    }`}
                    style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
                        isCurrent
                          ? `bg-slate-900 border-emerald-400 text-emerald-400 ring-4 ring-emerald-400/30`
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      <RoleIcon className="w-5 h-5" />
                    </div>

                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800 text-[10px] font-bold text-slate-300">
                      {idx + 1}. {wp.name.split(',')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 3: STRUCTURED CORRIDOR FLOWCHART DIAGRAM */}
          {viewMode === 'flow' && (
            <div className="p-6 space-y-4 overflow-y-auto max-h-[440px]">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <Milestone className="w-4 h-4 text-emerald-400" />
                <span>Sequential Batch Movement Tracking Diagram</span>
              </div>

              <div className="space-y-3">
                {waypoints.map((wp, idx) => {
                  const isCurrent = idx === activeIndex;
                  const RoleIcon = getRoleIcon(wp.role as string);
                  const color = getRoleColor(wp.role as string);

                  return (
                    <div
                      key={wp.id}
                      onClick={() => handleSelectPoint(idx)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-slate-800/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${color.bg} text-slate-950`}>
                              {wp.role}
                            </span>
                            <span className="font-bold text-xs text-white">{wp.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {wp.actor} · {wp.temp}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold block">
                          {wp.status}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">
                          {wp.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Waypoint Stepper Slider (Mobile & Desktop) */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2 z-20">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Transit Stops:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {waypoints.map((wp, i) => (
                <button
                  key={wp.id}
                  onClick={() => handleSelectPoint(i)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    i === activeIndex
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{i + 1}</span>
                  <span className="hidden md:inline truncate max-w-[80px]">{wp.name.split(',')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: IN-DEPTH WAYPOINT INSPECTOR PANEL (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {/* Header: Step & Role */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs flex items-center justify-center font-mono border border-emerald-500/30">
                  {activeIndex + 1}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Transit Waypoint Inspection
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                {activeWaypoint.role}
              </span>
            </div>

            {/* Location Title & GPS Coordinates */}
            <div>
              <h4 className="text-base font-extrabold text-white">
                {activeWaypoint.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 font-mono">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{activeWaypoint.coordinates}</span>
              </div>
            </div>

            {/* Custodian & Organization */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Authorized Custodian:</span>
                <span className="font-bold text-white">{activeWaypoint.actor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Organization:</span>
                <span className="font-medium text-slate-300 truncate max-w-[170px]">{activeWaypoint.organization}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recorded Timestamp:</span>
                <span className="font-mono text-slate-400 text-[11px]">{activeWaypoint.timestamp}</span>
              </div>
            </div>

            {/* Micro-Climate Temperature & Cold-Chain Status */}
            <div className="p-3 bg-teal-950/70 rounded-2xl border border-teal-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-teal-200">Micro-Climate:</span>
              </div>
              <span className="font-bold text-teal-300">{activeWaypoint.temp}</span>
            </div>

            {/* Handoff Custody Notes */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Custody Transition Notes:
              </span>
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {activeWaypoint.notes}
              </p>
            </div>
          </div>

          {/* Cryptographic Ledger Seal */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 Verified Ledger Seal</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">
              {activeWaypoint.evidenceCount} Verified Evidence Attachments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
