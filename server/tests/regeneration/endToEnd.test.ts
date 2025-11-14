/**
 * End-to-End Regeneration Tests
 * 
 * Tests for complete regeneration flows
 */

import { regenerateTeacher } from '../../src/engine/regeneration/regenerateTeacher';
import { regenerateSection } from '../../src/engine/regeneration/regenerateSection';
import { regenerateDay } from '../../src/engine/regeneration/regenerateDay';
import { regenerateSlot } from '../../src/engine/regeneration/regenerateSlot';
import { createTestData, cleanupTestData } from '../helpers/testData';
import prisma from '../../src/db';
import { TimetableData } from '../../src/engine/utils';

describe('End-to-End Regeneration Flows', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;

  beforeAll(async () => {
    testData = await createTestData('e2e');
  });

  afterAll(async () => {
    await cleanupTestData(testData);
  });

  describe('Teacher Regeneration', () => {
    it('should ensure only teacher-related slots change', async () => {
      // Get initial timetable
      const initialTimetable = await prisma.timetable.findUnique({
        where: { id: testData.timetableId },
      });
      const initialData: TimetableData = JSON.parse(initialTimetable!.json);

      // Regenerate teacher 1
      const result = await regenerateTeacher({
        timetableId: testData.timetableId,
        sectionId: testData.sectionId,
        targetId: testData.teacherIds[0],
        scope: 'teacher',
        preserveUnchanged: true,
        solverType: 'greedy',
      });

      const regeneratedData = result.timetables[testData.sectionId];

      // Check that only teacher 1's slots changed
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const dayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];

        for (let slot = 0; slot < Math.max(dayData.length, newDayData.length); slot++) {
          const oldCell = dayData[slot];
          const newCell = newDayData[slot];

          // If slot had teacher 1, it might have changed
          // If slot had other teachers, it should be unchanged
          if (oldCell && oldCell.teacherId !== testData.teacherIds[0]) {
            expect(JSON.stringify(newCell)).toBe(JSON.stringify(oldCell));
          }
        }
      }

      // Verify array length consistency
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const dayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];
        expect(newDayData.length).toBeGreaterThanOrEqual(dayData.length);
      }
    });
  });

  describe('Section Regeneration', () => {
    it('should ensure only section slots change', async () => {
      // Get initial timetable
      const initialTimetable = await prisma.timetable.findUnique({
        where: { id: testData.timetableId },
      });
      const initialData: TimetableData = JSON.parse(initialTimetable!.json);

      // Regenerate section
      const result = await regenerateSection({
        timetableId: testData.timetableId,
        sectionId: testData.sectionId,
        targetId: testData.sectionId,
        scope: 'section',
        preserveUnchanged: true,
        solverType: 'greedy',
      });

      const regeneratedData = result.timetables[testData.sectionId];

      // Verify structure is preserved
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        expect(regeneratedData[day]).toBeDefined();
        expect(Array.isArray(regeneratedData[day])).toBe(true);
      }

      // Verify array length consistency
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const dayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];
        expect(newDayData.length).toBeGreaterThanOrEqual(dayData.length);
      }
    });
  });

  describe('Day Regeneration', () => {
    it('should ensure only that day updates', async () => {
      // Get initial timetable
      const initialTimetable = await prisma.timetable.findUnique({
        where: { id: testData.timetableId },
      });
      const initialData: TimetableData = JSON.parse(initialTimetable!.json);

      // Regenerate Monday
      const result = await regenerateDay({
        timetableId: testData.timetableId,
        sectionId: testData.sectionId,
        targetId: 'Mon',
        scope: 'day',
        day: 'Mon',
        preserveUnchanged: true,
        solverType: 'greedy',
      });

      const regeneratedData = result.timetables[testData.sectionId];

      // Check that other days are unchanged
      for (const day of ['Tue', 'Wed', 'Thu', 'Fri']) {
        const oldDayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];
        expect(JSON.stringify(newDayData)).toBe(JSON.stringify(oldDayData));
      }

      // Monday should have changed
      const oldMonData = initialData.Mon || [];
      const newMonData = regeneratedData.Mon || [];
      expect(JSON.stringify(newMonData)).not.toBe(JSON.stringify(oldMonData));

      // Verify array length consistency
      expect(newMonData.length).toBeGreaterThanOrEqual(oldMonData.length);
    });
  });

  describe('Slot Regeneration', () => {
    it('should handle single-slot replacement', async () => {
      // Get initial timetable
      const initialTimetable = await prisma.timetable.findUnique({
        where: { id: testData.timetableId },
      });
      const initialData: TimetableData = JSON.parse(initialTimetable!.json);

      // Regenerate slot 0 on Monday
      const result = await regenerateSlot({
        timetableId: testData.timetableId,
        sectionId: testData.sectionId,
        targetId: 'Mon:0',
        scope: 'slot',
        day: 'Mon',
        slotIndex: 0,
        preserveUnchanged: true,
        solverType: 'greedy',
      });

      const regeneratedData = result.timetables[testData.sectionId];

      // Check that other slots are unchanged
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const oldDayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];

        for (let slot = 0; slot < Math.max(oldDayData.length, newDayData.length); slot++) {
          if (day !== 'Mon' || slot !== 0) {
            const oldCell = oldDayData[slot];
            const newCell = newDayData[slot];
            expect(JSON.stringify(newCell)).toBe(JSON.stringify(oldCell));
          }
        }
      }

      // Verify array length consistency
      for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
        const dayData = initialData[day] || [];
        const newDayData = regeneratedData[day] || [];
        expect(newDayData.length).toBeGreaterThanOrEqual(dayData.length);
      }
    });

    it('should handle lab-block replacement', async () => {
      // Create a timetable with a lab block
      const labTimetable: TimetableData = {
        Mon: [
          { type: 'lab', subjectCode: 'LAB1', teacherId: testData.teacherIds[0], roomId: testData.roomIds[2], durationSlots: 2, colSpan: 2 },
          { type: 'lab', subjectCode: 'LAB1', teacherId: testData.teacherIds[0], roomId: testData.roomIds[2], durationSlots: 2, colSpan: 0 },
          null,
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const timetable = await prisma.timetable.create({
        data: {
          sectionId: testData.sectionId,
          json: JSON.stringify(labTimetable),
          version: 2,
          score: 80,
        },
      });

      try {
        // Regenerate slot 0 (lab block start)
        const result = await regenerateSlot({
          timetableId: timetable.id,
          sectionId: testData.sectionId,
          targetId: 'Mon:0',
          scope: 'slot',
          day: 'Mon',
          slotIndex: 0,
          preserveUnchanged: true,
          solverType: 'greedy',
        });

        const regeneratedData = result.timetables[testData.sectionId];

        // Verify array length consistency
        expect(regeneratedData.Mon.length).toBeGreaterThanOrEqual(labTimetable.Mon.length);
      } finally {
        await prisma.timetable.delete({ where: { id: timetable.id } });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid day', async () => {
      await expect(
        regenerateDay({
          timetableId: testData.timetableId,
          sectionId: testData.sectionId,
          targetId: 'Invalid',
          scope: 'day',
          day: 'Invalid',
          preserveUnchanged: true,
          solverType: 'greedy',
        })
      ).rejects.toThrow();
    });

    it('should handle invalid slotIndex', async () => {
      await expect(
        regenerateSlot({
          timetableId: testData.timetableId,
          sectionId: testData.sectionId,
          targetId: 'Mon:-1',
          scope: 'slot',
          day: 'Mon',
          slotIndex: -1,
          preserveUnchanged: true,
          solverType: 'greedy',
        })
      ).rejects.toThrow();
    });

    it('should handle slotIndex out of bounds', async () => {
      const timetable = await prisma.timetable.findUnique({
        where: { id: testData.timetableId },
      });
      const data: TimetableData = JSON.parse(timetable!.json);
      const maxSlots = Math.max(...['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (data[d] || []).length));

      await expect(
        regenerateSlot({
          timetableId: testData.timetableId,
          sectionId: testData.sectionId,
          targetId: `Mon:${maxSlots + 10}`,
          scope: 'slot',
          day: 'Mon',
          slotIndex: maxSlots + 10,
          preserveUnchanged: true,
          solverType: 'greedy',
        })
      ).rejects.toThrow();
    });

    it('should handle missing timetableId', async () => {
      await expect(
        regenerateTeacher({
          timetableId: 'non-existent-id',
          sectionId: testData.sectionId,
          targetId: testData.teacherIds[0],
          scope: 'teacher',
          preserveUnchanged: true,
          solverType: 'greedy',
        })
      ).rejects.toThrow();
    });
  });
});

