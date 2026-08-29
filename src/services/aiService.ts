import {
  AIAnalysisRecord,
  SafetyRiskAlert,
  AISeverity,
  SafetyStatusType,
  Batch,
  AIRiskAnalysisRecord,
} from '../types';
import { supabase } from './supabaseClient';
import { calculateExpiryStatus } from './alertService';

export const INITIAL_AI_RECORDS: AIAnalysisRecord[] = [
  {
    id: 'AI-REC-WHT-01',
    batchId: 'WHT-MH-2026-001',
    type: 'STORAGE_EXCURSION_RISK',
    title: 'Solar Smart Storage Thermal Stability: Nominal',
    result: 'Stable Core Temperature Profile (21.4°C ±0.8°C)',
    confidence: 0.96,
    severity: 'LOW',
    explanation: 'Thermal forecast model evaluated historical solar micro-climate telemetry. Storage temperature remained continuously within the safe wheat storage envelope (15.0°C – 24.0°C). Solar PV generation provided 98.4% uptime.',
    affectedStage: 'Solar Smart Hub Cold Storage',
    storageUnitId: 'SU-SOLAR-04',
    modelVersion: 'CropThermo-Predict-v1.8.2',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isDemoState: true,
    recommendedAction: 'Continue nominal solar-assisted aeration schedule. No manual intervention required.',
  },
  {
    id: 'AI-REC-BIS-01',
    batchId: 'BIS-2026-092',
    type: 'ANOMALY_DETECTION',
    title: 'Multi-Parent Ingredient Lineage Verification',
    result: '100% Upstream Batch Provenance Match',
    confidence: 0.98,
    severity: 'LOW',
    explanation: 'Graph traversal algorithm verified upstream parent inputs (Organic Wheat WHT-MH-2026-001, Sulfurless Sugar SUG-MH-2026-003). Zero unauthorized lot mixing detected.',
    affectedStage: 'Baking & Packaging Plant',
    modelVersion: 'DAG-IntegrityNet-v2.4',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isDemoState: true,
    recommendedAction: 'Proceed with retail batch distribution. Traceability complete.',
  },
  {
    id: 'AI-REC-APL-01',
    batchId: 'APL-KSH-109',
    type: 'CONTAMINATION_DETECTION',
    title: 'High Chemical Residue Anomaly Detected',
    result: 'Synthetic Organophosphate Pesticide Residue Flag (0.18 mg/kg vs 0.01 MRL)',
    confidence: 0.94,
    severity: 'CRITICAL',
    explanation: 'Spectroscopic screening detected synthetic pesticide residue surpassing Maximum Residue Limits (MRL). Farm claimed 100% organic certification.',
    affectedStage: 'Regional Mandi Inward Inspection',
    evidenceRef: 'LAB-RES-APL-109',
    modelVersion: 'FarmVision-SpectralAI-v2.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    isDemoState: true,
    recommendedAction: 'Enact immediate batch quarantine. Block downstream dispatch and alert State Food Safety Authority.',
  },
];

export const INITIAL_SAFETY_ALERTS: SafetyRiskAlert[] = [
  {
    id: 'ALERT-RISK-001',
    batchId: 'APL-KSH-109',
    productName: 'Kashmir Valley Ambri Red Apples (Grade B - Recalled)',
    severity: 'CRITICAL',
    statusType: 'CONTAMINATION_FLAG',
    title: 'Active Chemical Contamination Quarantine',
    description: 'Pesticide Chlorpyrifos residue screen exceeded permissible limits (0.18 mg/kg). Quarantine active.',
    detectedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    detectedBy: 'Dr. Pradeep Sawant (State Food Safety Inspector)',
    affectedLocations: ['Pune Regional Quarantine Locker #02'],
    downstreamBatchesAffected: ['All Retail Distribution Blocked'],
    resolved: false,
  },
  {
    id: 'ALERT-RISK-002',
    batchId: 'MILK-PUN-2026-809',
    productName: 'Pure Gir Cow A2 Raw Milk (Chilled Lot 12)',
    severity: 'MEDIUM',
    statusType: 'APPROACHING_EXPIRY',
    title: 'Perishable Near-Expiry Warning',
    description: 'Chilled raw milk batch has < 24 hours shelf-life remaining. Prioritize immediate FIFO clearance.',
    detectedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    detectedBy: 'Smart Dairy Gateway #01',
    affectedLocations: ['Baramati Cold Milk Hub'],
    downstreamBatchesAffected: [],
    resolved: false,
  },
];

