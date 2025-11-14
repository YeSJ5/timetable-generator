/**
 * Regenerate Teacher Schedule
 * 
 * Partially regenerates timetable for a specific teacher with minimal disturbance
 */

import prisma from '../../db';
import { TimetableData, getAllSlots } from '../utils';
import { runSolver } from '../solvers';
import { analyzeTeacherImpact, unassignImpactedSlots, trackChanges } from './impactAnalysis';
import { RegenerationOptions, RegenerationResult } from './types';
import { saveTimetables } from '../saveTimetables';
import { Conflict } from '../aiInspector';
import {
  RegenerationProfiler,
  AvailabilityCache,
  ConstraintMemoCache,
  cloneAffectedDays,
} from './performance';

/**
 * Regenerate timetable for a specific teacher
 */
export async function regenerateTeacher(options: RegenerationOptions): Promise<RegenerationResult> {
  const {
    timetableId,
    sectionId,
    targetId: teacherId,
    preserveUnchanged = true,
    solverType = 'greedy',
  } = options;

  console.log(`[Regeneration] Regenerating teacher ${teacherId} in section ${sectionId}`);

  // Performance: Initialize profiler
  const profiler = new RegenerationProfiler();
  profiler.startPhase('fetch');

  // Fetch current timetable (batched with section data)
  profiler.recordQuery();
  const timetable = await prisma.timetable.findUnique({
    where: { id: timetableId },
    include: {
      section: {
        include: {
          mappings: {
            include: {
              teacher: true,
              subject: true,
            },
          },
          labs: {
            include: {
              teacher: true,
              room: true,
            },
          },
        },
      },
    },
  });

  if (!timetable) {
    throw new Error(`Timetable ${timetableId} not found`);
  }

  if (timetable.sectionId !== sectionId) {
    throw new Error(`Timetable does not belong to section ${sectionId}`);
  }

  // Parse current timetable
  profiler.startPhase('parse');
  const currentTimetable: TimetableData = JSON.parse(timetable.json);

  // Performance: Build availability cache (exclude teacher's slots)
  profiler.startPhase('cache');
  const availabilityCache = new AvailabilityCache();
  availabilityCache.buildFromTimetable(currentTimetable);
  const constraintCache = new ConstraintMemoCache();

  // Analyze impact
  profiler.startPhase('impact');
  const impact = analyzeTeacherImpact(currentTimetable, teacherId);
  impact.sectionId = sectionId;

  console.log(`[Regeneration] Impact analysis:`, {
    days: impact.days.length,
    slots: impact.slots.length,
    affectedTeachers: impact.affectedTeachers.length,
    affectedRooms: impact.affectedRooms.length,
  });

  // Unassign impacted slots
  profiler.startPhase('unassign');
  // Performance: Only clone affected days, not entire timetable
  profiler.recordClone();
  const unassignedTimetable = preserveUnchanged
    ? unassignImpactedSlots(currentTimetable, impact)
    : cloneAffectedDays(currentTimetable, impact.days);

  // Fetch all required data for regeneration (batched queries)
  profiler.startPhase('fetch');
  profiler.recordQuery(); // Section already fetched in initial query
  const section = timetable.section;
  
  // Performance: Batch room query (single query instead of multiple)
  profiler.recordQuery();
  const allRooms = await prisma.room.findMany();
  const lectureRooms = allRooms.filter(r => r.type === 'lecture');
  const labRooms = allRooms.filter(r => r.type === 'lab');

  // Filter mappings to only include this teacher's subjects
  const teacherMappings = section.mappings.filter((m: any) => m.teacherId === teacherId);
  const teacherLabs = section.labs.filter((l: any) => l.teacherId === teacherId);

  // Create a temporary section object with only this teacher's data
  const tempSection = {
    ...section,
    mappings: teacherMappings,
    labs: teacherLabs,
  };

  // Get slots - use standard slot format
  // We'll use the same slots as the original generation (with extra slots)
  const slots = getAllSlots(true);

  // Run solver on the unassigned timetable
  profiler.startPhase('solver');
  const solverResult = await runSolver({
    type: solverType as any,
    sections: [tempSection],
    slots,
    lectureRooms,
    labRooms,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
  });

  profiler.endPhase(); // End solver phase
  const generationTime = profiler.getMetrics().phases.solver || 0;

  // Merge the regenerated timetable with the preserved parts
  profiler.startPhase('merge');
  const regeneratedTimetable = solverResult.timetables[sectionId] || unassignedTimetable;
  
  // If preserving unchanged, merge with original
  // Performance: Only clone affected days
  profiler.recordClone();
  let finalTimetable: TimetableData;
  if (preserveUnchanged) {
    finalTimetable = cloneAffectedDays(currentTimetable, impact.days);
    
    // Overwrite only the impacted slots
    for (const day of impact.days) {
      if (!finalTimetable[day]) {
        finalTimetable[day] = [];
      }
      for (const slotIndex of impact.slots) {
        if (regeneratedTimetable[day] && regeneratedTimetable[day][slotIndex]) {
          finalTimetable[day][slotIndex] = regeneratedTimetable[day][slotIndex];
        }
      }
    }
  } else {
    finalTimetable = regeneratedTimetable;
  }

  // Track changes
  profiler.startPhase('track');
  const changedSlots = trackChanges(currentTimetable, finalTimetable, sectionId);

  // Calculate conflicts (reuse existing conflict detection logic)
  const conflicts: Conflict[] = [];
  // TODO: Run conflict detection on final timetable

  // Calculate score
  const score = solverResult.score;

  // Save as new version
  await saveTimetables({
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
    notes: `Regenerated for teacher ${teacherId}`,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: solverResult.diagnostics.usedSlots,
      constraintViolations: solverResult.constraintViolations,
      regenerationScope: `teacher:${teacherId}`,
    },
  });

  console.log(`[Regeneration] Teacher regeneration completed:`, {
    teacherId,
    generationTime: `${generationTime}ms`,
    changedSlots: changedSlots.length,
    conflicts: conflicts.length,
  });

  return {
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts,
    diagnostics: solverResult.diagnostics,
    sectionScores: solverResult.sectionScores,
    changedSlots,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: solverResult.diagnostics.usedSlots,
      constraintViolations: solverResult.constraintViolations,
      regenerationScope: `teacher:${teacherId}`,
    },
  };
}

