/**
 * Greedy Solver - Baseline Deterministic Engine
 * 
 * This is the foundation solver that:
 * - Fills timetable slot-by-slot
 * - Applies hard constraints strictly
 * - Scores soft constraints but allows violations
 * - Produces a valid timetable or returns conflicts
 * - Feeds constraints through the constraint engine
 */

import { TimetableData, TimetableCell, DAYS, getAllSlots, isBreakSlot, findContiguousSlots as findContiguousSlotsUtil } from '../utils';
import { constraintRegistry, ConstraintContext } from '../constraints';
import { scoreTimetable, ScoringContext } from '../scoring';
import { GenerationMode, GenerationPriorities } from '../../types/preferences';
import seedrandom from 'seedrandom';

export interface GreedySolverOptions {
  sections: any[];
  slots?: string[];
  lectureRooms: any[];
  labRooms: any[];
  seed?: number;
  generationMode?: GenerationMode;
  priorities?: GenerationPriorities;
  constraints?: {
    labPlacementDays?: string[];
    morningRange?: string[];
    afternoonRange?: string[];
  };
}

export interface GreedySolverResult {
  timetables: { [sectionId: string]: TimetableData };
  score: number;
  conflicts: Array<{
    type: 'teacher' | 'room' | 'subject' | 'lab' | 'constraint';
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
  constraintViolations: string[];
}

/**
 * Main greedy solver function
 */
export async function solveGreedy(options: GreedySolverOptions): Promise<GreedySolverResult> {
  const {
    sections,
    slots: providedSlots,
    lectureRooms,
    labRooms,
    seed,
    generationMode = 'adaptive',
    priorities,
    constraints,
  } = options;

  const slots = providedSlots || getAllSlots(true);
  const rng = seed ? seedrandom(seed.toString()) : seedrandom();
  
  const timetables: { [sectionId: string]: TimetableData } = {};
  const conflicts: GreedySolverResult['conflicts'] = [];
  const constraintViolations: string[] = [];

  // Performance: Pre-compute break slot indices to avoid repeated checks
  const breakSlotIndices = new Set<number>();
  slots.forEach((slot, idx) => {
    if (isBreakSlot(slot)) {
      breakSlotIndices.add(idx);
    }
  });

  // Initialize empty timetables
  // Performance: Use shared static day order, batch initialization
  for (const section of sections) {
    timetables[section.id] = {};
    for (const day of DAYS) {
      // Pre-allocate array with known size
      timetables[section.id][day] = new Array(slots.length);
      for (let i = 0; i < slots.length; i++) {
        timetables[section.id][day][i] = breakSlotIndices.has(i)
          ? { type: 'break' as const }
          : null;
      }
    }
  }

  // Track usage across ALL sections (for cross-section conflict detection)
  const teacherSlots: { [teacherId: string]: { [day: string]: Set<number> } } = {};
  const roomSlots: { [roomId: string]: { [day: string]: Set<number> } } = {};
  const subjectDayCount: { [sectionId: string]: { [subjectId: string]: { [day: string]: number } } } = {};
  const teacherLoad: { [teacherId: string]: number } = {};
  const roomUtilization: { [roomId: string]: number } = {};

  // Initialize tracking
  for (const section of sections) {
    subjectDayCount[section.id] = {};
    section.mappings?.forEach((m: any) => {
      if (!teacherSlots[m.teacherId]) {
        teacherSlots[m.teacherId] = {};
        teacherLoad[m.teacherId] = 0;
      }
      if (!subjectDayCount[section.id][m.subjectId]) {
        subjectDayCount[section.id][m.subjectId] = {};
      }
    });
  }

  // STEP 1: Place all LABS first (across all sections)
  const allLabs: Array<{ lab: any; section: any }> = [];
  for (const section of sections) {
    for (const lab of section.labs || []) {
      allLabs.push({ lab, section });
    }
  }

  // Sort labs by duration (longest first) and teacher load
  allLabs.sort((a, b) => {
    if (b.lab.durationSlots !== a.lab.durationSlots) {
      return b.lab.durationSlots - a.lab.durationSlots;
    }
    return (teacherLoad[b.lab.teacherId] || 0) - (teacherLoad[a.lab.teacherId] || 0);
  });

  for (const { lab, section } of allLabs) {
    const placed = await placeLabWithConstraints(
      timetables[section.id],
      lab,
      slots,
      teacherSlots,
      roomSlots,
      conflicts,
      constraintViolations,
      section.id,
      constraints
    );
    if (placed) {
      teacherLoad[lab.teacherId] = (teacherLoad[lab.teacherId] || 0) + lab.durationSlots;
      roomUtilization[lab.roomId] = (roomUtilization[lab.roomId] || 0) + lab.durationSlots;
    }
  }

  // STEP 2: Place THEORY classes (across all sections)
  for (const section of sections) {
    const shuffledMappings = [...(section.mappings || [])].sort(() => rng() - 0.5);

    for (const mapping of shuffledMappings) {
      const subject = mapping.subject;
      const teacher = mapping.teacher;
      const hoursNeeded = subject.hoursPerWeek || 0;
      let hoursPlaced = 0;

      while (hoursPlaced < hoursNeeded) {
        const placed = await placeTheoryClassWithConstraints(
          timetables[section.id],
          mapping,
          subject,
          teacher,
          lectureRooms,
          slots,
          teacherSlots,
          roomSlots,
          subjectDayCount[section.id],
          roomUtilization,
          conflicts,
          constraintViolations,
          section.id,
          constraints
        );

        if (placed) {
          hoursPlaced++;
          teacherLoad[teacher.id] = (teacherLoad[teacher.id] || 0) + 1;
        } else {
          // Could not place - record conflict
          conflicts.push({
            type: 'subject',
            day: '',
            slot: '',
            message: `Could not place all hours for ${subject.code} in section ${section.name}`,
            sectionId: section.id,
          });
          break;
        }
      }
    }
  }

  // Calculate scores per section and overall
  const sectionScores: { [sectionId: string]: number } = {};
  let totalScore = 0;

  for (const section of sections) {
    const sectionData = sections.find(s => s.id === section.id);
    const context: ScoringContext = {
      teacherLoads: teacherLoad,
      roomUtilization,
      teacherPreferences: buildTeacherPreferences(sections),
      conflicts: conflicts.filter(c => c.sectionId === section.id),
      slots,
      priorities,
      mode: generationMode,
      sectionRules: sectionData ? {
        maxHoursPerDay: sectionData.maxHoursPerDay,
        maxConsecutiveHours: sectionData.maxConsecutiveHours,
        minimumBreaks: sectionData.minimumBreaks,
        preferredStart: sectionData.preferredStart,
      } : undefined,
    };
    const score = scoreTimetable(timetables[section.id], context);
    sectionScores[section.id] = score;
    totalScore += score;
  }

  // Calculate diagnostics
  let totalSlots = 0;
  let usedSlots = 0;
  let labSlots = 0;
  let theorySlots = 0;

  for (const section of sections) {
    for (const day of DAYS) {
      for (const cell of timetables[section.id][day]) {
        totalSlots++;
        if (cell && cell.type === 'lab') {
          usedSlots++;
          labSlots++;
        } else if (cell && cell.type === 'theory') {
          usedSlots++;
          theorySlots++;
        }
      }
    }
  }

  return {
    timetables,
    score: totalScore / sections.length, // Average score
    conflicts,
    diagnostics: {
      totalSlots,
      usedSlots,
      labSlots,
      theorySlots,
      teacherLoad,
      roomUtilization,
    },
    sectionScores,
    constraintViolations,
  };
}

/**
 * Place lab with constraint validation
 */
async function placeLabWithConstraints(
  timetable: TimetableData,
  lab: any,
  slots: string[],
  teacherSlots: any,
  roomSlots: any,
  conflicts: GreedySolverResult['conflicts'],
  constraintViolations: string[],
  sectionId: string,
  constraints?: GreedySolverOptions['constraints']
): Promise<boolean> {
  const duration = lab.durationSlots || 2;
  const days = constraints?.labPlacementDays || DAYS;
  const shuffledDays = [...days].sort(() => Math.random() - 0.5);

  for (const day of shuffledDays) {
    const dayData = timetable[day] || [];
    const availableSlots = findContiguousSlots(dayData, duration);

    for (const startSlot of availableSlots) {
      // Build constraint context
      const context: ConstraintContext = {
        timetable,
        day,
        slot: startSlot.toString(),
        teacherId: lab.teacherId,
        subjectId: lab.subjectId || lab.id,
        roomId: lab.roomId,
        sectionId,
      };

      // Validate hard constraints
      const validation = constraintRegistry.validateHardConstraints(context);
      if (!validation.valid) {
        // Hard constraint violation - skip this slot
        constraintViolations.push(...validation.violations);
        continue;
      }

      // Check teacher availability
      if (teacherSlots[lab.teacherId]?.[day]?.has(startSlot)) {
        conflicts.push({
          type: 'teacher',
          day,
          slot: startSlot.toString(),
          message: `Teacher ${lab.teacherId} already assigned`,
          sectionId,
        });
        continue;
      }

      // Check room availability
      if (roomSlots[lab.roomId]?.[day]?.has(startSlot)) {
        conflicts.push({
          type: 'room',
          day,
          slot: startSlot.toString(),
          message: `Room ${lab.roomId} already assigned`,
          sectionId,
        });
        continue;
      }

      // Check for overlapping slots
      let canPlace = true;
      for (let i = 0; i < duration; i++) {
        const slotIndex = startSlot + i;
        if (slotIndex >= dayData.length) {
          canPlace = false;
          break;
        }
        const cell = dayData[slotIndex];
        if (cell && (cell.type === 'lab' || cell.type === 'theory')) {
          canPlace = false;
          break;
        }
      }

      if (!canPlace) continue;

      // Place the lab
      const firstIdx = startSlot;
      const entry: TimetableCell = {
        type: 'lab',
        subjectCode: lab.name || 'LAB',
        labName: lab.name,
        teacherId: lab.teacherId,
        teacherInitials: lab.teacher?.initials || lab.teacher?.name?.substring(0, 3) || '',
        roomId: lab.roomId,
        roomName: lab.room?.name || '',
        durationSlots: duration,
        colSpan: duration,
      };

      dayData[firstIdx] = entry;

      // Mark other slots as occupied (hidden)
      for (let i = 1; i < duration; i++) {
        const slotIndex = startSlot + i;
        if (slotIndex < dayData.length) {
          dayData[slotIndex] = {
            type: 'lab',
            labName: lab.name,
            teacherId: lab.teacherId,
            teacherInitials: lab.teacher?.initials || lab.teacher?.name?.substring(0, 3) || '',
            roomId: lab.roomId,
            roomName: lab.room?.name || '',
            durationSlots: duration,
            colSpan: 0, // Hidden
          };
        }
      }

      // Update tracking
      if (!teacherSlots[lab.teacherId]) {
        teacherSlots[lab.teacherId] = {};
      }
      if (!teacherSlots[lab.teacherId][day]) {
        teacherSlots[lab.teacherId][day] = new Set();
      }
      for (let i = 0; i < duration; i++) {
        teacherSlots[lab.teacherId][day].add(startSlot + i);
      }

      if (!roomSlots[lab.roomId]) {
        roomSlots[lab.roomId] = {};
      }
      if (!roomSlots[lab.roomId][day]) {
        roomSlots[lab.roomId][day] = new Set();
      }
      for (let i = 0; i < duration; i++) {
        roomSlots[lab.roomId][day].add(startSlot + i);
      }

      return true;
    }
  }

  return false;
}

/**
 * Place theory class with constraint validation
 */
async function placeTheoryClassWithConstraints(
  timetable: TimetableData,
  mapping: any,
  subject: any,
  teacher: any,
  lectureRooms: any[],
  slots: string[],
  teacherSlots: any,
  roomSlots: any,
  subjectDayCount: { [day: string]: number },
  roomUtilization: { [roomId: string]: number },
  conflicts: GreedySolverResult['conflicts'],
  constraintViolations: string[],
  sectionId: string,
  constraints?: GreedySolverOptions['constraints']
): Promise<boolean> {
  const days = [...DAYS].sort(() => Math.random() - 0.5);
  const shuffledRooms = [...lectureRooms].sort(() => Math.random() - 0.5);

  for (const day of days) {
    // Check subject spread constraint
    const dayCount = subjectDayCount[day] || 0;
    if (dayCount >= 2 && subject.spreadAcrossWeek) {
      continue; // Already has 2 classes this day, prefer spreading
    }

    const dayData = timetable[day] || [];
    for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
      const cell = dayData[slotIndex];
      if (cell && (cell.type === 'lab' || cell.type === 'theory')) {
        continue; // Slot occupied
      }
      if (isBreakSlot(slots[slotIndex])) {
        continue; // Break slot
      }

      // Try each available room
      for (const room of shuffledRooms) {
        // Build constraint context
        const context: ConstraintContext = {
          timetable,
          day,
          slot: slotIndex.toString(),
          teacherId: teacher.id,
          subjectId: subject.id,
          roomId: room.id,
          sectionId,
        };

        // Validate hard constraints
        const validation = constraintRegistry.validateHardConstraints(context);
        if (!validation.valid) {
          constraintViolations.push(...validation.violations);
          continue; // Try next room
        }

        // Check teacher availability
        if (teacherSlots[teacher.id]?.[day]?.has(slotIndex)) {
          continue; // Teacher busy
        }

        // Check room availability
        if (roomSlots[room.id]?.[day]?.has(slotIndex)) {
          continue; // Room busy
        }

        // Place the theory class
        const entry: TimetableCell = {
          type: 'theory',
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
          teacherSlots[teacher.id] = {};
        }
        if (!teacherSlots[teacher.id][day]) {
          teacherSlots[teacher.id][day] = new Set();
        }
        teacherSlots[teacher.id][day].add(slotIndex);

        if (!roomSlots[room.id]) {
          roomSlots[room.id] = {};
        }
        if (!roomSlots[room.id][day]) {
          roomSlots[room.id][day] = new Set();
        }
        roomSlots[room.id][day].add(slotIndex);

        subjectDayCount[day] = (subjectDayCount[day] || 0) + 1;
        roomUtilization[room.id] = (roomUtilization[room.id] || 0) + 1;

        return true;
      }
    }
  }

  return false;
}

/**
 * Helper: Find contiguous slots for lab placement
 */
function findContiguousSlots(dayData: (TimetableCell | null)[], duration: number): number[] {
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

/**
 * Helper: Build teacher preferences from sections
 */
function buildTeacherPreferences(sections: any[]): any {
  const preferences: any = {};
  for (const section of sections) {
    for (const mapping of section.mappings || []) {
      const teacher = mapping.teacher;
      if (teacher && !preferences[teacher.id]) {
        preferences[teacher.id] = {
          preferredTimeSlots: teacher.preferredTimeSlots ? JSON.parse(teacher.preferredTimeSlots) : [],
          availabilityMatrix: teacher.availabilityMatrix ? JSON.parse(teacher.availabilityMatrix) : {},
          maxClassesPerDay: teacher.maxClassesPerDay,
          maxClassesPerWeek: teacher.maxClassesPerWeek,
        };
      }
    }
  }
  return preferences;
}