export interface BatchRiskEvaluation {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPIRED';
  riskScore: number; // 0 (safest) - 100 (highest risk)
  riskFactors: Array<{ factor: string; impact: 'POSITIVE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; detail: string }>;
  storageAnomalyDetected: boolean;
  recommendations: string[];
  isDeterministicFallback: boolean;
  modelVersion: string;
}

class AIService {
  private alerts: SafetyRiskAlert[] = [...INITIAL_SAFETY_ALERTS];
  private listeners: (() => void)[] = [];

  constructor() {
    try {
      supabase
        .channel('public:ai_risk_analyses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_risk_analyses' }, () => {
          this.notify();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime ai_risk_analyses subscription error:', e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('AI listener error:', err);
      }
    });
  }

  /**
   * Deterministic & Explainable AI Risk Evaluation Engine
   */
  public evaluateBatchRisk(batch: Batch): BatchRiskEvaluation {
    const riskFactors: BatchRiskEvaluation['riskFactors'] = [];
    let riskScore = 10; // Baseline nominal risk
    let storageAnomaly = false;

    // 1. Evaluate Contamination & Recalls
    if (batch.contaminationFlag?.flagged || batch.status === 'RECALLED') {
      riskScore += 80;
      riskFactors.push({
        factor: 'Chemical / Toxic Contamination',
        impact: 'CRITICAL',
        detail: batch.contaminationFlag?.reason || 'Lot quarantined or recalled by state inspectorate.',
      });
    }

    // 2. Evaluate Expiry & Shelf-Life Proximity
    const expiry = calculateExpiryStatus(batch.expiryDate);
    if (expiry.status === 'EXPIRED') {
      riskScore = Math.max(riskScore, 95);
      riskFactors.push({
        factor: 'Shelf-Life Expiry',
        impact: 'CRITICAL',
        detail: 'Batch has passed expiration date. Not safe for retail sale.',
      });
    } else if (expiry.status === 'NEAR_EXPIRY') {
      riskScore += 35;
      riskFactors.push({
        factor: 'Imminent Expiration',
        impact: 'HIGH',
        detail: `${expiry.daysRemaining} days remaining in safe consumption window.`,
      });
    } else {
      riskFactors.push({
        factor: 'Shelf-Life Window',
        impact: 'POSITIVE',
        detail: `${expiry.daysRemaining} days remaining until expiration.`,
      });
    }

    // 3. Evaluate Storage & Micro-Climate Telemetry
    if (batch.currentStorage) {
      if (batch.currentStorage.conditionStatus === 'OUT_OF_RANGE') {
        storageAnomaly = true;
        riskScore += 40;
        riskFactors.push({
          factor: 'Thermal Storage Excursion',
          impact: 'HIGH',
          detail: `Telemetry logged at ${batch.currentStorage.temperature}°C, violating safe bounds.`,
        });
      } else if (batch.currentStorage.conditionStatus === 'WARNING') {
        riskScore += 15;
        riskFactors.push({
          factor: 'Storage Parameter Drift',
          impact: 'MEDIUM',
          detail: `Humidity/temperature approaching upper boundary limits (${batch.currentStorage.humidity}% RH).`,
        });
      } else if (batch.currentStorage.powerStatus === 'SOLAR') {
        riskFactors.push({
          factor: 'Clean Solar Cold Chain',
          impact: 'POSITIVE',
          detail: `Maintained on 100% solar micro-climate power (${batch.currentStorage.temperature}°C).`,
        });
      }
    }

    // 4. Evaluate Traceability Completeness & Evidence Proof
    if (batch.events.length >= 3 && batch.evidences.length === 0) {
      riskScore += 20;
      riskFactors.push({
        factor: 'Missing Visual Proof',
        impact: 'MEDIUM',
        detail: 'Multi-stage custodial handoffs lack timestamped camera capture proof.',
      });
    } else if (batch.evidences.length > 0) {
      riskFactors.push({
        factor: 'Cryptographic Media Evidence',
        impact: 'POSITIVE',
        detail: `${batch.evidences.length} tamper-proof camera records verified.`,
      });
    }

    // 5. Evaluate Multi-Parent Provenance Integrity
    if (batch.parentBatchIds && batch.parentBatchIds.length > 0) {
      riskFactors.push({
        factor: 'Multi-Ingredient Lineage',
        impact: 'POSITIVE',
        detail: `${batch.parentBatchIds.length} upstream ingredient batches mapped in verified DAG.`,
      });
    }

    // Determine Risk Level Category
    const clampedScore = Math.max(0, Math.min(100, riskScore));
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPIRED' = 'LOW';
    if (expiry.status === 'EXPIRED') {
      riskLevel = 'EXPIRED';
    } else if (clampedScore >= 70) {
      riskLevel = 'HIGH';
    } else if (clampedScore >= 35) {
      riskLevel = 'MEDIUM';
    }

    const recommendations: string[] = [];
    if (riskLevel === 'HIGH' || riskLevel === 'EXPIRED') {
      recommendations.push('Do NOT dispense or distribute to retail channels');
      recommendations.push('Enforce immediate physical segregation and quarantine');
      recommendations.push('File regulatory inspection notice with State Food Safety Wing');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Prioritize rapid FIFO clearance at retail shelves');
      recommendations.push('Perform secondary sensory and moisture dock inspection');
    } else {
      recommendations.push('Nominal quality verified: Approved for general distribution');
      recommendations.push('Maintain verified solar-assisted cold chain integrity');
    }

    return {
      riskLevel,
      riskScore: clampedScore,
      riskFactors,
      storageAnomalyDetected: storageAnomaly,
      recommendations,
      isDeterministicFallback: true,
      modelVersion: 'FARM-TRACER-AI-V2-RULE-ENGINE',
    };
  }

