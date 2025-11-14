/**
 * Greedy Solver Output Normalizer
 * 
 * Maps greedy solver output format to legacy format expected by frontend
 * This ensures backward compatibility with existing UI and exports
 */

import { TimetableData, TimetableCell } from '../utils';
import { GreedySolverResult } from '../solvers/greedy';

export interface LegacyTimetableFormat {
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
}

/**
 * Normalize greedy solver result to legacy format
 */
export function normalizeGreedyResult(result: GreedySolverResult): LegacyTimetableFormat {
  // The greedy solver already outputs in a compatible format,
  // but we ensure all fields are present and properly formatted

  return {
    timetables: result.timetables,
    score: result.score,
    conflicts: result.conflicts.map(conflict => ({
      type: conflict.type,
      day: conflict.day || '',
      slot: conflict.slot || '',
      message: conflict.message,
      sectionId: conflict.sectionId,
    })),
    diagnostics: {
      totalSlots: result.diagnostics.totalSlots,
      usedSlots: result.diagnostics.usedSlots,
      labSlots: result.diagnostics.labSlots,
      theorySlots: result.diagnostics.theorySlots,
      teacherLoad: result.diagnostics.teacherLoad,
      roomUtilization: result.diagnostics.roomUtilization,
    },
    sectionScores: result.sectionScores,
  };
}

/**
 * Add constraint violations to conflicts array
 */
export function addConstraintViolationsToConflicts(
  legacyFormat: LegacyTimetableFormat,
  constraintViolations: string[]
): LegacyTimetableFormat {
  if (!constraintViolations || constraintViolations.length === 0) {
    return legacyFormat;
  }

  // Add constraint violations as conflicts
  const constraintConflicts = constraintViolations.map(violation => ({
    type: 'constraint' as const,
    day: '',
    slot: '',
    message: violation,
    sectionId: undefined,
  }));

  return {
    ...legacyFormat,
    conflicts: [...legacyFormat.conflicts, ...constraintConflicts],
  };
}

