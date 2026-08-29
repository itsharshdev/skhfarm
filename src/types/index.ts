export type StakeholderRole =
  | 'FARMER'
  | 'MANDI'
  | 'TRANSPORTER'
  | 'WAREHOUSE'
  | 'PROCESSOR'
  | 'MANUFACTURER'
  | 'FACTORY'
  | 'DISTRIBUTOR'
  | 'RETAILER'
  | 'AUTHORITY'
  | 'ADMIN'
  | 'CONSUMER'
  | 'CUSTOM';


export type EventType =
  | 'CREATED'
  | 'HARVESTED'
  | 'COLLECTED'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'STORED'
  | 'TRANSPORTED'
  | 'PROCESSED'
  | 'TRANSFORMED'
  | 'PACKAGED'
  | 'TRANSFERRED'
  | 'SOLD'
  | 'RECALLED'
  | 'BLOCKED'
  | 'AUDITED'
  | 'LAB_TEST';

export type VerificationState = 'VERIFIED' | 'PENDING' | 'FLAGGED' | 'REJECTED';

export type ConditionStatus = 'SAFE' | 'WARNING' | 'OUT_OF_RANGE';

export type PowerSourceStatus = 'SOLAR' | 'GRID' | 'HYBRID' | 'BATTERY_BACKUP' | 'OFFLINE';

export type SolarGenerationStatus = 'OPTIMAL' | 'MODERATE' | 'LOW' | 'CHARGING' | 'DISCHARGING' | 'STANDBY';

export interface StorageUnit {
  storageUnitId: string;
  name: string;
  type: 'SOLAR_SMART_HUB' | 'COLD_STORAGE_WAREHOUSE' | 'REEFER_TRANSIT' | 'FARM_SHED_COOLER';
  location: string;
  capacity: string;
  currentStatus: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE';
  powerStatus: PowerSourceStatus;
  solarStatus: SolarGenerationStatus;
  solarOutputWatts?: number;
  batteryPercentage?: number;
  safeTemperatureMin: number; // °C
  safeTemperatureMax: number; // °C
  safeHumidityMin?: number; // %
  safeHumidityMax?: number; // %
  demoState: 'DEMO_SIMULATED' | 'INTEGRATION_PENDING';
}

export interface StorageCondition {
  conditionId: string;
  batchId: string;
  storageUnitId: string;
  storageUnitName: string;
  location: string;
  recordedAt: string;
  temperature: number; // in °C
  humidity: number; // in %
  powerStatus: PowerSourceStatus;
  solarStatus: SolarGenerationStatus;
  conditionStatus: ConditionStatus;
  notes?: string;
  source: 'SIMULATED_SENSOR_NODE' | 'MANUAL_INSPECTION_RECORD';
  demoState: 'DEMO_SIMULATED' | 'INTEGRATION_PENDING';
}

export interface Organization {
  organizationId: string;
  name: string;
  type: 'FPO' | 'MANDI' | 'LOGISTICS' | 'STORAGE' | 'MILL_PROCESSOR' | 'MANUFACTURER' | 'RETAILER' | 'REGULATOR';
  location: string;
  coordinates: { lat: number; lng: number };
  verificationStatus: VerificationState;
  contactEmail: string;
  certificateStatus: string;
  rating?: number;
}

export interface EvidenceRecord {
  evidenceId: string;
  eventId: string;
  batchId: string;
  captureType: 'PHOTO' | 'VIDEO';
  capturedAt: string;
  capturedBy: string;
  captureLocation: string;
  previewUrl: string;
  uploadState: 'LOCAL_CAPTURED' | 'PENDING_STORAGE_SYNC';
  verificationState: VerificationState;
  metadata: {
    deviceCameraOnly: boolean;
    geoAccuracyMeters?: number;
    fileSizeBytes?: number;
    tamperProofHash?: string;
  };
}

export interface FeedbackRecord {
  feedbackId: string;
  batchId: string;
  eventId: string;
  fromRole: StakeholderRole;
  toRole: StakeholderRole;
  submittedBy: string;
  category: 'QUALITY' | 'ACCURACY' | 'PACKAGING' | 'HANDLING' | 'TIMELINESS' | 'CONDITION' | 'TRACEABILITY' | 'OVERALL';
  score: number; // 0 - 100
  comment: string;
  createdAt: string;
  status: 'PUBLISHED' | 'FLAGGED';
}

