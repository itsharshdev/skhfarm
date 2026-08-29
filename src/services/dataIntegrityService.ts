import {
  IncidentState,
  RecordIntegrityStatus,
  DataIntegrityIncidentRecord,
  InFlightOperationRecord,
  InFlightOperationStatus,
  ReconciliationState,
} from '../types';

const STORAGE_INCIDENT_STATE_KEY = 'farmtracer_incident_state';
const STORAGE_CUSTOM_INCIDENT_KEY = 'farmtracer_custom_incident';
const STORAGE_INFLIGHT_OPS_KEY = 'farmtracer_inflight_operations';
const STORAGE_RECONCILIATION_KEY = 'farmtracer_reconciliation_records';

export interface RecoveryBatchItem {
  batchId: string;
  batchCode: string;
  productName: string;
  knownEventsCount: number;
  missingEventsCount: number;
  totalExpectedEvents: number;
  recoveryStatus: RecordIntegrityStatus;
  completenessScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  reviewRequired: boolean;
  notes: string;
  reconstructedFromPeer?: boolean;
}

export interface ReconciliationItem {
  id: string;
  batchId: string;
  batchCode: string;
  productName: string;
  state: ReconciliationState;
  localTimestamp: string;
  serverTimestamp: string;
  localOwner: string;
  serverOwner: string;
  diffDetails: string;
  conflictResolved?: boolean;
  resolvedWith?: 'KEEP_LOCAL' | 'KEEP_SERVER' | 'MANUAL_MERGE';
}

class DataIntegrityService {
  private currentState: IncidentState = 'NORMAL';
  private activeIncident: DataIntegrityIncidentRecord | null = null;
  private inFlightOperations: InFlightOperationRecord[] = [];
  private reconciliationItems: ReconciliationItem[] = [];
  private recoveryBatches: RecoveryBatchItem[] = [];
  private listeners: Set<(state: IncidentState) => void> = new Set();

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedState = localStorage.getItem(STORAGE_INCIDENT_STATE_KEY) as IncidentState | null;
      if (savedState) {
        this.currentState = savedState;
      }
      const savedIncident = localStorage.getItem(STORAGE_CUSTOM_INCIDENT_KEY);
      if (savedIncident) {
        this.activeIncident = JSON.parse(savedIncident);
      } else if (this.currentState !== 'NORMAL') {
        this.activeIncident = this.getDefaultIncidentForState(this.currentState);
      }

      const savedInFlight = localStorage.getItem(STORAGE_INFLIGHT_OPS_KEY);
      if (savedInFlight) {
        this.inFlightOperations = JSON.parse(savedInFlight);
      } else {
        this.inFlightOperations = this.getDefaultInFlightOperations();
      }

      const savedRecon = localStorage.getItem(STORAGE_RECONCILIATION_KEY);
      if (savedRecon) {
        this.reconciliationItems = JSON.parse(savedRecon);
      } else {
        this.reconciliationItems = this.getDefaultReconciliationItems();
      }

