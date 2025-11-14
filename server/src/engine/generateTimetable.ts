import prisma from '../db';
import { 
  DAYS, 
  getAllSlots, 
  isBreakSlot, 
  TimetableData, 
  TimetableEntry,
  findContiguousSlots,
  hasTeacherConflict,
  hasRoomConflict,
  isSlotAvailable,
  getMorningSlots,
  getAfternoonSlots,
} from './utils';
import { scoreTimetable, ScoringContext, DEFAULT_WEIGHTS } from './scoring';
import { GenerationMode, GenerationPriorities } from '../types/preferences';
import seedrandom from 'seedrandom';
import { runSolver, SolverType } from './solvers';
import { normalizeGreedyResult, addConstraintViolationsToConflicts } from './normalizers/greedyToLegacy';

// Feature flag: Use new greedy solver (default: false for backward compatibility)
const USE_GREEDY_SOLVER = process.env.USE_GREEDY_SOLVER === 'true' || process.env.USE_GREEDY_SOLVER === '1';

interface Conflict {
  type: 'teacher' | 'room' | 'subject' | 'lab';
  day: string;
  slot: string;
  message: string;
  sectionId?: string;
}

interface GenerationOptions {
  sections: string[] | 'all';
  slots?: string[];
  candidateCount?: number;
  seed?: number;
  includeExtraSlots?: boolean;
  useAI?: boolean;
  constraints?: {
    labPlacementDays?: string[];
    morningRange?: string[];
    afternoonRange?: string[];
  };
  generationMode?: GenerationMode;
  priorities?: GenerationPriorities;
}

interface GenerationResult {
  timetables: { [sectionId: string]: TimetableData };
  score: number;
  conflicts: Conflict[];
  diagnostics: {
    totalSlots: number;
    usedSlots: number;
    labSlots: number;
    theorySlots: number;
    teacherLoad: { [teacherId: string]: number };
    roomUtilization: { [roomId: string]: number };
  };
  sectionScores: { [sectionId: string]: number };
  solverMetadata?: {
    solver: string;
    generationTime?: number;
    iterations?: number;
    placements?: number;
    constraintViolations?: string[];
  };
}

interface Candidate {
  timetables: { [sectionId: string]: TimetableData };
  score: number;
  conflicts: Conflict[];
  diagnostics: GenerationResult['diagnostics'];
  sectionScores: { [sectionId: string]: number };
}

