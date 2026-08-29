import { FarmerReputationMetrics, FarmerBadge } from '../types';

export const DEFAULT_FARMER_BADGES: FarmerBadge[] = [
  {
    id: 'BADGE-01',
    title: 'Verified Origin',
    description: '100% farm plot coordinates and identity verified with digital land record verification.',
    iconName: 'ShieldCheck',
    earnedDate: '2025-11-14',
    tier: 'GOLD',
  },
  {
    id: 'BADGE-02',
    title: 'Consistent Quality',
    description: '94% average moisture & endosperm grain vitality rating across all registered harvest seasons.',
    iconName: 'Sparkles',
    earnedDate: '2025-12-20',
    tier: 'PLATINUM',
  },
  {
    id: 'BADGE-03',
    title: 'Complete Camera Records',
    description: 'Zero missing evidence handoffs. 100% live device-camera proofs attached at harvest.',
    iconName: 'CheckCircle2',
    earnedDate: '2026-01-08',
    tier: 'GOLD',
  },
  {
    id: 'BADGE-04',
    title: 'Reliable Handoffs',
    description: 'Zero dispute rate across 28 mandi custodial transfers and cold-storage intakes.',
    iconName: 'Award',
    earnedDate: '2026-02-01',
    tier: 'PLATINUM',
  },
  {
    id: 'BADGE-05',
    title: 'Traceability Champion',
    description: 'Ranked in the top 5% of transparent organic producers in Ahmednagar Agricultural District.',
    iconName: 'Star',
    earnedDate: '2026-02-18',
    tier: 'PLATINUM',
  },
];

export class ReputationService {
  public getFarmerReputation(farmerId: string, farmerName: string): FarmerReputationMetrics {
    return {
      farmerId,
      farmerName: farmerName || 'Ramesh Patil',
      organizationName: 'Kopargaon Organic Farmer Producer Org (FPO)',
      qualityScoreTrend: [
        { month: 'Oct', score: 88 },
        { month: 'Nov', score: 91 },
        { month: 'Dec', score: 94 },
        { month: 'Jan', score: 96 },
        { month: 'Feb', score: 98 },
      ],
      traceabilityScoreTrend: [
        { month: 'Oct', score: 82 },
        { month: 'Nov', score: 89 },
        { month: 'Dec', score: 92 },
        { month: 'Jan', score: 97 },
        { month: 'Feb', score: 99 },
      ],
      totalBatchesRegistered: 14,
      verifiedHandoffsCount: 28,
      zeroDisputeRatePercent: 100,
      averageBatchScore: 97,
      badges: DEFAULT_FARMER_BADGES,
      improvementSuggestions: [
        'Maintain solar smart storage moisture below 12.0% to preserve Grade A premium status.',
        'Record short 5-second live video at collection point for instant 10/10 evidence score.',
        'Invite mandi buyers to inspect real-time batch QR to expedite auction clearing time.',
      ],
    };
  }
}

export const reputationService = new ReputationService();
