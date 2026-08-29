# FARMTRACER — FRONTEND ARCHITECTURE & CODEBASE AUDIT
**Phase 0 Comprehensive Audit Report**
**Status:** Audit Complete | **Backend Freeze:** Strictly Enforced | **Code Modifications:** None

---

## 1. Executive Summary

FarmTracer is a React 19 / Vite 6 / TypeScript Progressive Web Application (PWA) designed to provide an end-to-end digital food traceability and solar-powered cold-chain monitoring platform (addressing hackathon problem cluster **SKH029, SKH030, SKH031**).

The frontend is fully functional in hybrid mode: it integrates with a live Supabase backend instance for real-time authentication, batch registry queries, event logging, audit logs, alerts, recalls, and feedback submissions, while providing seamless deterministic fallbacks to rich local mock scenarios (`ALL_DEMO_BATCHES`) when disconnected or running offline.

This audit report documents the entire frontend architecture, inventorying all entry points, layouts, dashboards, operational modals, services, and UX characteristics without altering production code.

---

## 2. Application Entry Points & Lifecycle

```
index.html
  └── src/main.tsx
        └── <StrictMode>
              └── <LanguageProvider> (src/i18n/LanguageContext.tsx)
                    └── <AuthRoleProvider> (src/context/AuthRoleContext.tsx)
                          └── <AppContent> (src/App.tsx)
```

### 2.1 File Breakdown
* **`index.html`** (`2,234 bytes`):
  * Configures PWA metadata (`theme-color: #059669`, apple-touch icons, manifest link).
  * Injects Google Fonts: `Plus Jakarta Sans` (UI typography) and `Space Grotesk` (headings/branding).
  * Registers Service Worker (`/sw.js`) upon window load event if supported.
* **`src/main.tsx`** (`241 bytes`):
  * Mounts React 19 root into DOM node `#root` with `StrictMode`.
  * Imports global styles (`src/index.css`).
* **`src/index.css`** (`24 bytes`):
  * Imports Tailwind CSS v4 via `@import "tailwindcss";`.
* **`src/App.tsx`** (`12,208 bytes`):
  * Top-level state orchestrator managing `activeView` (`'landing' | 'trace' | 'batches' | 'dashboard'`).
  * Listens to `window.location.hash` (`hashchange` listener) for lightweight client routing (`#trace/:id`, `#batches`, `#dashboard`, `#landing`).
  * Automatically switches to `dashboard` view upon authentication state change.
  * Manages global modals: `QRScannerModal`, `StakeholderLoginModal`, `RegisterModal`, and `OfflineSyncDrawer`.
  * Renders `Navbar`, active main view, `Footer`, and `MobileNav`.

---

## 3. Core Component Inventory by Domain

The application contains **38 React components** organized into 13 modular directories under `src/components/`:

### 3.1 Layout Components (`src/components/layout/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **Navbar** | `src/components/layout/Navbar.tsx` | 10.3 KB | Sticky top header with brand logo, quick batch search input, live offline/online indicator with pending sync badge, language switcher (`en`, `hi`, `mr`), QR scanner trigger, and user auth dropdown. |
| **Footer** | `src/components/layout/Footer.tsx` | 5.7 KB | Footer links, quick demo batch selectors, copyright notice, and problem cluster badges. |
| **MobileNav** | `src/components/layout/MobileNav.tsx` | 3.3 KB | Bottom navigation bar for mobile viewports (<768px), providing 1-tap switching between Home, Trace, QR Scanner, Batches, and Workspace. |

### 3.2 Landing & Exploration (`src/components/landing/`, `src/components/batches/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **LandingPage** | `src/components/landing/LandingPage.tsx` | 14.3 KB | Hero banner with dual consumer/stakeholder callouts, live batch code input with direct trace redirection, featured scenario batch cards, Super-PS problem statement explainer, and value chain loop overview. |
| **DemoBatchesListView** | `src/components/batches/DemoBatchesListView.tsx` | 6.4 KB | Tabular and card-based batch registry browser with search, status filters (Active, Stored, Recalled), and 1-click batch selection. |

