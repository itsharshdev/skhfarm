# FARMTRACER — ROLE MATRIX & ACCESS CONTROL AUDIT
**Phase 0 Role Analysis & RBAC Matrix**
**Status:** Audit Complete | **Backend Freeze:** Strictly Enforced | **Code Modifications:** None

---

## 1. Supported Role Inventory

FarmTracer supports **9 primary supply-chain and regulatory roles** plus **2 auxiliary roles**, covering the complete lifecycle from harvest origin to consumer verification:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    FARMER    │ ──> │    MANDI     │ ──> │  WAREHOUSE   │ ──> │  PROCESSOR   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   CONSUMER   │ <── │   RETAILER   │ <── │ TRANSPORTER  │ <──────────┘
└──────────────┘     └──────────────┘     └──────────────┘
       ▲
       │             ┌──────────────┐     ┌──────────────┐
       └──────────── │  AUTHORITY   │ <── │    ADMIN     │
                     └──────────────┘     └──────────────┘
```

---

## 2. Comprehensive Role-by-Role Matrix

| Role Identifier | Primary Persona & Title | Dashboard View Component | Key Actions & Available Navigation | Protected / Role-Exclusive Functionality | Role-Specific Service Calls |
|---|---|---|---|---|---|
| **`FARMER`** | Farmer / FPO Origin Producer | [`FarmerDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/FarmerDashboardView.tsx) | • Register new harvest lot<br>• View registered batch inventory<br>• Inspect origin quality score<br>• Trigger custody transfer to Mandi<br>• View reputation & earned badges | • **Device-Camera Harvest Proof Capture** (`CameraEvidenceCaptureModal`)<br>• **Farm Origin Batch Creation** (`createBatch`)<br>• **Farmer Reputation & Badge Hub** (`FarmerReputationHub`) | `traceService.createBatch`<br>`traceService.getBatchesForUser('FARMER')`<br>`reputationService.getFarmerReputation` |
| **`MANDI`** | APMC Collection & Aggregation Yard | [`MandiDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/MandiDashboardView.tsx) | • Inspect inbound farmer lots<br>• Receive & weigh incoming produce<br>• Submit farmer quality feedback<br>• Transfer to storage or processors<br>• Print/Display batch QR | • **Weighbridge Calibration & Intake Log** (`receiveBatch`)<br>• **Stakeholder-to-Stakeholder Rating** (`HandoffFeedbackModal`)<br>• **Mandi-Level Lot Aggregation** | `traceService.getBatchesForUser('MANDI')`<br>`traceService.getIncomingBatches('MANDI')`<br>`traceService.receiveBatch`<br>`traceService.submitFeedback` |
| **`WAREHOUSE`** | Solar Smart Storage / Cold Vault Operator | [`WarehouseDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/WarehouseDashboardView.tsx) | • Monitor solar vault units<br>• Assign produce to storage units<br>• Log live temperature/humidity<br>• Monitor battery & PV generation<br>• Transfer vaulted lots | • **Solar Storage Unit Telemetry Updates** (`StorageConditionUpdateModal`)<br>• **Vault Allocation & Micro-Climate Control** (`assignStorageUnit`)<br>• **SKH030 Solar Power Status Monitoring** | `traceService.getBatchesForUser('WAREHOUSE')`<br>`traceService.getStorageUnits`<br>`traceService.assignStorageUnit`<br>`traceService.recordStorageCondition` |
| **`PROCESSOR`** *(also covers `MANUFACTURER`, `FACTORY`)* | Mill, Processing Plant & Food Manufacturer | [`ProcessorDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/ProcessorDashboardView.tsx) | • Select multiple parent batches<br>• Execute transformation / milling<br>• Generate output product batch<br>• Produce retail packaging QR<br>• Transfer to logistics fleet | • **Multi-Parent Recipe Formulation Engine** (`transformBatch`)<br>• **Automated Parent Batch Lineage Linking** (`batch_lineage` inserts)<br>• **Intermediate & Finished Good Creation** | `traceService.getBatchesForUser('PROCESSOR')`<br>`traceService.getAllBatches`<br>`traceService.transformBatch`<br>`traceService.getBatchById` |
| **`TRANSPORTER`** *(also covers `DISTRIBUTOR`)* | Reefer Transit Fleet & Distribution Carrier | [`TransporterDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/TransporterDashboardView.tsx) | • View active transit consignments<br>• Log GPS route checkpoints<br>• Monitor in-cabin reefer temps<br>• Capture transit arrival proofs<br>• Complete delivery to retail | • **Route Corridor GPS Waypoint Logging** (`receiveBatch` as checkpoint)<br>• **Reefer Cold-Chain Integrity Verification**<br>• **Transit Tamper-Proof Evidence** | `traceService.getBatchesForUser('TRANSPORTER')`<br>`traceService.receiveBatch`<br>`traceService.transferBatch` |
| **`RETAILER`** | Supermarket, Retail Store & Point of Sale | [`RetailerDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/RetailerDashboardView.tsx) | • Receive inbound supplier shipments<br>• Verify condition & seal integrity<br>• Display consumer-facing shelf QR<br>• Monitor near-expiry inventory<br>• Review consumer ratings | • **Store Shelf Stocking & Retail Status Seal** (`receiveBatch` -> `RETAILED`)<br>• **Consumer QR Label Display Mode** (`BatchQRModal`)<br>• **FIFO Near-Expiry Alerts** | `traceService.getBatchesForUser('RETAILER')`<br>`traceService.getIncomingBatches('RETAILER')`<br>`traceService.receiveBatch` |
| **`AUTHORITY`** | State Food Safety Inspector & Regulator | [`AuthorityDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/AuthorityDashboardView.tsx) | • Search & audit all platform batches<br>• Execute regulatory inspections<br>• Enforce chemical residue quarantines<br>• Initiate emergency lot recalls<br>• Review AI safety alerts | • **Regulatory Audit & Verification Verdicts** (`verifyBatchAsAuthority`)<br>• **Emergency Lot Recall System** (`alertService.createRecall`)<br>• **Centralized Risk & Quarantine Center** (`RiskAlertCenter`) | `traceService.getAllBatches`<br>`traceService.verifyBatchAsAuthority`<br>`alertService.createRecall`<br>`alertService.createAlert`<br>`aiService.getAllSafetyAlerts` |
| **`ADMIN`** | System Administrator & Operations | [`AdminDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/AdminDashboardView.tsx) | • View overall system metrics<br>• Simulate real-time harvest lots<br>• Inspect storage unit fleet<br>• Reset demo state to verified default | • **System-wide Database Seed & Demo Reset** (`resetToDemoData`)<br>• **Synthetic Harvest Simulation Tool**<br>• **Global Infrastructure Health Overview** | `traceService.getAllBatches`<br>`traceService.getStorageUnits`<br>`traceService.createBatch`<br>`traceService.resetToDemoData` |
| **`CONSUMER`** | End-Consumer & Public Shopper | [`ConsumerDashboardView`](file:///c:/Users/jivit/skhfarm/src/components/dashboard/ConsumerDashboardView.tsx) | • Scan product QR codes<br>• Inspect 100-pt quality score<br>• Verify live solar storage safety<br>• Explore full ingredient lineage DAG<br>• Submit verified buyer reviews | • **Public Traceability Verification** (`PublicTraceView`)<br>• **Consumer Direct-to-Producer Reviews** (`submitConsumerFeedback`)<br>• **Personal Scan History & Saved Producers** | `traceService.getBatchById`<br>`traceService.submitConsumerFeedback`<br>`traceService.getBatchLineageGraph` |
| **`CUSTOM`** | Supply Chain Auditor / Third-Party Consultant | Shares generic workspace tab | • Inspect multi-stage value chains<br>• Review compliance certificates | • Read-only access to audit logs and certificates | `traceService.getAllBatches` |

---

## 3. Duplicated & Overlapping Dashboard Logic

The Phase 0 audit reveals several opportunities for modularization during future refactoring phases:

1. **Repetitive Modal Mounting**:
   * Every single role dashboard independently mounts `TransferBatchModal`, `BatchQRModal`, `CameraEvidenceCaptureModal`, and `HandoffFeedbackModal`.
   * *Refactor Target:* Centralize operational modals in a shared `<WorkspaceLayout>` or modal manager context.
2. **Duplicate Query Patterns**:
   * All stakeholder dashboards repeat the pattern:
     ```typescript
     const [batches, setBatches] = useState<Batch[]>([]);
     const [loading, setLoading] = useState(true);
     useEffect(() => {
       loadData();
       const unsubscribe = traceService.subscribe(loadData);
       return () => unsubscribe();
     }, []);
     ```
   * *Refactor Target:* Extract into a unified custom hook `useStakeholderBatches(role, userName, orgName)`.
3. **Overlapping Receive / Checkpoint Actions**:
   * Mandi, Warehouse, Transporter, and Retailer dashboards all call `traceService.receiveBatch` with slightly different hardcoded notes strings.
   * *Refactor Target:* Standardize into a unified `HandoffActionModal` with configurable stage metadata.

---

## 4. Supply Chain Custody & Transition Flow

```
[1. FARMER]
   │  Creates Batch (Status: ACTIVE, Evidence: Live Photo/Video)
   ▼
[2. MANDI]
   │  Receives Lot (Event: RECEIVED, Weighbridge calibrated, Grade checked)
   │  Submits Feedback to Farmer
   ▼
[3. WAREHOUSE (Solar Vault)]
   │  Intake Produce (Status: STORED, Telemetry: 18.2°C, 100% Solar)
   │  Logs Periodic Micro-Climate Inspections
   ▼
[4. PROCESSOR (Mill / Factory)]
   │  Selects Raw Inputs -> Transforms (Status: TRANSFORMED)
   │  Creates Output Formulation Batch (Status: ACTIVE, Lineage DAG linked)
   ▼
[5. TRANSPORTER (Reefer Transit)]
   │  Dispatches Consignment (Status: IN_TRANSIT, Reefer temp logged)
   │  Records Expressway GPS Checkpoints
   ▼
[6. RETAILER]
   │  Receives Stock -> Places on Shelf (Status: RETAILED)
   │  Displays Scannable Product QR
   ▼
[7. CONSUMER]
   │  Scans QR -> Sees Origin, Storage Safety, DAG & Score
   │  Submits Verified Consumer Review
   ▼
[8. AUTHORITY (Supervisory Oversight)]
   │  Can Inspect, Audit, Flag, or Quarantine/Recall at ANY Stage
```
