# FARMTRACER — ROUTING MATRIX & NAVIGATION AUDIT
**Phase 0 Navigation Architecture & Routing Gap Analysis**
**Status:** Audit Complete | **Backend Freeze:** Strictly Enforced | **Code Modifications:** None

---

## 1. Current Routing Implementation

The existing frontend application uses a **hybrid Hash-based State Router** managed inside [`src/App.tsx`](file:///c:/Users/jivit/skhfarm/src/App.tsx#L45-L68):

```typescript
// App.tsx client-side hash listener
const syncFromHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('trace/')) {
    const parts = hash.split('/');
    if (parts[1]) setActiveBatchId(parts[1]);
    setActiveView('trace');
  } else if (hash === 'batches') {
    setActiveView('batches');
  } else if (hash === 'dashboard') {
    setActiveView('dashboard');
  } else if (hash === 'landing' || hash === '') {
    setActiveView('landing');
  }
};
```

### 1.1 Current Active Hash Routes
* `#` or `#landing` -> Renders `<LandingPage />`
* `#trace/:batchId` -> Fetches batch via `traceService.getBatchById(batchId)` and renders `<PublicTraceView />`
* `#trace/:batchId/:subtab` -> Activates sub-tab in `<PublicTraceView />` (`lineage`, `timeline`, `ai`, `map`, `certificates`, `feedback`)
* `#batches` -> Renders `<DemoBatchesListView />`
* `#dashboard` -> Conditionally renders role-specific dashboard based on `currentUser.role`

---

## 2. Comparison: Current Hash Router vs Brain V3 Architecture

The FarmTracer specification ([`FARM_TRACER_BACKEND_BRAIN_V3.md`](file:///c:/Users/jivit/skhfarm/FARM_TRACER_BACKEND_BRAIN_V3.md#L45-L115)) requires a real, declarative URL-based routing architecture with strict route guards:

| Intended Route (Brain V3) | Current Implementation | Status / Gap | Required Migration Action |
|---|---|---|---|
| `/` | `window.location.hash = '#landing'` (Conditional render in `App.tsx`) | **Working via Hash** | Migrate to `<Route path="/" element={<LandingPage />} />` |
| `/login` | `StakeholderLoginModal` modal overlay | **Modal-Only** | Add dedicated `/login` page while keeping quick modal option |
| `/register` | `RegisterModal` modal overlay | **Modal-Only** | Add dedicated `/register` page while keeping modal option |
| `/trace/:batchId` | `window.location.hash = '#trace/' + batchId` | **Working via Hash** | Migrate to `<Route path="/trace/:batchId" element={<PublicTraceView />} />` |
| `/trace/:batchId/timeline` | `window.location.hash = '#trace/' + batchId + '/timeline'` | **Working via Sub-tab** | Support direct URL route with deep-linking |
| `/trace/:batchId/map` | `window.location.hash = '#trace/' + batchId + '/map'` | **Working via Sub-tab** | Support direct URL route with deep-linking |
| `/trace/:batchId/lineage` | `window.location.hash = '#trace/' + batchId + '/lineage'` | **Working via Sub-tab** | Support direct URL route with deep-linking |
| `/about` | Footer section | **Missing Dedicated Page** | Create standalone `/about` page |
| `/dashboard` | `window.location.hash = '#dashboard'` (Role switcher in `App.tsx`) | **Working via Hash** | Add role redirector `/dashboard` -> `/dashboard/:role` |
| `/dashboard/farmer` | Inline switch `currentUser.role === 'FARMER'` | **Conditional Render** | Protected route `<FarmerDashboardView />` |
| `/dashboard/mandi` | Inline switch `currentUser.role === 'MANDI'` | **Conditional Render** | Protected route `<MandiDashboardView />` |
| `/dashboard/processor` | Inline switch `currentUser.role === 'PROCESSOR'` | **Conditional Render** | Protected route `<ProcessorDashboardView />` |
| `/dashboard/warehouse` | Inline switch `currentUser.role === 'WAREHOUSE'` | **Conditional Render** | Protected route `<WarehouseDashboardView />` |
| `/dashboard/distributor` | Inline switch `currentUser.role === 'TRANSPORTER'` | **Conditional Render** | Protected route `<TransporterDashboardView />` |
| `/dashboard/retailer` | Inline switch `currentUser.role === 'RETAILER'` | **Conditional Render** | Protected route `<RetailerDashboardView />` |
| `/dashboard/consumer` | Inline switch `currentUser.role === 'CONSUMER'` | **Conditional Render** | Protected route `<ConsumerDashboardView />` |
| `/dashboard/authority` | Inline switch `currentUser.role === 'AUTHORITY'` | **Conditional Render** | Protected route `<AuthorityDashboardView />` |
| `/dashboard/admin` | Inline switch `currentUser.role === 'ADMIN'` | **Conditional Render** | Protected route `<AdminDashboardView />` |
| `/batches` | `window.location.hash = '#batches'` | **Working via Hash** | Migrate to `<Route path="/batches" element={<DemoBatchesListView />} />` |
| `/batches/:batchId` | Redirects to `/trace/:batchId` | **Aliased** | Support dedicated batch inspector or alias to trace |
| `/events` | Rendered inside timeline tab | **Embedded** | Expose standalone events explorer or keep in timeline |
| `/admin/alerts` | Tab inside `AuthorityDashboardView` / `RiskAlertCenter` | **Embedded** | Add direct sub-route `/admin/alerts` |
| `/admin/recalls` | Modal inside `RiskAlertCenter` | **Embedded** | Add direct sub-route `/admin/recalls` |

---

## 3. Route Guard & Access Control Classification

```
┌────────────────────────────────────────────────────────────────────────┐
│                             PUBLIC ROUTES                              │
│  /  ·  /login  ·  /register  ·  /trace/:batchId/*  ·  /batches  · /about│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Requires Supabase Session)
┌────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATED ROUTES                           │
│                 /dashboard  ·  /feedback  ·  /notifications            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Requires Specific Profile Role)
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE-PROTECTED WORKSPACES                       │
│  /dashboard/farmer       ──> Only FARMER                               │
│  /dashboard/mandi        ──> Only MANDI                                │
│  /dashboard/warehouse    ──> Only WAREHOUSE                            │
│  /dashboard/processor    ──> Only PROCESSOR / FACTORY / MANUFACTURER   │
│  /dashboard/distributor  ──> Only TRANSPORTER / DISTRIBUTOR            │
│  /dashboard/retailer     ──> Only RETAILER                             │
│  /dashboard/consumer     ──> Only CONSUMER                             │
│  /dashboard/authority    ──> Only AUTHORITY / ADMIN                    │
│  /dashboard/admin        ──> Only ADMIN                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Planned Router Refactor Strategy (For Phase 1+)

When transitioning from Phase 0 to execution phases, the routing will be cleanly refactored without breaking existing deep links:

1. **Install Declarative Client Router** (`react-router` or lightweight path-matcher).
2. **Implement `<ProtectedRoute>` & `<RoleGuard>` wrapper components**:
   ```typescript
   export const ProtectedRoute: React.FC<{ allowedRoles?: StakeholderRole[]; children: React.ReactNode }> = ({
     allowedRoles,
     children,
   }) => {
     const { currentUser, isAuthenticated, isLoadingAuth } = useAuthRole();
     if (isLoadingAuth) return <LoadingSpinner />;
     if (!isAuthenticated) return <Navigate to="/login" replace />;
     if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
       return <Navigate to="/dashboard" replace />;
     }
     return <>{children}</>;
   };
   ```
3. **Preserve Legacy Hash Backward Compatibility**: Automatically redirect legacy hashes (`#trace/BIS-2026-092`) to standard URLs (`/trace/BIS-2026-092`).