      this.recoveryBatches = this.getDefaultRecoveryBatches();
    } catch (e) {
      console.warn('DataIntegrityService initialization notice:', e);
    }
  }

  public getIncidentState(): IncidentState {
    return this.currentState;
  }

  public getActiveIncident(): DataIntegrityIncidentRecord | null {
    if (this.currentState === 'NORMAL') return null;
    return this.activeIncident || this.getDefaultIncidentForState(this.currentState);
  }

  public setIncidentState(state: IncidentState, customRecord?: Partial<DataIntegrityIncidentRecord>) {
    this.currentState = state;
    if (state === 'NORMAL') {
      this.activeIncident = null;
    } else {
      const def = this.getDefaultIncidentForState(state);
      this.activeIncident = {
        ...def,
        ...customRecord,
        state,
      };
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_INCIDENT_STATE_KEY, state);
        if (this.activeIncident) {
          localStorage.setItem(STORAGE_CUSTOM_INCIDENT_KEY, JSON.stringify(this.activeIncident));
        } else {
          localStorage.removeItem(STORAGE_CUSTOM_INCIDENT_KEY);
        }
      }
    } catch (e) {}

    this.notify();
  }

  public subscribe(listener: (state: IncidentState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Disaster Recovery Batches Management
   */
  public getRecoveryBatches(): RecoveryBatchItem[] {
    return this.recoveryBatches;
  }

  public reconstructBatchFromPeer(batchId: string) {
    this.recoveryBatches = this.recoveryBatches.map((b) => {
      if (b.batchId === batchId) {
        return {
          ...b,
          knownEventsCount: b.totalExpectedEvents,
          missingEventsCount: 0,
          recoveryStatus: 'RECOVERED',
          completenessScore: 100,
          confidenceScore: 98,
          reviewRequired: false,
          notes: 'Reconstructed from local peer custody signatures and validated against distributed ledger hashes.',
          reconstructedFromPeer: true,
        };
      }
      return b;
    });
    this.notify();
  }

  /**
   * In-Flight Operations Management
   */
  public getInFlightOperations(): InFlightOperationRecord[] {
    return this.inFlightOperations;
  }

  public async retryInFlightOperation(operationId: string): Promise<boolean> {
    this.inFlightOperations = this.inFlightOperations.map((op) => {
      if (op.operationId === operationId) {
        return {
          ...op,
          status: 'COMPLETED',
          steps: op.steps.map((s) => ({ ...s, status: 'SUCCESS', detail: 'Completed & cryptographic hash validated.' })),
          interruptionReason: undefined,
          canRetry: false,
        };
      }
      return op;
    });

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_INFLIGHT_OPS_KEY, JSON.stringify(this.inFlightOperations));
      }
    } catch (e) {}

    this.notify();
    return true;
  }

  /**
   * Ledger Reconciliation Management
   */
  public getReconciliationItems(): ReconciliationItem[] {
    return this.reconciliationItems;
  }

  public resolveReconciliation(
    id: string,
    resolution: 'KEEP_LOCAL' | 'KEEP_SERVER' | 'MANUAL_MERGE'
  ) {
    this.reconciliationItems = this.reconciliationItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          state: 'MATCHED',
          conflictResolved: true,
          resolvedWith: resolution,
          diffDetails: `Resolved via ${resolution}. Both records synchronized with non-destructive audit trail.`,
        };
      }
      return item;
    });

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_RECONCILIATION_KEY, JSON.stringify(this.reconciliationItems));
      }
    } catch (e) {}

    this.notify();
  }

  /**
   * Evaluates the integrity status of any specific batch under the current incident state
   */
  public getBatchIntegrityStatus(batchId: string): RecordIntegrityStatus {
    if (this.currentState === 'NORMAL') {
      return 'VERIFIED';
    }

    const bLower = batchId.toLowerCase();
    if (bLower.includes('unrec') || bLower.includes('lost')) {
      return 'UNRECOVERABLE';
    }
    if (bLower.includes('mnd') || bLower.includes('proc')) {
      return this.currentState === 'INCIDENT' ? 'PARTIALLY_RECOVERED' : 'RECOVERED';
    }
    if (bLower.includes('rev') || bLower.includes('warn')) {
      return 'REQUIRES_REVIEW';
    }
    if (this.currentState === 'INCIDENT') {
      return 'PARTIALLY_RECOVERED';
    }
    if (this.currentState === 'RECOVERY') {
      return 'RECOVERED';
    }
    if (this.currentState === 'PARTIALLY_RECOVERED') {
      return 'PARTIALLY_RECOVERED';
    }
    if (this.currentState === 'DEGRADED') {
      return 'REQUIRES_REVIEW';
    }
    return 'VERIFIED';
  }

  public getBatchIntegrityDetails(batchId: string): {
    status: RecordIntegrityStatus;
    knownEventsCount: number;
    missingEventsCount: number;
    confidenceScore: number;
    notes: string;
  } {
    const status = this.getBatchIntegrityStatus(batchId);
    switch (status) {
      case 'VERIFIED':
        return {
          status: 'VERIFIED',
          knownEventsCount: 5,
          missingEventsCount: 0,
          confidenceScore: 100,
          notes: 'Cryptographic hash signatures and telemetry blocks fully verified intact across distributed nodes.',
        };
      case 'RECOVERED':
        return {
          status: 'RECOVERED',
          knownEventsCount: 4,
          missingEventsCount: 0,
          confidenceScore: 92,
          notes: 'Reconstructed from local edge IndexedDB cache and peer custody receipts. Data verified intact.',
        };
      case 'PARTIALLY_RECOVERED':
        return {
          status: 'PARTIALLY_RECOVERED',
          knownEventsCount: 3,
          missingEventsCount: 1,
          confidenceScore: 68,
          notes: 'Origin and transformation events recovered. 1 intermediate transport telemetry log missing (recovery verification required).',
        };
      case 'REQUIRES_REVIEW':
        return {
          status: 'REQUIRES_REVIEW',
          knownEventsCount: 3,
          missingEventsCount: 1,
          confidenceScore: 50,
          notes: 'Timestamp disparity detected during failover recovery. Manual stakeholder review required before release.',
        };
      case 'UNRECOVERABLE':
        return {
          status: 'UNRECOVERABLE',
          knownEventsCount: 0,
          missingEventsCount: 4,
          confidenceScore: 0,
          notes: 'Data unavailable: Primary partition block unreadable and not present in local edge nodes. Unrecoverable.',
        };
      case 'PENDING_SYNCHRONIZATION':
        return {
          status: 'PENDING_SYNCHRONIZATION',
          knownEventsCount: 2,
          missingEventsCount: 0,
          confidenceScore: 80,
          notes: 'Queued in local storage. Awaiting network reconnection to reconcile with master ledger.',
        };
    }
  }

  private getDefaultRecoveryBatches(): RecoveryBatchItem[] {
    return [
      {
        batchId: 'BIS-2026-092',
        batchCode: 'BIS-2026-092',
        productName: 'Organic Whole Wheat Digestive Biscuits',
        knownEventsCount: 5,
        missingEventsCount: 0,
        totalExpectedEvents: 5,
        recoveryStatus: 'VERIFIED',
        completenessScore: 100,
        confidenceScore: 100,
        reviewRequired: false,
        notes: 'All 5 custody events verified with cryptographic hash chain across distributed nodes.',
      },
      {
        batchId: 'MND-2026-881',
        batchCode: 'MND-2026-881',
        productName: 'Sharbati A-Grade Grain Lot',
        knownEventsCount: 3,
        missingEventsCount: 1,
        totalExpectedEvents: 4,
        recoveryStatus: 'PARTIALLY_RECOVERED',
        completenessScore: 75,
        confidenceScore: 70,
        reviewRequired: true,
        notes: 'Mandi receipt & farm origin intact. Transporter departure telemetry lost during connection reset.',
      },
      {
        batchId: 'WHT-2026-001',
        batchCode: 'WHT-2026-001',
        productName: 'Raw Sharbati Organic Wheat (Bulk)',
        knownEventsCount: 4,
        missingEventsCount: 0,
        totalExpectedEvents: 4,
        recoveryStatus: 'RECOVERED',
        completenessScore: 100,
        confidenceScore: 94,
        reviewRequired: false,
        notes: 'Reconstructed from local farmer edge device IndexedDB store.',
      },
      {
        batchId: 'FT-2026-REV-44',
        batchCode: 'FT-2026-REV-44',
        productName: 'Cold-Pressed Mustard Oil Lot',
        knownEventsCount: 2,
        missingEventsCount: 1,
        totalExpectedEvents: 3,
        recoveryStatus: 'REQUIRES_REVIEW',
        completenessScore: 66,
        confidenceScore: 50,
        reviewRequired: true,
        notes: 'Conflicting warehouse check-in timestamps between server and transporter log.',
      },
      {
        batchId: 'FT-2026-UNREC-09',
        batchCode: 'FT-2026-UNREC-09',
        productName: 'Perishable Dairy Curd Batch',
        knownEventsCount: 0,
        missingEventsCount: 3,
        totalExpectedEvents: 3,
        recoveryStatus: 'UNRECOVERABLE',
        completenessScore: 0,
        confidenceScore: 0,
        reviewRequired: true,
        notes: 'Primary block wiped during storage failure; zero peer edge copies found.',
      },
    ];
  }

  private getDefaultInFlightOperations(): InFlightOperationRecord[] {
    return [
      {
        operationId: 'OP-TRF-1024',
        batchId: 'MND-2026-881',
        batchCode: 'MND-2026-881',
        operationType: 'TRANSFER',
        status: 'INTERRUPTED',
        startedAt: new Date(Date.now() - 1800000).toISOString(),
        steps: [
          { stepName: 'Custody Handoff Initiated', status: 'SUCCESS', detail: 'Farmer signed release token.' },
          { stepName: 'Cryptographic GPS Validation', status: 'SUCCESS', detail: 'Coordinates matched Mandi Geo-fence.' },
          { stepName: 'Ledger Confirmation Receipt', status: 'WARNING', detail: 'Timeout awaiting server ACK.' },
        ],
        interruptionReason: 'Network handshake timed out before receiving ledger confirmation hash.',
        canRetry: true,
      },
      {
        operationId: 'OP-STOR-2091',
        batchId: 'BIS-2026-092',
        batchCode: 'BIS-2026-092',
        operationType: 'STORAGE_UPDATE',
        status: 'PENDING',
        startedAt: new Date(Date.now() - 600000).toISOString(),
        steps: [
          { stepName: 'Sensor Node Telemetry Captured', status: 'SUCCESS', detail: '22.4°C / 48% Humidity' },
          { stepName: 'Local IndexedDB Persistence', status: 'SUCCESS', detail: 'Written to edge storage queue.' },
          { stepName: 'Master Server Synchronization', status: 'PENDING', detail: 'Queued for next sync cycle.' },
        ],
        canRetry: true,
      },
      {
        operationId: 'OP-EVD-9812',
        batchId: 'WHT-2026-001',
        batchCode: 'WHT-2026-001',
        operationType: 'EVIDENCE_SEAL',
        status: 'REQUIRES_REVIEW',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        steps: [
          { stepName: 'Live Camera Capture', status: 'SUCCESS', detail: '10s Video proof captured.' },
          { stepName: 'SHA-256 Tamper Proof Hash', status: 'SUCCESS', detail: 'Generated sha256:8f2a...7c9b' },
          { stepName: 'Cross-Peer Verification', status: 'FAILED', detail: 'Receiving node reported hash mismatch.' },
        ],
        interruptionReason: 'Peer verification node reported discrepancy in timestamp header.',
        canRetry: false,
      },
    ];
  }

  private getDefaultReconciliationItems(): ReconciliationItem[] {
    const timestamp = new Date().toISOString();
    return [
      {
        id: 'REC-01',
        batchId: 'BIS-2026-092',
        batchCode: 'BIS-2026-092',
        productName: 'Organic Whole Wheat Digestive Biscuits',
        state: 'MATCHED',
        localTimestamp: timestamp,
        serverTimestamp: timestamp,
        localOwner: 'Apex Distribution Hub',
        serverOwner: 'Apex Distribution Hub',
        diffDetails: 'All 5 events match identically across local edge store and server records.',
      },
      {
        id: 'REC-02',
        batchId: 'MND-2026-881',
        batchCode: 'MND-2026-881',
        productName: 'Sharbati A-Grade Grain Lot',
        state: 'SERVER_MISSING',
        localTimestamp: timestamp,
        serverTimestamp: 'None (Data missing on server)',
        localOwner: 'Nashik APMC Mandi #4',
        serverOwner: 'Unavailable',
        diffDetails: 'Local device holds verified Mandi check-in receipt. Server master table lost block during partition disruption.',
      },
      {
        id: 'REC-03',
        batchId: 'FT-2026-REV-44',
        batchCode: 'FT-2026-REV-44',
        productName: 'Cold-Pressed Mustard Oil Lot',
        state: 'CONFLICT',
        localTimestamp: new Date(Date.now() - 7200000).toISOString(),
        serverTimestamp: new Date(Date.now() - 3600000).toISOString(),
        localOwner: 'Sai Transporter Logistics',
        serverOwner: 'Central Processing Warehouse',
        diffDetails: 'Conflict detected: Local edge reports batch still in transit, whereas server received an unverified receiving ping.',
      },
      {
        id: 'REC-04',
        batchId: 'WHT-2026-001',
        batchCode: 'WHT-2026-001',
        productName: 'Raw Sharbati Organic Wheat (Bulk)',
        state: 'LOCAL_MISSING',
        localTimestamp: 'None',
        serverTimestamp: timestamp,
        localOwner: 'Unavailable',
        serverOwner: 'Kisan Organic Grower FPO',
        diffDetails: 'Server holds verified harvest block; local client cache was cleared.',
      },
    ];
  }

  private getDefaultIncidentForState(state: IncidentState): DataIntegrityIncidentRecord {
    const timestamp = new Date().toISOString();
    switch (state) {
      case 'INCIDENT':
        return {
          incidentId: 'INC-2026-DATA-01',
          state: 'INCIDENT',
          title: 'Primary Data Store Corruption / Read Outage',
          description:
            'A database partition anomaly was detected. Some records are temporarily unavailable or require recovery verification.',
          affectedBatchIds: ['BIS-2026-092', 'MND-2026-881', 'FT-2026-REV-44', 'FT-2026-UNREC-09'],
          recoverableCount: 18,
          partiallyRecoverableCount: 6,
          unrecoverableCount: 1,
          pendingOperationsCount: 4,
          requiresReviewCount: 3,
          initiatedAt: timestamp,
          primaryDataStoreState: 'CORRUPTED',
        };
      case 'DEGRADED':
        return {
          incidentId: 'INC-2026-DATA-02',
          state: 'DEGRADED',
          title: 'Secondary Data Synchronization Latency',
          description: 'Telemetry nodes experiencing sync latency. Available records reflect latest confirmed state.',
          affectedBatchIds: ['MND-2026-881'],
          recoverableCount: 22,
          partiallyRecoverableCount: 2,
          unrecoverableCount: 0,
          pendingOperationsCount: 2,
          requiresReviewCount: 1,
          initiatedAt: timestamp,
          primaryDataStoreState: 'UNREADABLE',
        };
      case 'RECOVERY':
        return {
          incidentId: 'INC-2026-DATA-03',
          state: 'RECOVERY',
          title: 'Active Ledger Reconciliation in Progress',
          description:
            'Disaster recovery sequence initiated. Rebuilding batch custody histories from local edge stores and peer receipts.',
          affectedBatchIds: ['BIS-2026-092', 'MND-2026-881'],
          recoverableCount: 24,
          partiallyRecoverableCount: 1,
          unrecoverableCount: 0,
          pendingOperationsCount: 1,
          requiresReviewCount: 2,
          initiatedAt: timestamp,
          primaryDataStoreState: 'RESTORING',
        };
      case 'PARTIALLY_RECOVERED':
        return {
          incidentId: 'INC-2026-DATA-04',
          state: 'PARTIALLY_RECOVERED',
          title: 'Partial Data Recovery Completed',
          description:
            'Most batches reconciled. Highlighting unverified segments honestly rather than masking missing records.',
          affectedBatchIds: ['BIS-2026-092'],
          recoverableCount: 23,
          partiallyRecoverableCount: 2,
          unrecoverableCount: 1,
          pendingOperationsCount: 0,
          requiresReviewCount: 1,
          initiatedAt: timestamp,
          primaryDataStoreState: 'RECONCILED',
        };
      case 'NORMAL':
      default:
        return {
          incidentId: 'INC-NORMAL',
          state: 'NORMAL',
          title: 'All Systems Operational',
          description: 'Data integrity is intact across all distributed telemetry nodes.',
          affectedBatchIds: [],
          recoverableCount: 0,
          partiallyRecoverableCount: 0,
          unrecoverableCount: 0,
          pendingOperationsCount: 0,
          requiresReviewCount: 0,
          initiatedAt: timestamp,
          primaryDataStoreState: 'HEALTHY',
        };
    }
  }
}

export const dataIntegrityService = new DataIntegrityService();
