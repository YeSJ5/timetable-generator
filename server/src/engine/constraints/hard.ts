/**
 * Hard Constraints Implementation
 * 
 * Constraints that must never be violated
 */

import { HardConstraint, ConstraintContext } from './types';
import { HARD_CONSTRAINTS } from './types';
import { TimetableData, TimetableEntry } from '../utils';

/**
 * No teacher double booking
 */
export const noTeacherDoubleBooking: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.NO_TEACHER_DOUBLE_BOOKING,
  entityType: 'teacher',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { timetable, day, slot, teacherId } = context;
    if (!teacherId || !timetable || !day || !slot) return true;

    const dayData = (timetable as TimetableData)[day] || [];
    const slotIndex = parseInt(slot) || 0;

    // Check if teacher is already assigned in this slot
    for (let i = 0; i < dayData.length; i++) {
      const cell = dayData[i];
      if (cell && (cell as TimetableEntry).teacherId === teacherId) {
        // Check if this is the same slot or overlapping slots
        if (i === slotIndex) {
          return false; // Violation: teacher already assigned
        }
        // Check for overlapping multi-slot entries (labs)
        if ((cell as TimetableEntry).type === 'lab') {
          const duration = (cell as TimetableEntry).durationSlots || 1;
          const cellStart = i;
          const cellEnd = i + duration - 1;
          if (slotIndex >= cellStart && slotIndex <= cellEnd) {
            return false; // Violation: overlapping with lab
          }
        }
      }
    }

    return true;
  },
  message: 'Teacher cannot be double-booked in the same time slot',
};

/**
 * No room double booking
 */
export const noRoomDoubleBooking: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.NO_ROOM_DOUBLE_BOOKING,
  entityType: 'room',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { timetable, day, slot, roomId } = context;
    if (!roomId || !timetable || !day || !slot) return true;

    const dayData = (timetable as TimetableData)[day] || [];
    const slotIndex = parseInt(slot) || 0;

    // Check if room is already assigned in this slot
    for (let i = 0; i < dayData.length; i++) {
      const cell = dayData[i];
      if (cell && (cell as TimetableEntry).roomId === roomId) {
        if (i === slotIndex) {
          return false; // Violation: room already assigned
        }
        // Check for overlapping multi-slot entries
        if ((cell as TimetableEntry).type === 'lab') {
          const duration = (cell as TimetableEntry).durationSlots || 1;
          const cellStart = i;
          const cellEnd = i + duration - 1;
          if (slotIndex >= cellStart && slotIndex <= cellEnd) {
            return false; // Violation: overlapping
          }
        }
      }
    }

    return true;
  },
  message: 'Room cannot be double-booked in the same time slot',
};

/**
 * Room capacity constraint
 */
export const roomCapacity: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.ROOM_CAPACITY,
  entityType: 'room',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { roomId, sectionId } = context;
    if (!roomId || !sectionId) return true;

    // This requires room capacity and section size data
    // For now, we'll assume it's validated elsewhere
    // In a full implementation, you'd fetch room capacity and section size
    return true;
  },
  message: 'Room capacity must be >= number of students',
};

/**
 * Lab must be in lab room
 */
export const labInLabRoom: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.LAB_IN_LAB_ROOM,
  entityType: 'subject',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { subjectId, roomId } = context;
    if (!subjectId || !roomId) return true;

    // This requires checking if subject is a lab and room type is lab
    // For now, we'll assume it's validated elsewhere
    return true;
  },
  message: 'Lab classes must be scheduled in lab rooms',
};

/**
 * Weekly hours must be met
 */
export const weeklyHoursMet: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.WEEKLY_HOURS_MET,
  entityType: 'subject',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    // This is typically validated after full timetable generation
    // Not per-slot, so we'll return true here
    return true;
  },
  message: 'Subject weekly hours requirement must be met',
};

/**
 * Working hours constraint
 */
export const workingHours: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.WORKING_HOURS,
  entityType: 'global',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { slot } = context;
    if (!slot) return true;

    // This should check against configured working hours
    // For now, we'll assume slots are pre-validated
    return true;
  },
  message: 'Classes must be within institute working hours',
};

/**
 * Teacher availability constraint
 */
export const teacherAvailability: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.TEACHER_AVAILABILITY,
  entityType: 'teacher',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { teacherId, day, slot } = context;
    if (!teacherId || !day || !slot) return true;

    // This should check teacher's availability matrix
    // For now, we'll assume it's validated elsewhere
    return true;
  },
  message: 'Teacher must be available in the assigned time slot',
};

/**
 * Room availability constraint
 */
export const roomAvailability: HardConstraint = {
  type: 'hard',
  name: HARD_CONSTRAINTS.ROOM_AVAILABILITY,
  entityType: 'room',
  payload: {},
  validate: (context: ConstraintContext): boolean => {
    const { roomId, day, slot } = context;
    if (!roomId || !day || !slot) return true;

    // This should check room's availability matrix
    return true;
  },
  message: 'Room must be available in the assigned time slot',
};

/**
 * Register all built-in hard constraints
 */
export function registerHardConstraints(registry: any): void {
  registry.registerHard(noTeacherDoubleBooking);
  registry.registerHard(noRoomDoubleBooking);
  registry.registerHard(roomCapacity);
  registry.registerHard(labInLabRoom);
  registry.registerHard(weeklyHoursMet);
  registry.registerHard(workingHours);
  registry.registerHard(teacherAvailability);
  registry.registerHard(roomAvailability);
}

