import { TimetableData, TimetableEntry } from './utils';
import { GenerationPriorities, GenerationMode } from '../types/preferences';

export interface ScoringWeights {
  conflictPenalty: number;
  preferenceBonus: number;
  loadBalanceBonus: number;
  roomBalanceBonus: number;
  sameSubjectSameDayPenalty: number;
  earlyPlacementBonus: number;
  teacherAvailabilityBonus: number;
  subjectSpreadBonus: number;
  sectionWorkloadBonus: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  conflictPenalty: -1000,
  preferenceBonus: 10,
  loadBalanceBonus: 5,
  roomBalanceBonus: 3,
  sameSubjectSameDayPenalty: -20,
  earlyPlacementBonus: 2,
  teacherAvailabilityBonus: 15,
  subjectSpreadBonus: 8,
  sectionWorkloadBonus: 10,
};

export interface ScoringContext {
  teacherLoads: { [teacherId: string]: number };
  roomUtilization: { [roomId: string]: number };
  teacherPreferences: { [teacherId: string]: { morning: boolean; afternoon: boolean; slots?: number[]; availabilityMatrix?: any } };
  conflicts: Array<{ type: string; message: string }>;
  slots: string[];
  priorities?: GenerationPriorities;
  mode?: GenerationMode;
  sectionRules?: any;
  subjectConstraints?: any;
}

export function scoreTimetable(
  timetable: TimetableData,
  context: ScoringContext,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  let score = 1000; // Base score

  // Adjust weights based on priorities
  const adjustedWeights = adjustWeightsForPriorities(weights, context.priorities, context.mode);

  // Penalize conflicts heavily (scaled by conflict avoidance priority)
  const conflictMultiplier = (context.priorities?.conflictAvoidanceStrictness || 50) / 50;
  score += context.conflicts.length * adjustedWeights.conflictPenalty * conflictMultiplier;

  // Calculate teacher load balance (scaled by teacher priority)
  const teacherMultiplier = (context.priorities?.teacherPriority || 50) / 50;
  const loads = Object.values(context.teacherLoads);
  if (loads.length > 0) {
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
    score += Math.max(0, 10 - variance) * adjustedWeights.loadBalanceBonus * teacherMultiplier;
  }

  // Reward teacher preference matching
  for (const [teacherId, pref] of Object.entries(context.teacherPreferences)) {
    const load = context.teacherLoads[teacherId] || 0;
    if (load > 0) {
      // Check availability matrix compliance
      if (pref.availabilityMatrix) {
        const availabilityScore = calculateAvailabilityScore(timetable, teacherId, pref.availabilityMatrix, context.slots);
        score += availabilityScore * adjustedWeights.teacherAvailabilityBonus * teacherMultiplier;
      }

      if (pref.morning && load > 0) {
        const morningCount = countMorningClasses(timetable, teacherId, context.slots);
        score += (morningCount / load) * adjustedWeights.preferenceBonus * teacherMultiplier;
      }
      if (pref.afternoon && load > 0) {
        const afternoonCount = countAfternoonClasses(timetable, teacherId, context.slots);
        score += (afternoonCount / load) * adjustedWeights.preferenceBonus * teacherMultiplier;
      }
    }
  }

  // Room utilization balance (scaled by room utilization priority)
  const roomMultiplier = (context.priorities?.roomUtilization || 50) / 50;
  const roomLoads = Object.values(context.roomUtilization);
  if (roomLoads.length > 0) {
    const avgRoomLoad = roomLoads.reduce((a, b) => a + b, 0) / roomLoads.length;
    const roomVariance = roomLoads.reduce((sum, load) => sum + Math.pow(load - avgRoomLoad, 2), 0) / roomLoads.length;
    score += Math.max(0, 10 - roomVariance) * adjustedWeights.roomBalanceBonus * roomMultiplier;
  }

  // Subject spread quality (scaled by subject spread priority)
  const subjectSpreadMultiplier = (context.priorities?.subjectSpreadQuality || 50) / 50;
  const sameSubjectViolations = countSameSubjectSameDay(timetable);
  score += sameSubjectViolations * adjustedWeights.sameSubjectSameDayPenalty;
  
  if (context.subjectConstraints) {
    const spreadScore = calculateSubjectSpreadScore(timetable, context.subjectConstraints);
    score += spreadScore * adjustedWeights.subjectSpreadBonus * subjectSpreadMultiplier;
  }

  // Section workload balance (scaled by student workload priority)
  const studentWorkloadMultiplier = (context.priorities?.studentWorkloadBalance || 50) / 50;
  if (context.sectionRules) {
    const workloadScore = calculateSectionWorkloadScore(timetable, context.sectionRules, context.slots);
    score += workloadScore * adjustedWeights.sectionWorkloadBonus * studentWorkloadMultiplier;
  }

  // Reward early placement (prefer earlier slots)
  const earlyPlacementScore = calculateEarlyPlacementBonus(timetable, context.slots);
  score += earlyPlacementScore * adjustedWeights.earlyPlacementBonus;

  // Reward filled slots
  const filledRatio = calculateFilledRatio(timetable);
  score += filledRatio * 50;

  return Math.max(0, score);
}

function adjustWeightsForPriorities(
  baseWeights: ScoringWeights,
  priorities?: GenerationPriorities,
  mode?: GenerationMode
): ScoringWeights {
  if (!priorities) return baseWeights;

  const adjusted = { ...baseWeights };

  // In strict mode, increase penalties
  if (mode === 'strict') {
    adjusted.conflictPenalty *= 2;
    adjusted.sameSubjectSameDayPenalty *= 1.5;
  }

  // In free mode, reduce penalties
  if (mode === 'free') {
    adjusted.conflictPenalty *= 0.5;
    adjusted.sameSubjectSameDayPenalty *= 0.5;
  }

  return adjusted;
}