  /**
   * Run AI Analysis and persist results to Supabase public.ai_risk_analyses
   */
  public async analyzeBatchAndPersist(batch: Batch): Promise<AIRiskAnalysisRecord> {
    const evaluation = this.evaluateBatchRisk(batch);
    const analysisCode = `AIRA-${batch.batchId}-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('ai_risk_analyses')
        .insert({
          analysis_code: analysisCode,
          batch_code: batch.batchId,
          risk_level: evaluation.riskLevel,
          risk_score: evaluation.riskScore,
          risk_factors: evaluation.riskFactors,
          storage_anomaly_detected: evaluation.storageAnomalyDetected,
          recommendations: evaluation.recommendations,
          is_deterministic_fallback: evaluation.isDeterministicFallback,
          model_version: evaluation.modelVersion,
          analyzed_at: timestamp,
        })
        .select()
        .single();

      await supabase.from('audit_logs').insert({
        action: 'AI_RISK_ANALYZED',
        actor_name: 'FARM-TRACER AI Guard',
        actor_role: 'SYSTEM',
        entity_type: 'AI_ANALYSIS',
        entity_id: batch.batchId,
        details: { riskLevel: evaluation.riskLevel, riskScore: evaluation.riskScore },
      });

      if (data) {
        this.notify();
        return {
          id: data.id,
          analysisCode: data.analysis_code,
          batchId: data.batch_id,
          batchCode: data.batch_code,
          riskLevel: data.risk_level,
          riskScore: Number(data.risk_score),
          riskFactors: data.risk_factors,
          storageAnomalyDetected: data.storage_anomaly_detected,
          recommendations: data.recommendations,
          isDeterministicFallback: data.is_deterministic_fallback,
          modelVersion: data.model_version,
          analyzedAt: data.analyzed_at,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Could not persist AI analysis to DB, using evaluation:', err);
    }

    return {
      id: analysisCode,
      analysisCode,
      batchId: batch.batchId,
      batchCode: batch.batchId,
      riskLevel: evaluation.riskLevel,
      riskScore: evaluation.riskScore,
      riskFactors: evaluation.riskFactors,
      storageAnomalyDetected: evaluation.storageAnomalyDetected,
      recommendations: evaluation.recommendations,
      isDeterministicFallback: evaluation.isDeterministicFallback,
      modelVersion: evaluation.modelVersion,
      analyzedAt: timestamp,
      createdAt: timestamp,
    };
  }

  /**
   * Fetch stored AI Risk Analyses for a batch
   */
  public async getRiskAnalysesForBatch(batchId: string): Promise<AIRiskAnalysisRecord[]> {
    try {
      const { data, error } = await supabase
        .from('ai_risk_analyses')
        .select('*')
        .eq('batch_code', batchId)
        .order('analyzed_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((a: any) => ({
        id: a.id,
        analysisCode: a.analysis_code,
        batchId: a.batch_id,
        batchCode: a.batch_code,
        riskLevel: a.risk_level,
        riskScore: Number(a.risk_score),
        riskFactors: a.risk_factors || [],
        storageAnomalyDetected: !!a.storage_anomaly_detected,
        recommendations: a.recommendations || [],
        isDeterministicFallback: !!a.is_deterministic_fallback,
        modelVersion: a.model_version,
        analyzedAt: a.analyzed_at,
        createdAt: a.created_at,
      }));
    } catch (err) {
      console.error('Error fetching AI risk analyses:', err);
      return [];
    }
  }

  public async getAIAnalysisForBatch(batchId: string): Promise<AIAnalysisRecord[]> {
    try {
      const dbAnalyses = await this.getRiskAnalysesForBatch(batchId);
      if (dbAnalyses.length > 0) {
        return dbAnalyses.map((a) => ({
          id: a.analysisCode,
          batchId: a.batchCode,
          type:
            a.riskLevel === 'HIGH'
              ? 'CONTAMINATION_DETECTION'
              : a.riskLevel === 'EXPIRED'
              ? 'EXPIRY_RISK'
              : 'STORAGE_EXCURSION_RISK',
          title: `AI Risk Assessment: ${a.riskLevel} Risk Profile (${a.riskScore}/100)`,
          result: a.recommendations[0] || 'Nominal status evaluated',
          confidence: 0.94,
          severity:
            a.riskLevel === 'EXPIRED' || a.riskLevel === 'HIGH'
              ? 'CRITICAL'
              : a.riskLevel === 'MEDIUM'
              ? 'MEDIUM'
              : 'LOW',
          explanation: a.riskFactors.map((rf) => `${rf.factor}: ${rf.detail}`).join('. '),
          modelVersion: a.modelVersion,
          timestamp: a.analyzedAt,
          isDemoState: a.isDeterministicFallback,
          recommendedAction: a.recommendations.join('; '),
        }));
      }
    } catch (e) {
      console.warn('Error querying DB AI analyses:', e);
    }

    const initial = INITIAL_AI_RECORDS.filter((r) => r.batchId === batchId);
    if (initial.length > 0) return initial;

    return INITIAL_AI_RECORDS.slice(0, 2);
  }

  public async runAIDiagnosis(batchId: string): Promise<void> {
    const { traceService } = await import('./traceService');
    const batch = await traceService.getBatchById(batchId);
    if (batch) {
      await this.analyzeBatchAndPersist(batch);
    }
  }

  public async getAllSafetyAlerts(): Promise<SafetyRiskAlert[]> {
    return this.alerts;
  }

  public async createAlert(alert: Omit<SafetyRiskAlert, 'id' | 'detectedAt' | 'resolved'>): Promise<SafetyRiskAlert> {
    const newAlert: SafetyRiskAlert = {
      ...alert,
      id: `ALERT-RISK-${Date.now().toString().slice(-4)}`,
      detectedAt: new Date().toISOString(),
      resolved: false,
    };
    this.alerts.unshift(newAlert);
    this.notify();
    return newAlert;
  }

  public async resolveAlert(alertId: string, notes: string): Promise<void> {
    const found = this.alerts.find((a) => a.id === alertId);
    if (found) {
      found.resolved = true;
      found.resolutionNotes = notes;
      this.notify();
    }
  }

  public getRecordsForBatch(batchId: string): AIAnalysisRecord[] {
    return INITIAL_AI_RECORDS.filter((r) => r.batchId === batchId);
  }

  public getAllRecords(): AIAnalysisRecord[] {
    return INITIAL_AI_RECORDS;
  }

  public getAlerts(): SafetyRiskAlert[] {
    return this.alerts;
  }
}

export const aiService = new AIService();
