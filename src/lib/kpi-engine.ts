export interface ScoringRule {
  workItemType: 'PROJECT_TASK' | 'FIELD_FORM' | 'QA_REVIEW' | 'DESIGN_ASSET' | 'IT_TICKET' | 'WON_TENDER';
  basePoints: number;
  onTimeBonus: number;
  overduePenaltyPerDay: number;
}

export const SCORING_RULES: Record<string, ScoringRule> = {
  PROJECT_TASK: {
    workItemType: 'PROJECT_TASK',
    basePoints: 50,
    onTimeBonus: 15,
    overduePenaltyPerDay: 5,
  },
  FIELD_FORM: {
    workItemType: 'FIELD_FORM',
    basePoints: 30,
    onTimeBonus: 10,
    overduePenaltyPerDay: 3,
  },
  QA_REVIEW: {
    workItemType: 'QA_REVIEW',
    basePoints: 40,
    onTimeBonus: 15,
    overduePenaltyPerDay: 10,
  },
  DESIGN_ASSET: {
    workItemType: 'DESIGN_ASSET',
    basePoints: 35,
    onTimeBonus: 10,
    overduePenaltyPerDay: 5,
  },
  IT_TICKET: {
    workItemType: 'IT_TICKET',
    basePoints: 15,
    onTimeBonus: 5,
    overduePenaltyPerDay: 2,
  },
  WON_TENDER: {
    workItemType: 'WON_TENDER',
    basePoints: 100,
    onTimeBonus: 25,
    overduePenaltyPerDay: 10,
  }
};

export function calculateEventPoints(
  type: keyof typeof SCORING_RULES,
  dueDate: string,
  completionDate: string
): { totalPoints: number; breakdown: { base: number; bonus: number; penalty: number; isOnTime: boolean; daysLate: number } } {
  const rule = SCORING_RULES[type] || SCORING_RULES.PROJECT_TASK;
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
      daysLate
    }
  };
}