function calculateAvailabilityScore(
  timetable: TimetableData,
  teacherId: string,
  availabilityMatrix: any,
  slots: string[]
): number {
  let score = 0;
  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    const dayMatrix = availabilityMatrix[day] || {};
    
    dayData.forEach((cell, slotIdx) => {
      if (cell && cell.teacherId === teacherId) {
        const slot = slots[slotIdx];
        const availability = dayMatrix[slot];
        if (availability === 'preferred') {
          score += 5;
        } else if (availability === 'available') {
          score += 2;
        } else if (availability === 'not_available') {
          score -= 10;
        }
      }
    });
  }
  return score;
}

function calculateSubjectSpreadScore(timetable: TimetableData, constraints: any): number {
  let score = 0;
  const subjectDays: { [subjectCode: string]: Set<string> } = {};

  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    dayData.forEach(cell => {
      if (cell && cell.subjectCode) {
        if (!subjectDays[cell.subjectCode]) {
          subjectDays[cell.subjectCode] = new Set();
        }
        subjectDays[cell.subjectCode].add(day);
      }
    });
  }

  // Reward spreading across week
  if (constraints.spreadAcrossWeek) {
    Object.values(subjectDays).forEach(days => {
      score += days.size * 2; // More days = better spread
    });
  }

  // Penalize consecutive days
  if (constraints.noConsecutiveDays) {
    Object.values(subjectDays).forEach(days => {
      const dayArray = Array.from(days).sort();
      for (let i = 1; i < dayArray.length; i++) {
        const prevIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(dayArray[i - 1]);
        const currIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(dayArray[i]);
        if (currIdx === prevIdx + 1) {
          score -= 5; // Consecutive days penalty
        }
      }
    });
  }

  return score;
}

function calculateSectionWorkloadScore(timetable: TimetableData, rules: any, slots: string[]): number {
  let score = 0;

  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    let hoursToday = 0;
    let consecutiveCount = 0;
    let maxConsecutive = 0;
    let breaks = 0;

    dayData.forEach((cell, idx) => {
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        hoursToday++;
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else if (isBreakSlot(slots[idx])) {
        breaks++;
        consecutiveCount = 0;
      } else {
        consecutiveCount = 0;
      }
    });

    // Check max hours per day
    if (rules.maxHoursPerDay && hoursToday > rules.maxHoursPerDay) {
      score -= (hoursToday - rules.maxHoursPerDay) * 10;
    }

    // Check max back-to-back
    if (rules.maxBackToBack && maxConsecutive > rules.maxBackToBack) {
      score -= (maxConsecutive - rules.maxBackToBack) * 5;
    }

    // Check minimum breaks
    if (rules.minimumBreaks && breaks < rules.minimumBreaks) {
      score -= (rules.minimumBreaks - breaks) * 3;
    }
  }

  return score;
}

function isBreakSlot(slot: string): boolean {
  return slot === '10:30-10:45' || slot === '12:45-1:30';
}

function countMorningClasses(
  timetable: TimetableData,
  teacherId: string,
  slots: string[]
): number {
  let count = 0;
  const morningSlots = slots
    .map((s, i) => (s.startsWith('8:') || s.startsWith('9:') || s.startsWith('10:') || s.startsWith('11:') || s.startsWith('12:')) ? i : -1)
    .filter(i => i >= 0);

  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    morningSlots.forEach(slotIdx => {
      const cell = dayData?.[slotIdx];
      if (cell && cell.teacherId === teacherId && (cell.type === 'theory' || cell.type === 'lab')) {
        count++;
      }
    });
  }
  return count;
}

function countAfternoonClasses(
  timetable: TimetableData,
  teacherId: string,
  slots: string[]
): number {
  let count = 0;
  const afternoonSlots = slots
    .map((s, i) => (s.startsWith('1:') || s.startsWith('2:') || s.startsWith('3:') || s.startsWith('4:') || s.startsWith('5:')) ? i : -1)
    .filter(i => i >= 0);

  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    afternoonSlots.forEach(slotIdx => {
      const cell = dayData?.[slotIdx];
      if (cell && cell.teacherId === teacherId && (cell.type === 'theory' || cell.type === 'lab')) {
        count++;
      }
    });
  }
  return count;
}

function countSameSubjectSameDay(timetable: TimetableData): number {
  let violations = 0;
  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    const subjects = new Set<string>();
    dayData.forEach(cell => {
      if (cell && cell.subjectCode) {
        if (subjects.has(cell.subjectCode)) {
          violations++;
        } else {
          subjects.add(cell.subjectCode);
        }
      }
    });
  }
  return violations;
}

function calculateEarlyPlacementBonus(timetable: TimetableData, slots: string[]): number {
  let bonus = 0;
  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    dayData.forEach((cell, idx) => {
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        // Earlier slots get higher bonus
        bonus += (slots.length - idx) / slots.length;
      }
    });
  }
  return bonus;
}

function calculateFilledRatio(timetable: TimetableData): number {
  let total = 0;
  let filled = 0;
  for (const day of Object.keys(timetable)) {
    const dayData = timetable[day];
    dayData.forEach(cell => {
      total++;
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        filled++;
      }
    });
  }
  return total > 0 ? filled / total : 0;
}
