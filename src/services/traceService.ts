import {
  Batch,
  StorageUnit,
  FeedbackRecord,
  EvidenceRecord,
  SupplyChainEvent,
  StorageCondition,
  StakeholderRole,
  VerificationState,
  PowerSourceStatus,
  SolarGenerationStatus,
  LineageNode,
  LineageLink,
} from '../types';
import { supabase } from './supabaseClient';
import { ALL_DEMO_BATCHES, MOCK_STORAGE_UNITS, DEMO_LINEAGE_NODES, DEMO_LINEAGE_LINKS } from '../data/mockData';
import { calculateBatchScore } from './scoreService';


export interface CreateBatchInput {
  productName: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: 'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES';
  origin: string;
  originFarmerId?: string;
  originFarmerName: string;
  harvestDate?: string;
  expiryDays: number;
  notes?: string;
  evidence?: {
    previewUrl: string;
    captureType: 'PHOTO' | 'VIDEO';
  };
  labCertificate?: {
    certificateId: string;
    title: string;
    issuer: string;
    documentRef: string;
    pesticidePpm?: string;
    fileUrl?: string;
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
  organizationId?: string;
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
      powerStatus: PowerSourceStatus;
      solarStatus: SolarGenerationStatus;
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
  getBatchLineageGraph(batchId: string): Promise<{ nodes: LineageNode[]; links: LineageLink[] }>;
  getBatchTimeline(batchId: string): Promise<SupplyChainEvent[]>;
  getBatchRouteLocations(batchId: string): Promise<Array<{ stage: string; location: string; coordinates: { lat: number; lng: number }; actor: string; timestamp: string }>>;
  resetToDemoData(): Promise<void>;
  subscribe(cb: () => void): () => void;
}

class SupabaseTraceService implements ITraceService {
  private subscribers: Array<() => void> = [];

