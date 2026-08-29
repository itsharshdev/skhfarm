import React, { useState, useEffect } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';
import { offlineSyncService } from '../../services/offlineSyncService';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
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
} from 'lucide-react';

interface NavbarProps {
  onSearchBatch?: (batchId: string) => void;
  onNavigateHome?: () => void;
  onOpenOfflineSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchBatch, onNavigateHome, onOpenOfflineSync }) => {
  const { currentUser, isAuthenticated, logout, setLoginModalOpen, setScannerOpen } = useAuthRole();
  const { language, setLanguage, t } = useLanguage();
  const [isOffline, setIsOffline] = useState(offlineSyncService.isOffline());
  const [pendingCount, setPendingCount] = useState(offlineSyncService.getPendingCount());
  const [quickSearch, setQuickSearch] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim() && onSearchBatch) {
      onSearchBatch(quickSearch.trim());
      setQuickSearch('');
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'hi', label: 'हिन्दी', flag: 'HI' },
    { code: 'mr', label: 'मराठी', flag: 'MR' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Super PS badge */}
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
              className="w-full pl-9 pr-20 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Trace
            </button>
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Scan QR Button */}
            <button
              id="navbar-scan-qr-btn"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-semibold text-xs md:text-sm transition-all shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fadeIn">
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

            {/* PWA Offline / Online indicator & Queue Trigger */}
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

            {/* Stakeholder Login / Active Persona */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-100/90 pl-2 pr-1 py-1 rounded-xl border border-slate-200">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[100px] sm:max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  id="navbar-switch-role-btn"
                  onClick={() => setLoginModalOpen(true)}
                  title="Switch Stakeholder Role"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  id="navbar-logout-btn"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => setLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Demo Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
