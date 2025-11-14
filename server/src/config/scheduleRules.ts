export interface PeriodRule {
  count: number; // periods per day
  durations: number[]; // minutes per period
  shortBreakMinutes: number;
  lunchBreakMinutes: number;
  halfDay?: {
    enabled: boolean;
    days: string[]; // e.g. ['Fri']
    periodCount?: number;
  };
}

export interface WeeklyRules {
  maxFullDaysPerWeek?: number;
  minTeachingHoursPerWeek?: number;
  maxTeachingHoursPerWeek?: number;
  minLabsPerWeek?: number;
  maxLabsPerWeek?: number;
  maxConsecutiveTheory?: number;
  forcedGaps?: Array<{ day: string; afterSlotLabel: string }>; // e.g. {day: 'Fri', afterSlotLabel: '3:30-4:30'}
  avoidLongGaps?: boolean;
}

export interface ScheduleRules {
  periods: PeriodRule;
  weekly: WeeklyRules;
}

// Default configuration - can be updated at runtime via API
export const DEFAULT_SCHEDULE_RULES: ScheduleRules = {
  periods: {
    count: 8,
    durations: [60, 60, 15, 60, 60, 45, 60, 60],
    shortBreakMinutes: 15,
    lunchBreakMinutes: 45,
    halfDay: {
      enabled: false,
      days: [],
      periodCount: 4,
    },
  },
  weekly: {
    maxFullDaysPerWeek: 5,
    minTeachingHoursPerWeek: 16,
    maxTeachingHoursPerWeek: 30,
    minLabsPerWeek: 1,
    maxLabsPerWeek: 6,
    maxConsecutiveTheory: 3,
    forcedGaps: [],
    avoidLongGaps: true,
  },
};

let currentRules: ScheduleRules = DEFAULT_SCHEDULE_RULES;

export function getScheduleRules(): ScheduleRules {
  return currentRules;
}

export function updateScheduleRules(patch: Partial<ScheduleRules>) {
  currentRules = { ...currentRules, ...patch } as ScheduleRules;
}