### 3.3 Traceability & Visualization (`src/components/trace/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **PublicTraceView** | `src/components/trace/PublicTraceView.tsx` | 25.2 KB | Core consumer and judge-facing screen. Answers the two central Super-PS questions: *"Is it safe right now?"* (solar storage card) and *"Where has this batch been?"* (tabbed lineage DAG, event timeline, AI guard, route corridor, certificates, reviews). |
| **LineageDAGGraph** | `src/components/trace/LineageDAGGraph.tsx` | 23.4 KB | Interactive Directed Acyclic Graph (DAG) visualizing multi-parent ingredients (Wheat + Sugar → Flour → Biscuit), transformation nodes, zoom controls, full-screen mode, and node detail click handlers. |
| **CurrentStorageConditionCard** | `src/components/trace/CurrentStorageConditionCard.tsx` | 12.3 KB | Real-time solar micro-climate card showing core temperature gauge, humidity, solar power generation status, battery level, safe boundary bars, and produce-specific temperature envelopes. |
| **EventTimelineView** | `src/components/trace/EventTimelineView.tsx` | 10.9 KB | Vertical chronological timeline showing all custodial handoffs, actors, GPS locations, timestamps, sealed evidence thumbnails, and verification badges. |
| **SupplyChainRouteMap** | `src/components/trace/SupplyChainRouteMap.tsx` | 9.7 KB | Interactive route corridor visualization mapping transit waypoints from Kopargaon origin to Shirdi storage, Nashik mill, Chakan factory, and retail store. |
| **MultiParentLineageCard** | `src/components/trace/MultiParentLineageCard.tsx` | 5.9 KB | Visual recipe breakdown showing upstream parent ingredients and relative composition ratios. |
| **BatchDetailDrawer** | `src/components/trace/BatchDetailDrawer.tsx` | 17.7 KB | Slide-over drawer presenting in-depth metadata, laboratory inspection records, chemical residue details, tamper-proof hashes, and node telemetry when clicking any DAG node or timeline event. |
| **DemoScenarioBar** | `src/components/trace/DemoScenarioBar.tsx` | 6.4 KB | Top scenario quick-switcher allowing instant 1-click switching between Nominal Biscuit, High-Risk Chemical Residue, Perishable Milk, Cold Apple, and Solar Onion batches. |

### 3.4 Stakeholder Role Dashboards (`src/components/dashboard/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **FarmerDashboardView** | `src/components/dashboard/FarmerDashboardView.tsx` | 27.1 KB | Farmer portal: harvest batch registration with live camera proof, batch inventory table, quality score metrics, transfer triggers, and embedded `FarmerReputationHub`. |
| **MandiDashboardView** | `src/components/dashboard/MandiDashboardView.tsx` | 14.5 KB | Mandi collection portal: receive incoming farmer lots, weighbridge calibration logging, grade verification, feedback scoring, and transfer to storage/processors. |
| **WarehouseDashboardView** | `src/components/dashboard/WarehouseDashboardView.tsx` | 20.3 KB | Solar Smart Cold Storage portal: storage unit monitor, telemetry updates, batch assignment to solar vaults, temperature threshold alerts, and custody handoffs. |
| **ProcessorDashboardView** | `src/components/dashboard/ProcessorDashboardView.tsx` | 23.3 KB | Mill/Processor portal: ingredient transformation engine, multi-parent batch merging, output batch creation, parent batch status updates, and packaging QR generation. |
| **TransporterDashboardView** | `src/components/dashboard/TransporterDashboardView.tsx` | 9.3 KB | Logistics portal: active reefer transit consignments, route GPS checkpoint logging, temperature custody verification, and delivery completion. |
| **RetailerDashboardView** | `src/components/dashboard/RetailerDashboardView.tsx` | 11.7 KB | Retail storefront portal: inbound stock receiving, shelf display QR codes, expiry monitoring, and consumer feedback overview. |
| **AuthorityDashboardView** | `src/components/dashboard/AuthorityDashboardView.tsx` | 19.3 KB | Regulator portal: comprehensive batch audit table, verification decisions (Verified / Flagged / Rejected), recall execution, and tabbed `RiskAlertCenter`. |
| **AdminDashboardView** | `src/components/dashboard/AdminDashboardView.tsx` | 9.1 KB | System administration portal: platform statistics, quick harvest simulation, storage unit inventory, and system state reset tool. |
| **ConsumerDashboardView** | `src/components/dashboard/ConsumerDashboardView.tsx` | 10.6 KB | Authenticated consumer hub: recent scan history, favorite producer farms, feedback management, and quick QR scan triggers. |

