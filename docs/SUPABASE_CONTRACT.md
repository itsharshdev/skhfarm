# FARMTRACER — SUPABASE CONTRACT & DATA INVENTORY
**Phase 0 Supabase Interaction Inventory & Schema Contract Mapping**
**Status:** Audit Complete | **Backend Freeze:** Strictly Enforced | **Backend Modifications:** 0

---

## 1. Supabase Client Configuration

* **Client File:** [`src/services/supabaseClient.ts`](file:///c:/Users/jivit/skhfarm/src/services/supabaseClient.ts)
* **Target Project URL:** `https://xfivsdalirigtdkpwopp.supabase.co`
* **Anon Key:** Configured via `VITE_SUPABASE_ANON_KEY` (with bundled fallback for sandbox stability).
* **Client Settings:**
  ```typescript
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
  ```

---

## 2. Table-by-Table Interaction Inventory

The frontend interacts with **12 Supabase database tables** across authentication, traceability, operations, compliance, and auditing:

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│      profiles          │      │     organizations      │      │     storage_units      │
└──────────┬─────────────┘      └──────────┬─────────────┘      └──────────┬─────────────┘
           │                               │                               │
           ▼                               ▼                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       batches                                          │
└──────────┬───────────────────────────────┬───────────────────────────────┬─────────────┘
           │                               │                               │
           ▼                               ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  supply_chain_events   │      │     batch_lineage      │      │       feedbacks        │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
           │                               │                               │
           ▼                               ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│      certificates      │      │         alerts         │      │        recalls         │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
           │                               │
           ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│   ai_risk_analyses     │      │       audit_logs       │
└────────────────────────┘      └────────────────────────┘
```

---

### 2.1 Table: `profiles`
Stores extended user profile metadata linked to Supabase Auth users.

| Field | Detail |
|---|---|
| **Service & Method** | [`AuthService.fetchProfile(userId)`](file:///c:/Users/jivit/skhfarm/src/services/authService.ts#L43-L93) |
| **Operation** | `SELECT` |
| **Columns Selected** | `id`, `user_id`, `full_name`, `role`, `language`, `organization_id`, `organizations (id, name, type, city, state)` |
| **Filters & Joins** | `.eq('user_id', userId).maybeSingle()`, joined with `organizations` table via foreign key `organization_id` |
| **Auth Dependency** | Requires active user session ID (`session.user.id`) |
| **Role Dependency** | Any authenticated user |
| **Expected Response** | Single object containing user profile + joined organization details |
| **Error / Fallback** | Logs warning to console; returns `null`. Frontend falls back to cached `farmtracer_user` in `localStorage`. |

---

### 2.2 Table: `organizations`
Stores cooperatives, APMC mandis, storage operators, processing mills, logistics fleets, retailers, and regulatory agencies.

| Interaction | Detail |
|---|---|
| **1. Fetch All Orgs** | [`AuthService.fetchOrganizations()`](file:///c:/Users/jivit/skhfarm/src/services/authService.ts#L213-L226) |
| **Operation** | `SELECT` |
| **Columns Selected** | `id`, `name`, `type`, `city`, `state` |
| **Filters & Order** | `.order('name')` |
| **Auth Dependency** | Public / Anon access permitted for registration dropdown |
| **Expected Response** | Array of `OrganizationOption` objects |
| **Error / Fallback** | Returns empty array `[]` on failure |
| **2. Register New Org** | [`AuthService.signUp(input)`](file:///c:/Users/jivit/skhfarm/src/services/authService.ts#L132-L196) |
| **Operation** | `INSERT` |
| **Columns Inserted** | `name`, `type`, `city`, `state` |
| **Returns** | `id` of inserted organization record |
| **Error / Fallback** | Bypasses org insert if `organizationId` already selected |

---

### 2.3 Table: `batches`
Core physical produce and manufactured batch registry.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers | Auth / Role | Fallback / Error Handling |
|---|---|---|---|---|---|---|
| **Get by ID** | `traceService.getBatchById(batchId)` | `SELECT` | `*` | `.eq('batch_code', batchId).maybeSingle()` | Public | Checks `localStorage` cache `ft_cache_batch_${batchId}` -> returns `ALL_DEMO_BATCHES[batchId]` |
| **Search** | `traceService.searchBatches(query)` | `SELECT` | `*` | `.or('batch_code.ilike...').order('created_at', {ascending: false})` | Public | Filters `ALL_DEMO_BATCHES` locally on matching query string |
| **Get All** | `traceService.getAllBatches()` | `SELECT` | `*` | `.order('created_at', {ascending: false})` | Public | Checks `ft_cache_all_batches` -> returns `Object.values(ALL_DEMO_BATCHES)` |
| **Get for User** | `traceService.getBatchesForUser(role, user, org)` | `SELECT` | `*` | `.or('origin_farmer_name.ilike...', 'current_owner_role.eq...')` | Role-filtered | Filters `ALL_DEMO_BATCHES` by role (Farmer, Mandi, Warehouse, etc.) |
| **Create Batch** | `traceService.createBatch(input)` | `INSERT` | `batch_code`, `product_name`, `category`, `variety`, `quantity`, `unit`, `origin`, `origin_farmer_id`, `origin_farmer_name`, `current_owner`, `current_owner_role`, `current_location`, `lat`, `lng`, `status`, `harvest_date`, `production_date`, `expiry_date`, `total_score`, `score_breakdown`, `evidences`, `feedbacks`, `certificates`, `qr_code_string` | Single record insert `.select('*').single()` | `FARMER` / Authenticated | Emits realtime notification to subscribers |
| **Transform Batch** | `traceService.transformBatch(input)` | `INSERT` | Same schema as createBatch with `current_owner_role: 'PROCESSOR'` | Single record insert | `PROCESSOR` / `FACTORY` | Emits notification; triggers parent batch status update to `'TRANSFORMED'` |
| **Receive Batch** | `traceService.receiveBatch(...)` | `UPDATE` | `current_owner`, `current_owner_role`, `current_location`, `status`, `evidences`, `updated_at` | `.eq('batch_code', batchId)` | `MANDI` / `WAREHOUSE` / `RETAILER` | Refetches batch and notifies subscribers |
| **Transfer Batch** | `traceService.transferBatch(...)` | `UPDATE` | `current_owner`, `current_owner_role`, `current_location`, `status`, `evidences`, `updated_at` | `.eq('batch_code', batchId)` | Transferee Role | Updates status to `'IN_TRANSIT'` when assigned to `TRANSPORTER` |
| **Assign Storage** | `traceService.assignStorageUnit(...)` | `UPDATE` | `current_owner`, `current_owner_role`, `current_location`, `status`, `current_storage`, `updated_at` | `.eq('batch_code', batchId)` | `WAREHOUSE` | Sets `status: 'STORED'` and attaches `current_storage` JSON payload |
| **Update Telemetry**| `traceService.recordStorageCondition(...)` | `UPDATE` | `current_storage`, `updated_at` | `.eq('batch_code', batchId)` | `WAREHOUSE` | Updates active micro-climate readings and condition status |
| **Add Evidence** | `traceService.addEvidenceToBatch(...)` | `UPDATE` | `evidences`, `updated_at` | `.eq('batch_code', batchId)` | Authenticated | Appends camera record to JSONB `evidences` array |
| **Verify Batch** | `traceService.verifyBatchAsAuthority(...)` | `UPDATE` | `status`, `contamination_flag`, `updated_at` | `.eq('batch_code', batchId)` | `AUTHORITY` / `ADMIN` | Sets `status: 'RECALLED'` if rejected; sets contamination flag |

---

### 2.4 Table: `supply_chain_events`
Chronological, append-oriented ledger of all handoffs, custody transfers, inspections, and transformations.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Fetch Batch Events** | `traceService.mapDbRowToBatch` & `traceService.getBatchTimeline` | `SELECT` | `id`, `event_code`, `batch_id`, `batch_code`, `event_type`, `actor`, `actor_role`, `organization`, `location`, `lat`, `lng`, `timestamp`, `quantity`, `notes`, `previous_location`, `new_location`, `verification_state`, `evidence_ids`, `storage_condition` | `.eq('batch_code', batchCode).order('timestamp', {ascending: true})` |
| **Log Harvest Event** | `traceService.createBatch` | `INSERT` | `event_code`, `batch_id`, `batch_code`, `event_type: 'HARVESTED'`, `actor`, `actor_role: 'FARMER'`, `organization`, `location`, `lat`, `lng`, `timestamp`, `quantity`, `notes`, `verification_state: 'VERIFIED'`, `evidence_ids` | Insert on batch creation |
| **Log Transform Event** | `traceService.transformBatch` | `INSERT` | `event_type: 'TRANSFORMED'`, `actor_role: 'PROCESSOR'`, etc. | Insert on formulation |
| **Log Receive Event** | `traceService.receiveBatch` | `INSERT` | `event_type: 'COLLECTED'` or `'RECEIVED'`, actor details | Insert on arrival |
| **Log Transfer Event**| `traceService.transferBatch` | `INSERT` | `event_type: 'TRANSFERRED'`, destination details | Insert on dispatch |
| **Log Storage Event** | `traceService.assignStorageUnit` | `INSERT` | `event_type: 'STORED'`, `storage_condition` | Insert on vault intake |
| **Log Inspect Event** | `traceService.recordStorageCondition` | `INSERT` | `event_type: 'INSPECTED'`, `storage_condition` | Insert on inspection |
| **Log Audit Event** | `traceService.verifyBatchAsAuthority` | `INSERT` | `event_type: 'AUDITED'`, `actor_role: 'AUTHORITY'`, `verification_state` | Insert on regulator audit |

---

### 2.5 Table: `batch_lineage`
Relational Directed Acyclic Graph (DAG) edges representing parent-child ingredient relationships (Many-to-Many & One-to-Many).

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Parents** | `traceService.mapDbRowToBatch` | `SELECT` | `parent_batch_code` | `.eq('child_batch_code', batchCode)` |
| **Query Children** | `traceService.mapDbRowToBatch` | `SELECT` | `child_batch_code` | `.eq('parent_batch_code', batchCode)` |
| **Create Lineage Link** | `traceService.transformBatch` | `INSERT` | `parent_batch_code`, `child_batch_code`, `transformation_type`, `quantity`, `notes` | Inserts edge for every selected parent ID |

---

### 2.6 Table: `feedbacks`
Multi-tier feedback submissions across supply-chain stakeholders and public consumers.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Feedbacks** | `traceService.mapDbRowToBatch` | `SELECT` | `id`, `feedback_code`, `batch_code`, `event_code`, `from_role`, `to_role`, `submitted_by`, `category`, `score`, `comment`, `created_at`, `status` | `.eq('batch_code', batchCode).order('created_at', {ascending: false})` |
| **Submit Feedback** | `traceService.submitFeedback` | `INSERT` | `feedback_code`, `batch_code`, `from_role`, `to_role`, `submitted_by`, `category`, `score`, `comment`, `status: 'PUBLISHED'` | Inserts new feedback record |

---

### 2.7 Table: `certificates`
Quality, organic, and standards compliance certificates attached to batches.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Certificates** | `traceService.mapDbRowToBatch` | `SELECT` | `id`, `certificate_code`, `batch_code`, `title`, `issuer`, `type`, `issued_date`, `expiry_date`, `verification_status`, `document_ref`, `is_demo_non_fssai` | `.eq('batch_code', batchCode)` |

---

### 2.8 Table: `storage_units`
Solar smart cold storage infrastructure, cold rooms, and refrigerated transit units.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Storage Units** | `traceService.getStorageUnits` | `SELECT` | `code`, `name`, `type`, `location`, `capacity`, `current_status`, `power_status`, `solar_status`, `solar_output_watts`, `battery_percentage`, `safe_temperature_min`, `safe_temperature_max`, `safe_humidity_min`, `safe_humidity_max`, `demo_state` | `.order('name')` |

---

### 2.9 Table: `alerts`
Targeted role notifications, near-expiry warnings, contamination flags, and compliance notices.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Alerts** | `alertService.getAlerts(targetRole)` | `SELECT` | `id`, `alert_code`, `user_id`, `target_role`, `batch_id`, `batch_code`, `type`, `severity`, `title`, `message`, `is_read`, `created_at` | `.order('created_at', {ascending: false})` (filters by role if not Admin/Authority) |
| **Mark Alert Read** | `alertService.markAlertRead(alertCode)` | `UPDATE` | `is_read: true` | `.eq('alert_code', alertCode)` |
| **Create Alert** | `alertService.createAlert(input)` | `INSERT` | `alert_code`, `target_role`, `batch_code`, `type`, `severity`, `title`, `message`, `is_read: false` | Inserts single alert record |

---

### 2.10 Table: `recalls`
Official food safety lot recall actions initiated by authorities.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Recalls** | `alertService.getRecalls` | `SELECT` | `id`, `recall_code`, `batch_id`, `batch_code`, `reason`, `severity`, `status`, `initiated_by_name`, `initiated_by_role`, `affected_product_name`, `affected_quantity`, `action_required`, `created_at`, `updated_at` | `.order('created_at', {ascending: false})` |
| **Create Recall** | `alertService.createRecall(input)` | `INSERT` | `recall_code`, `batch_code`, `reason`, `severity`, `status: 'ACTIVE'`, `initiated_by_name`, `initiated_by_role`, `affected_product_name`, `affected_quantity`, `action_required` | Inserts recall and auto-dispatches alerts |

---

### 2.11 Table: `ai_risk_analyses`
Explainable AI risk evaluations, anomaly detections, and shelf-life predictions.

| Interaction | Method / Location | Operation | Columns Referenced | Filters / Modifiers |
|---|---|---|---|---|
| **Query Analyses** | `aiService.getRiskAnalysesForBatch(batchId)` | `SELECT` | `id`, `analysis_code`, `batch_id`, `batch_code`, `risk_level`, `risk_score`, `risk_factors`, `storage_anomaly_detected`, `recommendations`, `is_deterministic_fallback`, `model_version`, `analyzed_at`, `created_at` | `.eq('batch_code', batchId).order('analyzed_at', {ascending: false})` |
| **Persist Analysis** | `aiService.analyzeBatchAndPersist(batch)` | `INSERT` | `analysis_code`, `batch_code`, `risk_level`, `risk_score`, `risk_factors`, `storage_anomaly_detected`, `recommendations`, `is_deterministic_fallback`, `model_version`, `analyzed_at` | Inserts analysis record and audit entry |

---

### 2.12 Table: `audit_logs`
Immutable system audit trail tracking all major lifecycle mutations.

| Interaction | Trigger Source | Operation | Payload Columns |
|---|---|---|---|
| **Batch Created** | `traceService.createBatch` | `INSERT` | `action: 'BATCH_CREATED'`, `actor_name`, `actor_role`, `entity_type: 'BATCH'`, `entity_id`, `details` |
| **Batch Transformed**| `traceService.transformBatch` | `INSERT` | `action: 'BATCH_TRANSFORMED'`, `actor_name`, `actor_role`, `entity_type: 'BATCH'`, `entity_id`, `details` |
| **Batch Received** | `traceService.receiveBatch` | `INSERT` | `action: 'BATCH_RECEIVED'`, `actor_name`, `actor_role`, `entity_type: 'BATCH'`, `entity_id`, `details` |
| **Batch Transferred**| `traceService.transferBatch` | `INSERT` | `action: 'BATCH_TRANSFERRED'`, `actor_name`, `actor_role`, `entity_type: 'BATCH'`, `entity_id`, `details` |
| **Feedback Logged** | `traceService.submitFeedback` | `INSERT` | `action: 'FEEDBACK_SUBMITTED'`, `actor_name`, `actor_role`, `entity_type: 'FEEDBACK'`, `entity_id`, `details` |
| **Authority Audit** | `traceService.verifyBatchAsAuthority` | `INSERT` | `action: 'AUTHORITY_VERIFICATION'`, `actor_name`, `actor_role`, `entity_type: 'BATCH'`, `entity_id`, `details` |
| **Batch Recalled** | `alertService.createRecall` | `INSERT` | `action: 'BATCH_RECALLED'`, `actor_name`, `actor_role`, `entity_type: 'RECALL'`, `entity_id`, `details` |
| **AI Risk Evaluated**| `aiService.analyzeBatchAndPersist` | `INSERT` | `action: 'AI_RISK_ANALYZED'`, `actor_name: 'FARM-TRACER AI Guard'`, `actor_role: 'SYSTEM'`, `entity_type: 'AI_ANALYSIS'`, `entity_id`, `details` |

---

## 3. Realtime Channels & Subscriptions

The application subscribes to 3 distinct Supabase Realtime channels for instant UI reactivity without page refresh:

```typescript
// 1. Live Batches Channel (traceService.ts)
supabase.channel('public:batches')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, () => {
    this.notify(); // Re-queries active batch and invalidates UI caches
  })
  .subscribe();

