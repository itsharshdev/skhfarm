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
import { DataIntegrityBanner } from './components/integrity/DataIntegrityBanner';
import { DataRecoveryHubModal } from './components/integrity/DataRecoveryHubModal';
import { AlertCircle, ArrowLeft, Layers, ShieldCheck, User, QrCode, Sparkles } from 'lucide-react';

export type AppViewMode = 'landing' | 'trace' | 'batches' | 'dashboard';

const STORAGE_ACTIVE_VIEW_KEY = 'farmtracer_active_view';
const STORAGE_ACTIVE_BATCH_KEY = 'farmtracer_active_batch_id';

function AppContent() {
  const { activeBatchId, setActiveBatchId, setScannerOpen, currentUser, isAuthenticated, setLoginModalOpen } =
    useAuthRole();
  const [showSplash, setShowSplash] = useState(true);
  
  // Restore initial view from URL hash or localStorage
  const [activeView, setActiveView] = useState<AppViewMode>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : '';
    if (hash.startsWith('trace/')) return 'trace';
    if (hash === 'batches') return 'batches';
    if (hash === 'dashboard') return 'dashboard';
    if (hash === 'landing') return 'landing';

    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_ACTIVE_VIEW_KEY) : null;
    if (saved === 'dashboard' || saved === 'batches' || saved === 'trace') {
      return saved as AppViewMode;
    }
    const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('farmtracer_user') : null;
    if (savedUser) return 'dashboard';
    return 'landing';
  });

  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState<string | null>(null);
  const [isOfflineDrawerOpen, setIsOfflineDrawerOpen] = useState(false);
  const [isRecoveryHubOpen, setIsRecoveryHubOpen] = useState(false);

  // Synchronize router state with URL hash and localStorage
  const navigateToView = (view: AppViewMode, batchId?: string) => {
    setActiveView(view);
    try {
      localStorage.setItem(STORAGE_ACTIVE_VIEW_KEY, view);
    } catch (e) {}

    if (view === 'trace') {
      const bId = batchId || activeBatchId || 'BIS-2026-092';
      setActiveBatchId(bId);
      try {
        localStorage.setItem(STORAGE_ACTIVE_BATCH_KEY, bId);
      } catch (e) {}
      window.location.hash = `#trace/${bId}`;
    } else if (view === 'dashboard') {
      window.location.hash = '#dashboard';
    } else if (view === 'batches') {
      window.location.hash = '#batches';
    } else {
      window.location.hash = '#landing';
    }
  };

  // Switch to dashboard view automatically when user logs in with a specific role
  useEffect(() => {
    if (isAuthenticated && currentUser && activeView !== 'trace') {
      navigateToView('dashboard');
    }
  }, [currentUser?.role, isAuthenticated]);

  // Synchronize URL hash with router state on initial boot and popstate
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('trace/')) {
        const parts = hash.split('/');
        const bId = parts[1];
        if (bId) {
          setActiveBatchId(bId);
          try {
            localStorage.setItem(STORAGE_ACTIVE_BATCH_KEY, bId);
          } catch (e) {}
        }
        setActiveView('trace');
      } else if (hash === 'batches') {
        setActiveView('batches');
      } else if (hash === 'dashboard') {
        setActiveView('dashboard');
      } else if (hash === 'landing') {
        setActiveView('landing');
      } else if (hash === '') {
        const savedView = (localStorage.getItem(STORAGE_ACTIVE_VIEW_KEY) as AppViewMode) || (isAuthenticated ? 'dashboard' : 'landing');
        navigateToView(savedView);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (activeBatchId) {
      loadBatch(activeBatchId);
    }
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
    navigateToView('trace', batchId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchBatch = (batchId: string) => {
    handleSelectBatch(batchId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Group (Sticky without internal overlaps) */}
      <div className="sticky top-0 z-40 w-full flex flex-col bg-white shadow-2xs">
        <Navbar
          onSearchBatch={handleSearchBatch}
          onNavigateHome={() => navigateToView('landing')}
          onOpenOfflineSync={() => setIsOfflineDrawerOpen(true)}
        />
        {/* PS-1 Data Integrity & Incident Banner */}
        <DataIntegrityBanner onOpenRecoveryDetails={() => setIsRecoveryHubOpen(true)} />
      </div>

      {/* Main App Workspaces View Port */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Navigation Breadcrumb & Back Bar (When not on Landing) */}
        {activeView !== 'landing' && (
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80">
            <button
              onClick={() => navigateToView(isAuthenticated ? 'dashboard' : 'landing')}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to {isAuthenticated ? 'Workspace' : 'Home'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateToView('batches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeView === 'batches'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Sample Batches
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => navigateToView('dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeView === 'dashboard'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  My Workspace
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Routing */}
        {activeView === 'landing' && (
          <LandingPage
            onSelectBatch={handleSelectBatch}
            onOpenScanner={() => setScannerOpen(true)}
            onOpenStakeholderLogin={() => setLoginModalOpen(true)}
            onViewAllBatches={() => navigateToView('batches')}
          />
        )}

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
      <DataRecoveryHubModal
        isOpen={isRecoveryHubOpen}
        onClose={() => setIsRecoveryHubOpen(false)}
        onInspectBatch={handleSelectBatch}
      />

      {/* Footer */}
      <Footer onSelectBatch={handleSelectBatch} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeView={activeView as any}
        setActiveView={(v) => navigateToView(v as AppViewMode)}
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
