/**
 * Regeneration Engine Types
 * 
 * Types for partial timetable regeneration
 */

import { TimetableData } from '../utils';

export interface RegenerationOptions {
  timetableId: string;
  sectionId: string;
  scope: 'teacher' | 'section' | 'day' | 'slot';
  targetId: string; // teacherId, sectionId, day, or slotId
  preserveUnchanged?: boolean; // default: true
  solverType?: 'greedy' | 'legacy';
}

export interface RegenerationResult {
  timetables: { [sectionId: string]: TimetableData };
  score: number;
  conflicts: Array<{
    type: string;
    day: string;
    slot: string;
    message: string;
    sectionId?: string;
  }>;
  diagnostics: {
    totalSlots: number;
    usedSlots: number;
    labSlots: number;
    theorySlots: number;
    teacherLoad: { [teacherId: string]: number };
    roomUtilization: { [roomId: string]: number };
  };
  sectionScores: { [sectionId: string]: number };
  changedSlots: Array<{
    sectionId: string;
    day: string;
    slot: number;
    action: 'added' | 'removed' | 'modified';
    oldValue?: any;
    newValue?: any;
  }>;
  solverMetadata?: {
    solver: string;
    generationTime?: number;
    placements?: number;
    constraintViolations?: string[];
    regenerationScope?: string;
  };
}

export interface ImpactedRegion {
  sectionId: string;
  days: string[];
  slots: number[];
  affectedTeachers: string[];
  affectedRooms: string[];
  affectedSubjects: string[];
}