### 3.5 Operations & Modals (`src/components/operations/`, `src/components/scanner/`, `src/components/auth/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **CameraEvidenceCaptureModal** | `src/components/operations/CameraEvidenceCaptureModal.tsx` | 15.3 KB | Hardware device-camera capture (`navigator.mediaDevices.getUserMedia`) supporting photo snapshots, 5-second video clips, camera toggle, and fallback simulated captures in sandbox containers. |
| **TransferBatchModal** | `src/components/operations/TransferBatchModal.tsx` | 12.1 KB | Custody transfer modal allowing selection of downstream stakeholder role, target organization, destination address, transit notes, and optional camera proof. |
| **BatchQRModal** | `src/components/operations/BatchQRModal.tsx` | 9.7 KB | Generates dynamic printable QR label with SVG matrix styling, batch code, origin details, and direct copy/print capabilities. |
| **HandoffFeedbackModal** | `src/components/operations/HandoffFeedbackModal.tsx` | 8.1 KB | Stakeholder-to-stakeholder rating modal (1-100 score + categories: Quality, Condition, Accuracy, Packaging, Handling) submitted directly to Supabase `feedbacks`. |
| **StorageConditionUpdateModal** | `src/components/operations/StorageConditionUpdateModal.tsx` | 9.7 KB | Environmental telemetry logging modal for temperature, humidity, power mode (Solar/Grid/Battery), and automatic boundary range validation. |
| **StorageUnitDetailModal** | `src/components/operations/StorageUnitDetailModal.tsx` | 8.4 KB | Detailed view of solar storage infrastructure, PV output wattage, battery reserve percentage, and capacity utilization. |
| **QRScannerModal** | `src/components/scanner/QRScannerModal.tsx` | 10.2 KB | Live camera QR scanner overlay with fallback manual batch code text entry and quick demo sample buttons. |
| **StakeholderLoginModal** | `src/components/auth/StakeholderLoginModal.tsx` | 14.6 KB | 1-Click fast role switcher across all 9 roles with preconfigured demo accounts, plus standard Email/Password authentication form. |
| **RegisterModal** | `src/components/auth/RegisterModal.tsx` | 13.0 KB | Registration modal for new users with role selection, organization creation or existing organization association, and location input. |

### 3.6 Safety, AI & Offline (`src/components/safety/`, `src/components/ai/`, `src/components/offline/`, `src/components/farmer/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **RiskAlertCenter** | `src/components/safety/RiskAlertCenter.tsx` | 21.2 KB | Centralized safety alert dashboard with severity filters (Critical, High, Medium, Low), contamination quarantine execution, alert resolution, and recall logging. |
| **AIInsightsPanel** | `src/components/ai/AIInsightsPanel.tsx` | 8.4 KB | AI diagnosis view displaying model predictions, confidence scores, thermal stability analysis, residue spectrometry, and recommendations. |
| **FarmerReputationHub** | `src/components/farmer/FarmerReputationHub.tsx` | 10.5 KB | Farmer reputation dashboard displaying verified origin badges, quality/traceability monthly score trends, and actionable improvement recommendations. |
| **OfflineSyncDrawer** | `src/components/offline/OfflineSyncDrawer.tsx` | 11.6 KB | Slide-out offline drawer managing queued transactions, simulated offline mode toggle, item deletion, and batch synchronization to live backend. |