export interface Certificate {
  certificateId: string;
  title: string;
  issuer: string;
  type: 'ORIGIN_VERIFICATION' | 'ORGANIC_STANDARD' | 'COLD_CHAIN_MONITORING' | 'PACKAGING_STANDARD';
  issuedDate: string;
  expiryDate: string;
  verificationStatus: VerificationState;
  documentRef: string;
  isDemoNonFSSAI: boolean;
}

export interface TraceScoreBreakdown {
  handoffScore: number; // Max 20
  handoffMax: number;
  completenessScore: number; // Max 20
  completenessMax: number;
  verificationScore: number; // Max 15
  verificationMax: number;
  qualityScore: number; // Max 20
  qualityMax: number;
  evidenceScore: number; // Max 10
  evidenceMax: number;
  feedbackScore: number; // Max 10
  feedbackMax: number;
  freshnessScore: number; // Max 5
  freshnessMax: number;
  penalties: {
    contaminationPenalty: number;
    anomalyPenalty: number;
    expiryPenalty: number;
    missingEvidencePenalty: number;
  };
  totalScore: number; // Clamped 0 - 100
  modelName: string; // 'FARM-TRACER 100-PT WEIGHTED INTEGRITY MODEL (V2)'
}

export interface SupplyChainEvent {
  eventId: string;
  batchId: string;
  eventType: EventType;
  actor: string;
  actorRole: StakeholderRole;
  organization: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  quantity: string;
  notes: string;
  previousLocation?: string;
  newLocation?: string;
  verificationState: VerificationState;
  evidenceIds: string[];
  feedbackId?: string;
  storageCondition?: StorageCondition;
}

export interface Batch {
  batchId: string;
  productName: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: 'KG' | 'QUINTAL' | 'TONNES' | 'PACKS' | 'CRATES';
  origin: string;
  originFarmerId: string;
  originFarmerName: string;
  currentOwner: string;
  currentOwnerRole: StakeholderRole;
  currentLocation: string;
  status: 'ACTIVE' | 'STORED' | 'IN_TRANSIT' | 'TRANSFORMED' | 'RETAILED' | 'RECALLED';
  createdAt: string;
  harvestDate?: string;
  productionDate?: string;
  expiryDate: string;
  parentBatchIds: string[];
  childBatchIds: string[];
  scoreBreakdown: TraceScoreBreakdown;
  currentStorage?: StorageCondition;
  storageUnit?: StorageUnit;
  events: SupplyChainEvent[];
  evidences: EvidenceRecord[];
  feedbacks: FeedbackRecord[];
  certificates: Certificate[];
  qrCodeString: string;
  contaminationFlag?: {
    flagged: boolean;
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    reason: string;
    detectedAt: string;
    actionRequired: string;
  };
}

export interface LineageNode {
  id: string;
  batchId: string;
  title: string;
  type: 'RAW_MATERIAL' | 'COLLECTION' | 'STORAGE' | 'TRANSIT' | 'INTERMEDIATE' | 'MANUFACTURED' | 'FINAL_PRODUCT';
  stage: string;
  actor: string;
  organization?: string;
  location: string;
  timestamp: string;
  score: number;
  status: string;
  current?: boolean;
  parents?: string[];
  children?: string[];
  quantity?: string;
  storageTelemetry?: {
    temperature: number;
    humidity?: number;
    powerStatus: PowerSourceStatus;
    solarStatus: SolarGenerationStatus;
    solarWatts?: number;
    batteryPercentage?: number;
    safeRange: string;
    isSafe: boolean;
  };
  notes?: string;
  riskFlag?: string;
  evidenceCount?: number;
  feedbackScore?: number;
}

export interface LineageLink {
  source: string;
  target: string;
  label: string;
  type: 'HARVEST_COLLECT' | 'SOLAR_INTAKE' | 'MILLING_TRANSFORMATION' | 'MERGE_FORMULATION' | 'BAKING_MANUFACTURE' | 'REEFER_TRANSIT' | 'DISTRIBUTION_PACK';
  animated?: boolean;
}

export interface AppUser {
  userId: string;
  name: string;
  role: StakeholderRole;
  organizationName: string;
  organizationId: string;
  location: string;
  verified: boolean;
  avatarInitials: string;
}

export type User = AppUser;

// Phase 4: AI-Ready Types
export type AIAnalysisType =
  | 'CONTAMINATION_DETECTION'
  | 'ANOMALY_DETECTION'
  | 'SUSPICIOUS_EVENT'
  | 'EXPIRY_RISK'
  | 'SHELF_LIFE_PREDICTION'
  | 'STORAGE_EXCURSION_RISK';

