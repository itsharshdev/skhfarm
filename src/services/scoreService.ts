import { Batch, TraceScoreBreakdown } from '../types';

export function calculateBatchScore(batch: Partial<Batch>): TraceScoreBreakdown {
  const events = batch.events || [];
  const evidences = batch.evidences || [];
  const feedbacks = batch.feedbacks || [];
  const certificates = batch.certificates || [];
  const currentStorage = batch.currentStorage;
  const contamination = batch.contaminationFlag;

  // 1. Handoff Integrity (Max 20 pts)
  // Evaluates sequential custodial handoffs and completeness of event chain
  let handoffScore = 5; // Base for creation
  if (events.length >= 2) handoffScore += 5; // Mandi / Hub
  if (events.length >= 3) handoffScore += 4; // Storage / Mill
  if (events.length >= 5) handoffScore += 4; // Factory / Transit
  if (events.length >= 7) handoffScore += 2; // Retail
  handoffScore = Math.min(20, handoffScore);

  // 2. Trace Completeness (Max 20 pts)
  let completenessScore = 6;
  if (batch.origin && batch.originFarmerName) completenessScore += 4;
  if (batch.harvestDate || batch.productionDate) completenessScore += 3;
  if (batch.parentBatchIds && batch.parentBatchIds.length > 0) completenessScore += 4;
  if (batch.category && batch.variety) completenessScore += 3;
  completenessScore = Math.min(20, completenessScore);

  // 3. Verification & Certificates (Max 15 pts)
  let verificationScore = 5;
  const verifiedEvents = events.filter((e) => e.verificationState === 'VERIFIED').length;
  if (verifiedEvents > 0) {
    verificationScore += Math.min(6, verifiedEvents * 1.5);
  }
  if (certificates.length > 0) {
    verificationScore += Math.min(4, certificates.length * 2);
  }
  verificationScore = Math.min(15, Math.round(verificationScore));

  // 4. Product Quality & Condition (Max 20 pts)
  let qualityScore = 15;
  if (currentStorage) {
    if (currentStorage.conditionStatus === 'SAFE') {
      qualityScore = 19;
    } else if (currentStorage.conditionStatus === 'WARNING') {
      qualityScore = 14;
    } else if (currentStorage.conditionStatus === 'OUT_OF_RANGE') {
      qualityScore = 8;
    }
  }
  if (batch.category?.toLowerCase().includes('organic')) {
    qualityScore = Math.min(20, qualityScore + 1);
  }

  // 5. Evidence & Camera Proof (Max 10 pts)
  let evidenceScore = 3;
  if (evidences.length > 0) {
    evidenceScore += Math.min(7, evidences.length * 3);
  }
  evidenceScore = Math.min(10, evidenceScore);

  // 6. Stakeholder & Consumer Feedback (Max 10 pts)
  let feedbackScore = 6;
  if (feedbacks.length > 0) {
    const avgFeedback = feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length;
    feedbackScore = Math.round((avgFeedback / 100) * 10);
  }
  feedbackScore = Math.min(10, feedbackScore);

  // 7. Freshness (Max 5 pts)
  let freshnessScore = 5;
  if (batch.expiryDate) {
    const expiryTime = new Date(batch.expiryDate).getTime();
    const now = Date.now();
    const remainingDays = (expiryTime - now) / (1000 * 60 * 60 * 24);
    if (remainingDays < 0) {
      freshnessScore = 0;
    } else if (remainingDays < 3) {
      freshnessScore = 1;
    } else if (remainingDays < 14) {
      freshnessScore = 3;
    } else {
      freshnessScore = 5;
    }
  }

  // Penalties
  let contaminationPenalty = 0;
  if (contamination && contamination.flagged) {
    if (contamination.severity === 'CRITICAL') contaminationPenalty = 35;
    else if (contamination.severity === 'MEDIUM') contaminationPenalty = 20;
    else contaminationPenalty = 10;
  }

  let expiryPenalty = 0;
  if (batch.expiryDate) {
    const expiryTime = new Date(batch.expiryDate).getTime();
    const now = Date.now();
    const remainingDays = (expiryTime - now) / (1000 * 60 * 60 * 24);
    if (remainingDays < 0) {
      expiryPenalty = 30;
    } else if (remainingDays < 2) {
      expiryPenalty = 12;
    }
  }

  let anomalyPenalty = 0;
  if (currentStorage && currentStorage.conditionStatus === 'OUT_OF_RANGE') {
    anomalyPenalty = 15;
  }

  let missingEvidencePenalty = 0;
  if (events.length >= 3 && evidences.length === 0) {
    missingEvidencePenalty = 8;
  }

  const baseTotal =
    handoffScore +
    completenessScore +
    verificationScore +
    qualityScore +
    evidenceScore +
    feedbackScore +
    freshnessScore;

  const totalPenalties = contaminationPenalty + expiryPenalty + anomalyPenalty + missingEvidencePenalty;
  const clampedScore = Math.max(0, Math.min(100, Math.round(baseTotal - totalPenalties)));

  return {
    handoffScore,
    handoffMax: 20,
    completenessScore,
    completenessMax: 20,
    verificationScore,
    verificationMax: 15,
    qualityScore,
    qualityMax: 20,
    evidenceScore,
    evidenceMax: 10,
    feedbackScore,
    feedbackMax: 10,
    freshnessScore,
    freshnessMax: 5,
    penalties: {
      contaminationPenalty,
      anomalyPenalty,
      expiryPenalty,
      missingEvidencePenalty,
    },
    totalScore: clampedScore,
    modelName: 'FARM-TRACER 100-PT WEIGHTED INTEGRITY MODEL (V2)',
  };
}