### 3.7 Common UI Elements (`src/components/common/`)
| Component | Path | Size | Description & Key Responsibilities |
|---|---|---|---|
| **ScoreRing** | `src/components/common/ScoreRing.tsx` | 12.8 KB | Animated radial SVG gauge rendering the 100-Point Weighted Integrity Score with collapsible 7-pillar breakdown (Handoffs, Completeness, Verification, Quality, Evidence, Feedback, Freshness) and active penalty indicators. |
| **StatusBadge** | `src/components/common/StatusBadge.tsx` | 2.5 KB | Color-coded status chip for batch status (`ACTIVE`, `STORED`, `IN_TRANSIT`, `TRANSFORMED`, `RETAILED`, `RECALLED`) and verification state (`VERIFIED`, `FLAGGED`, `REJECTED`). |
| **ColdChainStatusBadge** | `src/components/common/ColdChainStatusBadge.tsx` | 8.4 KB | Micro-status indicator for solar cold-chain state (`SAFE`, `WARNING`, `OUT_OF_RANGE`). |

---

## 4. Contexts & Hooks

### 4.1 `AuthRoleContext` (`src/context/AuthRoleContext.tsx`)
* **State Managed:**
  * `currentUser`: `AppUser | null` (hydrated from `localStorage.getItem('farmtracer_user')` and Supabase session).
  * `isAuthenticated`: boolean.
  * `isLoadingAuth`: boolean.
  * `activeBatchId`: string (defaults to primary demo batch `'BIS-2026-092'`).
  * Modal visibility states: `isLoginModalOpen`, `isRegisterModalOpen`, `isScannerOpen`.
* **Key Functions:**
  * `loginAsRole(role)`: Performs 1-click authentication using preconfigured demo credentials.
  * `loginWithCredentials(email, password)`: Authenticates with Supabase Auth `signInWithPassword`.
  * `registerUser(input)`: Registers user and organization via Supabase Auth `signUp`.
  * `logout()`: Signs out from Supabase Auth and clears local user cache.
* **Supabase Listeners:**
  * Subscribes to `supabase.auth.onAuthStateChange` to automatically synchronize user profile upon `SIGNED_IN` or `SIGNED_OUT`.

### 4.2 `LanguageContext` (`src/i18n/LanguageContext.tsx`)
* **State Managed:**
  * `language`: `'en' | 'hi' | 'mr'` (persisted to `localStorage.getItem('farmtracer_lang')`).
  * `t`: Translation dictionary for the active language.
* **Key Functions:**
  * `setLanguage(lang)`: Updates active locale and persists selection.

---

## 5. Services & Business Logic Layer

```
src/services/
├── supabaseClient.ts      ── Supabase client instantiation & auth persistence config
├── authService.ts         ── Authentication, session profiles, organization lookup
├── traceService.ts        ── Batches, supply chain events, transformations, lineage DAG
├── scoreService.ts        ── Deterministic 100-Point Weighted Integrity Score algorithm
├── aiService.ts           ── AI risk analysis, thermal excursion analysis, safety alerts
├── alertService.ts        ── Expiry calculation, alert dispatching, recall workflows
├── offlineSyncService.ts  ── Offline queue storage (localStorage), network events, sync runner
└── reputationService.ts   ── Farmer reputation metrics, badges, and score trends
```

### 5.1 Service Details
* **`traceService.ts`** (` ITouchService `):
  * Primary data gateway for batch CRUD, custodial transfers, processing transformations, and lineage queries.
  * Realtime: Subscribes to Postgres changes on `public:batches`.
  * Resilient Fallback: If Supabase query returns null/error, seamlessly falls back to `localStorage` cache or `ALL_DEMO_BATCHES`.
* **`scoreService.ts`**:
  * Implements the **FARM-TRACER 100-PT WEIGHTED INTEGRITY MODEL (V2)**.
  * Evaluates 7 positive pillars (Max 100 pts) minus 4 penalty deductions (Contamination: -10 to -35, Expiry: -12 to -30, Storage Anomaly: -15, Missing Evidence: -8).
* **`aiService.ts`**:
  * Evaluates batch safety profiles deterministically (`evaluateBatchRisk`) and persists results to Supabase `ai_risk_analyses`.
  * Subscribes to realtime updates on `public:ai_risk_analyses`.
* **`alertService.ts`**:
  * Calculates shelf-life days remaining (`NORMAL`, `NEAR_EXPIRY`, `EXPIRED`).
  * Creates targeted role alerts in `alerts` and manages official recalls in `recalls`.