// 2. Realtime AI Analyses Channel (aiService.ts)
supabase.channel('public:ai_risk_analyses')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_risk_analyses' }, () => {
    this.notify(); // Refreshes active AI insights panel
  })
  .subscribe();

// 3. Realtime Alerts Channel (alertService.ts)
supabase.channel('public:alerts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
    this.notify(); // Updates notification badges in Navbar and Authority dashboard
  })
  .subscribe();
```

---

## 4. Contract Observations & Future Alignment Notes

> [!NOTE]
> The following observations document subtle field naming differences between TypeScript interfaces and database schemas. In strict accordance with the **Absolute Backend Freeze**, these are documented for future frontend adapter alignment only:

1. **Identifier Conventions (`batch_code` vs `id`)**:
   * Frontend TypeScript interfaces use `batchId: string` to represent human-readable codes (e.g. `BIS-2026-092`).
   * Database table `batches` uses `batch_code` as unique human-readable identifier and `id` (UUID) as internal primary key.
   * `traceService.mapDbRowToBatch` properly maps `row.batch_code` to `batch.batchId`.
2. **Denormalized JSONB vs Relational Tables**:
   * For backwards compatibility and high-speed retrieval, `batches` stores denormalized JSONB copies of `evidences`, `feedbacks`, `certificates`, and `score_breakdown`.
   * Normalized child tables (`supply_chain_events`, `batch_lineage`, `feedbacks`, `certificates`) are also written to simultaneously.
   * `traceService` prioritizes queries from relational tables (`feedbacks`, `certificates`, `supply_chain_events`) and falls back to JSONB columns if empty.
3. **Atomic Operations (RPC Candidates)**:
   * Multi-step transactions (such as `transformBatch`, which inserts into `batches`, `supply_chain_events`, `batch_lineage`, updates parent `batches`, and logs to `audit_logs`) currently execute as sequential client-side queries.
   * As specified in Brain V3 (§25), these operations should eventually be encapsulated in atomic database RPC functions (e.g. `create_processing_event()`).
