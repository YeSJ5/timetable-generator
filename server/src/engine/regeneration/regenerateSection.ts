/**
 * Regenerate Section Schedule
 * 
 * Partially regenerates timetable for an entire section with minimal disturbance
 * Preserves other sections, unaffected teachers, and unaffected days
 */

import prisma from '../../db';
import { TimetableData, getAllSlots } from '../utils';
import { runSolver } from '../solvers';
import { analyzeSectionImpact, unassignImpactedSlots, trackChanges } from './impactAnalysis';
import { RegenerationOptions, RegenerationResult } from './types';
import { saveTimetables } from '../saveTimetables';
import { Conflict } from '../aiInspector';
import {
  RegenerationProfiler,
  AvailabilityCache,
  shallowCloneTimetable,
} from './performance';
import {
  RegenerationProfiler,
  AvailabilityCache,
  shallowCloneTimetable,
} from './performance';

/**
 * Regenerate timetable for an entire section
 */
export async function regenerateSection(options: RegenerationOptions): Promise<RegenerationResult> {
  const {
    timetableId,
    sectionId,
    preserveUnchanged = true,
    solverType = 'greedy',
  } = options;

  console.log(`[Regeneration] Regenerating section ${sectionId}`);

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
  profiler.markPhase('parse');
  const currentTimetable: TimetableData = JSON.parse(timetable.json);

  // Build availability cache
  profiler.markPhase('cache');
  const availabilityCache = new AvailabilityCache();
  availabilityCache.buildFromTimetable(currentTimetable);

  // Analyze impact - all slots in this section
  profiler.markPhase('impact');
  const impact = analyzeSectionImpact(currentTimetable, sectionId);

  console.log(`[Regeneration] Section impact analysis:`, {
    days: impact.days.length,
    slots: impact.slots.length,
    affectedTeachers: impact.affectedTeachers.length,
    affectedRooms: impact.affectedRooms.length,
    affectedSubjects: impact.affectedSubjects.length,
  });

  // Unassign impacted slots (all section slots)
  profiler.markPhase('unassign');
  // Use shallow clone to avoid deep cloning
  profiler.recordClone();
  const unassignedTimetable = preserveUnchanged
    ? unassignImpactedSlots(currentTimetable, impact)
    : shallowCloneTimetable(currentTimetable);

  // Fetch all required data for regeneration (batched queries)
  profiler.markPhase('fetch');
  profiler.recordQuery(); // Section already fetched
  const section = timetable.section;
  
  // Batch room query (single query)
  profiler.recordQuery();
  const allRooms = await prisma.room.findMany();
  const lectureRooms = allRooms.filter(r => r.type === 'lecture');
  const labRooms = allRooms.filter(r => r.type === 'lab');

  // Get slots - use standard slot format
  const slots = getAllSlots(true);

  // Run solver on the unassigned timetable for this section
  const solverStartTime = Date.now();
  
  const solverResult = await runSolver({
    type: solverType as any,
    sections: [section], // Full section with all mappings and labs
    slots,
    lectureRooms,
    labRooms,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
  });

  profiler.endPhase(); // End solver phase
  const generationTime = profiler.getMetrics().phases.solver || 0;

  // Get regenerated timetable for this section
  profiler.startPhase('merge');
  const regeneratedTimetable = solverResult.timetables[sectionId] || unassignedTimetable;
  
  // If preserving unchanged, merge with original
  // Performance: Use shallow clone
  profiler.recordClone();
  let finalTimetable: TimetableData;
  if (preserveUnchanged) {
    finalTimetable = shallowCloneTimetable(currentTimetable);
    
    // Overwrite only the impacted slots
    for (const day of impact.days) {
      if (!finalTimetable[day]) {
        finalTimetable[day] = [];
      }
      const dayData = finalTimetable[day];
      const regeneratedDayData = regeneratedTimetable[day] || [];
      
      for (let slotIndex = 0; slotIndex < Math.max(dayData.length, regeneratedDayData.length); slotIndex++) {
        // Only update slots that were in the impacted region
        if (impact.slots.includes(slotIndex)) {
          if (slotIndex < regeneratedDayData.length) {
            dayData[slotIndex] = regeneratedDayData[slotIndex];
          } else {
            dayData[slotIndex] = null;
          }
        }
        // Ensure array length matches
        while (dayData.length < regeneratedDayData.length) {
          dayData.push(null);
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

  // Count affected slots
  const affectedSlotsCount = impact.slots.length;

  // Save as new version
  profiler.startPhase('save');
  await saveTimetables({
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
    notes: `Regenerated for section ${sectionId}`,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: solverResult.diagnostics.usedSlots,
      constraintViolations: solverResult.constraintViolations,
      regenerationScope: `section:${sectionId}`,
    },
  });

  // Performance: Log metrics
  profiler.endPhase();
  profiler.logMetrics(`Section Regeneration (${sectionId})`);

  console.log(`[Regeneration] Section regeneration completed:`, {
    sectionId,
    generationTime: `${profiler.getMetrics().totalTime}ms`,
    changedSlots: changedSlots.length,
    affectedSlots: affectedSlotsCount,
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
      regenerationScope: `section:${sectionId}`,
      performance: metrics, // Include performance metrics
    },
  };
}

