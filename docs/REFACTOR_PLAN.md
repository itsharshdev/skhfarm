# FARMTRACER — REFACTORING & IMPLEMENTATION PLAN
**Phase 0 Code Quality Audit & Roadmap for Subsequent Phases**
**Status:** Audit Complete | **Backend Freeze:** Strictly Enforced | **Code Modifications in Phase 0:** None

---

## 1. Code Quality & Technical Debt Inventory

During the Phase 0 audit, the codebase was inspected for maintainability, modularity, type safety, and architectural integrity. The following areas have been documented for phased refactoring in subsequent phases:

### 1.1 Oversized & High-Complexity Files
| File Path | Lines | Size | Technical Issue & Rationale for Change |
|---|---|---|---|
| [`src/services/traceService.ts`](file:///c:/Users/jivit/skhfarm/src/services/traceService.ts) | 1,477 | 51.1 KB | **Monolithic Service**: Mixes Supabase CRUD, mock fallback resolution, realtime pub/sub listeners, lineage DAG graph generation, and localStorage caching in a single 1,477-line class. *Target:* Break into `batchService.ts`, `eventService.ts`, `lineageService.ts`, and `storageService.ts`. |
| [`src/data/mockData.ts`](file:///c:/Users/jivit/skhfarm/src/data/mockData.ts) | 1,609 | 53.9 KB | **Monolithic Data File**: Contains 8 complete batch datasets with embedded timelines, evidences, feedback records, certificates, DAG links, and demo users in one huge file. *Target:* Modularize into `src/data/batches/`, `src/data/organizations.ts`, and `src/data/users.ts`. |
| [`src/components/dashboard/FarmerDashboardView.tsx`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/FarmerDashboardView.tsx) | 565 | 27.1 KB | **Overloaded Component State**: Manages harvest form inputs, camera triggers, modal visibility, batch lists, and embedded reputation hubs inline. *Target:* Extract harvest form to `<HarvestRegistrationModal />` and use custom hook `useFarmerBatches`. |
| [`src/components/trace/PublicTraceView.tsx`](file:///c:/Users/jivit/skhfarm/src/components/trace/PublicTraceView.tsx) | 580 | 25.2 KB | **Complex Multi-Tab Orchestrator**: Handles scenario switching, contamination banners, score breakdown, solar telemetry, 6 sub-tabs, and consumer feedback submission in one component. *Target:* Decompose sub-tabs into discrete lazy-loaded tab views. |
| [`src/components/trace/LineageDAGGraph.tsx`](file:///c:/Users/jivit/skhfarm/src/components/trace/LineageDAGGraph.tsx) | 553 | 23.5 KB | **Complex SVG Graph Rendering**: Implements manual layout mathematics, zoom/pan transform matrix calculations, and node rendering. *Target:* Modularize node cards and graph controls into dedicated sub-components. |

### 1.2 Duplicated Code & Patterns
1. **Modal Mounting Boilerplate**:
   * All 9 dashboard views (`FarmerDashboardView`, `MandiDashboardView`, `WarehouseDashboardView`, etc.) duplicate identical state hooks for `transferBatch`, `qrBatch`, `evidenceBatch`, and `feedbackBatch`.
   * *Solution:* Implement a shared `<DashboardLayout>` that hosts global operational modals via a `ModalContext`.
2. **Duplicate Data Fetching & Realtime Subscription**:
   * Identical `useEffect` subscription pattern is repeated across 8 different dashboard components.
   * *Solution:* Introduce a reusable `useTraceLedger(role)` hook.
3. **Any / Unsafe TypeScript Casts**:
   * Occasional `(row as any)` or `(import.meta as any)` casts found in `traceService.ts` and `authService.ts`.
   * *Solution:* Introduce strict typed database schema interfaces (`Database['public']['Tables']`).

---

## 2. Phased Refactoring Roadmap (Aligned with Brain V3)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 1: AUTH & NAVIGATION FOUNDATION                │
│  • React Router declarative URLs (/trace/:id, /dashboard/:role)        │
│  • ProtectedRoute & RoleGuard wrappers                                 │
│  • Decouple Auth & User Profile hydration                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 2: TRACEABILITY SERVICE SPLIT                  │
│  • Break traceService.ts into dedicated domain services                │
│  • Introduce useTraceLedger and useBatchDetail custom hooks            │
│  • Atomic operations optimization (RPC preparation)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 3: COMPONENT DE-DUPLICATION                    │
│  • Create <DashboardLayout> & unified <HandoffActionModal>             │
│  • Modularize PublicTraceView sub-tabs                                 │
│  • Split mockData.ts into modular scenario files                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: STATE & OFFLINE HARDENING                   │
│  • Migrate localStorage offline queue to IndexedDB (idb/Dexie)         │
│  • Resilient background sync & retry exponential backoff               │
│  • Service worker caching strategy optimization                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 5: UI/UX POLISH & ACCESSIBILITY                │
│  • Consistent spacing & typography tokens                              │
│  • ARIA accessibility labels for screen readers & keyboard nav         │
│  • Mobile responsiveness refinement on complex DAG & Map views         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Refactoring Blueprints

### 3.1 Blueprint 1: Declarative Router Migration
Replace hash-based navigation in `App.tsx` with standard declarative routes:
```typescript
// Proposed src/routes/AppRoutes.tsx
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/batches" element={<DemoBatchesListView />} />
      <Route path="/trace/:batchId" element={<PublicTraceView />}>
        <Route index element={<Navigate to="lineage" replace />} />
        <Route path="lineage" element={<LineageDAGGraph />} />
        <Route path="timeline" element={<EventTimelineView />} />
        <Route path="ai" element={<AIInsightsPanel />} />
        <Route path="map" element={<SupplyChainRouteMap />} />
      </Route>
      
      {/* Role-Protected Workspaces */}
      <Route path="/dashboard" element={<ProtectedRoute><RoleRedirector /></ProtectedRoute>} />
      <Route path="/dashboard/farmer" element={<ProtectedRoute allowedRoles={['FARMER']}><FarmerDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/mandi" element={<ProtectedRoute allowedRoles={['MANDI']}><MandiDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/warehouse" element={<ProtectedRoute allowedRoles={['WAREHOUSE']}><WarehouseDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/processor" element={<ProtectedRoute allowedRoles={['PROCESSOR', 'FACTORY', 'MANUFACTURER']}><ProcessorDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/transporter" element={<ProtectedRoute allowedRoles={['TRANSPORTER', 'DISTRIBUTOR']}><TransporterDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/retailer" element={<ProtectedRoute allowedRoles={['RETAILER']}><RetailerDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/authority" element={<ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}><AuthorityDashboardView /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardView /></ProtectedRoute>} />
    </Routes>
  );
};
```

### 3.2 Blueprint 2: Service Layer Modularization
Split the 51 KB `traceService.ts` into focused domain modules:
* `src/services/batches/batchService.ts`: Batch CRUD, queries, search.
* `src/services/events/eventService.ts`: Supply-chain event appending and timeline retrieval.
* `src/services/lineage/lineageService.ts`: Dynamic DAG graph calculation and multi-parent traversals.
* `src/services/storage/storageService.ts`: Solar storage unit queries and telemetry logs.

### 3.3 Blueprint 3: Shared Dashboard Layout
Extract common header banners, stats bars, and modal management:
```typescript
// Proposed src/components/dashboard/common/DashboardLayout.tsx
export const DashboardLayout: React.FC<{
  title: string;
  badgeText: string;
  badgeIcon: React.ReactNode;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, badgeText, badgeIcon, description, actions, children }) => {
  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      <DashboardHeaderBanner title={title} badgeText={badgeText} badgeIcon={badgeIcon} description={description} actions={actions} />
      {children}
      <SharedOperationalModals />
    </div>
  );
};
```

### 3.4 Blueprint 4: IndexedDB Offline Queue
Upgrade `offlineSyncService.ts` from `localStorage` string serialization to robust `IndexedDB` with binary blob support (allowing offline video evidence caching without hitting 5MB localStorage quotas).

---

## 4. Non-Breaking Verification Protocol

To ensure 100% stability during each subsequent refactoring phase, every modification must pass the following verification gates:

1. **Typecheck Gate**: `npm run typecheck` (`tsc --noEmit`) must exit with 0 errors.
2. **Build Gate**: `npm run build` (`vite build`) must compile cleanly without chunking warnings.
3. **End-to-End Persona Verification**:
   * Farmer batch creation with camera evidence.
   * Mandi intake and weighbridge verification.
   * Warehouse solar smart storage telemetry recording.
   * Processor multi-parent wheat -> flour -> biscuit transformation.
   * Transporter route checkpoint logging.
   * Retailer shelf placement.
   * Public consumer QR scan and 100-pt score verification.
   * Authority regulatory audit and recall dispatch.
