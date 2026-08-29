import {
  Batch,
  StorageUnit,
  FeedbackRecord,
  EvidenceRecord,
  SupplyChainEvent,
  StorageCondition,
  StakeholderRole,
  VerificationState,
} from '../types';
import { ALL_DEMO_BATCHES, MOCK_STORAGE_UNITS, MOCK_ORGANIZATIONS } from '../data/mockData';
import { calculateBatchScore } from './scoreService';

const STORAGE_KEY_BATCHES = 'farmtracer_batches_v2';
const STORAGE_KEY_UNITS = 'farmtracer_storage_units_v2';

export interface CreateBatchInput {
  productName: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: 'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES';
  origin: string;
  originFarmerId: string;
  originFarmerName: string;
  harvestDate?: string;
  expiryDays: number;
  notes?: string;
  evidence?: {
    previewUrl: string;
    captureType: 'PHOTO' | 'VIDEO';
  };
}

export interface TransformBatchInput {
  parentBatchIds: string[];
  productName: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: 'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES';
  processorName: string;
  organizationId: string;
  organizationName: string;
  location: string;
  notes: string;
  expiryDays: number;
  evidence?: {
    previewUrl: string;
    captureType: 'PHOTO' | 'VIDEO';
  };
}

export interface ITraceService {
  getBatchById(batchId: string): Promise<Batch | null>;
  searchBatches(query: string): Promise<Batch[]>;
  getAllBatches(): Promise<Batch[]>;
  getBatchesForUser(userRole: StakeholderRole, userName: string, orgName: string): Promise<Batch[]>;
  getIncomingBatches(userRole: StakeholderRole, orgName: string): Promise<Batch[]>;
  getStorageUnits(): Promise<StorageUnit[]>;
  getStorageUnit(unitId: string): Promise<StorageUnit | null>;
  createBatch(input: CreateBatchInput): Promise<Batch>;
  transformBatch(input: TransformBatchInput): Promise<Batch>;
  receiveBatch(
    batchId: string,
    actorName: string,
    actorRole: StakeholderRole,
    orgName: string,
    location: string,
    notes?: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch>;
  transferBatch(
    batchId: string,
    fromActor: string,
    fromRole: StakeholderRole,
    toRole: StakeholderRole,
    toOrgName: string,
    destinationLocation: string,
    transitNotes: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch>;
  assignStorageUnit(
    batchId: string,
    storageUnitId: string,
    operatorName: string,
    orgName: string,
    notes?: string
  ): Promise<Batch>;
  recordStorageCondition(
    batchId: string,
    condition: {
      temperature: number;
      humidity: number;
      powerStatus: 'SOLAR' | 'GRID' | 'HYBRID' | 'BATTERY_BACKUP';
      solarStatus: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'CHARGING' | 'DISCHARGING';
      conditionStatus: 'SAFE' | 'WARNING' | 'OUT_OF_RANGE';
      notes?: string;
    }
  ): Promise<Batch>;
  addEvidenceToBatch(
    batchId: string,
    evidence: {
      previewUrl: string;
      captureType: 'PHOTO' | 'VIDEO';
      capturedBy: string;
      captureLocation: string;
      notes?: string;
    }
  ): Promise<EvidenceRecord>;
  submitFeedback(
    batchId: string,
    feedback: {
      fromRole: StakeholderRole;
      toRole: StakeholderRole;
      category: 'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TIMELINESS' | 'CONDITION' | 'TRACEABILITY' | 'OVERALL';
      score: number;
      comment: string;
      submittedBy: string;
    }
  ): Promise<FeedbackRecord>;
  submitConsumerFeedback(
    batchId: string,
    feedback: {
      category: 'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TRACEABILITY' | 'OVERALL';
      score: number;
      comment: string;
      submittedBy?: string;
    }
  ): Promise<FeedbackRecord>;
  verifyBatchAsAuthority(
    batchId: string,
    inspectorName: string,
    decision: VerificationState,
    auditNotes: string,
    contaminationSeverity?: 'LOW' | 'MEDIUM' | 'CRITICAL'
  ): Promise<Batch>;
  resetToDemoData(): Promise<void>;
}

class ReactiveTraceService implements ITraceService {
  private batches: Record<string, Batch>;
  private storageUnits: StorageUnit[];
  private subscribers: Array<() => void> = [];

  constructor() {
    this.batches = this.loadBatches();
    this.storageUnits = this.loadStorageUnits();
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.saveBatches();
    this.saveStorageUnits();
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Subscriber notify error:', err);
      }
    });
  }

  private loadBatches(): Record<string, Batch> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BATCHES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          return { ...ALL_DEMO_BATCHES, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not read saved batches, using initial mock data.', e);
    }
    return { ...ALL_DEMO_BATCHES };
  }

  private saveBatches() {
    try {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(this.batches));
    } catch (e) {
      console.warn('Could not save batches to localStorage.', e);
    }
  }

  private loadStorageUnits(): StorageUnit[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNITS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved storage units, using initial mock data.', e);
    }
    return [...MOCK_STORAGE_UNITS];
  }

  private saveStorageUnits() {
    try {
      localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(this.storageUnits));
    } catch (e) {
      console.warn('Could not save storage units to localStorage.', e);
    }
  }

  async getBatchById(batchId: string): Promise<Batch | null> {
    if (!batchId) return null;
    const cleanId = batchId.trim().replace(/^FARM-TRACER:\/\/BATCH\//i, '').toUpperCase();
    
    if (this.batches[cleanId]) return this.batches[cleanId];

    const foundKey = Object.keys(this.batches).find(
      (k) => k.toLowerCase() === cleanId.toLowerCase()
    );
    if (foundKey) return this.batches[foundKey];

    const match = Object.values(this.batches).find(
      (b) =>
        b.batchId.toLowerCase().includes(cleanId.toLowerCase()) ||
        b.productName.toLowerCase().includes(cleanId.toLowerCase())
    );
    return match || null;
  }

  async searchBatches(query: string): Promise<Batch[]> {
    const q = query.trim().toLowerCase();
    const list = Object.values(this.batches);
    if (!q) return list;
    return list.filter(
      (b) =>
        b.batchId.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.currentOwner.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }

  async getAllBatches(): Promise<Batch[]> {
    return Object.values(this.batches);
  }

  async getBatchesForUser(userRole: StakeholderRole, userName: string, orgName: string): Promise<Batch[]> {
    const all = Object.values(this.batches);
    if (userRole === 'ADMIN' || userRole === 'AUTHORITY') {
      return all;
    }
    return all.filter((b) => {
      if (b.currentOwnerRole === userRole) return true;
      if (userRole === 'FARMER' && (b.originFarmerId === userName || b.originFarmerName.includes(userName))) return true;
      if (b.currentOwner.toLowerCase().includes(orgName.toLowerCase())) return true;
      const wasActor = b.events.some((e) => e.actorRole === userRole || e.organization.toLowerCase().includes(orgName.toLowerCase()));
      return wasActor;
    });
  }

  async getIncomingBatches(userRole: StakeholderRole, orgName: string): Promise<Batch[]> {
    const all = Object.values(this.batches);
    if (userRole === 'FARMER') return [];
    return all.filter((b) => {
      // If batch is in transit or transferred towards this role/organization
      if (b.status === 'IN_TRANSIT') {
        const lastEvent = b.events[b.events.length - 1];
        if (lastEvent && lastEvent.notes.toLowerCase().includes(userRole.toLowerCase())) return true;
      }
      // If batch was created and not yet received by Mandi
      if (userRole === 'MANDI' && b.status === 'ACTIVE' && b.currentOwnerRole === 'FARMER') {
        return true;
      }
      // If batch is ready for storage or warehouse intake
      if (userRole === 'WAREHOUSE' && b.status === 'ACTIVE' && (b.currentOwnerRole === 'MANDI' || b.currentOwnerRole === 'TRANSPORTER')) {
        return true;
      }
      // If batch is ready for processing
      if (userRole === 'PROCESSOR' && b.status === 'STORED' && b.category.includes('Raw')) {
        return true;
      }
      // If batch is manufactured and ready for retail
      if (userRole === 'RETAILER' && b.status === 'ACTIVE' && b.currentOwnerRole === 'PROCESSOR') {
        return true;
      }
      return false;
    });
  }

  async getStorageUnits(): Promise<StorageUnit[]> {
    return this.storageUnits;
  }

  async getStorageUnit(unitId: string): Promise<StorageUnit | null> {
    return this.storageUnits.find((u) => u.storageUnitId === unitId) || null;
  }

  async createBatch(input: CreateBatchInput): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const prefix = input.category.toLowerCase().includes('grain') || input.category.toLowerCase().includes('wheat')
      ? 'WHT'
      : input.category.toLowerCase().includes('fruit') || input.category.toLowerCase().includes('apple')
      ? 'ORG-APL'
      : input.category.toLowerCase().includes('dairy')
      ? 'MLK'
      : 'CROP';
    
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const batchId = `${prefix}-MH-${year}-${randomSuffix}`;
    const eventId = `EVT-001-HARVEST-${Date.now().toString().slice(-4)}`;
    const evidenceId = input.evidence ? `EVD-001-FARM-${Date.now().toString().slice(-4)}` : '';

    const harvestDate = input.harvestDate || timestamp;
    const expiryDate = new Date(Date.now() + input.expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const initialEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'HARVESTED',
      actor: input.originFarmerName,
      actorRole: 'FARMER',
      organization: `${input.origin} Organic FPO`,
      location: `${input.origin} Farm Sector`,
      coordinates: { lat: 19.8856, lng: 74.4782 },
      timestamp: harvestDate,
      quantity: `${input.quantity} ${input.unit}`,
      notes: input.notes || 'Verified origin crop harvest recorded with camera evidence.',
      verificationState: 'VERIFIED',
      evidenceIds: evidenceId ? [evidenceId] : [],
    };

    const initialEvidence: EvidenceRecord[] = input.evidence
      ? [
          {
            evidenceId,
            eventId,
            batchId,
            captureType: input.evidence.captureType,
            capturedAt: timestamp,
            capturedBy: input.originFarmerName,
            captureLocation: `${input.origin} Field`,
            previewUrl: input.evidence.previewUrl,
            uploadState: 'LOCAL_CAPTURED',
            verificationState: 'VERIFIED',
            metadata: {
              deviceCameraOnly: true,
              geoAccuracyMeters: 3.5,
              tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            },
          },
        ]
      : [];

    const newBatch: Batch = {
      batchId,
      productName: input.productName,
      category: input.category,
      variety: input.variety || 'Standard Grade A',
      quantity: input.quantity,
      unit: input.unit,
      origin: input.origin,
      originFarmerId: input.originFarmerId,
      originFarmerName: input.originFarmerName,
      currentOwner: input.originFarmerName,
      currentOwnerRole: 'FARMER',
      currentLocation: `${input.origin} Farm Gate`,
      status: 'ACTIVE',
      createdAt: timestamp,
      harvestDate,
      expiryDate,
      parentBatchIds: [],
      childBatchIds: [],
      qrCodeString: `FARM-TRACER://BATCH/${batchId}`,
      events: [initialEvent],
      evidences: initialEvidence,
      feedbacks: [],
      certificates: [
        {
          certificateId: `CERT-ORG-${Date.now().toString().slice(-3)}`,
          title: 'Verified Farmer Origin Registry',
          issuer: 'FPO Collective Compliance (Demo)',
          type: 'ORIGIN_VERIFICATION',
          issuedDate: harvestDate.split('T')[0],
          expiryDate: expiryDate.split('T')[0],
          verificationStatus: 'VERIFIED',
          documentRef: `DOC-FPO-${batchId}`,
          isDemoNonFSSAI: true,
        },
      ],
      scoreBreakdown: calculateBatchScore({
        origin: input.origin,
        originFarmerName: input.originFarmerName,
        category: input.category,
        variety: input.variety,
        harvestDate,
        expiryDate,
        events: [initialEvent],
        evidences: initialEvidence,
        feedbacks: [],
        certificates: [],
      }),
    };

    this.batches[batchId] = newBatch;
    this.notify();
    return newBatch;
  }

  async transformBatch(input: TransformBatchInput): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const prefix = input.category.toLowerCase().includes('snack') || input.category.toLowerCase().includes('biscuit')
      ? 'BIS'
      : input.category.toLowerCase().includes('flour') || input.category.toLowerCase().includes('milled')
      ? 'MAIDA'
      : 'PROC';

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const batchId = `${prefix}-MH-${year}-${randomSuffix}`;
    const eventId = `EVT-TRF-${Date.now().toString().slice(-4)}`;
    const evidenceId = input.evidence ? `EVD-TRF-${Date.now().toString().slice(-4)}` : '';
    const expiryDate = new Date(Date.now() + input.expiryDays * 24 * 60 * 60 * 1000).toISOString();

    // Pull parent info
    const primaryParent = input.parentBatchIds.length > 0 ? this.batches[input.parentBatchIds[0]] : null;
    const origin = primaryParent?.origin || 'Western Maharashtra Agro Hub';
    const originFarmerName = primaryParent?.originFarmerName || 'Verified Origin Collective';
    const originFarmerId = primaryParent?.originFarmerId || 'FAR-MH-COLLECTIVE';

    // Mark parent batches as TRANSFORMED and link childBatchId
    input.parentBatchIds.forEach((pId) => {
      const parent = this.batches[pId];
      if (parent) {
        parent.status = 'TRANSFORMED';
        if (!parent.childBatchIds.includes(batchId)) {
          parent.childBatchIds = [...parent.childBatchIds, batchId];
        }
      }
    });

    const transformEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'TRANSFORMED',
      actor: input.processorName,
      actorRole: 'PROCESSOR',
      organization: input.organizationName,
      location: input.location,
      coordinates: { lat: 19.954, lng: 73.742 },
      timestamp,
      quantity: `${input.quantity} ${input.unit}`,
      notes: `${input.notes || 'Batch transformation complete.'} Derived from parent batch: ${input.parentBatchIds.join(', ')}`,
      verificationState: 'VERIFIED',
      evidenceIds: evidenceId ? [evidenceId] : [],
    };

    const newEvidence: EvidenceRecord[] = input.evidence
      ? [
          {
            evidenceId,
            eventId,
            batchId,
            captureType: input.evidence.captureType,
            capturedAt: timestamp,
            capturedBy: input.processorName,
            captureLocation: input.location,
            previewUrl: input.evidence.previewUrl,
            uploadState: 'LOCAL_CAPTURED',
            verificationState: 'VERIFIED',
            metadata: {
              deviceCameraOnly: true,
              geoAccuracyMeters: 2.8,
              tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            },
          },
        ]
      : [];

    // Inherit events from parent for full lineage trace
    const inheritedEvents = primaryParent ? [...primaryParent.events] : [];

    const newBatch: Batch = {
      batchId,
      productName: input.productName,
      category: input.category,
      variety: input.variety || 'Processed Specification',
      quantity: input.quantity,
      unit: input.unit,
      origin,
      originFarmerId,
      originFarmerName,
      currentOwner: input.organizationName,
      currentOwnerRole: 'PROCESSOR',
      currentLocation: input.location,
      status: 'ACTIVE',
      createdAt: timestamp,
      productionDate: timestamp,
      expiryDate,
      parentBatchIds: input.parentBatchIds,
      childBatchIds: [],
      qrCodeString: `FARM-TRACER://BATCH/${batchId}`,
      events: [...inheritedEvents, transformEvent],
      evidences: newEvidence,
      feedbacks: [],
      certificates: [
        {
          certificateId: `CERT-ISO-${Date.now().toString().slice(-3)}`,
          title: 'Clean Processing & Formulation Audit',
          issuer: 'Food Integrity Standards Board (Demo)',
          type: 'PACKAGING_STANDARD',
          issuedDate: timestamp.split('T')[0],
          expiryDate: expiryDate.split('T')[0],
          verificationStatus: 'VERIFIED',
          documentRef: `DOC-MILL-${batchId}`,
          isDemoNonFSSAI: true,
        },
      ],
      scoreBreakdown: calculateBatchScore({
        origin,
        originFarmerName,
        category: input.category,
        variety: input.variety,
        productionDate: timestamp,
        expiryDate,
        parentBatchIds: input.parentBatchIds,
        events: [...inheritedEvents, transformEvent],
        evidences: newEvidence,
        feedbacks: [],
        certificates: [],
      }),
    };

    this.batches[batchId] = newBatch;
    this.notify();
    return newBatch;
  }

  async receiveBatch(
    batchId: string,
    actorName: string,
    actorRole: StakeholderRole,
    orgName: string,
    location: string,
    notes?: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const timestamp = new Date().toISOString();
    const eventId = `EVT-REC-${Date.now().toString().slice(-4)}`;
    const evidenceId = evidence ? `EVD-REC-${Date.now().toString().slice(-4)}` : '';

    const receiveEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'RECEIVED',
      actor: actorName,
      actorRole,
      organization: orgName,
      location,
      coordinates: { lat: 19.892, lng: 74.485 },
      timestamp,
      quantity: `${batch.quantity} ${batch.unit}`,
      notes: notes || `Batch received and inspected by ${actorName} (${orgName}).`,
      verificationState: 'VERIFIED',
      evidenceIds: evidenceId ? [evidenceId] : [],
    };

    const newEvidenceList = [...batch.evidences];
    if (evidence) {
      newEvidenceList.push({
        evidenceId,
        eventId,
        batchId,
        captureType: evidence.captureType,
        capturedAt: timestamp,
        capturedBy: actorName,
        captureLocation: location,
        previewUrl: evidence.previewUrl,
        uploadState: 'LOCAL_CAPTURED',
        verificationState: 'VERIFIED',
        metadata: {
          deviceCameraOnly: true,
          geoAccuracyMeters: 3.1,
          tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        },
      });
    }

    batch.currentOwner = orgName;
    batch.currentOwnerRole = actorRole;
    batch.currentLocation = location;
    batch.status = actorRole === 'RETAILER' ? 'RETAILED' : 'ACTIVE';
    batch.events = [...batch.events, receiveEvent];
    batch.evidences = newEvidenceList;
    batch.scoreBreakdown = calculateBatchScore(batch);

    this.notify();
    return batch;
  }

  async transferBatch(
    batchId: string,
    fromActor: string,
    fromRole: StakeholderRole,
    toRole: StakeholderRole,
    toOrgName: string,
    destinationLocation: string,
    transitNotes: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const timestamp = new Date().toISOString();
    const eventId = `EVT-TRF-${Date.now().toString().slice(-4)}`;
    const evidenceId = evidence ? `EVD-TRF-${Date.now().toString().slice(-4)}` : '';

    const transferEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'TRANSFERRED',
      actor: fromActor,
      actorRole: fromRole,
      organization: batch.currentOwner,
      location: batch.currentLocation,
      coordinates: { lat: 19.88, lng: 74.47 },
      timestamp,
      quantity: `${batch.quantity} ${batch.unit}`,
      notes: `Transferred to ${toRole} (${toOrgName}) at ${destinationLocation}. ${transitNotes}`,
      verificationState: 'VERIFIED',
      evidenceIds: evidenceId ? [evidenceId] : [],
    };

    const newEvidenceList = [...batch.evidences];
    if (evidence) {
      newEvidenceList.push({
        evidenceId,
        eventId,
        batchId,
        captureType: evidence.captureType,
        capturedAt: timestamp,
        capturedBy: fromActor,
        captureLocation: batch.currentLocation,
        previewUrl: evidence.previewUrl,
        uploadState: 'LOCAL_CAPTURED',
        verificationState: 'VERIFIED',
        metadata: {
          deviceCameraOnly: true,
          geoAccuracyMeters: 4.0,
          tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        },
      });
    }

    batch.currentOwner = toOrgName;
    batch.currentOwnerRole = toRole;
    batch.currentLocation = destinationLocation;
    batch.status = 'IN_TRANSIT';
    batch.events = [...batch.events, transferEvent];
    batch.evidences = newEvidenceList;
    batch.scoreBreakdown = calculateBatchScore(batch);

    this.notify();
    return batch;
  }

  async assignStorageUnit(
    batchId: string,
    storageUnitId: string,
    operatorName: string,
    orgName: string,
    notes?: string
  ): Promise<Batch> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const unit = this.storageUnits.find((u) => u.storageUnitId === storageUnitId);
    if (!unit) throw new Error(`Storage Unit ${storageUnitId} not found`);

    const timestamp = new Date().toISOString();
    const conditionId = `COND-${Date.now().toString().slice(-4)}`;
    const eventId = `EVT-STOR-${Date.now().toString().slice(-4)}`;

    const storageCondition: StorageCondition = {
      conditionId,
      batchId,
      storageUnitId: unit.storageUnitId,
      storageUnitName: unit.name,
      location: unit.location,
      recordedAt: timestamp,
      temperature: (unit.safeTemperatureMin + unit.safeTemperatureMax) / 2,
      humidity: unit.safeHumidityMin ? (unit.safeHumidityMin + (unit.safeHumidityMax || 65)) / 2 : 55,
      powerStatus: unit.powerStatus,
      solarStatus: unit.solarStatus,
      conditionStatus: 'SAFE',
      notes: notes || `Assigned to ${unit.name}. Operating under ${unit.powerStatus} solar resilience mode.`,
      source: 'SIMULATED_SENSOR_NODE',
      demoState: 'DEMO_SIMULATED',
    };

    const storeEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'STORED',
      actor: operatorName,
      actorRole: 'WAREHOUSE',
      organization: orgName,
      location: unit.location,
      coordinates: { lat: 19.851, lng: 74.462 },
      timestamp,
      quantity: `${batch.quantity} ${batch.unit}`,
      notes: `Batch placed into ${unit.name} (${unit.type}). Telemetry monitoring active.`,
      verificationState: 'VERIFIED',
      evidenceIds: [],
      storageCondition,
    };

    batch.storageUnit = unit;
    batch.currentStorage = storageCondition;
    batch.currentLocation = unit.location;
    batch.currentOwner = orgName;
    batch.currentOwnerRole = 'WAREHOUSE';
    batch.status = 'STORED';
    batch.events = [...batch.events, storeEvent];
    batch.scoreBreakdown = calculateBatchScore(batch);

    this.notify();
    return batch;
  }

  async recordStorageCondition(
    batchId: string,
    condition: {
      temperature: number;
      humidity: number;
      powerStatus: 'SOLAR' | 'GRID' | 'HYBRID' | 'BATTERY_BACKUP';
      solarStatus: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'CHARGING' | 'DISCHARGING';
      conditionStatus: 'SAFE' | 'WARNING' | 'OUT_OF_RANGE';
      notes?: string;
    }
  ): Promise<Batch> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const timestamp = new Date().toISOString();
    const conditionId = `COND-${Date.now().toString().slice(-4)}`;

    const currentUnit = batch.storageUnit || this.storageUnits[0];

    const updatedCondition: StorageCondition = {
      conditionId,
      batchId,
      storageUnitId: currentUnit.storageUnitId,
      storageUnitName: currentUnit.name,
      location: currentUnit.location,
      recordedAt: timestamp,
      temperature: condition.temperature,
      humidity: condition.humidity,
      powerStatus: condition.powerStatus,
      solarStatus: condition.solarStatus,
      conditionStatus: condition.conditionStatus,
      notes: condition.notes || 'Sensor telemetry update recorded.',
      source: 'SIMULATED_SENSOR_NODE',
      demoState: 'DEMO_SIMULATED',
    };

    batch.currentStorage = updatedCondition;
    batch.scoreBreakdown = calculateBatchScore(batch);

    this.notify();
    return batch;
  }

  async addEvidenceToBatch(
    batchId: string,
    evidence: {
      previewUrl: string;
      captureType: 'PHOTO' | 'VIDEO';
      capturedBy: string;
      captureLocation: string;
      notes?: string;
    }
  ): Promise<EvidenceRecord> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const timestamp = new Date().toISOString();
    const evidenceId = `EVD-${Date.now().toString().slice(-4)}`;

    const record: EvidenceRecord = {
      evidenceId,
      eventId: batch.events.length > 0 ? batch.events[batch.events.length - 1].eventId : 'EVT-MANUAL',
      batchId,
      captureType: evidence.captureType,
      capturedAt: timestamp,
      capturedBy: evidence.capturedBy,
      captureLocation: evidence.captureLocation,
      previewUrl: evidence.previewUrl,
      uploadState: 'LOCAL_CAPTURED',
      verificationState: 'VERIFIED',
      metadata: {
        deviceCameraOnly: true,
        geoAccuracyMeters: 2.5,
        tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      },
    };

    batch.evidences = [record, ...batch.evidences];
    batch.scoreBreakdown = calculateBatchScore(batch);
    this.notify();
    return record;
  }

  async submitFeedback(
    batchId: string,
    feedback: {
      fromRole: StakeholderRole;
      toRole: StakeholderRole;
      category: 'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TIMELINESS' | 'CONDITION' | 'TRACEABILITY' | 'OVERALL';
      score: number;
      comment: string;
      submittedBy: string;
    }
  ): Promise<FeedbackRecord> {
    const batch = this.batches[batchId];
    const timestamp = new Date().toISOString();
    const feedbackId = `FB-${Date.now().toString().slice(-4)}`;

    const record: FeedbackRecord = {
      feedbackId,
      batchId,
      eventId: batch && batch.events.length > 0 ? batch.events[batch.events.length - 1].eventId : 'EVT-HANDOFF',
      fromRole: feedback.fromRole,
      toRole: feedback.toRole,
      submittedBy: feedback.submittedBy,
      category: feedback.category,
      score: feedback.score,
      comment: feedback.comment,
      createdAt: timestamp,
      status: 'PUBLISHED',
    };

    if (batch) {
      batch.feedbacks = [record, ...batch.feedbacks];
      batch.scoreBreakdown = calculateBatchScore(batch);
      this.notify();
    }
    return record;
  }

  async submitConsumerFeedback(
    batchId: string,
    feedback: {
      category: 'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TRACEABILITY' | 'OVERALL';
      score: number;
      comment: string;
      submittedBy?: string;
    }
  ): Promise<FeedbackRecord> {
    return this.submitFeedback(batchId, {
      fromRole: 'CONSUMER',
      toRole: 'RETAILER',
      category: feedback.category,
      score: feedback.score,
      comment: feedback.comment,
      submittedBy: feedback.submittedBy || 'Verified Consumer',
    });
  }

  async verifyBatchAsAuthority(
    batchId: string,
    inspectorName: string,
    decision: VerificationState,
    auditNotes: string,
    contaminationSeverity?: 'LOW' | 'MEDIUM' | 'CRITICAL'
  ): Promise<Batch> {
    const batch = this.batches[batchId];
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const timestamp = new Date().toISOString();
    const eventId = `EVT-AUDIT-${Date.now().toString().slice(-4)}`;

    const auditEvent: SupplyChainEvent = {
      eventId,
      batchId,
      eventType: 'INSPECTED',
      actor: inspectorName,
      actorRole: 'AUTHORITY',
      organization: 'State Food Safety & Ag-Compliance Inspectorate',
      location: batch.currentLocation,
      coordinates: { lat: 19.89, lng: 74.48 },
      timestamp,
      quantity: `${batch.quantity} ${batch.unit}`,
      notes: `Regulatory Inspection: Marked ${decision}. ${auditNotes}`,
      verificationState: decision,
      evidenceIds: [],
    };

    if (decision === 'FLAGGED' || decision === 'REJECTED') {
      batch.contaminationFlag = {
        flagged: true,
        severity: contaminationSeverity || 'MEDIUM',
        reason: auditNotes,
        detectedAt: timestamp,
        actionRequired: decision === 'REJECTED' ? 'Hold and quarantine immediate stock' : 'Secondary inspection within 24h',
      };
      if (decision === 'REJECTED') {
        batch.status = 'RECALLED';
      }
    } else if (decision === 'VERIFIED') {
      batch.contaminationFlag = undefined;
    }

    batch.events = [...batch.events, auditEvent];
    batch.scoreBreakdown = calculateBatchScore(batch);
    this.notify();
    return batch;
  }

  async resetToDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_BATCHES);
    localStorage.removeItem(STORAGE_KEY_UNITS);
    this.batches = { ...ALL_DEMO_BATCHES };
    this.storageUnits = [...MOCK_STORAGE_UNITS];
    this.notify();
  }
}

export const traceService = new ReactiveTraceService();