* **`offlineSyncService.ts`**:
  * Maintains offline queue in `localStorage` (`farm_tracer_offline_sync_queue_v1`).
  * Provides simulation toggle for testing low-connectivity field environments.
  * Executes batch synchronization (`syncAll`) to replay field events against Supabase tables.

---

## 6. PWA, Service Worker & Offline Capability

* **Service Worker (`public/sw.js`)**:
  * Implements cache-first / network-fallback strategy for static assets (`/`, `/index.html`, `/manifest.json`, SVG icons).
  * Automatically intercepts failed HTTP fetch requests in offline mode to serve cached application shell.
* **Manifest (`public/manifest.json`)**:
  * Configures standalone PWA installation, emerald theme colors, and SVG app icons.
* **Offline UI Drawer (`OfflineSyncDrawer.tsx`)**:
  * Provides visual queue of pending field transactions.
  * Allows manual trigger for synchronization with retry counters and error logs.

---

## 7. AI & Computer Vision Architecture

* **Camera-Only Evidence Capture**:
  * `CameraEvidenceCaptureModal.tsx` uses live `getUserMedia` stream.
  * Generates simulated tamper-proof SHA-256 hash and geo-accuracy metadata.
  * Explicitly restricts gallery uploads for tamper-proof audit trails.
* **Explainable AI Anomaly Guard**:
  * Implements rule-based and predictive models for:
    * `STORAGE_EXCURSION_RISK`: Analyzes thermal drift against produce-specific envelopes.
    * `ANOMALY_DETECTION`: Verifies multi-parent DAG provenance integrity.
    * `CONTAMINATION_DETECTION`: Flags chemical residues exceeding MRL thresholds.
    * `EXPIRY_RISK`: Forecasts perishable spoilage windows.
  * AI predictions are persisted in Supabase `ai_risk_analyses` and clearly labeled as `Demo AI Result` or verified system flags.

---

## 8. UI/UX Quality & Accessibility Assessment

### 8.1 Strengths
* **Visual Polish**: Professional color palette using emerald, slate, teal, amber, and rose tailored to agricultural and food safety contexts.
* **Information Scannability**: Visual score ring, status badges, and color-coded alerts provide immediate clarity.
* **Dual-Audience Flow**: Clear separation between consumer exploration (scan/trace) and supply chain stakeholder operations (workspaces).
* **High Interactivity**: Smooth zoom/pan DAG graph, animated score rings, and real-time state reactivity.

### 8.2 Identified UX / UI Debt (For Phase 1+ Refactoring)
1. **Oversized Components**:
   * `src/services/traceService.ts` (1,477 lines, 51 KB) combines DB queries, data mapping, fallback mock resolution, and realtime pub/sub in one monolithic class.
   * `FarmerDashboardView.tsx` (565 lines, 27 KB) and `PublicTraceView.tsx` (580 lines, 25 KB) contain complex inline state and nested modals.
2. **Navigation / Routing Limitations**:
   * Application currently relies on `window.location.hash` and conditional view state rendering in `App.tsx` instead of a declarative client-side router (e.g. React Router).
   * Direct deep-linking to sub-routes (e.g. `/dashboard/farmer` or `/admin/alerts`) requires manual hash parsing.
3. **Typography & Spacing Inconsistencies**:
   * Some modal headers use hardcoded pixel sizes instead of standard design tokens.
   * Text sizes across stat cards range from `text-[10px]` to `text-3xl` with occasional inconsistent line-heights on mobile viewports.
4. **Modal Overlap**:
   * Global modals (`QRScannerModal`, `StakeholderLoginModal`, `RegisterModal`) mount alongside local dashboard modals, occasionally causing z-index stacking contention (`z-50`).

---

## 9. Audit Verification Summary

| Metric | Result | Notes |
|---|---|---|
| **TypeScript Compilation (`npm run typecheck`)** | **0 Errors** | Fully typechecked across all modules |
| **Vite Production Build (`npm run build`)** | **Passing** | Bundle generated without errors |
| **Backend State** | **Frozen** | Zero modifications made to Supabase schema/rules |
| **Frontend Code State** | **Unmodified** | No source files edited during Phase 0 audit |
