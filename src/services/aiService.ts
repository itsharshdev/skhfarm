import { AIAnalysisRecord, SafetyRiskAlert, AISeverity, SafetyStatusType } from '../types';

export const INITIAL_AI_RECORDS: AIAnalysisRecord[] = [
  {
    id: 'AI-REC-WHT-01',
    batchId: 'WHT-MH-2026-001',
    type: 'STORAGE_EXCURSION_RISK',
    title: 'Solar Smart Storage Thermal Stability: Nominal',
    result: 'Stable Core Temperature Profile (21.4°C ±0.8°C)',
    confidence: 0.96,
    severity: 'LOW',
    explanation: 'Thermal forecast model evaluated 48-hour historical solar micro-climate telemetry. Storage temperature remained continuously within the safe wheat storage envelope (15.0°C – 24.0°C). Solar PV generation provided 98.4% uptime.',
    affectedStage: 'Solar Smart Hub Cold Storage',
    storageUnitId: 'SOLAR-HUB-KPG-01',
    modelVersion: 'CropThermo-Predict-v1.8.2',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isDemoState: true,
    recommendedAction: 'Continue nominal solar-assisted aeration schedule. No manual intervention required.',
  },
  {
    id: 'AI-REC-WHT-02',
    batchId: 'WHT-MH-2026-001',
    type: 'SHELF_LIFE_PREDICTION',
    title: 'Dynamic Shelf-Life Expectancy: +42 Days Over Baseline',
    result: 'Projected Total Usability: 407 Days (Nominal 365 Days)',
    confidence: 0.91,
    severity: 'LOW',
    explanation: 'Due to consistent low-humidity solar warehouse storage (52% RH) and absence of moisture spikes, wheat endosperm vitality degradation is 14% slower than open-air storage baselines.',
    affectedStage: 'Farm & Mandi Custody',
    modelVersion: 'AgriShelfLife-ML-v3.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isDemoState: true,
    recommendedAction: 'Eligible for premium Grade A milling certification.',
  },
  {
    id: 'AI-REC-BIS-01',
    batchId: 'BIS-2026-092',
    type: 'ANOMALY_DETECTION',
    title: 'Multi-Parent Ingredient Lineage Verification',
    result: '100% Upstream Batch Provenance Match',
    confidence: 0.98,
    severity: 'LOW',
    explanation: 'Graph traversal algorithm verified all 3 upstream parent inputs (Organic Wheat WHT-MH-2026-001, Sulfurless Sugar SGR-MH-2026-088, Fresh Milk MLK-ND-2026-012). Zero unauthorized lot mixing detected.',
    affectedStage: 'Baking & Packaging Plant',
    modelVersion: 'DAG-IntegrityNet-v2.4',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isDemoState: true,
    recommendedAction: 'Proceed with retail batch distribution. Traceability complete.',
  },
  {
    id: 'AI-REC-TOM-01',
    batchId: 'TOM-MH-CONTAM-2026',
    type: 'CONTAMINATION_DETECTION',
    title: 'High Chemical Residue Anomaly Detected',
    result: 'Synthetic Organophosphate Pesticide Residue Flag (0.24 mg/kg vs 0.05 MRL)',
    confidence: 0.94,
    severity: 'CRITICAL',
    explanation: 'Spectroscopic lab screening and vision analysis detected synthetic pesticide residue surpassing Maximum Residue Limits (MRL). Farm claimed 100% organic certification.',
    affectedStage: 'Regional Mandi Inward Inspection',
    evidenceRef: 'LAB-RES-TOM-8902',
    modelVersion: 'FarmVision-SpectralAI-v2.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    isDemoState: true,
    recommendedAction: 'Enact immediate batch quarantine. Block downstream dispatch and alert State Food Safety Authority.',
  },
  {
    id: 'AI-REC-MLK-01',
    batchId: 'MLK-ND-2026-012',
    type: 'STORAGE_EXCURSION_RISK',
    title: 'Reefer Transit Temperature Spike Warning',
    result: 'Temperature Excursion (+7.2°C for 42 minutes)',
    confidence: 0.89,
    severity: 'MEDIUM',
    explanation: 'During highway transit near Ahmednagar, reefer compressor switched to backup auxiliary generator during a grid transition, causing a transient 3.2°C temperature elevation above the 4.0°C chill limit.',
    affectedStage: 'Chilled Reefer Transit Hop #2',
    storageUnitId: 'REEFER-TRUCK-MH-12',
    modelVersion: 'ColdGuard-StreamML-v1.5',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    isDemoState: true,
    recommendedAction: 'Execute rapid titration & bacterial culture screening at receiving dock before blending.',
  },
];

