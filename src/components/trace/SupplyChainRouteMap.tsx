import React, { useState } from 'react';
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
} from 'lucide-react';
import { Batch } from '../../types';

interface SupplyChainRouteMapProps {
  batch: Batch;
  selectedWaypointIndex?: number | null;
  onSelectWaypoint?: (index: number, locationName: string) => void;
}

interface Waypoint {
  id: string;
  name: string;
  stage: string;
  role: string;
  actor: string;
  coordinates: string;
  temp?: string;
  status: string;
  x: number; // percentage on map canvas
  y: number; // percentage on map canvas
  highlight?: boolean;
}

export const SupplyChainRouteMap: React.FC<SupplyChainRouteMapProps> = ({
  batch,
  selectedWaypointIndex,
  onSelectWaypoint,
}) => {
  const [activeStop, setActiveStop] = useState<number>(selectedWaypointIndex ?? 0);

  const waypoints: Waypoint[] = [
    {
      id: 'wp-1',
      name: 'Kopargaon Organic Farms',
      stage: '1. Origin Harvest',
      role: 'FARMER',
      actor: batch.originFarmerName || 'Ramesh Patil',
      coordinates: '19.8856°N, 74.4782°E',
      temp: '22.0°C Harvest Ambient',
      status: 'Verified Field Harvest',
      x: 20,
      y: 35,
    },
    {
      id: 'wp-2',
      name: 'MahaAgro Solar Cool Hub #04',
      stage: '2. Solar Vault Pre-Cooling',
      role: 'WAREHOUSE',
      actor: 'Ganesh Kute',
      coordinates: '19.8510°N, 74.4620°E',
      temp: '18.2°C Solar Regulated',
      status: 'Optimal Micro-Climate',
      x: 35,
      y: 45,
    },
    {
      id: 'wp-3',
      name: 'Maharashtra Grain Mills (Ambad)',
      stage: '3. Stone Milling & Quality',
      role: 'PROCESSOR',
      actor: 'Vikram Joshi',
      coordinates: '19.9975°N, 73.7898°E',
      temp: '20.5°C Process Bay',
      status: 'Ash & Gluten Screened',
      x: 52,
      y: 30,
    },
    {
      id: 'wp-4',
      name: 'Deccan Foods Factory (Chakan)',
      stage: '4. Cleanroom Formulation & Bake',
      role: 'MANUFACTURER',
      actor: 'Ananya Roy',
      coordinates: '18.7610°N, 73.8580°E',
      temp: '21.0°C Cleanroom',
      status: 'GMP Packaged Lot',
      x: 70,
      y: 65,
    },
    {
      id: 'wp-5',
      name: 'FreshMart Superstore (Kopargaon)',
      stage: '5. Retail Shelf Distribution',
      role: 'RETAILER',
      actor: 'Pooja Kulkarni',
      coordinates: '19.8920°N, 74.4810°E',
      temp: '21.4°C Safe Shelf',
      status: 'Consumer Ready QR',
      x: 88,
      y: 40,
    },
  ];

  const currentWp = waypoints[activeStop] || waypoints[0];

  const handlePointClick = (idx: number) => {
    setActiveStop(idx);
    if (onSelectWaypoint) {
      onSelectWaypoint(idx, waypoints[idx].name);
    }
  };

  return (
    <div
      id="supply-chain-route-map-container"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-7 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
              <Navigation className="w-4 h-4 text-teal-700" />
            </div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Geographic Route & Logistics Corridor
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Western Maharashtra Verified Transit Corridor
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto">
          <span>Route: ~420 km</span>
          <span>·</span>
          <span className="text-emerald-700 font-bold">5 Verified Handoffs</span>
        </div>
      </div>

      {/* Visual Geographic Map Container */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-4 select-none">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Top Info Overlay */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            NH-60 & SH-10 AGRI-TRANSIT CORRIDOR
          </span>
          <span className="hidden sm:inline text-slate-400">
            SIMULATED GPS WAYPOINTS
          </span>
        </div>

        {/* SVG Route Line Canvas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Connected Curved Route Polyline */}
          <path
            d="M 20% 35% Q 28% 40%, 35% 45% T 52% 30% T 70% 65% T 88% 40%"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>

        {/* Interactive Waypoint Pins */}
        {waypoints.map((wp, idx) => {
          const isSelected = activeStop === idx;
          return (
            <div
              key={wp.id}
              onClick={() => handlePointClick(idx)}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
            >
              {/* Pulsing ring for active pin */}
              {isSelected && (
                <div className="absolute -inset-2 bg-emerald-400 rounded-full animate-ping opacity-70 pointer-events-none" />
              )}

              {/* Pin Badge */}
              <div
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 scale-110'
                    : 'bg-slate-900/90 text-white border border-slate-700 hover:bg-slate-800 hover:scale-105'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline text-[11px] truncate max-w-[120px]">
                  {wp.name.split(' ')[0]}
                </span>
                <span className="font-mono text-[10px]">#{idx + 1}</span>
              </div>
            </div>
          );
        })}

        {/* Floating Active Stop Summary on Map Canvas */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3 text-white text-xs shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {currentWp.stage}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {currentWp.coordinates}
            </span>
          </div>

          <h5 className="font-bold text-sm text-white mt-0.5">{currentWp.name}</h5>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
            <span>Custodian: {currentWp.actor}</span>
            <span className="text-teal-400 font-mono font-semibold">{currentWp.temp}</span>
          </div>
        </div>
      </div>

      {/* 5 Step Corridor Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
        {waypoints.map((wp, idx) => {
          const isSelected = activeStop === idx;
          return (
            <button
              key={wp.id}
              onClick={() => handlePointClick(idx)}
              className={`text-left p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs ring-2 ring-emerald-400/30'
                  : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Stop #{idx + 1}</span>
                <span className="font-mono text-emerald-700">{wp.role}</span>
              </div>

              <h5 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                {wp.name}
              </h5>

              <p className="text-[10px] text-slate-500 truncate mt-0.5">{wp.actor}</p>

              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px] font-mono">
                <span className="text-teal-700 font-bold truncate">{wp.temp}</span>
                <span className="text-slate-400">Verified</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
