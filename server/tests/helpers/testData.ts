/**
 * Test Data Helper
 * 
 * Provides utilities for creating seeded test data
 */

import prisma from '../../src/db';
import { TimetableData } from '../../src/engine/utils';

export interface TestData {
  sectionId: string;
  teacherIds: string[];
  subjectIds: string[];
  roomIds: string[];
  labIds: string[];
  timetableId: string;
}

/**
 * Create seeded test data for regeneration tests
 */
export async function createTestData(seed: string = 'default'): Promise<TestData> {
  // Create section
  const section = await prisma.section.create({
    data: {
      name: `Test Section ${seed}`,
    },
  });

  // Create teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: `Teacher A ${seed}`,
        initials: 'TA',
        maxClassesPerDay: 4,
        maxClassesPerWeek: 20,
      },
    }),
    prisma.teacher.create({
      data: {
        name: `Teacher B ${seed}`,
        initials: 'TB',
        maxClassesPerDay: 3,
        maxClassesPerWeek: 15,
      },
    }),
    prisma.teacher.create({
      data: {
        name: `Teacher C ${seed}`,
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
        code: `SUBJ1_${seed}`,
        name: `Subject 1 ${seed}`,
        hoursPerWeek: 3,
        type: 'theory',
      },
    }),
    prisma.subject.create({
      data: {
        code: `SUBJ2_${seed}`,
        name: `Subject 2 ${seed}`,
        hoursPerWeek: 2,
        type: 'theory',
      },
    }),
    prisma.subject.create({
      data: {
        code: `SUBJ3_${seed}`,
        name: `Subject 3 ${seed}`,
        hoursPerWeek: 4,
        type: 'theory',
      },
    }),
  ]);

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: `Room A ${seed}`,
        type: 'lecture',
        capacity: 50,
      },
    }),
    prisma.room.create({
      data: {
        name: `Room B ${seed}`,
        type: 'lecture',
        capacity: 60,
      },
    }),
    prisma.room.create({
      data: {
        name: `Lab Room ${seed}`,
        type: 'lab',
        capacity: 30,
      },
    }),
  ]);

  // Create mappings (teacher 1 -> subject 1, teacher 2 -> subject 2, teacher 3 -> subject 3)
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
        name: `Lab 1 ${seed}`,
        sectionId: section.id,
        teacherId: teachers[0].id,
        roomId: rooms[2].id,
        durationSlots: 2,
      },
    }),
    prisma.lab.create({
      data: {
        name: `Lab 2 ${seed}`,
        sectionId: section.id,
        teacherId: teachers[1].id,
        roomId: rooms[2].id,
        durationSlots: 3,
      },
    }),
  ]);

  // Create initial timetable
  const initialTimetable: TimetableData = {
    Mon: [
      { type: 'theory', subjectCode: subjects[0].code, teacherId: teachers[0].id, teacherInitials: 'TA', roomId: rooms[0].id, roomName: rooms[0].name },
      { type: 'theory', subjectCode: subjects[1].code, teacherId: teachers[1].id, teacherInitials: 'TB', roomId: rooms[1].id, roomName: rooms[1].name },
      { type: 'break' },
      { type: 'theory', subjectCode: subjects[0].code, teacherId: teachers[0].id, teacherInitials: 'TA', roomId: rooms[0].id, roomName: rooms[0].name },
      { type: 'theory', subjectCode: subjects[2].code, teacherId: teachers[2].id, teacherInitials: 'TC', roomId: rooms[1].id, roomName: rooms[1].name },
      { type: 'break' },
      null,
      null,
    ],
    Tue: [
      { type: 'lab', subjectCode: labs[0].name, labName: labs[0].name, teacherId: teachers[0].id, teacherInitials: 'TA', roomId: rooms[2].id, roomName: rooms[2].name, durationSlots: 2, colSpan: 2 },
      { type: 'lab', subjectCode: labs[0].name, labName: labs[0].name, teacherId: teachers[0].id, teacherInitials: 'TA', roomId: rooms[2].id, roomName: rooms[2].name, durationSlots: 2, colSpan: 0 },
      { type: 'break' },
      { type: 'theory', subjectCode: subjects[1].code, teacherId: teachers[1].id, teacherInitials: 'TB', roomId: rooms[0].id, roomName: rooms[0].name },
      null,
      { type: 'break' },
      null,
      null,
    ],
    Wed: Array(8).fill(null),
    Thu: Array(8).fill(null),
    Fri: Array(8).fill(null),
  };

  const timetable = await prisma.timetable.create({
    data: {
      sectionId: section.id,
      json: JSON.stringify(initialTimetable),
      version: 1,
      score: 80,
      healthScore: 85,
      generationMode: 'adaptive',
    },
  });

  return {
    sectionId: section.id,
    teacherIds: teachers.map(t => t.id),
    subjectIds: subjects.map(s => s.id),
    roomIds: rooms.map(r => r.id),
    labIds: labs.map(l => l.id),
    timetableId: timetable.id,
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData(data: TestData): Promise<void> {
  await prisma.timetable.deleteMany({ where: { sectionId: data.sectionId } });
  await prisma.timetableVersion.deleteMany({ where: { timetable: { sectionId: data.sectionId } } });
  await prisma.lab.deleteMany({ where: { sectionId: data.sectionId } });
  await prisma.teacherSubjectMapping.deleteMany({ where: { sectionId: data.sectionId } });
  await prisma.subject.deleteMany({ where: { id: { in: data.subjectIds } } });
  await prisma.teacher.deleteMany({ where: { id: { in: data.teacherIds } } });
  await prisma.room.deleteMany({ where: { id: { in: data.roomIds } } });
  await prisma.section.delete({ where: { id: data.sectionId } });
}

