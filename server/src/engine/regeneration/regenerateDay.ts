/**
 * Regenerate Day Schedule
 * 
 * Partially regenerates timetable for a specific day with minimal disturbance
 * Preserves other days, unaffected teachers, and unaffected slots
 */

import prisma from '../../db';
import { TimetableData, TimetableCell, getAllSlots, DAYS, isBreakSlot } from '../utils';
import { analyzeDayImpact, unassignImpactedSlots, trackChanges } from './impactAnalysis';
import { RegenerationOptions, RegenerationResult } from './types';
import { saveTimetables } from '../saveTimetables';
import { Conflict } from '../aiInspector';
import { constraintRegistry, ConstraintContext } from '../constraints';
import {
  RegenerationProfiler,
  AvailabilityCache,
  ConstraintMemoCache,
  shallowCloneTimetable,
  cloneDay,
} from './performance';
import {
  RegenerationProfiler,
  AvailabilityCache,
  ConstraintMemoCache,
  cloneDay,
} from './performance';

/**
 * Regenerate timetable for a specific day
 */
export async function regenerateDay(options: RegenerationOptions & { day: string }): Promise<RegenerationResult> {
  const {
    timetableId,
    sectionId,
    day,
    preserveUnchanged = true,
    solverType = 'greedy',
  } = options;

  if (!DAYS.includes(day as any)) {
    throw new Error(`Invalid day: ${day}. Must be one of: ${DAYS.join(', ')}`);
  }

  console.log(`[Regeneration] Regenerating day ${day} in section ${sectionId}`);

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

  // Build availability cache (exclude target day for regeneration)
  profiler.markPhase('cache');
  const availabilityCache = new AvailabilityCache();
  availabilityCache.buildFromTimetable(currentTimetable, day); // Exclude target day
  const constraintCache = new ConstraintMemoCache();

  // Analyze impact - all slots on this day
  profiler.markPhase('impact');
  const impact = analyzeDayImpact(currentTimetable, day);
  impact.sectionId = sectionId;

  console.log(`[Regeneration] Day impact analysis:`, {
    day,
    slots: impact.slots.length,
    affectedTeachers: impact.affectedTeachers.length,
    affectedRooms: impact.affectedRooms.length,
    affectedSubjects: impact.affectedSubjects.length,
  });

  // Unassign impacted slots (only for this day)
  profiler.markPhase('unassign');
  // Use shallow clone and only clone the affected day
  profiler.recordClone();
  const unassignedTimetable = preserveUnchanged
    ? unassignImpactedSlots(currentTimetable, impact)
    : (() => {
        const cloned = shallowCloneTimetable(currentTimetable);
        cloned[day] = cloneDay(currentTimetable, day);
        return cloned;
      })();

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

  // For day regeneration, we need a different approach:
  // 1. Start with the unassigned timetable (other days preserved)
  // 2. Manually place classes only on the target day
  // 3. Use constraint validation for each placement
  
  profiler.startPhase('placement');
  
  // Performance: Use shallow clone and only clone the target day
  profiler.recordClone();
  const workingTimetable = shallowCloneTimetable(unassignedTimetable);
  workingTimetable[day] = cloneDay(unassignedTimetable, day);
  
  // Performance: Reuse availability cache instead of rebuilding
  // The cache already has all other days' availability
  const teacherSlots: { [teacherId: string]: Set<number> } = {};
  const roomSlots: { [roomId: string]: Set<number> } = {};
  
  // Initialize from cache (much faster than iterating)
  for (const [teacherId, slots] of Object.entries(availabilityCache.teacherSlots)) {
    teacherSlots[teacherId] = new Set(slots);
  }
  for (const [roomId, slots] of Object.entries(availabilityCache.roomSlots)) {
    roomSlots[roomId] = new Set(slots);
  }
  
  const conflicts: Array<{ type: string; day: string; slot: string; message: string; sectionId?: string }> = [];
  const constraintViolations: string[] = [];
  
  // Get day data
  const dayData = workingTimetable[day] || [];
  const daySlotCount = dayData.length;
  
  // STEP 1: Place labs first (only on this day)
  const dayLabs = section.labs || [];
  const sortedLabs = [...dayLabs].sort((a, b) => {
    if (b.durationSlots !== a.durationSlots) {
      return b.durationSlots - a.durationSlots;
    }
    return 0;
  });
  
  for (const lab of sortedLabs) {
    const duration = lab.durationSlots || 2;
    const availableSlots = findContiguousSlotsForDay(dayData, duration);
    
    for (const startSlot of availableSlots) {
      // Check teacher availability (across all days)
      if (teacherSlots[lab.teacherId]?.has(startSlot)) {
        continue;
      }
      
      // Check room availability
      if (roomSlots[lab.roomId]?.has(startSlot)) {
        continue;
      }
      
      // Performance: Use memoized constraint check
      const context = {
        timetable: workingTimetable,
        day,
        slot: startSlot.toString(),
        teacherId: lab.teacherId,
        subjectId: lab.subjectId || lab.id,
        roomId: lab.roomId,
        sectionId,
      };
      
      const validation = constraintCache.check(context, (ctx) =>
        constraintRegistry.validateHardConstraints(ctx)
      );
      if (!validation.valid) {
        constraintViolations.push(...validation.violations);
        continue;
      }
      
      // Place the lab
      const entry = {
        type: 'lab' as const,
        subjectCode: lab.name || 'LAB',
        labName: lab.name,
        teacherId: lab.teacherId,
        teacherInitials: lab.teacher?.initials || lab.teacher?.name?.substring(0, 3) || '',
        roomId: lab.roomId,
        roomName: lab.room?.name || '',
        durationSlots: duration,
        colSpan: duration,
      };
      
      dayData[startSlot] = entry;
      for (let i = 1; i < duration; i++) {
        if (startSlot + i < dayData.length) {
          dayData[startSlot + i] = {
            ...entry,
            colSpan: 0, // Hidden
          };
        }
      }
      
      // Update tracking
      for (let i = 0; i < duration; i++) {
        if (!teacherSlots[lab.teacherId]) {
          teacherSlots[lab.teacherId] = new Set();
        }
        teacherSlots[lab.teacherId].add(startSlot + i);
        
        if (!roomSlots[lab.roomId]) {
          roomSlots[lab.roomId] = new Set();
        }
        roomSlots[lab.roomId].add(startSlot + i);
      }
      
      break; // Lab placed, move to next
    }
  }
  
  // STEP 2: Place theory classes (only on this day)
  profiler.markPhase('place-theory');
  // Performance: Pre-shuffle mappings once instead of in each iteration
  const shuffledMappings = [...(section.mappings || [])].sort(() => Math.random() - 0.5);
  
  for (const mapping of shuffledMappings) {
    const subject = mapping.subject;
    const teacher = mapping.teacher;
    const hoursNeeded = subject.hoursPerWeek || 0;
    
    // Calculate how many hours already placed this week (from other days)
    let hoursAlreadyPlaced = 0;
    for (const d of DAYS) {
      if (d !== day) {
        const otherDayData = currentTimetable[d] || [];
        for (const cell of otherDayData) {
          if (cell && cell.subjectCode === subject.code && cell.teacherId === teacher.id) {
            hoursAlreadyPlaced++;
          }
        }
      }
    }
    
    // Calculate remaining hours needed
    const hoursRemaining = Math.max(0, hoursNeeded - hoursAlreadyPlaced);
    
    // Try to place remaining hours on this day
    let hoursPlaced = 0;
    for (let slotIndex = 0; slotIndex < dayData.length && hoursPlaced < hoursRemaining; slotIndex++) {
      const cell = dayData[slotIndex];
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        continue; // Slot occupied
      }
      if (isBreakSlot(slots[slotIndex])) {
        continue; // Break slot
      }
      
      // Check teacher availability
      if (teacherSlots[teacher.id]?.has(slotIndex)) {
        continue;
      }
      
      // Try each available room
      const shuffledRooms = [...lectureRooms].sort(() => Math.random() - 0.5);
      for (const room of shuffledRooms) {
        // Check room availability
        if (roomSlots[room.id]?.has(slotIndex)) {
          continue;
        }
        
        // Performance: Use memoized constraint check
        const context = {
          timetable: workingTimetable,
          day,
          slot: slotIndex.toString(),
          teacherId: teacher.id,
          subjectId: subject.id,
          roomId: room.id,
          sectionId,
        };
        
        const validation = constraintCache.check(context, (ctx) =>
          constraintRegistry.validateHardConstraints(ctx)
        );
        if (!validation.valid) {
          constraintViolations.push(...validation.violations);
          continue;
        }
        
        // Place the theory class
        const entry = {
          type: 'theory' as const,
          subjectCode: subject.code,
          subjectName: subject.name,
          teacherId: teacher.id,
          teacherInitials: teacher.initials || teacher.name?.substring(0, 3) || '',
          roomId: room.id,
          roomName: room.name,
        };
        
        dayData[slotIndex] = entry;
        
        // Update tracking
        if (!teacherSlots[teacher.id]) {
          teacherSlots[teacher.id] = new Set();
        }
        teacherSlots[teacher.id].add(slotIndex);
        
        if (!roomSlots[room.id]) {
          roomSlots[room.id] = new Set();
        }
        roomSlots[room.id].add(slotIndex);
        
        hoursPlaced++;
        break; // Placed, move to next hour
      }
    }
  }
  
  profiler.endPhase(); // End placement phase
  
  // The regenerated timetable is the working timetable
  profiler.startPhase('merge');
  const regeneratedTimetable = workingTimetable;
  
  // Calculate diagnostics
  let usedSlots = 0;
  let labSlots = 0;
  let theorySlots = 0;
  const teacherLoad: { [teacherId: string]: number } = {};
  const roomUtilization: { [roomId: string]: number } = {};
  
  for (const cell of dayData) {
    if (cell && cell.type === 'lab') {
      usedSlots++;
      labSlots++;
      teacherLoad[cell.teacherId] = (teacherLoad[cell.teacherId] || 0) + 1;
      roomUtilization[cell.roomId] = (roomUtilization[cell.roomId] || 0) + 1;
    } else if (cell && cell.type === 'theory') {
      usedSlots++;
      theorySlots++;
      teacherLoad[cell.teacherId] = (teacherLoad[cell.teacherId] || 0) + 1;
      roomUtilization[cell.roomId] = (roomUtilization[cell.roomId] || 0) + 1;
    }
  }
  
  // Merge regenerated day slots back into original timetable
  profiler.markPhase('merge');
  let finalTimetable: TimetableData;
  if (preserveUnchanged) {
    // Performance: Use shallow clone instead of deep clone
    profiler.recordClone();
    finalTimetable = shallowCloneTimetable(currentTimetable);
    
    // Overwrite only the target day's slots
    if (regeneratedTimetable[day]) {
      finalTimetable[day] = [...regeneratedTimetable[day]];
    }
    
    // Ensure day array length matches
    const originalDayLength = currentTimetable[day]?.length || 0;
    const regeneratedDayLength = regeneratedTimetable[day]?.length || 0;
    const maxLength = Math.max(originalDayLength, regeneratedDayLength);
    
    // Ensure array is properly sized
    if (!finalTimetable[day]) {
      finalTimetable[day] = [];
    }
    while (finalTimetable[day].length < maxLength) {
      finalTimetable[day].push(null);
    }
  } else {
    finalTimetable = regeneratedTimetable;
  }

  // Track changes (only for this day)
  const changedSlots = trackChanges(currentTimetable, finalTimetable, sectionId).filter(
    change => change.day === day
  );

  // Calculate conflicts - convert to Conflict format
  const finalConflicts: Conflict[] = conflicts
    .filter(c => ['teacher', 'room', 'subject', 'lab'].includes(c.type))
    .map(c => ({
      type: c.type as 'teacher' | 'room' | 'subject' | 'lab',
      day: c.day,
      slot: c.slot,
      message: c.message,
      sectionId: c.sectionId,
    }));

  // Calculate score (simplified for day regeneration)
  profiler.startPhase('save');
  const score = 100 - (finalConflicts.length * 10) - (constraintViolations.length * 5);

  // Count affected slots
  const affectedSlotsCount = impact.slots.length;

  // Save as new version
  await saveTimetables({
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts: finalConflicts,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
    notes: `Regenerated for day ${day}`,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: usedSlots,
      constraintViolations,
      regenerationScope: `day:${day}`,
    },
  });

  // Performance: Log metrics
  profiler.endPhase();
  profiler.logMetrics(`Day Regeneration (${day})`);

  console.log(`[Regeneration] Day regeneration completed:`, {
    day,
    sectionId,
    generationTime: `${profiler.getMetrics().totalTime}ms`,
    changedSlots: changedSlots.length,
    affectedSlots: affectedSlotsCount,
    conflicts: finalConflicts.length,
    cacheStats: constraintCache.getStats(),
  });

  return {
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts: finalConflicts,
    diagnostics: {
      totalSlots: daySlotCount * 5, // Approximate
      usedSlots,
      labSlots,
      theorySlots,
      teacherLoad,
      roomUtilization,
    },
    sectionScores: { [sectionId]: score },
    changedSlots,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: usedSlots,
      constraintViolations,
      regenerationScope: `day:${day}`,
      performance: metrics, // Include performance metrics
    },
  };
}

/**
 * Helper: Find contiguous slots for lab placement on a specific day
 */
function findContiguousSlotsForDay(dayData: (TimetableCell | null)[], duration: number): number[] {
  const available: number[] = [];
  let consecutive = 0;

  for (let i = 0; i < dayData.length; i++) {
    const cell = dayData[i];
    if (!cell || (cell.type !== 'lab' && cell.type !== 'theory')) {
      consecutive++;
      if (consecutive >= duration) {
        available.push(i - duration + 1);
      }
    } else {
      consecutive = 0;
    }
  }

  return available;
}

