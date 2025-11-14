/**
 * Version Creation Tests
 * 
 * Tests for version creation metadata, notes, timestamps, scope
 */

import { saveTimetables } from '../../src/engine/saveTimetables';
import { createTestData, cleanupTestData } from '../helpers/testData';
import prisma from '../../src/db';
import { TimetableData } from '../../src/engine/utils';

describe('Version Creation', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;

  beforeAll(async () => {
    testData = await createTestData('version');
  });

  afterAll(async () => {
    await cleanupTestData(testData);
  });

  describe('Metadata', () => {
    it('should create version with solver metadata', async () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: testData.teacherIds[0], roomId: testData.roomIds[0] },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 85,
        conflicts: [],
        solverMetadata: {
          solver: 'greedy',
          generationTime: 150,
          placements: 10,
          constraintViolations: [],
        },
        notes: 'Test version with metadata',
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved).toBeDefined();
      expect(saved?.notes).toContain('Solver: greedy');
      expect(saved?.notes).toContain('Time: 150ms');
      expect(saved?.notes).toContain('Placements: 10');
    });

    it('should create version with regeneration scope', async () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: testData.teacherIds[0], roomId: testData.roomIds[0] },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 85,
        conflicts: [],
        solverMetadata: {
          solver: 'greedy',
          regenerationScope: 'teacher:teacher-id',
        },
        notes: 'Regenerated for teacher',
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved).toBeDefined();
      expect(saved?.notes).toContain('Regenerated for teacher');
    });
  });

  describe('Timestamps', () => {
    it('should set generatedAt timestamp', async () => {
      const before = new Date();
      
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 80,
        conflicts: [],
      });

      const after = new Date();

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved?.generatedAt).toBeDefined();
      expect(saved?.generatedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(saved?.generatedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should set createdAt and updatedAt', async () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 80,
        conflicts: [],
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved?.createdAt).toBeDefined();
      expect(saved?.updatedAt).toBeDefined();
    });
  });

  describe('Version History', () => {
    it('should create version history entry', async () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: testData.teacherIds[0], roomId: testData.roomIds[0] },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 85,
        conflicts: [],
        notes: 'Test version history',
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
        include: { versionHistory: true },
      });

      expect(saved?.versionHistory.length).toBeGreaterThan(0);
      const latestVersion = saved?.versionHistory.find(v => v.version === saved?.version);
      expect(latestVersion).toBeDefined();
      expect(latestVersion?.notes).toBe('Test version history');
    });

    it('should increment version number', async () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      // Create first version
      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 80,
        conflicts: [],
      });

      const first = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      // Create second version
      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 85,
        conflicts: [],
      });

      const second = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(second?.version).toBe((first?.version || 0) + 1);
    });
  });

  describe('Notes', () => {
    it('should store custom notes', async () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 80,
        conflicts: [],
        notes: 'Custom test note',
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved?.notes).toContain('Custom test note');
    });

    it('should combine notes with metadata', async () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      await saveTimetables({
        timetables: { [testData.sectionId]: timetable },
        score: 80,
        conflicts: [],
        notes: 'Base note',
        solverMetadata: {
          solver: 'greedy',
          generationTime: 100,
        },
      });

      const saved = await prisma.timetable.findFirst({
        where: { sectionId: testData.sectionId },
        orderBy: { version: 'desc' },
      });

      expect(saved?.notes).toContain('Base note');
      expect(saved?.notes).toContain('Solver: greedy');
    });
  });
});

