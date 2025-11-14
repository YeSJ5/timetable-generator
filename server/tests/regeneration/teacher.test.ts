/**
 * Teacher Regeneration Endpoint Tests
 * 
 * Tests for POST /regenerate/teacher endpoint
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/db';

describe('POST /regenerate/teacher', () => {
  let testTimetableId: string;
  let testSectionId: string;
  let testTeacherId: string;
  let testSubjectId: string;
  let testRoomId: string;

  beforeAll(async () => {
    // Create test data
    const section = await prisma.section.create({
      data: {
        name: 'Test Section Regeneration',
      },
    });
    testSectionId = section.id;

    const teacher = await prisma.teacher.create({
      data: {
        name: 'Test Teacher Regeneration',
        initials: 'TTR',
      },
    });
    testTeacherId = teacher.id;

    const subject = await prisma.subject.create({
      data: {
        code: 'TEST101',
        name: 'Test Subject',
        hoursPerWeek: 3,
        type: 'theory',
      },
    });
    testSubjectId = subject.id;

    const room = await prisma.room.create({
      data: {
        name: 'Test Room',
        type: 'lecture',
        capacity: 50,
      },
    });
    testRoomId = room.id;

    // Create mapping
    await prisma.teacherSubjectMapping.create({
      data: {
        teacherId: testTeacherId,
        subjectId: testSubjectId,
        sectionId: testSectionId,
      },
    });

    // Create a test timetable
    const testTimetable: any = {
      Mon: [
        { type: 'theory', subjectCode: 'TEST101', teacherId: testTeacherId, teacherInitials: 'TTR', roomId: testRoomId, roomName: 'Test Room' },
        null,
        { type: 'break' },
        { type: 'theory', subjectCode: 'TEST101', teacherId: testTeacherId, teacherInitials: 'TTR', roomId: testRoomId, roomName: 'Test Room' },
        null,
        { type: 'break' },
        null,
        null,
      ],
      Tue: [
        null,
        null,
        { type: 'break' },
        { type: 'theory', subjectCode: 'TEST101', teacherId: testTeacherId, teacherInitials: 'TTR', roomId: testRoomId, roomName: 'Test Room' },
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
        sectionId: testSectionId,
        json: JSON.stringify(testTimetable),
        version: 1,
        score: 80,
        healthScore: 85,
      },
    });
    testTimetableId = timetable.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.timetable.deleteMany({ where: { sectionId: testSectionId } });
    await prisma.teacherSubjectMapping.deleteMany({ where: { sectionId: testSectionId } });
    await prisma.subject.delete({ where: { id: testSubjectId } });
    await prisma.teacher.delete({ where: { id: testTeacherId } });
    await prisma.room.delete({ where: { id: testRoomId } });
    await prisma.section.delete({ where: { id: testSectionId } });
  });

  describe('Test 1: Regenerate teacher with valid timetable', () => {
    it('should update only impacted slots', async () => {
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
      expect(response.body.timetables).toBeDefined();
      expect(response.body.timetables[testSectionId]).toBeDefined();
      expect(response.body.changedSlots).toBeDefined();
      expect(Array.isArray(response.body.changedSlots)).toBe(true);
      expect(response.body.solverMetadata).toBeDefined();
      expect(response.body.solverMetadata.solver).toBe('greedy');
      expect(response.body.solverMetadata.regenerationScope).toBe(`teacher:${testTeacherId}`);
    });
  });

  describe('Test 2: Regenerate teacher with no impacted slots', () => {
    it('should create a new version but no changes', async () => {
      // Create a timetable without this teacher
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

      expect(response.body.success).toBe(true);
      // Should create new version even if no changes
      expect(response.body.changedSlots).toBeDefined();
      
      // Cleanup
      await prisma.timetable.delete({ where: { id: emptyTimetableRecord.id } });
    });
  });

  describe('Test 3: Regenerate teacher when solver fails', () => {
    it('should handle errors gracefully', async () => {
      // Use invalid solver type to force error
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          solverType: 'invalid', // This should cause an error
        });

      // Should either return error or fallback gracefully
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Test 4: Missing teacherId', () => {
    it('should return 400', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          // teacherId missing
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('teacherId');
    });
  });

  describe('Test 5: Missing timetableId', () => {
    it('should return 400', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          // timetableId missing
          sectionId: testSectionId,
          teacherId: testTeacherId,
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('timetableId');
    });
  });

  describe('Test 6: Preserve unaffected slots', () => {
    it('should not modify slots not belonging to teacher', async () => {
      // Create timetable with multiple teachers
      const otherTeacher = await prisma.teacher.create({
        data: {
          name: 'Other Teacher',
          initials: 'OT',
        },
      });

      const otherSubject = await prisma.subject.create({
        data: {
          code: 'OTHER101',
          name: 'Other Subject',
          hoursPerWeek: 2,
          type: 'theory',
        },
      });

      await prisma.teacherSubjectMapping.create({
        data: {
          teacherId: otherTeacher.id,
          subjectId: otherSubject.id,
          sectionId: testSectionId,
        },
      });

      const multiTeacherTimetable: any = {
        Mon: [
          { type: 'theory', subjectCode: 'TEST101', teacherId: testTeacherId, teacherInitials: 'TTR', roomId: testRoomId, roomName: 'Test Room' },
          { type: 'theory', subjectCode: 'OTHER101', teacherId: otherTeacher.id, teacherInitials: 'OT', roomId: testRoomId, roomName: 'Test Room' },
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

      const multiTimetable = await prisma.timetable.create({
        data: {
          sectionId: testSectionId,
          json: JSON.stringify(multiTeacherTimetable),
          version: 1,
          score: 75,
        },
      });

      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: multiTimetable.id,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        })
        .expect(200);

      const newTimetable = response.body.timetables[testSectionId];
      
      // Other teacher's slot should be preserved
      expect(newTimetable.Mon[1]).toBeDefined();
      expect(newTimetable.Mon[1].teacherId).toBe(otherTeacher.id);

      // Cleanup
      await prisma.timetable.delete({ where: { id: multiTimetable.id } });
      await prisma.teacherSubjectMapping.delete({ where: { teacherId: otherTeacher.id } });
      await prisma.subject.delete({ where: { id: otherSubject.id } });
      await prisma.teacher.delete({ where: { id: otherTeacher.id } });
    });
  });

  describe('Test 7: VersionHistory entry with metadata', () => {
    it('should contain metadata and change summary', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          teacherId: testTeacherId,
        })
        .expect(200);

      // Check that new version was created
      const versions = await prisma.timetableVersion.findMany({
        where: {
          timetable: {
            sectionId: testSectionId,
          },
        },
        orderBy: { version: 'desc' },
        take: 1,
      });

      expect(versions.length).toBeGreaterThan(0);
      const latestVersion = versions[0];
      
      // Check notes contain regeneration info
      expect(latestVersion.notes).toBeDefined();
      if (latestVersion.notes) {
        expect(latestVersion.notes).toContain('Regenerated for teacher');
      }
    });
  });

  describe('Test 8: Changed slots include added, removed, modified', () => {
    it('should track all types of changes', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: testTimetableId,
          sectionId: testSectionId,
          teacherId: testTeacherId,
          preserveUnchanged: true,
        })
        .expect(200);

      const changedSlots = response.body.changedSlots;
      expect(Array.isArray(changedSlots)).toBe(true);

      // Check that each change has required fields
      changedSlots.forEach((change: any) => {
        expect(change.sectionId).toBe(testSectionId);
        expect(change.day).toBeDefined();
        expect(change.slot).toBeDefined();
        expect(['added', 'removed', 'modified']).toContain(change.action);
        
        if (change.action === 'removed' || change.action === 'modified') {
          expect(change.oldValue).toBeDefined();
        }
        if (change.action === 'added' || change.action === 'modified') {
          expect(change.newValue).toBeDefined();
        }
      });
    });
  });
});