export async function generateTimetable(options: GenerationOptions): Promise<GenerationResult> {
  const {
    sections,
    slots,
    candidateCount = 10,
    seed,
    includeExtraSlots = true,
    generationMode = 'adaptive',
    priorities,
  } = options;

  // Determine which sections to generate
  let sectionIds: string[];
  if (sections === 'all') {
    const allSections = await prisma.section.findMany({ select: { id: true } });
    sectionIds = allSections.map(s => s.id);
  } else {
    sectionIds = sections;
  }

  if (sectionIds.length === 0) {
    throw new Error('No sections to generate timetables for');
  }

  // Get all slots
  const allSlots = slots || getAllSlots(includeExtraSlots);

  // Fetch all required data
  const sectionsData = await prisma.section.findMany({
    where: { id: { in: sectionIds } },
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
  });

  const allRooms = await prisma.room.findMany();
  const lectureRooms = allRooms.filter(r => r.type === 'lecture');
  const labRooms = allRooms.filter(r => r.type === 'lab');

  // Load existing timetables to avoid overlaps
  const existingTimetables = await prisma.timetable.findMany({
    where: { sectionId: { in: sectionIds } },
  });

  // NEW PATH: Use greedy solver if feature flag is enabled
  if (USE_GREEDY_SOLVER) {
    console.log('[Solver] Using greedy solver (feature flag enabled)');
    const solverStartTime = Date.now();
    
    try {
      const solverResult = await runSolver({
        type: 'greedy',
        sections: sectionsData,
        slots: allSlots,
        lectureRooms,
        labRooms,
        seed,
        generationMode,
        priorities,
        constraints: options.constraints,
      });

      const solverEndTime = Date.now();
      const generationTime = solverEndTime - solverStartTime;

      // Log solver metrics
      console.log('[Solver] Greedy solver completed:', {
        solver: 'greedy',
        generationTime: `${generationTime}ms`,
        sections: sectionIds.length,
        conflicts: solverResult.conflicts.length,
        constraintViolations: solverResult.constraintViolations?.length || 0,
        score: solverResult.score,
        placements: solverResult.diagnostics.usedSlots,
      });

      // Normalize output to legacy format
      let normalized = normalizeGreedyResult(solverResult);
      
      // Add constraint violations to conflicts
      if (solverResult.constraintViolations && solverResult.constraintViolations.length > 0) {
        normalized = addConstraintViolationsToConflicts(normalized, solverResult.constraintViolations);
      }

      return {
        timetables: normalized.timetables,
        score: normalized.score,
        conflicts: normalized.conflicts,
        diagnostics: normalized.diagnostics,
        sectionScores: normalized.sectionScores,
        solverMetadata: {
          solver: 'greedy',
          generationTime,
          placements: solverResult.diagnostics.usedSlots,
          constraintViolations: solverResult.constraintViolations,
        },
      };
    } catch (error) {
      console.error('[Solver] Greedy solver failed, falling back to legacy generator:', error);
      // Fall through to legacy path
    }
  }

  // LEGACY PATH: Original candidate generation (preserved for backward compatibility)
  console.log('[Solver] Using legacy candidate generator');
  const legacyStartTime = Date.now();
  
  const candidates: Candidate[] = [];
  const rng = seed ? seedrandom(seed.toString()) : seedrandom();

  for (let i = 0; i < candidateCount; i++) {
    try {
      const candidateSeed = seed ? seed + i : undefined;
      const candidate = await generateCandidate(
        sectionsData,
        allSlots,
        lectureRooms,
        labRooms,
        candidateSeed,
        options.constraints,
        generationMode,
        priorities
      );
      candidates.push(candidate);
    } catch (error) {
      console.error(`Failed to generate candidate ${i}:`, error);
    }
  }

  if (candidates.length === 0) {
    throw new Error('Failed to generate any valid timetable candidates');
  }

  // Sort by score (higher is better)
  candidates.sort((a, b) => b.score - a.score);

  const legacyEndTime = Date.now();
  console.log('[Solver] Legacy generator completed:', {
    solver: 'legacy',
    generationTime: `${legacyEndTime - legacyStartTime}ms`,
    candidates: candidates.length,
    bestScore: candidates[0].score,
  });

  // Return best candidate
  const best = candidates[0];
  return {
    timetables: best.timetables,
    score: best.score,
    conflicts: best.conflicts,
    diagnostics: best.diagnostics,
    sectionScores: best.sectionScores,
    solverMetadata: {
      solver: 'legacy',
      generationTime: legacyEndTime - legacyStartTime,
      placements: best.diagnostics.usedSlots,
    },
  };
}

