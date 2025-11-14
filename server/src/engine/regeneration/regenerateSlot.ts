/**
 * Regenerate Slot Schedule
 * 
 * Partially regenerates timetable for a specific slot with minimal disturbance
 * Preserves all other slots, days, teachers, and rooms
 */

import prisma from '../../db';
import { TimetableData, TimetableCell, getAllSlots, DAYS, isBreakSlot } from '../utils';
import { analyzeSlotImpact, unassignImpactedSlots, trackChanges, ImpactedRegion } from './impactAnalysis';
import { RegenerationOptions, RegenerationResult } from './types';
import { saveTimetables } from '../saveTimetables';
import { Conflict } from '../aiInspector';
import { constraintRegistry, ConstraintContext } from '../constraints';
import {
  RegenerationProfiler,
  AvailabilityCache,
  ConstraintMemoCache,
  cloneSlotRange,
  shallowCloneTimetable,
  cloneDay,
} from './performance';

/**
 * Regenerate timetable for a specific slot
 */
export async function regenerateSlot(
  options: RegenerationOptions & { day: string; slotIndex: number }
): Promise<RegenerationResult> {
  const {
    timetableId,
    sectionId,
    day,
    slotIndex,
    preserveUnchanged = true,
    solverType = 'greedy',
  } = options;

  if (!DAYS.includes(day as any)) {
    throw new Error(`Invalid day: ${day}. Must be one of: ${DAYS.join(', ')}`);
  }

  if (slotIndex < 0) {
    throw new Error(`Invalid slotIndex: ${slotIndex}. Must be >= 0`);
  }

  console.log(`[Regeneration] Regenerating slot ${slotIndex} on ${day} in section ${sectionId}`);

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

  // Validate slot index
  const dayData = currentTimetable[day] || [];
  if (slotIndex >= dayData.length) {
    throw new Error(`Invalid slotIndex: ${slotIndex}. Day ${day} has only ${dayData.length} slots`);
  }

  // Build availability cache (exclude target slot)
  profiler.markPhase('cache');
  const availabilityCache = new AvailabilityCache();
  availabilityCache.buildFromTimetable(currentTimetable, day, slotIndex);
  const constraintCache = new ConstraintMemoCache();

  // Analyze impact - single slot (may include lab block)
  profiler.markPhase('impact');
  const impactResult = analyzeSlotImpact(currentTimetable, day, slotIndex);
  const impact: ImpactedRegion & { isLab?: boolean; labDuration?: number } = {
    ...impactResult,
    sectionId,
  };

  console.log(`[Regeneration] Slot impact analysis:`, {
    day,
    slotIndex,
    affectedTeachers: impact.affectedTeachers.length,
    affectedRooms: impact.affectedRooms.length,
    affectedSubjects: impact.affectedSubjects.length,
    isLab: impact.isLab || false,
    labDuration: impact.labDuration || 0,
  });

  // Unassign impacted slot(s) - may be multiple if it's a lab block
  profiler.markPhase('unassign');
  // Only clone the affected day, not entire timetable
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

  profiler.startPhase('placement');

  // Performance: Use shallow clone and only clone the target day
  profiler.recordClone();
  const workingTimetable = shallowCloneTimetable(unassignedTimetable);
  workingTimetable[day] = cloneDay(unassignedTimetable, day);
  const workingDayData = workingTimetable[day] || [];

  // Performance: Reuse availability cache instead of rebuilding
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

  // Determine if we need to place a lab block or theory class
  const isLabSlot = impact.isLab || false;
  const labDuration = impact.labDuration || 0;
  const originalCell = dayData[slotIndex];

  let placed = false;
  let placedType: 'lab' | 'theory' | null = null;
  let impactedEntities: string[] = [];

  if (isLabSlot && labDuration > 0) {
    // Try to place a lab block starting at this slot
    placed = await placeLabBlockAtSlot(
      workingDayData,
      section,
      slotIndex,
      labDuration,
      labRooms,
      teacherSlots,
      roomSlots,
      conflicts,
      constraintViolations,
      sectionId,
      day
    );
    placedType = 'lab';
  } else {
    // Try to place a theory class at this slot
    placed = await placeTheoryClassAtSlot(
      workingDayData,
      section,
      slotIndex,
      slots,
      lectureRooms,
      teacherSlots,
      roomSlots,
      conflicts,
      constraintViolations,
      sectionId,
      day,
      currentTimetable
    );
    placedType = 'theory';
  }

  // Collect impacted entities
  if (originalCell) {
    if (originalCell.teacherId) {
      impactedEntities.push(`teacher:${originalCell.teacherId}`);
    }
    if (originalCell.roomId) {
      impactedEntities.push(`room:${originalCell.roomId}`);
    }
    if (originalCell.subjectCode) {
      impactedEntities.push(`subject:${originalCell.subjectCode}`);
    }
  }

  const solverEndTime = Date.now();
  const generationTime = solverEndTime - solverStartTime;

  // Update working timetable with the day data
  workingTimetable[day] = workingDayData;

  // Merge regenerated slot back into original timetable
  profiler.markPhase('merge');
  let finalTimetable: TimetableData;
  if (preserveUnchanged) {
    // Performance: Use shallow clone instead of deep clone
    profiler.recordClone();
    finalTimetable = shallowCloneTimetable(currentTimetable);
    
    // Overwrite only the target slot (and lab block if applicable)
    if (workingTimetable[day]) {
      const finalDayData = finalTimetable[day] || [];
      const regeneratedDayData = workingTimetable[day];
      
      // Ensure arrays are same length
      while (finalDayData.length < regeneratedDayData.length) {
        finalDayData.push(null);
      }
      
      // Copy the regenerated slot(s)
      if (isLabSlot && labDuration > 0) {
        // Copy entire lab block
        for (let i = 0; i < labDuration && slotIndex + i < regeneratedDayData.length; i++) {
          finalDayData[slotIndex + i] = regeneratedDayData[slotIndex + i];
        }
      } else {
        // Copy single slot
        finalDayData[slotIndex] = regeneratedDayData[slotIndex];
      }
      
      finalTimetable[day] = finalDayData;
    }
  } else {
    finalTimetable = workingTimetable;
  }

  // Track changes (only for this slot)
  profiler.startPhase('track');
  const changedSlots = trackChanges(currentTimetable, finalTimetable, sectionId).filter(
    change => change.day === day && change.slot === slotIndex.toString()
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

  // Calculate score (simplified for slot regeneration)
  const score = placed ? (100 - (finalConflicts.length * 10) - (constraintViolations.length * 5)) : 50;

  // Calculate diagnostics
  const usedSlots = placed ? (isLabSlot ? labDuration : 1) : 0;
  const labSlots = placed && isLabSlot ? labDuration : 0;
  const theorySlots = placed && !isLabSlot ? 1 : 0;
  const teacherLoad: { [teacherId: string]: number } = {};
  const roomUtilization: { [roomId: string]: number } = {};

  if (placed && workingDayData[slotIndex]) {
    const cell = workingDayData[slotIndex];
    if (cell && (cell.type === 'lab' || cell.type === 'theory')) {
      teacherLoad[cell.teacherId] = (teacherLoad[cell.teacherId] || 0) + 1;
      if (cell.roomId) {
        roomUtilization[cell.roomId] = (roomUtilization[cell.roomId] || 0) + 1;
      }
    }
  }

  // Save as new version
  await saveTimetables({
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts: finalConflicts,
    generationMode: timetable.generationMode || 'adaptive',
    priorities: timetable.priorities ? JSON.parse(timetable.priorities) : undefined,
    notes: `Regenerated slot ${slotIndex} on ${day}`,
    solverMetadata: {
      solver: solverType,
      generationTime,
      placements: usedSlots,
      constraintViolations,
      regenerationScope: `slot:${day}:${slotIndex}`,
      slotType: placedType || 'none',
      impactedEntities,
      isLabBlock: isLabSlot && labDuration > 0,
    },
  });

  // Performance: Log metrics
  profiler.endPhase();
  profiler.logMetrics(`Slot Regeneration (${day}:${slotIndex})`);

  console.log(`[Regeneration] Slot regeneration completed:`, {
    day,
    slotIndex,
    sectionId,
    generationTime: `${profiler.getMetrics().totalTime}ms`,
    placed,
    placedType,
    changedSlots: changedSlots.length,
    conflicts: finalConflicts.length,
    cacheStats: constraintCache.getStats(),
  });

  return {
    timetables: { [sectionId]: finalTimetable },
    score,
    conflicts: finalConflicts,
    diagnostics: {
      totalSlots: dayData.length * 5, // Approximate
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
      regenerationScope: `slot:${day}:${slotIndex}`,
      performance: metrics, // Include performance metrics
    },
  };
}

/**
 * Place a lab block starting at a specific slot
 */
async function placeLabBlockAtSlot(
  dayData: (TimetableCell | null)[],
  section: any,
  startSlot: number,
  duration: number,
  labRooms: any[],
  teacherSlots: { [teacherId: string]: Set<number> },
  roomSlots: { [roomId: string]: Set<number> },
  conflicts: Array<{ type: string; day: string; slot: string; message: string; sectionId?: string }>,
  constraintViolations: string[],
  sectionId: string,
  day: string
): Promise<boolean> {
  // Check if we have enough contiguous slots
  if (startSlot + duration > dayData.length) {
    conflicts.push({
      type: 'lab',
      day,
      slot: startSlot.toString(),
      message: `Not enough slots for lab block (need ${duration}, have ${dayData.length - startSlot})`,
      sectionId,
    });
    return false;
  }

  // Check if all slots in the block are available
  for (let i = 0; i < duration; i++) {
    const cell = dayData[startSlot + i];
    if (cell && (cell.type === 'lab' || cell.type === 'theory')) {
      conflicts.push({
        type: 'lab',
        day,
        slot: (startSlot + i).toString(),
        message: `Slot ${startSlot + i} is already occupied`,
        sectionId,
      });
      return false;
    }
  }

  // Try each lab
  const availableLabs = section.labs || [];
  const shuffledLabs = [...availableLabs].sort(() => Math.random() - 0.5);

  for (const lab of shuffledLabs) {
    if (lab.durationSlots !== duration) {
      continue; // Lab duration must match
    }

    // Check teacher availability for all slots in block
    let teacherAvailable = true;
    for (let i = 0; i < duration; i++) {
      if (teacherSlots[lab.teacherId]?.has(startSlot + i)) {
        teacherAvailable = false;
        break;
      }
    }

    if (!teacherAvailable) {
      continue;
    }

    // Check room availability for all slots in block
    let roomAvailable = true;
    for (let i = 0; i < duration; i++) {
      if (roomSlots[lab.roomId]?.has(startSlot + i)) {
        roomAvailable = false;
        break;
      }
    }

    if (!roomAvailable) {
      continue;
    }

      // Performance: Use memoized constraint check
      const context = {
        timetable: { [day]: dayData } as TimetableData,
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

    // Place the lab block
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

    return true; // Lab placed successfully
  }

  return false; // Could not place any lab
}

/**
 * Place a theory class at a specific slot
 */
async function placeTheoryClassAtSlot(
  dayData: (TimetableCell | null)[],
  section: any,
  slotIndex: number,
  slots: string[],
  lectureRooms: any[],
  teacherSlots: { [teacherId: string]: Set<number> },
  roomSlots: { [roomId: string]: Set<number> },
  conflicts: Array<{ type: string; day: string; slot: string; message: string; sectionId?: string }>,
  constraintViolations: string[],
  sectionId: string,
  day: string,
  currentTimetable: TimetableData
): Promise<boolean> {
  // Check if slot is available
  if (dayData[slotIndex] && (dayData[slotIndex]?.type === 'lab' || dayData[slotIndex]?.type === 'theory')) {
    conflicts.push({
      type: 'subject',
      day,
      slot: slotIndex.toString(),
      message: `Slot ${slotIndex} is already occupied`,
      sectionId,
    });
    return false;
  }

  // Check if it's a break slot
  if (isBreakSlot(slots[slotIndex])) {
    conflicts.push({
      type: 'subject',
      day,
      slot: slotIndex.toString(),
      message: `Slot ${slotIndex} is a break slot`,
      sectionId,
    });
    return false;
  }

  // Try each mapping
  const mappings = section.mappings || [];
  const shuffledMappings = [...mappings].sort(() => Math.random() - 0.5);

  for (const mapping of shuffledMappings) {
    const subject = mapping.subject;
    const teacher = mapping.teacher;

    // Check if teacher is available at this slot
    if (teacherSlots[teacher.id]?.has(slotIndex)) {
      continue;
    }

    // Calculate hours already placed this week
    let hoursAlreadyPlaced = 0;
    for (const d of DAYS) {
      const otherDayData = currentTimetable[d] || [];
      for (const cell of otherDayData) {
        if (cell && cell.subjectCode === subject.code && cell.teacherId === teacher.id) {
          hoursAlreadyPlaced++;
        }
      }
    }

    // Check if we still need hours for this subject
    const hoursNeeded = subject.hoursPerWeek || 0;
    if (hoursAlreadyPlaced >= hoursNeeded) {
      continue; // Already have enough hours
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
        timetable: { [day]: dayData } as TimetableData,
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

      return true; // Theory class placed successfully
    }
  }

  return false; // Could not place any theory class
}

