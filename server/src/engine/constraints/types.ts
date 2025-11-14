/**
 * Constraint Engine Types
 * 
 * Defines hard and soft constraints for timetable generation
 */

export type ConstraintType = 'hard' | 'soft';
export type EntityType = 'teacher' | 'subject' | 'room' | 'section' | 'global';

export interface ConstraintPayload {
  [key: string]: any;
}

export interface Constraint {
  id?: string;
  type: ConstraintType;
  name: string;
  entityType: EntityType;
  entityId?: string;
  payload: ConstraintPayload;
  weight?: number; // for soft constraints (0-1)
  isActive?: boolean;
}

/**
 * Hard Constraints (must never be violated)
 */
export interface HardConstraint extends Constraint {
  type: 'hard';
  validate: (context: ConstraintContext) => boolean;
  message?: string;
}

/**
 * Soft Constraints (weighted, can be violated at cost)
 */
export interface SoftConstraint extends Constraint {
  type: 'soft';
  weight: number; // 0-1, default 1.0
  score: (context: ConstraintContext) => number; // returns penalty score (0 = perfect, higher = worse)
}

export interface ConstraintContext {
  timetable: any; // TimetableData
  day: string;
  slot: string;
  teacherId?: string;
  subjectId?: string;
  roomId?: string;
  sectionId?: string;
  [key: string]: any; // additional context
}

/**
 * Built-in Hard Constraints
 */
export const HARD_CONSTRAINTS = {
  NO_TEACHER_DOUBLE_BOOKING: 'no_teacher_double_booking',
  NO_ROOM_DOUBLE_BOOKING: 'no_room_double_booking',
  ROOM_CAPACITY: 'room_capacity',
  LAB_IN_LAB_ROOM: 'lab_in_lab_room',
  WEEKLY_HOURS_MET: 'weekly_hours_met',
  WORKING_HOURS: 'working_hours',
  TEACHER_AVAILABILITY: 'teacher_availability',
  ROOM_AVAILABILITY: 'room_availability',
} as const;

/**
 * Built-in Soft Constraints
 */
export const SOFT_CONSTRAINTS = {
  TEACHER_PREFERRED_TIME: 'teacher_preferred_time',
  AVOID_CONSECUTIVE_HOURS: 'avoid_consecutive_hours',
  AVOID_BACK_TO_BACK_HEAVY: 'avoid_back_to_back_heavy',
  PREFER_MORNING_LABS: 'prefer_morning_labs',
  SPREAD_SUBJECT_HOURS: 'spread_subject_hours',
  MINIMIZE_TEACHER_GAPS: 'minimize_teacher_gaps',
  TEACHER_PREFERRED_ROOMS: 'teacher_preferred_rooms',
  SUBJECT_PREFERRED_DISTRIBUTION: 'subject_preferred_distribution',
} as const;

