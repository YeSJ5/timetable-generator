/**
 * Test Fixtures
 * 
 * Deterministic test data for E2E tests
 */

import prisma from '../../src/db';
import { TimetableData } from '../../src/engine/utils';

/**
 * Create a complete test fixture with all required entities
 */
export async function createTestFixture() {
  // Create section
  const section = await prisma.section.create({
    data: {
      name: 'E2E Test Section',
    },
  });

  // Create teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: 'Teacher A',
        initials: 'TA',
        maxClassesPerDay: 4,
        maxClassesPerWeek: 20,
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Teacher B',
        initials: 'TB',
        maxClassesPerDay: 3,
        maxClassesPerWeek: 15,
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Teacher C',
        initials: 'TC',
        maxClassesPerDay: 5,
        maxClassesPerWeek: 25,
      },
    }),
  ]);

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        code: 'CS101',
        name: 'Data Structures',
        hoursPerWeek: 3,
        type: 'theory',
      },
    }),
    prisma.subject.create({
      data: {
        code: 'CS102',
        name: 'Algorithms',
        hoursPerWeek: 2,
        type: 'theory',
      },
    }),
    prisma.subject.create({
      data: {
        code: 'CS103',
        name: 'Database Systems',
        hoursPerWeek: 4,
        type: 'theory',
      },
    }),
  ]);

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Room A',
        type: 'lecture',
        capacity: 50,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Room B',
        type: 'lecture',
        capacity: 60,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Lab Room',
        type: 'lab',
        capacity: 30,
      },
    }),
  ]);

  // Create mappings (Teacher A -> CS101, Teacher B -> CS102, Teacher C -> CS103)
  await Promise.all([
    prisma.teacherSubjectMapping.create({
      data: {
        teacherId: teachers[0].id,
        subjectId: subjects[0].id,
        sectionId: section.id,
      },
    }),
    prisma.teacherSubjectMapping.create({
      data: {
        teacherId: teachers[1].id,
        subjectId: subjects[1].id,
        sectionId: section.id,
      },
    }),
    prisma.teacherSubjectMapping.create({
      data: {
        teacherId: teachers[2].id,
        subjectId: subjects[2].id,
        sectionId: section.id,
      },
    }),
  ]);

  // Create labs
  const labs = await Promise.all([
    prisma.lab.create({
      data: {
        name: 'CS101 Lab',
        sectionId: section.id,
        teacherId: teachers[0].id,
        roomId: rooms[2].id,
        durationSlots: 2,
      },
    }),
  ]);

  return {
    section,
    teachers,
    subjects,
    rooms,
    labs,
  };
}

/**
 * Create a deterministic initial timetable fixture
 */
export function createInitialTimetableFixture(
  teachers: Array<{ id: string; initials: string | null }>,
  subjects: { code: string }[],
  rooms: { id: string; name: string }[]
): TimetableData {
  const getInitials = (teacher: { initials: string | null }) => teacher.initials || 'T';
  
  return {
    Mon: [
      { type: 'theory', subjectCode: subjects[0].code, teacherId: teachers[0].id, teacherInitials: getInitials(teachers[0]), roomId: rooms[0].id, roomName: rooms[0].name },
      { type: 'theory', subjectCode: subjects[1].code, teacherId: teachers[1].id, teacherInitials: getInitials(teachers[1]), roomId: rooms[1].id, roomName: rooms[1].name },
      { type: 'break' },
      { type: 'theory', subjectCode: subjects[0].code, teacherId: teachers[0].id, teacherInitials: getInitials(teachers[0]), roomId: rooms[0].id, roomName: rooms[0].name },
      { type: 'theory', subjectCode: subjects[2].code, teacherId: teachers[2].id, teacherInitials: getInitials(teachers[2]), roomId: rooms[1].id, roomName: rooms[1].name },
      { type: 'break' },
      null,
      null,
    ],
    Tue: [
      { type: 'lab', subjectCode: 'CS101 Lab', labName: 'CS101 Lab', teacherId: teachers[0].id, teacherInitials: getInitials(teachers[0]), roomId: rooms[2].id, roomName: rooms[2].name, durationSlots: 2, colSpan: 2 },
      { type: 'lab', subjectCode: 'CS101 Lab', labName: 'CS101 Lab', teacherId: teachers[0].id, teacherInitials: getInitials(teachers[0]), roomId: rooms[2].id, roomName: rooms[2].name, durationSlots: 2, colSpan: 0 },
      { type: 'break' },
      { type: 'theory', subjectCode: subjects[1].code, teacherId: teachers[1].id, teacherInitials: getInitials(teachers[1]), roomId: rooms[0].id, roomName: rooms[0].name },
      null,
      { type: 'break' },
      null,
      null,
    ],
    Wed: Array(8).fill(null),
    Thu: Array(8).fill(null),
    Fri: Array(8).fill(null),
  };
}

/**
 * Load fixture timetable into database
 */
export async function loadFixtureTimetable(
  sectionId: string,
  timetable: TimetableData,
  version: number = 1
) {
  const saved = await prisma.timetable.create({
    data: {
      sectionId,
      json: JSON.stringify(timetable),
      version,
      score: 80,
      healthScore: 85,
      generationMode: 'adaptive',
    },
  });

  // Create version history entry
  await prisma.timetableVersion.create({
    data: {
      timetableId: saved.id,
      version,
      json: JSON.stringify(timetable),
      score: 80,
      healthScore: 85,
      notes: `Fixture version ${version}`,
    },
  });

  return saved;
}

/**
 * Cleanup test fixture
 */
export async function cleanupTestFixture(fixture: Awaited<ReturnType<typeof createTestFixture>>) {
  await prisma.timetableVersion.deleteMany({
    where: { timetable: { sectionId: fixture.section.id } },
  });
  await prisma.timetable.deleteMany({
    where: { sectionId: fixture.section.id },
  });
  await prisma.lab.deleteMany({
    where: { sectionId: fixture.section.id },
  });
  await prisma.teacherSubjectMapping.deleteMany({
    where: { sectionId: fixture.section.id },
  });
  await prisma.subject.deleteMany({
    where: { id: { in: fixture.subjects.map(s => s.id) } },
  });
  await prisma.teacher.deleteMany({
    where: { id: { in: fixture.teachers.map(t => t.id) } },
  });
  await prisma.room.deleteMany({
    where: { id: { in: fixture.rooms.map(r => r.id) } },
  });
  await prisma.section.delete({
    where: { id: fixture.section.id },
  });
}

