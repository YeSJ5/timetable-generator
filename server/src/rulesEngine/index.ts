import { ScheduleRules, getScheduleRules } from '../config/scheduleRules';
import { TimetableData, TimetableCell } from '../engine/utils';

export interface RuleViolation {
  type: string;
  message: string;
  day?: string;
  slotIdx?: number;
}

// Basic validator that checks a timetable against schedule rules
export function validateTimetableWithRules(timetable: TimetableData, rules?: ScheduleRules): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const usedRules = rules || getScheduleRules();

  // Example check: max consecutive theory periods
  for (const day of Object.keys(timetable)) {
    let consecutiveTheory = 0;
    const row = timetable[day];
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      if (cell && (cell.type === 'theory')) {
        consecutiveTheory++;
        if (usedRules.weekly.maxConsecutiveTheory && consecutiveTheory > usedRules.weekly.maxConsecutiveTheory) {
          violations.push({
            type: 'consecutiveTheory',
            message: `More than ${usedRules.weekly.maxConsecutiveTheory} consecutive theory periods on ${day}`,
            day,
            slotIdx: i,
          });
        }
      } else if (cell && cell.type === 'lab') {
        // reset on lab
        consecutiveTheory = 0;
      } else {
        // empty or break
        consecutiveTheory = 0;
      }
    }
  }

  // Example check: forced gaps (no classes after a time on a day)
  if (usedRules.weekly.forcedGaps && usedRules.weekly.forcedGaps.length) {
    // need mapping from slot labels to indices; engine/utils exposes slot arrays elsewhere.
    // This function will only flag a violation if a slot label matches exactly.
    // Caller may pass prepared slot label -> index mapping for accurate checks.
  }

  // Avoid long gaps check will be implemented by higher-level logic that inspects free periods between classes for each section

  return violations;
}

// Scoring helper to integrate with scoring engine: small example
export function scoreRuleCompliance(violations: RuleViolation[], priorities: any): number {
  // Each violation subtracts a penalty weighted by conflict avoidance strictness
  const basePenalty = -50;
  const strictness = (priorities?.conflictAvoidanceStrictness || 50) / 50;
  return violations.reduce((sum, v) => sum + basePenalty * strictness, 0);
}

export default {
  validateTimetableWithRules,
  scoreRuleCompliance,
};