async function generateCandidate(
  sections: any[],
  slots: string[],
  lectureRooms: any[],
  labRooms: any[],
  seed?: number,
  constraints?: GenerationOptions['constraints'],
  generationMode?: GenerationMode,
  priorities?: GenerationPriorities
): Promise<Candidate> {
  const rng = seed ? seedrandom(seed.toString()) : seedrandom();
  const timetables: { [sectionId: string]: TimetableData } = {};
  const conflicts: Conflict[] = [];

  // Initialize empty timetables
  for (const section of sections) {
    timetables[section.id] = {};
    for (const day of DAYS) {
      timetables[section.id][day] = slots.map(slot => {
        if (isBreakSlot(slot)) {
          return { type: 'break' as const };
        }
        return null;
      });
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
    section.mappings.forEach((m: any) => {
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
    for (const lab of section.labs) {
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
    const placed = placeLab(
      timetables[section.id],
      lab,
      slots,
      teacherSlots,
      roomSlots,
      conflicts,
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
    const shuffledMappings = [...section.mappings].sort(() => rng() - 0.5);

    for (const mapping of shuffledMappings) {
      const subject = mapping.subject;
      const teacher = mapping.teacher;
      const hoursNeeded = subject.hoursPerWeek;
      let hoursPlaced = 0;

      while (hoursPlaced < hoursNeeded) {
        const placed = placeTheoryClass(
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
          section.id,
          constraints
        );

        if (placed) {
          hoursPlaced++;
          teacherLoad[teacher.id] = (teacherLoad[teacher.id] || 0) + 1;
        } else {
          break;
        }
      }
    }
  }

  // Calculate scores per section and overall
  const sectionScores: { [sectionId: string]: number } = {};
  let totalScore = 0;

  for (const section of sections) {
    // Fetch section and subject data for constraints
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
        maxBackToBack: sectionData.maxBackToBack,
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
  };
}

function placeLab(
  timetable: TimetableData,
  lab: any,
  slots: string[],
  teacherSlots: any,
  roomSlots: any,
  conflicts: Conflict[],
  sectionId: string,
  constraints?: GenerationOptions['constraints']
): boolean {
  const duration = lab.durationSlots;
  const preferredDays = constraints?.labPlacementDays || DAYS;

  // Try each preferred day first, then others
  const daysToTry = [...preferredDays, ...DAYS.filter(d => !preferredDays.includes(d))];

  for (const day of daysToTry) {
    for (let startIdx = 0; startIdx <= slots.length - duration; startIdx++) {
      const requiredSlots = findContiguousSlots(slots, duration, startIdx, new Set());
      if (!requiredSlots) continue;

      // Check conflicts
      if (hasTeacherConflict(lab.teacherId, day, requiredSlots, teacherSlots)) {
        continue;
      }
      if (hasRoomConflict(lab.roomId, day, requiredSlots, roomSlots)) {
        continue;
      }

      // Check if slots are available
      let canPlace = true;
      for (const idx of requiredSlots) {
        if (!isSlotAvailable(day, idx, timetable)) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place the lab
        const firstIdx = requiredSlots[0];
        timetable[day][firstIdx] = {
          type: 'lab',
          labName: lab.name,
          teacherInitials: lab.teacher.initials || lab.teacher.name.substring(0, 3),
          teacherId: lab.teacherId,
          roomName: lab.room.name,
          roomId: lab.roomId,
          durationSlots: duration,
          colSpan: duration,
        };

        // Mark other slots as occupied
        for (let i = 1; i < duration; i++) {
          timetable[day][firstIdx + i] = {
            type: 'lab',
            labName: lab.name,
            teacherInitials: lab.teacher.initials || lab.teacher.name.substring(0, 3),
            teacherId: lab.teacherId,
            roomName: lab.room.name,
            roomId: lab.roomId,
            durationSlots: duration,
            colSpan: 0, // Hidden
          };
        }

        // Update tracking
        if (!teacherSlots[lab.teacherId]) {
          teacherSlots[lab.teacherId] = {};
        }
        if (!teacherSlots[lab.teacherId][day]) {
          teacherSlots[lab.teacherId][day] = new Set();
        }
        requiredSlots.forEach(idx => teacherSlots[lab.teacherId][day].add(idx));

        if (!roomSlots[lab.roomId]) {
          roomSlots[lab.roomId] = {};
        }
        if (!roomSlots[lab.roomId][day]) {
          roomSlots[lab.roomId][day] = new Set();
        }
        requiredSlots.forEach(idx => roomSlots[lab.roomId][day].add(idx));

        return true;
      }
    }
  }

  conflicts.push({
    type: 'lab',
    day: '',
    slot: '',
    message: `Could not place lab ${lab.name} for ${lab.teacher.name}`,
    sectionId,
  });
  return false;
}

function placeTheoryClass(
  timetable: TimetableData,
  mapping: any,
  subject: any,
  teacher: any,
  lectureRooms: any[],
  slots: string[],
  teacherSlots: any,
  roomSlots: any,
  subjectDayCount: any,
  roomUtilization: any,
  conflicts: Conflict[],
  sectionId: string,
  constraints?: GenerationOptions['constraints']
): boolean {
  // Get preferred time slots
  let preferredSlots: number[] = [];
  if (teacher.preferredTime === 'Morning') {
    preferredSlots = getMorningSlots(slots);
  } else if (teacher.preferredTime === 'Afternoon') {
    preferredSlots = getAfternoonSlots(slots);
  } else {
    preferredSlots = slots.map((_, i) => i).filter(i => !isBreakSlot(slots[i]));
  }

  // Shuffle preferred slots
  preferredSlots.sort(() => Math.random() - 0.5);

  // Try each day
  const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);

  for (const day of shuffledDays) {
    // Check if subject already placed today
    const dayCount = subjectDayCount[subject.id]?.[day] || 0;
    if (dayCount > 0) {
      continue;
    }

    // Try preferred slots first, then others
    const allSlotIndices = [...preferredSlots];
    for (let i = 0; i < slots.length; i++) {
      if (!allSlotIndices.includes(i) && !isBreakSlot(slots[i])) {
        allSlotIndices.push(i);
      }
    }

    for (const slotIdx of allSlotIndices) {
      if (slotIdx >= slots.length) continue;
      if (isBreakSlot(slots[slotIdx])) continue;
      if (!isSlotAvailable(day, slotIdx, timetable)) continue;

      // Check teacher conflict (across all sections)
      if (hasTeacherConflict(teacher.id, day, [slotIdx], teacherSlots)) {
        continue;
      }

      // Find available room
      let room = null;
      const shuffledRooms = [...lectureRooms].sort(() => Math.random() - 0.5);
      for (const r of shuffledRooms) {
        if (!hasRoomConflict(r.id, day, [slotIdx], roomSlots)) {
          room = r;
          break;
        }
      }

      if (!room) {
        continue;
      }

      // Place the class
      timetable[day][slotIdx] = {
        type: 'theory',
        subjectCode: subject.code,
        subjectName: subject.name,
        teacherInitials: teacher.initials || teacher.name.substring(0, 3),
        teacherId: teacher.id,
        roomName: room.name,
        roomId: room.id,
      };

      // Update tracking
      if (!teacherSlots[teacher.id]) {
        teacherSlots[teacher.id] = {};
      }
      if (!teacherSlots[teacher.id][day]) {
        teacherSlots[teacher.id][day] = new Set();
      }
      teacherSlots[teacher.id][day].add(slotIdx);

      if (!roomSlots[room.id]) {
        roomSlots[room.id] = {};
      }
      if (!roomSlots[room.id][day]) {
        roomSlots[room.id][day] = new Set();
      }
      roomSlots[room.id][day].add(slotIdx);

      if (!subjectDayCount[subject.id]) {
        subjectDayCount[subject.id] = {};
      }
      if (!subjectDayCount[subject.id][day]) {
        subjectDayCount[subject.id][day] = 0;
      }
      subjectDayCount[subject.id][day]++;

      roomUtilization[room.id] = (roomUtilization[room.id] || 0) + 1;

      return true;
    }
  }

  conflicts.push({
    type: 'subject',
    day: '',
    slot: '',
    message: `Could not place ${subject.code} for ${teacher.name}`,
    sectionId,
  });
  return false;
}

function buildTeacherPreferences(sections: any[]): { [teacherId: string]: { morning: boolean; afternoon: boolean; slots?: number[] } } {
  const prefs: { [teacherId: string]: { morning: boolean; afternoon: boolean; slots?: number[] } } = {};
  
  for (const section of sections) {
    for (const mapping of section.mappings) {
      const teacher = mapping.teacher;
      if (!prefs[teacher.id]) {
        prefs[teacher.id] = {
          morning: teacher.preferredTime === 'Morning',
          afternoon: teacher.preferredTime === 'Afternoon',
        };
        if (teacher.preferredTimeSlots) {
          try {
            prefs[teacher.id].slots = JSON.parse(teacher.preferredTimeSlots);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
  
  return prefs;
}
