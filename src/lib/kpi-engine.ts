import { 
  KpiScoringConfig, 
  KpiTierThresholds, 
  KpiWorkItemRule, 
  KpiWorkItemType, 
  PerformanceTier, 
  KpiLeaderboardEntry 
} from './types';

export interface ScoringRule {
  workItemType: KpiWorkItemType;
  basePoints: number;
  onTimeBonus: number;
  overduePenaltyPerDay: number;
}

export const DEFAULT_KPI_CONFIG: KpiScoringConfig = {
  attendanceOnTimeBonus: 10,
  tierThresholds: {
    needsImprovementMax: 149,
    satisfactoryMin: 150,
    commendableMin: 300,
    exemplaryMin: 450,
  },
  rules: {
    PROJECT_TASK: {
      workItemType: 'PROJECT_TASK',
      label: 'Project Task Deliverable',
      description: 'Assigned engineering, field, or analytical task in PM tracker',
      basePoints: 50,
      onTimeBonus: 15,
      overduePenaltyPerDay: 5,
    },
    FIELD_FORM: {
      workItemType: 'FIELD_FORM',
      label: 'Field Data Record / Survey',
      description: 'Borehole log, water quality sampling, or geotech field capture',
      basePoints: 30,
      onTimeBonus: 10,
      overduePenaltyPerDay: 3,
    },
    QA_REVIEW: {
      workItemType: 'QA_REVIEW',
      label: 'QA/QC Technical Peer Review',
      description: 'Senior peer review sign-off or deliverable validation gate',
      basePoints: 40,
      onTimeBonus: 15,
      overduePenaltyPerDay: 10,
    },
    DESIGN_ASSET: {
      workItemType: 'DESIGN_ASSET',
      label: 'Design & CAD Deliverable',
      description: 'CAD drawing, GIS contour map, bathymetric model, or report asset',
      basePoints: 35,
      onTimeBonus: 10,
      overduePenaltyPerDay: 5,
    },
    IT_TICKET: {
      workItemType: 'IT_TICKET',
      label: 'IT & Infrastructure Ticket',
      description: 'Internal support resolution, server maintenance, or hardware fix',
      basePoints: 15,
      onTimeBonus: 5,
      overduePenaltyPerDay: 2,
    },
    WON_TENDER: {
      workItemType: 'WON_TENDER',
      label: 'Commercial BD / Won Tender',
      description: 'Secured client RFP contract or commercial bid milestone',
      basePoints: 100,
      onTimeBonus: 25,
      overduePenaltyPerDay: 10,
    },
  },
};

export const SCORING_RULES: Record<string, ScoringRule> = DEFAULT_KPI_CONFIG.rules;

export function calculateEventPoints(
  type: keyof typeof DEFAULT_KPI_CONFIG.rules,
  dueDate: string,
  completionDate: string,
  customRule?: KpiWorkItemRule
): { totalPoints: number; breakdown: { base: number; bonus: number; penalty: number; isOnTime: boolean; daysLate: number } } {
  const rule = customRule || DEFAULT_KPI_CONFIG.rules[type] || DEFAULT_KPI_CONFIG.rules.PROJECT_TASK;
  const due = new Date(dueDate).getTime();
  const completed = new Date(completionDate).getTime();

  let bonus = 0;
  let penalty = 0;
  let daysLate = 0;
  const isOnTime = completed <= due;

  if (isOnTime) {
    bonus = rule.onTimeBonus;
  } else {
    const diffMs = completed - due;
    daysLate = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    penalty = daysLate * rule.overduePenaltyPerDay;
  }

  const totalPoints = Math.max(5, rule.basePoints + bonus - penalty);

  return {
    totalPoints,
    breakdown: {
      base: rule.basePoints,
      bonus,
      penalty,
      isOnTime,
      daysLate,
    },
  };
}

export interface TierInfo {
  tier: PerformanceTier;
  label: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgDarkColor: string;
  iconType: 'crown' | 'sparkles' | 'check' | 'alert';
  minScore: number;
}

