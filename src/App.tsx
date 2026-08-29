import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './components/landing/LandingPage';
import { PublicTraceView } from './components/trace/PublicTraceView';
import { DemoBatchesListView } from './components/batches/DemoBatchesListView';
import { QRScannerModal } from './components/scanner/QRScannerModal';
import { StakeholderLoginModal } from './components/auth/StakeholderLoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { FarmerDashboardView } from './components/dashboard/FarmerDashboardView';
import { MandiDashboardView } from './components/dashboard/MandiDashboardView';
import { WarehouseDashboardView } from './components/dashboard/WarehouseDashboardView';
import { ProcessorDashboardView } from './components/dashboard/ProcessorDashboardView';
import { TransporterDashboardView } from './components/dashboard/TransporterDashboardView';
import { RetailerDashboardView } from './components/dashboard/RetailerDashboardView';
import { AuthorityDashboardView } from './components/dashboard/AuthorityDashboardView';
import { AdminDashboardView } from './components/dashboard/AdminDashboardView';
import { ConsumerDashboardView } from './components/dashboard/ConsumerDashboardView';
import { OfflineSyncDrawer } from './components/offline/OfflineSyncDrawer';
import { SplashScreen } from './components/brand/SplashScreen';
import { PageLoading } from './components/common/LoadingStates';
import { traceService } from './services/traceService';
import { Batch } from './types';
import { AlertCircle, ArrowLeft, Layers, ShieldCheck, User, QrCode, Sparkles } from 'lucide-react';

export type AppViewMode = 'landing' | 'trace' | 'batches' | 'dashboard';

function AppContent() {
  const { activeBatchId, setActiveBatchId, setScannerOpen, currentUser, isAuthenticated, setLoginModalOpen } =
    useAuthRole();
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<AppViewMode>('landing');
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState<string | null>(null);
  const [isOfflineDrawerOpen, setIsOfflineDrawerOpen] = useState(false);

  // Switch to dashboard view automatically when user logs in with a specific role
  useEffect(() => {
    if (isAuthenticated && currentUser && activeView !== 'trace') {
      setActiveView('dashboard');
    }
  }, [currentUser?.role, isAuthenticated]);

  // Synchronize URL hash with router state
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('trace/')) {
        const parts = hash.split('/');
        const bId = parts[1];
        if (bId) {
          setActiveBatchId(bId);
        }
        setActiveView('trace');
      } else if (hash === 'batches') {
        setActiveView('batches');
      } else if (hash === 'dashboard') {
        setActiveView('dashboard');
      } else if (hash === 'landing' || hash === '') {
        setActiveView('landing');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    loadBatch(activeBatchId);
  }, [activeBatchId]);

  const loadBatch = async (batchId: string) => {
    setLoading(true);
    setErrorNotFound(null);
    try {
      const result = await traceService.getBatchById(batchId);
      if (result) {
        setCurrentBatch(result);
        setErrorNotFound(null);
      } else {
        setCurrentBatch(null);
        setErrorNotFound(`No batch record found matching code "${batchId}".`);
      }
    } catch (err: any) {
      setErrorNotFound('Error querying traceability record.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBatch = (batchId: string) => {
    setActiveBatchId(batchId);
    setActiveView('trace');
    window.location.hash = `#trace/${batchId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchBatch = (batchId: string) => {
    handleSelectBatch(batchId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        onSearchBatch={handleSearchBatch}
        onNavigateHome={() => {
          setActiveView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOfflineSync={() => setIsOfflineDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Bar / View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {activeView !== 'landing' && (
              <button
                id="back-overview-btn"
                onClick={() => setActiveView('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Overview</span>
              </button>
            )}

            {isAuthenticated && currentUser && (
              <button
                id="workspace-tab-btn"
                onClick={() => setActiveView('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  activeView === 'dashboard'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.role} Workspace</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="active-trace-tab-btn"
              onClick={() => setActiveView('trace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'trace'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Active Trace
            </button>

            <button
              id="batch-registry-tab-btn"
              onClick={() => setActiveView('batches')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'batches'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Batch Registry
            </button>
          </div>
        </div>

        {/* View Routing */}
        {activeView === 'landing' && <LandingPage onSelectBatch={handleSelectBatch} />}

        {activeView === 'batches' && <DemoBatchesListView onSelectBatch={handleSelectBatch} />}

        {activeView === 'dashboard' && currentUser && (
          <>
            {currentUser.role === 'FARMER' && (
              <FarmerDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'MANDI' && (
              <MandiDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'WAREHOUSE' && (
              <WarehouseDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {(currentUser.role === 'PROCESSOR' || currentUser.role === 'FACTORY' || currentUser.role === 'MANUFACTURER') && (
              <ProcessorDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {(currentUser.role === 'TRANSPORTER' || currentUser.role === 'DISTRIBUTOR') && (
              <TransporterDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'RETAILER' && (
              <RetailerDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'AUTHORITY' && (
              <AuthorityDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'ADMIN' && (
              <AdminDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
            {currentUser.role === 'CONSUMER' && (
              <ConsumerDashboardView user={currentUser} onSelectBatch={handleSelectBatch} />
            )}
          </>
        )}

        {activeView === 'trace' && (
          <>
            {loading ? (
              <PageLoading
                message="Decoding batch traceability & telemetry records..."
                submessage="Validating cryptographic chain integrity and solar cold-chain state"
              />
            ) : errorNotFound ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Trace Record Not Found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {errorNotFound} Try scanning a featured demo product or picking from the sample batch registry.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleSelectBatch('BIS-2026-092')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700"
                  >
                    Load Biscuit Batch (BIS-2026-092)
                  </button>
                  <button
                    onClick={() => setScannerOpen(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200"
                  >
                    Open Camera Scanner
                  </button>
                </div>
              </div>
            ) : currentBatch ? (
              <PublicTraceView batch={currentBatch} onSelectBatch={handleSelectBatch} />
            ) : null}
          </>
        )}
      </main>

      {/* Startup Splash Experience */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Global Modals */}
      <QRScannerModal onScanComplete={handleSelectBatch} />
      <StakeholderLoginModal />
      <RegisterModal />
      <OfflineSyncDrawer
        isOpen={isOfflineDrawerOpen}
        onClose={() => setIsOfflineDrawerOpen(false)}
      />

      {/* Footer */}
      <Footer onSelectBatch={handleSelectBatch} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeView={activeView as any}
        setActiveView={(v) => setActiveView(v as AppViewMode)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthRoleProvider>
        <AppContent />
      </AuthRoleProvider>
    </LanguageProvider>
  );
}
