import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  QrCode,
  Layers,
  User,
  ShieldCheck,
  Home,
  LayoutDashboard,
  Tractor,
  Store,
  Warehouse,
  Factory,
  Truck,
  ShoppingBag,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { AppViewMode } from '../../App';
import { StakeholderRole } from '../../types';

interface MobileNavProps {
  activeView: AppViewMode;
  setActiveView: (view: AppViewMode) => void;
}

function getRoleIcon(role: StakeholderRole) {
  switch (role) {
    case 'FARMER':
      return Tractor;
    case 'MANDI':
      return Store;
    case 'WAREHOUSE':
      return Warehouse;
    case 'PROCESSOR':
    case 'FACTORY':
    case 'MANUFACTURER':
      return Factory;
    case 'TRANSPORTER':
    case 'DISTRIBUTOR':
      return Truck;
    case 'RETAILER':
      return ShoppingBag;
    case 'AUTHORITY':
      return ShieldAlert;
    case 'ADMIN':
      return UserCog;
    default:
      return LayoutDashboard;
  }
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  const { setScannerOpen, setLoginModalOpen, isAuthenticated, currentUser } = useAuthRole();

  const RoleIcon = currentUser ? getRoleIcon(currentUser.role) : LayoutDashboard;

  return (
    <div
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
    >
      <button
        id="mobile-nav-home-btn"
        onClick={() => setActiveView('landing')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold ${
          activeView === 'landing' ? 'text-emerald-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Overview</span>
      </button>

      <button
        id="mobile-nav-trace-btn"
        onClick={() => setActiveView('trace')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold ${
          activeView === 'trace' ? 'text-emerald-700 font-bold' : 'text-slate-500'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span className="text-[10px]">Trace</span>
      </button>

      {/* Floating Center Quick Scan Button */}
      <button
        id="mobile-nav-scan-btn"
        onClick={() => setScannerOpen(true)}
        className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white hover:bg-emerald-700 transition-transform active:scale-95"
        title="Quick Scan QR Code"
      >
        <QrCode className="w-6 h-6" />
      </button>

      <button
        id="mobile-nav-batches-btn"
        onClick={() => setActiveView('batches')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold ${
          activeView === 'batches' ? 'text-emerald-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px]">Batches</span>
      </button>

      {isAuthenticated && currentUser ? (
        <button
          id="mobile-nav-workspace-btn"
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold ${
            activeView === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <RoleIcon className="w-5 h-5" />
          <span className="text-[10px] truncate max-w-[60px] font-bold">{currentUser.role}</span>
        </button>
      ) : (
        <button
          id="mobile-nav-stakeholder-btn"
          onClick={() => setLoginModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold text-slate-500"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Login</span>
        </button>
      )}
    </div>
  );
};