  constructor() {
    // Set up Realtime subscription on batches table
    try {
      supabase
        .channel('public:batches')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'batches' },
          () => {
            this.notify();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscription failed:', e);
    }
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Subscriber notify error:', err);
      }
    });
  }

  /**
   * Helper to map a Supabase batch row + joined relations to frontend Batch model
   */
  private async mapDbRowToBatch(row: any): Promise<Batch> {
    const batchCode = row.batch_code;

    // 1. Fetch events from supply_chain_events
    const { data: eventsData } = await supabase
      .from('supply_chain_events')
      .select('*')
      .eq('batch_code', batchCode)
      .order('timestamp', { ascending: true });

    const events: SupplyChainEvent[] = (eventsData || []).map((e: any) => ({
      eventId: e.event_code || e.id,
      batchId: e.batch_code,
      eventType: e.event_type,
      actor: e.actor,
      actorRole: e.actor_role as StakeholderRole,
      organization: e.organization,
      location: e.location,
      coordinates: { lat: e.lat || 19.88, lng: e.lng || 74.47 },
      timestamp: e.timestamp,
      quantity: e.quantity || `${row.quantity} ${row.unit}`,
      notes: e.notes || '',
      previousLocation: e.previous_location,
      newLocation: e.new_location,
      verificationState: (e.verification_state || 'VERIFIED') as VerificationState,
      evidenceIds: e.evidence_ids || [],
      storageCondition: e.storage_condition || undefined,
    }));

    // 2. Fetch parent and child lineages
    const { data: parentLineages } = await supabase
      .from('batch_lineage')
      .select('parent_batch_code')
      .eq('child_batch_code', batchCode);

    const { data: childLineages } = await supabase
      .from('batch_lineage')
      .select('child_batch_code')
      .eq('parent_batch_code', batchCode);

    const parentBatchIds = (parentLineages || []).map((l: any) => l.parent_batch_code);
    const childBatchIds = (childLineages || []).map((l: any) => l.child_batch_code);

    // 3. Fetch Feedbacks from public.feedbacks table
    const { data: dbFeedbacks } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('batch_code', batchCode)
      .order('created_at', { ascending: false });

    const feedbacks: FeedbackRecord[] = (dbFeedbacks && dbFeedbacks.length > 0)
      ? dbFeedbacks.map((f: any) => ({
          feedbackId: f.feedback_code || f.id,
          batchId: f.batch_code,
          eventId: f.event_code || '',
          fromRole: f.from_role,
          toRole: f.to_role,
          submittedBy: f.submitted_by,
          category: f.category,
          score: f.score,
          comment: f.comment,
          createdAt: f.created_at,
          status: f.status || 'PUBLISHED',
        }))
      : (row.feedbacks || []);

    // 4. Fetch Certificates from public.certificates table
    const { data: dbCerts } = await supabase
      .from('certificates')
      .select('*')
      .eq('batch_code', batchCode);

    const certificates: any[] = (dbCerts && dbCerts.length > 0)
      ? dbCerts.map((c: any) => ({
          certificateId: c.certificate_code || c.id,
          title: c.title,
          issuer: c.issuer,
          type: c.type,
          issuedDate: c.issued_date,
          expiryDate: c.expiry_date,
          verificationStatus: c.verification_status,
          documentRef: c.document_ref,
          isDemoNonFSSAI: !!c.is_demo_non_fssai,
        }))
      : (row.certificates || []);

    // 5. Construct score breakdown
    let scoreBreakdown = row.score_breakdown;
    if (!scoreBreakdown || !scoreBreakdown.totalScore) {
      scoreBreakdown = calculateBatchScore({
        origin: row.origin,
        originFarmerName: row.origin_farmer_name,
        category: row.category,
        variety: row.variety,
        productionDate: row.production_date,
        expiryDate: row.expiry_date,
        parentBatchIds,
        events,
        evidences: row.evidences || [],
        feedbacks,
        certificates,
        currentStorage: row.current_storage,
        contaminationFlag: row.contamination_flag,
      });
    }

    return {
      batchId: row.batch_code,
      productName: row.product_name,
      category: row.category,
      variety: row.variety || undefined,
      quantity: Number(row.quantity),
      unit: row.unit,
      origin: row.origin,
      originFarmerId: row.origin_farmer_id || 'FAR-ORIGIN',
      originFarmerName: row.origin_farmer_name,
      currentOwner: row.current_owner,
      currentOwnerRole: row.current_owner_role as StakeholderRole,
      currentLocation: row.current_location,
      status: row.status,
      createdAt: row.created_at,
      harvestDate: row.harvest_date || undefined,
      productionDate: row.production_date || undefined,
      expiryDate: row.expiry_date,
      parentBatchIds,
      childBatchIds,
      scoreBreakdown,
      currentStorage: row.current_storage || undefined,
      events,
      evidences: row.evidences || [],
      feedbacks,
      certificates,
      qrCodeString: row.qr_code_string || `FARM-TRACER://BATCH/${row.batch_code}`,
      contaminationFlag: row.contamination_flag || undefined,
    };
  }

  private getLocalBatches(): Record<string, Batch> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem('ft_local_custom_batches_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveLocalBatch(batch: Batch) {
    if (typeof localStorage === 'undefined') return;
    try {
      const all = this.getLocalBatches();
      all[batch.batchId] = batch;
      localStorage.setItem('ft_local_custom_batches_v1', JSON.stringify(all));
    } catch {}
  }

  public async getBatchById(batchId: string): Promise<Batch | null> {
    // 1. Check local in-memory/localStorage batches first
    const local = this.getLocalBatches();
    if (local[batchId]) return local[batchId];

    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('batch_code', batchId)
        .maybeSingle();

      if (error || !data) {
        // Check offline cache
        const cached = localStorage.getItem(`ft_cache_batch_${batchId}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            // ignore
          }
        }
        return ALL_DEMO_BATCHES[batchId] || null;
      }

      const batch = await this.mapDbRowToBatch(data);
      try {
        localStorage.setItem(`ft_cache_batch_${batchId}`, JSON.stringify(batch));
      } catch (e) {
        // ignore storage quota
      }
      return batch;
    } catch (err) {
      console.warn('getBatchById error, checking offline cache or demo data:', err);
      const cached = localStorage.getItem(`ft_cache_batch_${batchId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // ignore
        }
      }
      return ALL_DEMO_BATCHES[batchId] || null;
    }
  }

  public async searchBatches(query: string): Promise<Batch[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllBatches();

    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .or(`batch_code.ilike.%${q}%,product_name.ilike.%${q}%,origin.ilike.%${q}%,current_owner.ilike.%${q}%`)
        .order('created_at', { ascending: false });

      const localList = Object.values(this.getLocalBatches()).filter(
        (b) =>
          b.batchId.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.origin.toLowerCase().includes(q)
      );

      if (error || !data || data.length === 0) {
        const demoMatches = Object.values(ALL_DEMO_BATCHES).filter(
          (b) =>
            b.batchId.toLowerCase().includes(q) ||
            b.productName.toLowerCase().includes(q) ||
            b.origin.toLowerCase().includes(q)
        );
        const map = new Map<string, Batch>();
        localList.forEach((b) => map.set(b.batchId, b));
        demoMatches.forEach((b) => {
          if (!map.has(b.batchId)) map.set(b.batchId, b);
        });
        return Array.from(map.values());
      }

      const dbBatches = await Promise.all(data.map((r) => this.mapDbRowToBatch(r)));
      const map = new Map<string, Batch>();
      localList.forEach((b) => map.set(b.batchId, b));
      dbBatches.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    } catch (err) {
      const localList = Object.values(this.getLocalBatches()).filter(
        (b) =>
          b.batchId.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.origin.toLowerCase().includes(q)
      );
      const demoMatches = Object.values(ALL_DEMO_BATCHES).filter(
        (b) =>
          b.batchId.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.origin.toLowerCase().includes(q)
      );
      const map = new Map<string, Batch>();
      localList.forEach((b) => map.set(b.batchId, b));
      demoMatches.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    }
  }

  public async getAllBatches(): Promise<Batch[]> {
    const localList = Object.values(this.getLocalBatches());

    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const demoBatches = Object.values(ALL_DEMO_BATCHES);
        const map = new Map<string, Batch>();
        localList.forEach((b) => map.set(b.batchId, b));
        demoBatches.forEach((b) => {
          if (!map.has(b.batchId)) map.set(b.batchId, b);
        });
        return Array.from(map.values());
      }

      const dbBatches = await Promise.all(data.map((r) => this.mapDbRowToBatch(r)));
      const map = new Map<string, Batch>();
      localList.forEach((b) => map.set(b.batchId, b));
      dbBatches.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    } catch (err) {
      const demoBatches = Object.values(ALL_DEMO_BATCHES);
      const map = new Map<string, Batch>();
      localList.forEach((b) => map.set(b.batchId, b));
      demoBatches.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    }
  }

  public async getBatchesForUser(
    userRole: StakeholderRole,
    userName: string,
    orgName: string
  ): Promise<Batch[]> {
    const localList = Object.values(this.getLocalBatches());
    const userLower = (userName || '').toLowerCase();

    // Local custom batches created by this user
    const matchingLocal = localList.filter((b) => {
      if (userRole === 'FARMER') {
        return (
          b.originFarmerName.toLowerCase().includes(userLower) ||
          b.currentOwner.toLowerCase().includes(userLower) ||
          b.currentOwnerRole === 'FARMER'
        );
      }
      if (userRole === 'MANDI') return b.events.some((e) => e.actorRole === 'MANDI') || b.currentOwnerRole === 'MANDI';
      if (userRole === 'WAREHOUSE') return b.currentOwnerRole === 'WAREHOUSE' || b.status === 'STORED';
      if (userRole === 'PROCESSOR' || userRole === 'FACTORY') return b.currentOwnerRole === 'PROCESSOR' || b.parentBatchIds.length > 0;
      if (userRole === 'TRANSPORTER') return b.events.some((e) => e.actorRole === 'TRANSPORTER');
      if (userRole === 'RETAILER') return b.currentOwnerRole === 'RETAILER' || b.status === 'RETAILED';
      return true;
    });

    try {
      let query = supabase.from('batches').select('*');

      if (userRole === 'FARMER') {
        query = query.or(`origin_farmer_name.ilike.%${userName}%,current_owner_role.eq.FARMER`);
      } else if (userRole === 'ADMIN' || userRole === 'AUTHORITY') {
        // Admin and Authority see all batches
      } else {
        query = query.or(`current_owner.ilike.%${orgName}%,current_owner_role.eq.${userRole}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const all = Object.values(ALL_DEMO_BATCHES);
        let demoFiltered: Batch[] = [];
        if (userRole === 'FARMER') {
          demoFiltered = all.filter((b) => b.originFarmerName.toLowerCase().includes(userLower) || b.currentOwnerRole === 'FARMER');
        } else if (userRole === 'MANDI') {
          demoFiltered = all.filter((b) => b.events.some((e) => e.actorRole === 'MANDI'));
        } else if (userRole === 'WAREHOUSE') {
          demoFiltered = all.filter((b) => b.currentOwnerRole === 'WAREHOUSE' || b.status === 'STORED');
        } else if (userRole === 'PROCESSOR' || userRole === 'FACTORY') {
          demoFiltered = all.filter((b) => b.currentOwnerRole === 'PROCESSOR' || b.category.includes('Flour') || b.parentBatchIds.length > 0);
        } else if (userRole === 'TRANSPORTER' || userRole === 'DISTRIBUTOR') {
          demoFiltered = all.filter((b) => b.events.some((e) => e.actorRole === 'TRANSPORTER'));
        } else if (userRole === 'RETAILER') {
          demoFiltered = all.filter((b) => b.currentOwnerRole === 'RETAILER' || b.status === 'RETAILED');
        } else {
          demoFiltered = all;
        }

        const map = new Map<string, Batch>();
        matchingLocal.forEach((b) => map.set(b.batchId, b));
        demoFiltered.forEach((b) => {
          if (!map.has(b.batchId)) map.set(b.batchId, b);
        });
        return Array.from(map.values());
      }

      const dbBatches = await Promise.all(data.map((r) => this.mapDbRowToBatch(r)));
      const map = new Map<string, Batch>();
      matchingLocal.forEach((b) => map.set(b.batchId, b));
      dbBatches.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    } catch (err) {
      const all = Object.values(ALL_DEMO_BATCHES);
      const map = new Map<string, Batch>();
      matchingLocal.forEach((b) => map.set(b.batchId, b));
      all.forEach((b) => {
        if (!map.has(b.batchId)) map.set(b.batchId, b);
      });
      return Array.from(map.values());
    }
  }

  public async getIncomingBatches(
    userRole: StakeholderRole,
    orgName: string
  ): Promise<Batch[]> {
    try {
      const all = await this.getAllBatches();
      if (userRole === 'MANDI') {
        return all.filter((b) => b.currentOwnerRole === 'FARMER' && b.status === 'ACTIVE');
      }
      if (userRole === 'WAREHOUSE') {
        return all.filter((b) => (b.currentOwnerRole === 'MANDI' || b.currentOwnerRole === 'FARMER') && b.status === 'ACTIVE');
      }
      if (userRole === 'PROCESSOR' || userRole === 'FACTORY') {
        return all.filter((b) => (b.currentOwnerRole === 'WAREHOUSE' || b.currentOwnerRole === 'MANDI') && b.status === 'STORED');
      }
      if (userRole === 'RETAILER') {
        return all.filter((b) => b.currentOwnerRole === 'TRANSPORTER' || b.currentOwnerRole === 'PROCESSOR');
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  public async getStorageUnits(): Promise<StorageUnit[]> {
    try {
      const { data, error } = await supabase
        .from('storage_units')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        return MOCK_STORAGE_UNITS;
      }

      return data.map((u: any) => ({
        storageUnitId: u.code,
        name: u.name,
        type: u.type,
        location: u.location,
        capacity: u.capacity,
        currentStatus: u.current_status,
        powerStatus: u.power_status as PowerSourceStatus,
        solarStatus: u.solar_status as SolarGenerationStatus,
        solarOutputWatts: Number(u.solar_output_watts || 0),
        batteryPercentage: Number(u.battery_percentage || 100),
        safeTemperatureMin: Number(u.safe_temperature_min),
        safeTemperatureMax: Number(u.safe_temperature_max),
        safeHumidityMin: Number(u.safe_humidity_min || 40),
        safeHumidityMax: Number(u.safe_humidity_max || 70),
        demoState: (u.demo_state || 'DEMO_SIMULATED') as any,
      }));
    } catch (err) {
      return MOCK_STORAGE_UNITS;
    }
  }

  public async getStorageUnit(unitId: string): Promise<StorageUnit | null> {
    const units = await this.getStorageUnits();
    return units.find((u) => u.storageUnitId === unitId) || null;
  }

  public async createBatch(input: CreateBatchInput): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const batchCode = `FT-${new Date().getFullYear()}-FRM-${Math.floor(1000 + Math.random() * 9000)}`;
    const eventCode = `EVT-HARV-${Date.now().toString().slice(-4)}`;
    const evidenceCode = input.evidence ? `EVD-HARV-${Date.now().toString().slice(-4)}` : '';

    const expiryDate = new Date(Date.now() + (input.expiryDays || 365) * 24 * 60 * 60 * 1000).toISOString();

    const newEvidence: EvidenceRecord[] = input.evidence
      ? [
          {
            evidenceId: evidenceCode,
            eventId: eventCode,
            batchId: batchCode,
            captureType: input.evidence.captureType,
            capturedAt: timestamp,
            capturedBy: input.originFarmerName,
            captureLocation: input.origin,
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

    const initialEvent: SupplyChainEvent = {
      eventId: eventCode,
      batchId: batchCode,
      eventType: 'HARVESTED',
      actor: input.originFarmerName,
      actorRole: 'FARMER',
      organization: `${input.originFarmerName} Farm Collective`,
      location: input.origin,
      coordinates: { lat: 19.8856, lng: 74.4782 },
      timestamp,
      quantity: `${input.quantity} ${input.unit}`,
      notes: input.notes || 'Batch created at farm origin with verified harvest metadata.',
      verificationState: 'VERIFIED',
      evidenceIds: evidenceCode ? [evidenceCode] : [],
    };

    const certificates: any[] = [
      {
        certificateId: `CERT-ORIGIN-${Date.now().toString().slice(-4)}`,
        title: 'Farm Origin Registration Standard',
        issuer: 'Maharashtra Organic Farming Federation (Demo)',
        type: 'ORIGIN_VERIFICATION',
        issuedDate: timestamp.split('T')[0],
        expiryDate: expiryDate.split('T')[0],
        verificationStatus: 'VERIFIED',
        documentRef: `DOC-ORIGIN-${batchCode}`,
        isDemoNonFSSAI: true,
      },
    ];

    if (input.labCertificate) {
      certificates.unshift({
        certificateId: input.labCertificate.certificateId || `CERT-LAB-${Date.now().toString().slice(-4)}`,
        title: input.labCertificate.title || 'NABL Accredited Soil & Pesticide Residue Test Certificate',
        issuer: input.labCertificate.issuer || 'AgriTest Laboratories NABL #4912',
        type: 'LAB_TEST',
        issuedDate: timestamp.split('T')[0],
        expiryDate: expiryDate.split('T')[0],
        verificationStatus: 'VERIFIED',
        documentRef: input.labCertificate.documentRef || `NABL-TEST-${batchCode}`,
        isDemoNonFSSAI: false,
      });
    }

    const scoreBreakdown = calculateBatchScore({
      origin: input.origin,
      originFarmerName: input.originFarmerName,
      category: input.category,
      variety: input.variety,
      productionDate: timestamp,
      expiryDate,
      parentBatchIds: [],
      events: [initialEvent],
      evidences: newEvidence,
      feedbacks: [],
      certificates,
    });

    const createdBatch: Batch = {
      batchId: batchCode,
      productName: input.productName,
      category: input.category,
      variety: input.variety || 'Standard Grade',
      quantity: input.quantity,
      unit: input.unit,
      origin: input.origin,
      originFarmerId: input.originFarmerId || 'usr-farmer-local',
      originFarmerName: input.originFarmerName,
      currentOwner: `${input.originFarmerName} Farm Collective`,
      currentOwnerRole: 'FARMER',
      currentLocation: input.origin,
      status: 'ACTIVE',
      createdAt: timestamp,
      harvestDate: input.harvestDate || timestamp,
      productionDate: timestamp,
      expiryDate,
      parentBatchIds: [],
      childBatchIds: [],
      events: [initialEvent],
      evidences: newEvidence,
      feedbacks: [],
      certificates,
      scoreBreakdown,
      qrCodeString: `https://farmtracer.app/trace/${batchCode}`,
    };

    // Save to local custom batches store for immediate persistence and offline reliability
    this.saveLocalBatch(createdBatch);

    // 1. Insert into Supabase batches table
    try {
      const { data: insertedBatch, error: batchErr } = await supabase
        .from('batches')
        .insert({
          batch_code: batchCode,
          product_name: input.productName,
          category: input.category,
          variety: input.variety || 'Standard Grade',
          quantity: input.quantity,
          unit: input.unit,
          origin: input.origin,
          origin_farmer_id: input.originFarmerId || null,
          origin_farmer_name: input.originFarmerName,
          current_owner: `${input.originFarmerName} Farm Collective`,
          current_owner_role: 'FARMER',
          current_location: input.origin,
          lat: 19.8856,
          lng: 74.4782,
          status: 'ACTIVE',
          harvest_date: input.harvestDate || timestamp,
          production_date: timestamp,
          expiry_date: expiryDate,
          total_score: scoreBreakdown.totalScore,
          score_breakdown: scoreBreakdown,
          evidences: newEvidence,
          feedbacks: [],
          certificates,
          qr_code_string: `https://farmtracer.app/trace/${batchCode}`,
        })
        .select('*')
        .single();

      if (batchErr) {
        console.warn('Supabase batch insert notice:', batchErr);
      }

      // 2. Insert Supply Chain Event
      await supabase.from('supply_chain_events').insert({
        event_code: eventCode,
        batch_id: insertedBatch?.id,
        batch_code: batchCode,
        event_type: 'HARVESTED',
        actor: input.originFarmerName,
        actor_role: 'FARMER',
        organization: `${input.originFarmerName} Farm Collective`,
        location: input.origin,
        lat: 19.8856,
        lng: 74.4782,
        timestamp,
        quantity: `${input.quantity} ${input.unit}`,
        notes: input.notes || 'Batch created at farm origin with verified harvest metadata.',
        verification_state: 'VERIFIED',
        evidence_ids: evidenceCode ? [evidenceCode] : [],
      });

      // 3. Log Audit Entry
      await supabase.from('audit_logs').insert({
        action: 'BATCH_CREATED',
        actor_name: input.originFarmerName,
        actor_role: 'FARMER',
        entity_type: 'BATCH',
        entity_id: batchCode,
        details: { quantity: input.quantity, unit: input.unit, origin: input.origin },
      });
    } catch (e) {
      console.warn('Backend sync caught, operating on local batch state:', e);
    }

    this.notify();
    return createdBatch;
  }

  public async transformBatch(input: TransformBatchInput): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const batchCode = `FT-${new Date().getFullYear()}-PROC-${Math.floor(1000 + Math.random() * 9000)}`;
    const eventCode = `EVT-TRNF-${Date.now().toString().slice(-4)}`;
    const evidenceCode = input.evidence ? `EVD-TRNF-${Date.now().toString().slice(-4)}` : '';
    const expiryDate = new Date(Date.now() + (input.expiryDays || 180) * 24 * 60 * 60 * 1000).toISOString();

    // Fetch parent batches to carry over origin
    let origin = 'Regional Certified Hub';
    let originFarmerName = 'Multiple Sourced Farmers';
    if (input.parentBatchIds.length > 0) {
      const parent = await this.getBatchById(input.parentBatchIds[0]);
      if (parent) {
        origin = parent.origin;
        originFarmerName = parent.originFarmerName;
      }
    }

    const newEvidence: EvidenceRecord[] = input.evidence
      ? [
          {
            evidenceId: evidenceCode,
            eventId: eventCode,
            batchId: batchCode,
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

    const transformEvent: SupplyChainEvent = {
      eventId: eventCode,
      batchId: batchCode,
      eventType: 'TRANSFORMED',
      actor: input.processorName,
      actorRole: 'PROCESSOR',
      organization: input.organizationName,
      location: input.location,
      coordinates: { lat: 19.954, lng: 73.742 },
      timestamp,
      quantity: `${input.quantity} ${input.unit}`,
      notes: `Milled & Transformed from parent batches: ${input.parentBatchIds.join(', ')}. ${input.notes}`,
      verificationState: 'VERIFIED',
      evidenceIds: evidenceCode ? [evidenceCode] : [],
    };

    const scoreBreakdown = calculateBatchScore({
      origin,
      originFarmerName,
      category: input.category,
      variety: input.variety,
      productionDate: timestamp,
      expiryDate,
      parentBatchIds: input.parentBatchIds,
      events: [transformEvent],
      evidences: newEvidence,
      feedbacks: [],
      certificates: [],
    });

    // 1. Insert into Supabase batches table
    const { data: insertedBatch, error: batchErr } = await supabase
      .from('batches')
      .insert({
        batch_code: batchCode,
        product_name: input.productName,
        category: input.category,
        variety: input.variety || 'Milled Formulation',
        quantity: input.quantity,
        unit: input.unit,
        origin,
        origin_farmer_name: originFarmerName,
        current_owner: input.organizationName,
        current_owner_role: 'PROCESSOR',
        current_location: input.location,
        lat: 19.954,
        lng: 73.742,
        status: 'ACTIVE',
        production_date: timestamp,
        expiry_date: expiryDate,
        total_score: scoreBreakdown.totalScore,
        score_breakdown: scoreBreakdown,
        evidences: newEvidence,
        feedbacks: [],
        certificates: [
          {
            certificateId: `CERT-ISO-${Date.now().toString().slice(-4)}`,
            title: 'Clean Processing & Formulation Audit',
            issuer: 'Food Integrity Standards Board (Demo)',
            type: 'PACKAGING_STANDARD',
            issuedDate: timestamp.split('T')[0],
            expiryDate: expiryDate.split('T')[0],
            verificationStatus: 'VERIFIED',
            documentRef: `DOC-MILL-${batchCode}`,
            isDemoNonFSSAI: true,
          },
        ],
        qr_code_string: `FARM-TRACER://BATCH/${batchCode}`,
      })
      .select('*')
      .single();

    if (batchErr) {
      console.error('Error inserting transformed batch:', batchErr);
    }

    // 2. Insert Supply Chain Event
    await supabase.from('supply_chain_events').insert({
      event_code: eventCode,
      batch_id: insertedBatch?.id,
      batch_code: batchCode,
      event_type: 'TRANSFORMED',
      actor: input.processorName,
      actor_role: 'PROCESSOR',
      organization: input.organizationName,
      location: input.location,
      lat: 19.954,
      lng: 73.742,
      timestamp,
      quantity: `${input.quantity} ${input.unit}`,
      notes: `Milled & Transformed from parent batches: ${input.parentBatchIds.join(', ')}. ${input.notes}`,
      verification_state: 'VERIFIED',
      evidence_ids: evidenceCode ? [evidenceCode] : [],
    });

    // 3. Insert Parent-Child Lineage DAG Edges
    for (const parentCode of input.parentBatchIds) {
      const parent = await this.getBatchById(parentCode);
      await supabase.from('batch_lineage').insert({
        parent_batch_id: parent ? undefined : undefined,
        parent_batch_code: parentCode,
        child_batch_code: batchCode,
        transformation_type: 'MILLING_TRANSFORMATION',
        quantity: input.quantity,
        notes: input.notes,
      });

      // Update parent batch status to TRANSFORMED
      await supabase
        .from('batches')
        .update({ status: 'TRANSFORMED' })
        .eq('batch_code', parentCode);
    }

    // 4. Log Audit Entry
    await supabase.from('audit_logs').insert({
      action: 'BATCH_TRANSFORMED',
      actor_name: input.processorName,
      actor_role: 'PROCESSOR',
      entity_type: 'BATCH',
      entity_id: batchCode,
      details: { parentBatchIds: input.parentBatchIds, outputQuantity: input.quantity },
    });

    this.notify();
    return this.getBatchById(batchCode) as Promise<Batch>;
  }

  public async receiveBatch(
    batchId: string,
    actorName: string,
    actorRole: StakeholderRole,
    orgName: string,
    location: string,
    notes?: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const eventCode = `EVT-RCV-${Date.now().toString().slice(-4)}`;
    const evidenceCode = evidence ? `EVD-RCV-${Date.now().toString().slice(-4)}` : '';

    const newEvidenceItem: EvidenceRecord | null = evidence
      ? {
          evidenceId: evidenceCode,
          eventId: eventCode,
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
            geoAccuracyMeters: 3.2,
            tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          },
        }
      : null;

    // Fetch existing batch
    const current = await this.getBatchById(batchId);
    const existingEvidences = current?.evidences || [];
    const updatedEvidences = newEvidenceItem ? [...existingEvidences, newEvidenceItem] : existingEvidences;

    // Update batch in Supabase
    await supabase
      .from('batches')
      .update({
        current_owner: orgName,
        current_owner_role: actorRole,
        current_location: location,
        status: actorRole === 'RETAILER' ? 'RETAILED' : 'ACTIVE',
        evidences: updatedEvidences,
        updated_at: timestamp,
      })
      .eq('batch_code', batchId);

    // Insert supply chain event
    await supabase.from('supply_chain_events').insert({
      event_code: eventCode,
      batch_code: batchId,
      event_type: actorRole === 'RETAILER' ? 'RECEIVED' : 'COLLECTED',
      actor: actorName,
      actor_role: actorRole,
      organization: orgName,
      location,
      timestamp,
      quantity: current ? `${current.quantity} ${current.unit}` : undefined,
      notes: notes || `Custody received by ${actorRole} (${orgName}) at ${location}.`,
      verification_state: 'VERIFIED',
      evidence_ids: evidenceCode ? [evidenceCode] : [],
    });

    // Log Audit Entry
    await supabase.from('audit_logs').insert({
      action: 'BATCH_RECEIVED',
      actor_name: actorName,
      actor_role: actorRole,
      entity_type: 'BATCH',
      entity_id: batchId,
      details: { organization: orgName, location },
    });

    this.notify();
    return this.getBatchById(batchId) as Promise<Batch>;
  }

  public async transferBatch(
    batchId: string,
    fromActor: string,
    fromRole: StakeholderRole,
    toRole: StakeholderRole,
    toOrgName: string,
    destinationLocation: string,
    transitNotes: string,
    evidence?: { previewUrl: string; captureType: 'PHOTO' | 'VIDEO' }
  ): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const eventCode = `EVT-TRF-${Date.now().toString().slice(-4)}`;
    const evidenceCode = evidence ? `EVD-TRF-${Date.now().toString().slice(-4)}` : '';

    const newEvidenceItem: EvidenceRecord | null = evidence
      ? {
          evidenceId: evidenceCode,
          eventId: eventCode,
          batchId,
          captureType: evidence.captureType,
          capturedAt: timestamp,
          capturedBy: fromActor,
          captureLocation: destinationLocation,
          previewUrl: evidence.previewUrl,
          uploadState: 'LOCAL_CAPTURED',
          verificationState: 'VERIFIED',
          metadata: {
            deviceCameraOnly: true,
            geoAccuracyMeters: 4.0,
            tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          },
        }
      : null;

    const current = await this.getBatchById(batchId);
    const existingEvidences = current?.evidences || [];
    const updatedEvidences = newEvidenceItem ? [...existingEvidences, newEvidenceItem] : existingEvidences;

    await supabase
      .from('batches')
      .update({
        current_owner: toOrgName,
        current_owner_role: toRole,
        current_location: destinationLocation,
        status: toRole === 'TRANSPORTER' ? 'IN_TRANSIT' : 'ACTIVE',
        evidences: updatedEvidences,
        updated_at: timestamp,
      })
      .eq('batch_code', batchId);

    await supabase.from('supply_chain_events').insert({
      event_code: eventCode,
      batch_code: batchId,
      event_type: 'TRANSFERRED',
      actor: fromActor,
      actor_role: fromRole,
      organization: current?.currentOwner || toOrgName,
      location: destinationLocation,
      timestamp,
      quantity: current ? `${current.quantity} ${current.unit}` : undefined,
      notes: `Transferred to ${toRole} (${toOrgName}) at ${destinationLocation}. ${transitNotes}`,
      verification_state: 'VERIFIED',
      evidence_ids: evidenceCode ? [evidenceCode] : [],
    });

    await supabase.from('audit_logs').insert({
      action: 'BATCH_TRANSFERRED',
      actor_name: fromActor,
      actor_role: fromRole,
      entity_type: 'BATCH',
      entity_id: batchId,
      details: { toRole, toOrgName, destinationLocation },
    });

    this.notify();
    return this.getBatchById(batchId) as Promise<Batch>;
  }

  public async assignStorageUnit(
    batchId: string,
    storageUnitId: string,
    operatorName: string,
    orgName: string,
    notes?: string
  ): Promise<Batch> {
    const unit = await this.getStorageUnit(storageUnitId);
    if (!unit) throw new Error(`Storage unit ${storageUnitId} not found`);

    const timestamp = new Date().toISOString();
    const eventCode = `EVT-STOR-${Date.now().toString().slice(-4)}`;

    const storageCondition: StorageCondition = {
      conditionId: `COND-${Date.now().toString().slice(-4)}`,
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

    await supabase
      .from('batches')
      .update({
        current_owner: orgName,
        current_owner_role: 'WAREHOUSE',
        current_location: unit.location,
        status: 'STORED',
        current_storage: storageCondition,
        updated_at: timestamp,
      })
      .eq('batch_code', batchId);

    await supabase.from('supply_chain_events').insert({
      event_code: eventCode,
      batch_code: batchId,
      event_type: 'STORED',
      actor: operatorName,
      actor_role: 'WAREHOUSE',
      organization: orgName,
      location: unit.location,
      timestamp,
      notes: `Batch placed into ${unit.name} (${unit.type}). Telemetry monitoring active.`,
      verification_state: 'VERIFIED',
      storage_condition: storageCondition,
    });

    this.notify();
    return this.getBatchById(batchId) as Promise<Batch>;
  }

  public async recordStorageCondition(
    batchId: string,
    condition: {
      temperature: number;
      humidity: number;
      powerStatus: PowerSourceStatus;
      solarStatus: SolarGenerationStatus;
      conditionStatus: 'SAFE' | 'WARNING' | 'OUT_OF_RANGE';
      notes?: string;
    }
  ): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const current = await this.getBatchById(batchId);
    if (!current) throw new Error(`Batch ${batchId} not found`);

    const newStorageCondition: StorageCondition = {
      conditionId: `COND-${Date.now().toString().slice(-4)}`,
      batchId,
      storageUnitId: current.currentStorage?.storageUnitId || 'SU-SOLAR-04',
      storageUnitName: current.currentStorage?.storageUnitName || 'Solar Smart Storage',
      location: current.currentLocation,
      recordedAt: timestamp,
      temperature: condition.temperature,
      humidity: condition.humidity,
      powerStatus: condition.powerStatus,
      solarStatus: condition.solarStatus,
      conditionStatus: condition.conditionStatus,
      notes: condition.notes || 'Manual environmental inspection logged.',
      source: 'MANUAL_INSPECTION_RECORD',
      demoState: 'DEMO_SIMULATED',
    };

    await supabase
      .from('batches')
      .update({
        current_storage: newStorageCondition,
        updated_at: timestamp,
      })
      .eq('batch_code', batchId);

    await supabase.from('supply_chain_events').insert({
      event_code: `EVT-INSP-${Date.now().toString().slice(-4)}`,
      batch_code: batchId,
      event_type: 'INSPECTED',
      actor: current.currentOwner,
      actor_role: current.currentOwnerRole,
      organization: current.currentOwner,
      location: current.currentLocation,
      timestamp,
      notes: `Storage condition logged: ${condition.temperature}°C, ${condition.humidity}% RH (${condition.conditionStatus}). ${condition.notes || ''}`,
      verification_state: 'VERIFIED',
      storage_condition: newStorageCondition,
    });

    this.notify();
    return this.getBatchById(batchId) as Promise<Batch>;
  }

  public async addEvidenceToBatch(
    batchId: string,
    evidence: {
      previewUrl: string;
      captureType: 'PHOTO' | 'VIDEO';
      capturedBy: string;
      captureLocation: string;
      notes?: string;
    }
  ): Promise<EvidenceRecord> {
    const timestamp = new Date().toISOString();
    const evidenceCode = `EVD-${Date.now().toString().slice(-4)}`;

    const newEvidence: EvidenceRecord = {
      evidenceId: evidenceCode,
      eventId: `EVT-EVD-${Date.now().toString().slice(-4)}`,
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
        geoAccuracyMeters: 3.0,
        tamperProofHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      },
    };

    const current = await this.getBatchById(batchId);
    const updatedEvidences = [...(current?.evidences || []), newEvidence];

    await supabase
      .from('batches')
      .update({ evidences: updatedEvidences, updated_at: timestamp })
      .eq('batch_code', batchId);

    this.notify();
    return newEvidence;
  }

  public async submitFeedback(
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
    const timestamp = new Date().toISOString();
    const feedbackCode = `FB-${Date.now().toString().slice(-6)}`;
    const feedbackRecord: FeedbackRecord = {
      feedbackId: feedbackCode,
      batchId,
      eventId: `EVT-FB-${Date.now().toString().slice(-4)}`,
      fromRole: feedback.fromRole,
      toRole: feedback.toRole,
      submittedBy: feedback.submittedBy,
      category: feedback.category,
      score: feedback.score,
      comment: feedback.comment,
      createdAt: timestamp,
      status: 'PUBLISHED',
    };

    // 1. Insert into feedbacks table
    await supabase.from('feedbacks').insert({
      feedback_code: feedbackCode,
      batch_code: batchId,
      from_role: feedback.fromRole,
      to_role: feedback.toRole,
      submitted_by: feedback.submittedBy,
      category: feedback.category,
      score: feedback.score,
      comment: feedback.comment,
      status: 'PUBLISHED',
    });

    // 2. Log Audit Entry
    await supabase.from('audit_logs').insert({
      action: 'FEEDBACK_SUBMITTED',
      actor_name: feedback.submittedBy,
      actor_role: feedback.fromRole,
      entity_type: 'FEEDBACK',
      entity_id: feedbackCode,
      details: { batchCode: batchId, score: feedback.score, category: feedback.category },
    });

    this.notify();
    return feedbackRecord;
  }

  public async submitConsumerFeedback(
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

  public async verifyBatchAsAuthority(
    batchId: string,
    inspectorName: string,
    decision: VerificationState,
    auditNotes: string,
    contaminationSeverity?: 'LOW' | 'MEDIUM' | 'CRITICAL'
  ): Promise<Batch> {
    const timestamp = new Date().toISOString();
    const current = await this.getBatchById(batchId);
    if (!current) throw new Error(`Batch ${batchId} not found`);

    const contaminationFlag =
      decision === 'REJECTED' || decision === 'FLAGGED'
        ? {
            flagged: true,
            severity: contaminationSeverity || 'CRITICAL',
            reason: auditNotes,
            detectedAt: timestamp,
            actionRequired:
              decision === 'REJECTED'
                ? 'Batch quarantined and recalled from distribution.'
                : 'Batch flagged for immediate secondary lab testing.',
          }
        : undefined;

    const newStatus = decision === 'REJECTED' ? 'RECALLED' : decision === 'FLAGGED' ? 'ACTIVE' : current.status;

    await supabase
      .from('batches')
      .update({
        status: newStatus,
        contamination_flag: contaminationFlag || null,
        updated_at: timestamp,
      })
      .eq('batch_code', batchId);

    await supabase.from('supply_chain_events').insert({
      event_code: `EVT-AUDIT-${Date.now().toString().slice(-4)}`,
      batch_code: batchId,
      event_type: 'AUDITED',
      actor: inspectorName,
      actor_role: 'AUTHORITY',
      organization: 'State Food Safety Authority',
      location: current.currentLocation,
      timestamp,
      notes: `Regulatory inspection: ${decision}. ${auditNotes}`,
      verification_state: decision,
    });

    await supabase.from('audit_logs').insert({
      action: 'AUTHORITY_VERIFICATION',
      actor_name: inspectorName,
      actor_role: 'AUTHORITY',
      entity_type: 'BATCH',
      entity_id: batchId,
      details: { decision, auditNotes, contaminationSeverity },
    });

    this.notify();
    return this.getBatchById(batchId) as Promise<Batch>;
  }

  public async getBatchTimeline(batchId: string): Promise<SupplyChainEvent[]> {
    try {
      const { data, error } = await supabase
        .from('supply_chain_events')
        .select('*')
        .eq('batch_code', batchId)
        .order('timestamp', { ascending: true });

      if (error || !data || data.length === 0) {
        const batch = await this.getBatchById(batchId);
        return batch?.events || [];
      }

      return data.map((e: any) => ({
        eventId: e.event_code || e.id,
        batchId: e.batch_code,
        eventType: e.event_type,
        actor: e.actor,
        actorRole: e.actor_role as StakeholderRole,
        organization: e.organization,
        location: e.location,
        coordinates: { lat: e.lat || 19.88, lng: e.lng || 74.47 },
        timestamp: e.timestamp,
        quantity: e.quantity || '',
        notes: e.notes || '',
        previousLocation: e.previous_location,
        newLocation: e.new_location,
        verificationState: (e.verification_state || 'VERIFIED') as VerificationState,
        evidenceIds: e.evidence_ids || [],
        storageCondition: e.storage_condition || undefined,
      }));
    } catch (err) {
      const batch = await this.getBatchById(batchId);
      return batch?.events || [];
    }
  }

  public async getBatchRouteLocations(
    batchId: string
  ): Promise<Array<{ stage: string; location: string; coordinates: { lat: number; lng: number }; actor: string; timestamp: string }>> {
    const timeline = await this.getBatchTimeline(batchId);
    return timeline.map((e) => ({
      stage: `${e.eventType} · ${e.actorRole}`,
      location: e.location,
      coordinates: e.coordinates || { lat: 19.88, lng: 74.47 },
      actor: `${e.actor} (${e.organization})`,
      timestamp: e.timestamp,
    }));
  }

  public async getBatchLineageGraph(
    batchId: string
  ): Promise<{ nodes: LineageNode[]; links: LineageLink[] }> {
    if (batchId === 'BIS-2026-092') {
      return {
        nodes: DEMO_LINEAGE_NODES,
        links: DEMO_LINEAGE_LINKS,
      };
    }

    const batch = await this.getBatchById(batchId);
    if (!batch) {
      return { nodes: [], links: [] };
    }

    // Dynamic Lineage Graph Builder from live DB
    const nodes: LineageNode[] = [];
    const links: LineageLink[] = [];

    // Stage 1: Origin Farm Node
    const farmNodeId = `node-${batch.batchId}-farm`;
    nodes.push({
      id: farmNodeId,
      batchId: batch.batchId,
      title: batch.originFarmerName || 'Origin Producer',
      type: 'RAW_MATERIAL',
      stage: 'Stage 1 · Farm Harvest',
      actor: batch.originFarmerName,
      organization: batch.origin,
      location: batch.origin,
      timestamp: batch.harvestDate || batch.createdAt.split('T')[0],
      score: 96,
      status: batch.contaminationFlag?.flagged ? 'Contamination Alert' : 'Verified Origin Harvest',
      quantity: `${batch.quantity} ${batch.unit}`,
      parents: [],
      children: [],
      notes: `Harvest record registered at verified coordinates.`,
      riskFlag: batch.contaminationFlag?.flagged ? 'CRITICAL_CONTAMINATION' : undefined,
    });

    let previousNodeId = farmNodeId;

    // Stage 2: Storage / Warehouse Node if applicable
    if (batch.currentStorage || batch.status === 'STORED') {
      const storageNodeId = `node-${batch.batchId}-storage`;
      nodes.push({
        id: storageNodeId,
        batchId: batch.batchId,
        title: batch.currentStorage?.storageUnitName || 'Solar Cold Vault',
        type: 'STORAGE',
        stage: 'Stage 2 · Solar Smart Cold Storage',
        actor: batch.currentOwner,
        organization: batch.currentLocation,
        location: batch.currentLocation,
        timestamp: batch.currentStorage?.recordedAt || batch.createdAt,
        score: batch.scoreBreakdown.totalScore,
        status: batch.currentStorage?.conditionStatus === 'SAFE' ? '18.2°C Safe Micro-Climate' : 'Monitored Storage',
        quantity: `${batch.quantity} ${batch.unit}`,
        parents: [previousNodeId],
        children: [],
        storageTelemetry: {
          temperature: batch.currentStorage?.temperature ?? 18.2,
          humidity: batch.currentStorage?.humidity ?? 54,
          powerStatus: batch.currentStorage?.powerStatus ?? 'SOLAR',
          solarStatus: batch.currentStorage?.solarStatus ?? 'OPTIMAL',
          solarWatts: 4200,
          batteryPercentage: 96,
          safeRange: '15.0°C – 22.0°C',
          isSafe: (batch.currentStorage?.conditionStatus || 'SAFE') === 'SAFE',
        },
        notes: `Solar-assisted climate control active.`,
      });

      links.push({
        source: previousNodeId,
        target: storageNodeId,
        label: 'Solar Storage Intake',
        type: 'SOLAR_INTAKE',
        animated: true,
      });

      previousNodeId = storageNodeId;
    }

    // Stage 3: Current Custody Node
    if (batch.status === 'RETAILED' || batch.currentOwnerRole === 'RETAILER') {
      const retailNodeId = `node-${batch.batchId}-retail`;
      nodes.push({
        id: retailNodeId,
        batchId: batch.batchId,
        title: batch.currentOwner || 'Retail Point',
        type: 'FINAL_PRODUCT',
        stage: 'Stage 4 · Retail & Consumer Shelf',
        actor: batch.currentOwner,
        organization: batch.currentOwner,
        location: batch.currentLocation,
        timestamp: batch.createdAt,
        score: batch.scoreBreakdown.totalScore,
        status: 'Retail Stocked',
        quantity: `${batch.quantity} ${batch.unit}`,
        parents: [previousNodeId],
        children: [],
        current: true,
        notes: 'Consumer QR verification active.',
      });

      links.push({
        source: previousNodeId,
        target: retailNodeId,
        label: 'Stocked on Shelf',
        type: 'DISTRIBUTION_PACK',
        animated: true,
      });
    }

    return { nodes, links };
  }

  public async resetToDemoData(): Promise<void> {
    this.notify();
  }
}

export const traceService = new SupabaseTraceService();