export function getPerformanceTier(
  score: number, 
  thresholds: KpiTierThresholds = DEFAULT_KPI_CONFIG.tierThresholds
): TierInfo {
  if (score >= thresholds.exemplaryMin) {
    return {
      tier: 'EXEMPLARY',
      label: 'Exemplary Performer',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-400 dark:border-amber-500/50',
      bgDarkColor: 'bg-amber-500/10',
      iconType: 'crown',
      minScore: thresholds.exemplaryMin,
    };
  }

  if (score >= thresholds.commendableMin) {
    return {
      tier: 'COMMENDABLE',
      label: 'Commendable',
      badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-400 dark:border-indigo-500/50',
      bgDarkColor: 'bg-indigo-500/10',
      iconType: 'sparkles',
      minScore: thresholds.commendableMin,
    };
  }

  if (score >= thresholds.satisfactoryMin) {
    return {
      tier: 'SATISFACTORY',
      label: 'Satisfactory',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-400 dark:border-emerald-500/50',
      bgDarkColor: 'bg-emerald-500/10',
      iconType: 'check',
      minScore: thresholds.satisfactoryMin,
    };
  }

  return {
    tier: 'NEEDS_IMPROVEMENT',
    label: 'Needs Improvement',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-400 dark:border-rose-500/50',
    bgDarkColor: 'bg-rose-500/10',
    iconType: 'alert',
    minScore: 0,
  };
}

export interface SimulatedEntryComparison {
  userId: string;
  name: string;
  avatar?: string;
  jobTitle: string;
  departmentName: string;
  currentScore: number;
  currentRank: number;
  currentTier: TierInfo;
  simulatedScore: number;
  simulatedRank: number;
  simulatedTier: TierInfo;
  scoreDelta: number;
  rankDelta: number; // positive means climbed, negative means dropped, 0 unchanged
  tierChanged: boolean;
}

export function simulateLeaderboardRecalculation(
  currentEntries: KpiLeaderboardEntry[],
  oldConfig: KpiScoringConfig,
  newConfig: KpiScoringConfig
): SimulatedEntryComparison[] {
  // Delta in base task weight
  const oldBase = oldConfig.rules.PROJECT_TASK.basePoints;
  const newBase = newConfig.rules.PROJECT_TASK.basePoints;
  const baseDelta = newBase - oldBase;

  // Delta in on-time bonus
  const oldBonus = oldConfig.rules.PROJECT_TASK.onTimeBonus;
  const newBonus = newConfig.rules.PROJECT_TASK.onTimeBonus;
  const bonusDelta = newBonus - oldBonus;

  // Delta in penalty per day
  const oldPenalty = oldConfig.rules.PROJECT_TASK.overduePenaltyPerDay;
  const newPenalty = newConfig.rules.PROJECT_TASK.overduePenaltyPerDay;
  const penaltyDelta = newPenalty - oldPenalty;

  // Delta in attendance punctuality
  const attendanceDelta = newConfig.attendanceOnTimeBonus - oldConfig.attendanceOnTimeBonus;

  // Calculate unranked simulated entries
  const unranked = currentEntries.map(entry => {
    // Deliverable adjustments
    const completionAdjustment = entry.completedCount * baseDelta;
    const onTimeAdjustment = entry.onTimeCount * bonusDelta;
    const overdueAdjustment = entry.overdueCount * (penaltyDelta * 2); // average 2 days late
    const punctualityAdjustment = entry.onTimeCount * attendanceDelta;

    const netScoreDelta = completionAdjustment + onTimeAdjustment - overdueAdjustment + punctualityAdjustment;
    const simulatedScore = Math.max(15, entry.totalScore + netScoreDelta);

    return {
      userId: entry.userId,
      name: entry.name,
      avatar: entry.avatar,
      jobTitle: entry.jobTitle,
      departmentName: entry.departmentName,
      currentScore: entry.totalScore,
      currentRank: entry.rankPosition,
      simulatedScore,
      scoreDelta: netScoreDelta,
    };
  });

  // Sort by simulated score descending
  const sorted = [...unranked].sort((a, b) => b.simulatedScore - a.simulatedScore);

  // Build final comparison
  return sorted.map((item, index) => {
    const simulatedRank = index + 1;
    const rankDelta = item.currentRank - simulatedRank; // e.g. was 3, now 1 -> +2 climbed
    const currentTier = getPerformanceTier(item.currentScore, oldConfig.tierThresholds);
    const simulatedTier = getPerformanceTier(item.simulatedScore, newConfig.tierThresholds);

    return {
      userId: item.userId,
      name: item.name,
      avatar: item.avatar,
      jobTitle: item.jobTitle,
      departmentName: item.departmentName,
      currentScore: item.currentScore,
      currentRank: item.currentRank,
      currentTier,
      simulatedScore: item.simulatedScore,
      simulatedRank,
      simulatedTier,
      scoreDelta: item.scoreDelta,
      rankDelta,
      tierChanged: currentTier.tier !== simulatedTier.tier,
    };
  });
}