export type AISeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIAnalysisRecord {
  id: string;
  batchId: string;
  type: AIAnalysisType;
  title: string;
  result: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.94 -> 94%)
  severity: AISeverity;
  explanation: string;
  evidenceRef?: string;
  affectedStage?: string;
  storageUnitId?: string;
  modelVersion: string; // e.g. "FarmVision-v2.1-EdgeAI"
  timestamp: string;
  isDemoState: boolean; // Always true in prototype; clearly marked "Demo AI result"
  recommendedAction: string;
}

// Phase 4: Offline & PWA Sync Types
export interface OfflineSyncQueueItem {
  id: string;
  batchId: string;
  eventType: EventType;
  actor: string;
  actorRole: StakeholderRole;
  location: string;
  timestamp: string;
  quantity?: string;
  notes?: string;
  evidencePreviewUrl?: string;
  status: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
  createdOfflineAt: string;
}

export interface OfflineFileRecord {
  id: string;
  batchId: string;
  fileName: string;
  fileType: 'PHOTO' | 'VIDEO' | 'CERTIFICATE' | 'DOCUMENT';
  fileSizeBytes: number;
  dataUrl: string;
  capturedAt: string;
  capturedBy: string;
  captureLocation?: string;
  tamperProofHash?: string;
  syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  storageEngine: 'INDEXED_DB';
}

