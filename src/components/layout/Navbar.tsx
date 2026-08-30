import React, { useState, useEffect, useRef } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';
import { offlineSyncService } from '../../services/offlineSyncService';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
import { StakeholderRole } from '../../types';
import { UnifiedFeedbackModal } from '../operations/UnifiedFeedbackModal';
import {
  Shield,
  QrCode,
  Search,
  Globe,
  User,
  LogOut,
  Wifi,
  WifiOff,
  Sun,
  Layers,
  ChevronDown,
  RefreshCw,
  Tractor,
  Store,
  Warehouse,
  Factory,
  Truck,
  ShoppingBag,
  ShieldAlert,
  UserCog,
  Sparkles,
  Check,
  MessageSquare,
} from 'lucide-react';

interface NavbarProps {
  onSearchBatch?: (batchId: string) => void;
  onNavigateHome?: () => void;
  onOpenOfflineSync?: () => void;
}

const STAKEHOLDER_ROLES_LIST: { role: StakeholderRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: 'FARMER', label: 'Farmer / FPO Origin', icon: Tractor },
  { role: 'MANDI', label: 'Mandi / APMC Hub', icon: Store },
  { role: 'WAREHOUSE', label: 'Solar Cold Storage Vault', icon: Warehouse },
  { role: 'PROCESSOR', label: 'Processor / Flour Mill', icon: Factory },
  { role: 'TRANSPORTER', label: 'Reefer Logistics Carrier', icon: Truck },
  { role: 'RETAILER', label: 'Retailer / Storefront', icon: ShoppingBag },
  { role: 'AUTHORITY', label: 'Food Safety Regulator', icon: ShieldAlert },
  { role: 'ADMIN', label: 'Platform Administrator', icon: UserCog },
];

export const Navbar: React.FC<NavbarProps> = ({ onSearchBatch, onNavigateHome, onOpenOfflineSync }) => {
  const { currentUser, isAuthenticated, logout, loginAsRole, setLoginModalOpen, setScannerOpen } = useAuthRole();
  const { language, setLanguage, t } = useLanguage();
  const [isOffline, setIsOffline] = useState(offlineSyncService.isOffline());
  const [pendingCount, setPendingCount] = useState(offlineSyncService.getPendingCount());
  const [quickSearch, setQuickSearch] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const roleMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateOfflineState = () => {
      setIsOffline(offlineSyncService.isOffline());
      setPendingCount(offlineSyncService.getPendingCount());
    };

    updateOfflineState();
    const unsubscribe = offlineSyncService.subscribe(updateOfflineState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim() && onSearchBatch) {
      onSearchBatch(quickSearch.trim().toUpperCase());
      setQuickSearch('');
    }
  };

  const handleFastRoleSwitch = async (role: StakeholderRole) => {
    setIsRoleMenuOpen(false);
    await loginAsRole(role);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'hi', label: 'हिन्दी', flag: 'HI' },
    { code: 'mr', label: 'मराठी', flag: 'MR' },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-brand-logo-btn"
              onClick={onNavigateHome}
              className="text-left group focus:outline-none"
            >
              <FarmTracerLogo
                variant="full"
                theme="dark"
                size="sm"
                showTagline
              />
            </button>
          </div>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="navbar-quick-search-input"
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search Batch ID (e.g. BIS-2026-092, WHT-MH-2026-001)..."
              className="w-full pl-9 pr-20 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 font-mono uppercase"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Trace
            </button>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Feedback / Rate Button */}
            <button
              id="navbar-feedback-btn"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
              title="Submit Stakeholder Feedback or Rate Produce"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Feedback</span>
            </button>

            {/* Scan QR Button */}
            <button
              id="navbar-scan-qr-btn"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-semibold text-xs md:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="language-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                        language === l.code ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{l.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PWA Offline / Online Sync Indicator */}
            <button
              id="navbar-offline-sync-btn"
              onClick={onOpenOfflineSync}
              title={isOffline ? 'Offline Mode Active (Click to open Sync Queue)' : 'Online (Click to open Sync Queue)'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isOffline
                  ? 'text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-[11px] font-bold">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline text-[11px] font-bold">Online</span>
                </>
              )}

              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Stakeholder Auth Widget & Role Switcher Menu */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={roleMenuRef}>
                <div className="flex items-center gap-1.5 bg-slate-100/90 pl-2.5 pr-1 py-1 rounded-2xl border border-slate-200 shadow-2xs">
                  <button
                    id="navbar-role-menu-trigger"
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    className="flex items-center gap-1.5 text-left focus:outline-none group"
                    title="Switch Stakeholder Role Workspace"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                        {currentUser.name}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </button>

                  <button
                    id="navbar-logout-btn"
                    onClick={logout}
                    title="Sign Out of Stakeholder Workspace"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1-Click Fast Role Switcher Dropdown */}
                {isRoleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Switch Role Workspace
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                        {currentUser.organizationName || 'Live Stakeholder Network'}
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-0.5 py-1">
                      {STAKEHOLDER_ROLES_LIST.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = currentUser.role === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => handleFastRoleSwitch(r.role)}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg border ${isCurrent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="truncate">{r.label}</span>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsRoleMenuOpen(false);
                          setLoginModalOpen(true);
                        }}
                        className="w-full text-center py-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        Open Full Access Portal →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => setLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Stakeholder Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isFeedbackModalOpen && (
        <UnifiedFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          initialBatchId="BIS-2026-092"
          fromRole={currentUser?.role || 'CONSUMER'}
          targetRole={currentUser?.role === 'FARMER' ? 'MANDI' : currentUser?.role === 'MANDI' ? 'FARMER' : 'FARMER'}
          targetEntityName={currentUser?.role === 'FARMER' ? 'Mandi Aggregation Hub' : 'Origin Producer Farm'}
          submittedBy={currentUser?.name || 'Guest User'}
        />
      )}
    </header>
  );
};