export const INITIAL_SAFETY_ALERTS: SafetyRiskAlert[] = [
  {
    id: 'ALERT-RISK-001',
    batchId: 'TOM-MH-CONTAM-2026',
    productName: 'Organic Table Tomatoes (Lot #TOM-CONTAM)',
    severity: 'CRITICAL',
    statusType: 'CONTAMINATION_FLAG',
    title: 'Active Chemical Contamination Quarantine',
    description: 'Pesticide residue screen exceeded certified maximum limits. Immediate isolation protocol initiated.',
    detectedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    detectedBy: 'Nashik District Food Safety Laboratory (Inspector S. Deshmukh)',
    affectedLocations: ['Nashik Regional Mandi Yard 2', 'Cold Storage Shed 3'],
    downstreamBatchesAffected: ['TOM-SAUCE-2026-PREMIX (Blocked)'],
    resolved: false,
  },
  {
    id: 'ALERT-RISK-002',
    batchId: 'MLK-ND-2026-012',
    productName: 'Fresh Whole Dairy Milk (Chilled Tanker #12)',
    severity: 'MEDIUM',
    statusType: 'ANOMALY_DETECTED',
    title: 'Cold-Chain Transient Excursion',
    description: 'Reefer vehicle auxiliary power switchover caused 42-minute temperature rise to 7.2°C.',
    detectedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    detectedBy: 'Solar Telemetry Gateway Node #TK-09',
    affectedLocations: ['Highway NH-60 Transit Corridor', 'Chitale Dairy Receiving Dock'],
    downstreamBatchesAffected: [],
    resolved: true,
    resolutionNotes: 'Dock lab re-test confirmed microbial safety within Grade A milk threshold. Score penalty restored.',
  },
];

class AIService {
  private records: AIAnalysisRecord[] = [...INITIAL_AI_RECORDS];
  private alerts: SafetyRiskAlert[] = [...INITIAL_SAFETY_ALERTS];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedRecords = localStorage.getItem('farm_tracer_ai_records_v1');
      if (storedRecords) this.records = JSON.parse(storedRecords);
      const storedAlerts = localStorage.getItem('farm_tracer_safety_alerts_v1');
      if (storedAlerts) this.alerts = JSON.parse(storedAlerts);
    } catch (e) {
      console.warn('AI service storage load error', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('farm_tracer_ai_records_v1', JSON.stringify(this.records));
      localStorage.setItem('farm_tracer_safety_alerts_v1', JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('AI service storage save error', e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public async getAIAnalysisForBatch(batchId: string): Promise<AIAnalysisRecord[]> {
    const matched = this.records.filter((r) => r.batchId === batchId);
    if (matched.length > 0) {
      return matched;
    }

    // Generate dynamic fallback AI record if not present
    const genericRecord: AIAnalysisRecord = {
      id: `AI-GEN-${batchId}`,
      batchId,
      type: 'ANOMALY_DETECTION',
      title: 'Automated AI Integrity Inspection',
      result: 'Standard Trace & Telemetry Patterns Within Normal Variance',
      confidence: 0.93,
      severity: 'LOW',
      explanation: 'AI inference pipeline verified batch custody transfer intervals, environmental range limits, and digital signature validity. No suspicious anomalies detected.',
      modelVersion: 'FarmTracer-IntegrityAI-v2.1',
      timestamp: new Date().toISOString(),
      isDemoState: true,
      recommendedAction: 'Standard custodial workflow maintained.',
    };

    return [genericRecord];
  }

  public async runAIDiagnosis(batchId: string): Promise<AIAnalysisRecord[]> {
    // Simulate AI inference calculation
    await new Promise((res) => setTimeout(res, 900));

    const newRecord: AIAnalysisRecord = {
      id: `AI-DIAG-${Date.now()}`,
      batchId,
      type: 'STORAGE_EXCURSION_RISK',
      title: 'Live Edge-AI Micro-Climate & Shelf-Life Inference',
      result: 'Storage Thermal Stability 99.1% · Zero Micro-Bacterial Growth Risk',
      confidence: 0.95,
      severity: 'LOW',
      explanation: 'Model combined live solar battery reserves, external ambient heatwave index, and thermal insulation conductivity. Storage unit operating at peak energy efficiency with zero risk of cold-chain break.',
      affectedStage: 'Active Cold Storage Unit',
      modelVersion: 'FarmVision-EdgePredict-v3.2',
      timestamp: new Date().toISOString(),
      isDemoState: true,
      recommendedAction: 'Maintain current solar storage setpoint at 21.0°C.',
    };

    this.records.unshift(newRecord);
    this.saveToStorage();
    this.notify();
    return this.getAIAnalysisForBatch(batchId);
  }

  public async getAllSafetyAlerts(): Promise<SafetyRiskAlert[]> {
    return [...this.alerts];
  }

  public async resolveAlert(alertId: string, resolutionNotes: string): Promise<void> {
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          resolved: true,
          resolutionNotes: resolutionNotes || 'Resolved by Food Safety Authority after verified re-inspection.',
        };
      }
      return a;
    });
    this.saveToStorage();
    this.notify();
  }

  public async createAlert(alertData: Omit<SafetyRiskAlert, 'id' | 'detectedAt' | 'resolved'>): Promise<SafetyRiskAlert> {
    const newAlert: SafetyRiskAlert = {
      id: `ALERT-${Date.now()}`,
      ...alertData,
      detectedAt: new Date().toISOString(),
      resolved: false,
    };
    this.alerts.unshift(newAlert);
    this.saveToStorage();
    this.notify();
    return newAlert;
  }
}

export const aiService = new AIService();
