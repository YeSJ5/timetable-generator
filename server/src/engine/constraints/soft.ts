/**
 * Soft Constraints Implementation
 * 
 * Weighted constraints that can be violated at a cost
 */

import { SoftConstraint, ConstraintContext } from './types';
import { SOFT_CONSTRAINTS } from './types';
import { TimetableData, TimetableEntry } from '../utils';

/**
 * Teacher preferred time slots
 */
export const teacherPreferredTime: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.TEACHER_PREFERRED_TIME,
  entityType: 'teacher',
  weight: 1.0,
  payload: {},
  score: (context: ConstraintContext): number => {
    const { teacherId, day, slot } = context;
    if (!teacherId || !day || !slot) return 0;

    // This should check if slot is in teacher's preferred slots
    // For now, return 0 (no penalty) - implementation would check availability matrix
    return 0;
  },
};

/**
 * Avoid consecutive hours for teacher
 */
export const avoidConsecutiveHours: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.AVOID_CONSECUTIVE_HOURS,
  entityType: 'teacher',
  weight: 0.8,
  payload: { maxConsecutive: 3 },
  score: (context: ConstraintContext): number => {
    const { timetable, teacherId, day } = context;
    if (!teacherId || !timetable || !day) return 0;

    const dayData = (timetable as TimetableData)[day] || [];
    let consecutiveCount = 0;
    let maxConsecutive = 0;

    for (let i = 0; i < dayData.length; i++) {
      const cell = dayData[i];
      if (cell && (cell as TimetableEntry).teacherId === teacherId) {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 0;
      }
    }

    const maxAllowed = (context.payload?.maxConsecutive as number) || 3;
    if (maxConsecutive > maxAllowed) {
      return (maxConsecutive - maxAllowed) * 10; // Penalty per extra hour
    }

    return 0;
  },
};

/**
 * Avoid back-to-back heavy subjects
 */
export const avoidBackToBackHeavy: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.AVOID_BACK_TO_BACK_HEAVY,
  entityType: 'section',
  weight: 0.6,
  payload: {},
  score: (context: ConstraintContext): number => {
    // This would check if consecutive slots have "heavy" subjects
    // For now, return 0
    return 0;
  },
};

/**
 * Prefer morning slots for labs
 */
export const preferMorningLabs: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.PREFER_MORNING_LABS,
  entityType: 'subject',
  weight: 0.5,
  payload: { morningSlots: ['09:00', '10:00', '11:00'] },
  score: (context: ConstraintContext): number => {
    const { subjectId, slot } = context;
    if (!subjectId || !slot) return 0;

    // Check if this is a lab and if it's in morning
    // For now, return 0
    return 0;
  },
};

/**
 * Spread subject hours across week
 */
export const spreadSubjectHours: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.SPREAD_SUBJECT_HOURS,
  entityType: 'subject',
  weight: 0.7,
  payload: {},
  score: (context: ConstraintContext): number => {
    // This is typically calculated after full timetable generation
    // For per-slot scoring, return 0
    return 0;
  },
};

/**
 * Minimize teacher idle gaps
 */
export const minimizeTeacherGaps: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.MINIMIZE_TEACHER_GAPS,
  entityType: 'teacher',
  weight: 0.4,
  payload: {},
  score: (context: ConstraintContext): number => {
    // Calculate gaps in teacher's schedule
    // For now, return 0
    return 0;
  },
};

/**
 * Teacher preferred rooms
 */
export const teacherPreferredRooms: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.TEACHER_PREFERRED_ROOMS,
  entityType: 'teacher',
  weight: 0.3,
  payload: {},
  score: (context: ConstraintContext): number => {
    const { teacherId, roomId } = context;
    if (!teacherId || !roomId) return 0;

    // Check if room is in teacher's preferred rooms list
    // For now, return 0
    return 0;
  },
};

/**
 * Subject preferred distribution
 */
export const subjectPreferredDistribution: SoftConstraint = {
  type: 'soft',
  name: SOFT_CONSTRAINTS.SUBJECT_PREFERRED_DISTRIBUTION,
  entityType: 'subject',
  weight: 0.6,
  payload: {},
  score: (context: ConstraintContext): number => {
    // This is typically calculated after full timetable generation
    return 0;
  },
};

/**
 * Register all built-in soft constraints
 */
export function registerSoftConstraints(registry: any): void {
  registry.registerSoft(teacherPreferredTime);
  registry.registerSoft(avoidConsecutiveHours);
  registry.registerSoft(avoidBackToBackHeavy);
  registry.registerSoft(preferMorningLabs);
  registry.registerSoft(spreadSubjectHours);
  registry.registerSoft(minimizeTeacherGaps);
  registry.registerSoft(teacherPreferredRooms);
  registry.registerSoft(subjectPreferredDistribution);
}