// Phase 4: Farmer Reputation & Badges
export interface FarmerBadge {
  id: string;
  title: string;
  description: string;
  iconName: 'ShieldCheck' | 'Sparkles' | 'Award' | 'CheckCircle2' | 'Tractor' | 'Star';
  earnedDate: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface FarmerReputationMetrics {
  farmerId: string;
  farmerName: string;
  organizationName: string;
  qualityScoreTrend: { month: string; score: number }[];
  traceabilityScoreTrend: { month: string; score: number }[];
  totalBatchesRegistered: number;
  verifiedHandoffsCount: number;
  zeroDisputeRatePercent: number;
  averageBatchScore: number;
  badges: FarmerBadge[];
  improvementSuggestions: string[];
}

// Phase 4: Safety & Risk Center
export type SafetyStatusType =
  | 'SAFE'
  | 'APPROACHING_EXPIRY'
  | 'EXPIRED'
  | 'RECALLED'
  | 'BLOCKED'
  | 'VERIFICATION_REQUIRED'
  | 'CONTAMINATION_FLAG'
  | 'ANOMALY_DETECTED';

export interface SafetyRiskAlert {
  id: string;
  batchId: string;
  productName: string;
  severity: AISeverity;
  statusType: SafetyStatusType;
  title: string;
  description: string;
  detectedAt: string;
  detectedBy: string;
  affectedLocations: string[];
  downstreamBatchesAffected: string[];
  resolved: boolean;
  resolutionNotes?: string;
}

export type ExpiryState = 'NORMAL' | 'NEAR_EXPIRY' | 'EXPIRED';

export interface RecallRecord {
  id: string;
  recallCode: string;
  batchId: string;
  batchCode: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'INITIATED' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  initiatedByName: string;
  initiatedByRole: string;
  affectedProductName: string;
  affectedQuantity: string;
  actionRequired?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRecord {
  id: string;
  alertCode: string;
  userId?: string;
  targetRole?: string;
  batchId: string;
  batchCode: string;
  type: 'NEAR_EXPIRY' | 'EXPIRED' | 'HIGH_RISK' | 'CONTAMINATION' | 'RECALL' | 'COMPLIANCE' | 'ANOMALY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIRiskAnalysisRecord {
  id: string;
  analysisCode: string;
  batchId: string;
  batchCode: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPIRED';
  riskScore: number;
  riskFactors: Array<{ factor: string; impact: string; detail: string }>;
  storageAnomalyDetected: boolean;
  recommendations: string[];
  isDeterministicFallback: boolean;
  modelVersion: string;
  analyzedAt: string;
  createdAt: string;
}

// ==========================================
// PS-1: DATA RESILIENCE & INTEGRITY TYPES
// ==========================================

export type IncidentState = 'NORMAL' | 'DEGRADED' | 'INCIDENT' | 'RECOVERY' | 'PARTIALLY_RECOVERED';

export type RecordIntegrityStatus =
  | 'VERIFIED'
  | 'RECOVERED'
  | 'PARTIALLY_RECOVERED'
  | 'REQUIRES_REVIEW'
  | 'UNRECOVERABLE'
  | 'PENDING_SYNCHRONIZATION';

export type InFlightOperationStatus =
  | 'STARTED'
  | 'VALIDATED'
  | 'PENDING'
  | 'COMPLETED'
  | 'INTERRUPTED'
  | 'REQUIRES_REVIEW';

export type ReconciliationState =
  | 'MATCHED'
  | 'SERVER_MISSING'
  | 'LOCAL_MISSING'
  | 'CONFLICT'
  | 'REQUIRES_REVIEW';

export interface DataIntegrityIncidentRecord {
  incidentId: string;
  state: IncidentState;
  title: string;
  description: string;
  affectedBatchIds: string[];
  recoverableCount: number;
  partiallyRecoverableCount: number;
  unrecoverableCount: number;
  pendingOperationsCount: number;
  requiresReviewCount: number;
  initiatedAt: string;
  resolvedAt?: string;
  primaryDataStoreState: 'HEALTHY' | 'CORRUPTED' | 'UNREADABLE' | 'RESTORING' | 'RECONCILED';
}

export interface InFlightOperationRecord {
  operationId: string;
  batchId: string;
  batchCode: string;
  operationType: 'TRANSFER' | 'TRANSFORMATION' | 'STORAGE_UPDATE' | 'HANDOFF_CONFIRMATION' | 'EVIDENCE_SEAL';
  status: InFlightOperationStatus;
  startedAt: string;
  steps: Array<{ stepName: string; status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING'; detail?: string }>;
  interruptionReason?: string;
  canRetry: boolean;
}

// ==========================================
// PS-2: INFORMATION & CLAIM VERIFICATION TYPES
// ==========================================

export type VerificationStatus =
  | 'VERIFIED'
  | 'SUPPORTED'
  | 'UNVERIFIED'
  | 'DISPUTED'
  | 'CONTRADICTED_BY_RECORDS'
  | 'INSUFFICIENT_EVIDENCE';

export type VerificationFactorCategory =
  | 'TEMPERATURE'
  | 'COLD_CHAIN'
  | 'TIMELINE'
  | 'STORAGE'
  | 'SOLAR_ENVIRONMENT'
  | 'QUALITY'
  | 'EVIDENCE'
  | 'ROUTE'
  | 'INSPECTION'
  | 'CERTIFICATE'
  | 'LINEAGE_DAG';

export type VerificationRelationship =
  | 'CONTRADICTS_CLAIM'
  | 'SUPPORTS_CLAIM'
  | 'CONTEXT_ONLY'
  | 'INCONCLUSIVE';

export interface VerificationFactor {
  factorId: string;
  name: string;
  category: VerificationFactorCategory;
  isAvailable: boolean;
  observation: string;
  relationship: VerificationRelationship;
  evidenceRefId?: string;
  timestamp?: string;
}

export interface ClaimEvidence {
  evidenceId: string;
  sourceType: VerificationFactorCategory;
  title: string;
  timestamp: string;
  observation: string;
  relationship: VerificationRelationship;
  dataUnavailable?: boolean;
}

export interface Claim {
  claimId: string;
  batchId: string;
  batchCode: string;
  title: string;
  claimStatement: string;
  category:
    | 'CONTAMINATION'
    | 'COLD_CHAIN_FAILURE'
    | 'TEMPERATURE_EXCURSION'
    | 'STORAGE_FAILURE'
    | 'TRANSPORT_INTERRUPTION'
    | 'ORIGIN_MISREPRESENTATION'
    | 'QUALITY_DEFECT'
    | 'PROCESSING_TAMPERING'
    | 'CERTIFICATION_FRAUD';
  status: VerificationStatus;
  submittedAt: string;
  lastVerifiedAt: string;
  reason: string;
  factorSummary: {
    contradictingCount: number;
    supportingCount: number;
    contextOnlyCount: number;
    unavailableCount: number;
  };
  factors: VerificationFactor[];
  missingEvidenceList?: string[];
  isHumanReviewed?: boolean;
  reviewerRole?: StakeholderRole;
  reviewerName?: string;
  reviewerNotes?: string;
  isReviewerNotesPublic?: boolean;
  reviewDecisionNotes?: string;
  reviewedAt?: string;
  attachedEvidenceRefs?: string[];
}

