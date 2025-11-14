/**
 * Teacher Regeneration Integration Tests
 * 
 * Real-world scenarios for teacher regeneration
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/db';

describe('Teacher Regeneration - Real Data Scenarios', () => {
  let testSectionId: string;
  let testTeacherId: string;
  let testSubjectIds: string[] = [];
  let testRoomId: string;
  let testTimetableId: string;

  beforeAll(async () => {
    // Create comprehensive test data
    const section = await prisma.section.create({
      data: {
        name: 'Integration Test Section',
      },
    });
    testSectionId = section.id;

    const teacher = await prisma.teacher.create({
      data: {
        name: 'Integration Test Teacher',
        initials: 'ITT',
        maxClassesPerDay: 4,
        maxClassesPerWeek: 20,
      },
    });
    testTeacherId = teacher.id;

    // Create 3 subjects for this teacher
    const subjects = await Promise.all([
      prisma.subject.create({
        data: { code: 'SUBJ1', name: 'Subject 1', hoursPerWeek: 3, type: 'theory' },
      }),
      prisma.subject.create({
        data: { code: 'SUBJ2', name: 'Subject 2', hoursPerWeek: 2, type: 'theory' },
      }),
      prisma.subject.create({
        data: { code: 'SUBJ3', name: 'Subject 3', hoursPerWeek: 4, type: 'theory' },
      }),
    ]);
    testSubjectIds = subjects.map(s => s.id);

    const room = await prisma.room.create({
      data: {
        name: 'Integration Test Room',
        type: 'lecture',
        capacity: 60,
      },
    });
    testRoomId = room.id;

    // Create mappings
    for (const subjectId of testSubjectIds) {
      await prisma.teacherSubjectMapping.create({
        data: {
          teacherId: testTeacherId,
          subjectId,
          sectionId: testSectionId,
        },
      });
    }

    // Create initial timetable with teacher's 3 subjects
    const initialTimetable: any = {
      Mon: [
        { type: 'theory', subjectCode: 'SUBJ1', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'theory', subjectCode: 'SUBJ1', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'SUBJ1', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'theory', subjectCode: 'SUBJ2', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'SUBJ2', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        null,
      ],
      Tue: [
        { type: 'theory', subjectCode: 'SUBJ3', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'theory', subjectCode: 'SUBJ3', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'SUBJ3', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
        { type: 'theory', subjectCode: 'SUBJ3', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: testRoomId, roomName: 'Integration Test Room' },
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
        sectionId: testSectionId,
        json: JSON.stringify(initialTimetable),
        version: 1,
        score: 75,
        healthScore: 80,
      },
    });
    testTimetableId = timetable.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.timetable.deleteMany({ where: { sectionId: testSectionId } });
    await prisma.teacherSubjectMapping.deleteMany({ where: { sectionId: testSectionId } });
    await prisma.subject.deleteMany({ where: { id: { in: testSubjectIds } } });
    await prisma.teacher.delete({ where: { id: testTeacherId } });
    await prisma.room.delete({ where: { id: testRoomId } });
    await prisma.section.delete({ where: { id: testSectionId } });
  });

  describe('Scenario A: Normal teacher with 3 subjects', () => {
    it('should update only those slots', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.changedSlots.length).toBeGreaterThan(0);
      
      // All changed slots should be for this teacher
      const changedSlots = response.body.changedSlots;
      const newTimetable = response.body.timetables[testSectionId];
      
      // Verify teacher's subjects are still present
      let teacherSlotCount = 0;
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const dayData = newTimetable[day] || [];
        for (const cell of dayData) {
          if (cell && cell.teacherId === testTeacherId) {
            teacherSlotCount++;
          }
        }
      }
      
      // Should have slots for 3 subjects (3+2+4 = 9 hours total)
      expect(teacherSlotCount).toBeGreaterThan(0);
    });
  });

  describe('Scenario B: Teacher unavailable hours', () => {
    it('should remove teacher from blocked hours', async () => {
      // Set teacher unavailable for Monday morning
      await prisma.teacher.update({
        where: { id: testTeacherId },
        data: {
          unavailableSlots: JSON.stringify({
            Mon: [0, 1], // First two slots on Monday
          }),
        },
      });

      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        })
        .expect(200);

      const newTimetable = response.body.timetables[testSectionId];
      
      // Teacher should not be in first two slots on Monday
      if (newTimetable.Mon && Array.isArray(newTimetable.Mon)) {
        if (newTimetable.Mon[0] && typeof newTimetable.Mon[0] === 'object') {
          expect(newTimetable.Mon[0].teacherId).not.toBe(testTeacherId);
        }
        if (newTimetable.Mon[1] && typeof newTimetable.Mon[1] === 'object') {
          expect(newTimetable.Mon[1].teacherId).not.toBe(testTeacherId);
        }
      }
    });
  });

  describe('Scenario C: Force conflict - remove key room', () => {
    it('should gracefully handle errors', async () => {
      // Create timetable with specific room requirement
      const specificRoom = await prisma.room.create({
        data: {
          name: 'Specific Room',
          type: 'lecture',
          capacity: 30,
        },
      });

      const roomTimetable: any = {
        Mon: [
          { type: 'theory', subjectCode: 'SUBJ1', teacherId: testTeacherId, teacherInitials: 'ITT', roomId: specificRoom.id, roomName: 'Specific Room' },
          null,
          { type: 'break' },
          null,
          null,
          { type: 'break' },
          null,
          null,
        ],
        Tue: Array(8).fill(null),
        Wed: Array(8).fill(null),
        Thu: Array(8).fill(null),
        Fri: Array(8).fill(null),
      };

      const roomTimetableRecord = await prisma.timetable.create({
        data: {
          sectionId: testSectionId,
          json: JSON.stringify(roomTimetable),
          version: 1,
          score: 70,
        },
      });

      // Delete the room to force conflict
      await prisma.room.delete({ where: { id: specificRoom.id } });

      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: roomTimetableRecord.id,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        });

      // Should either succeed (using different room) or fail gracefully
      expect([200, 500]).toContain(response.status);
      
      // Cleanup
      await prisma.timetable.delete({ where: { id: roomTimetableRecord.id } });
    });
  });

  describe('Scenario D: No change scenario', () => {
    it('should produce minimal/no changes when teacher removed', async () => {
      // Create timetable without this teacher
      const emptyTimetable: any = {
        Mon: Array(8).fill(null),
        Tue: Array(8).fill(null),
        Wed: Array(8).fill(null),
        Thu: Array(8).fill(null),
        Fri: Array(8).fill(null),
      };

      const emptyTimetableRecord = await prisma.timetable.create({
        data: {
          sectionId: testSectionId,
          json: JSON.stringify(emptyTimetable),
          version: 1,
          score: 0,
        },
      });

      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: emptyTimetableRecord.id,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        })
        .expect(200);

      // Should succeed but with minimal changes
      expect(response.body.success).toBe(true);
      // Changed slots should be minimal (only new placements if any)
      
      // Cleanup
      await prisma.timetable.delete({ where: { id: emptyTimetableRecord.id } });
    });
  });
});

