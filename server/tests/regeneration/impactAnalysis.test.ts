/**
 * Impact Analysis Tests
 * 
 * Tests for impactAnalysis utilities
 */

import {
  analyzeTeacherImpact,
  analyzeSectionImpact,
  analyzeDayImpact,
  analyzeSlotImpact,
  unassignImpactedSlots,
} from '../../src/engine/regeneration/impactAnalysis';
import { TimetableData } from '../../src/engine/utils';

describe('Impact Analysis', () => {
  describe('analyzeTeacherImpact', () => {
    it('should identify all slots for a specific teacher', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
          { type: 'break' },
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeTeacherImpact(timetable, 'T1');

      expect(impact.affectedTeachers).toEqual(['T1']);
      expect(impact.days).toContain('Mon');
      expect(impact.slots).toContain(0);
      expect(impact.slots).toContain(3);
      expect(impact.slots).not.toContain(1); // T2's slot
      expect(impact.affectedRooms).toContain('R1');
      expect(impact.affectedSubjects).toContain('CS101');
    });

    it('should return empty impact for teacher with no slots', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T2', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeTeacherImpact(timetable, 'T1');

      expect(impact.affectedTeachers).toEqual(['T1']);
      expect(impact.days).toEqual([]);
      expect(impact.slots).toEqual([]);
    });
  });

  describe('analyzeSectionImpact', () => {
    it('should identify all slots in a section timetable', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R2', durationSlots: 2, colSpan: 2 },
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R2', durationSlots: 2, colSpan: 0 },
          null,
        ],
        Tue: [
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R1' },
          null,
        ],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeSectionImpact(timetable, 'S1');

      expect(impact.days).toContain('Mon');
      expect(impact.days).toContain('Tue');
      expect(impact.slots.length).toBeGreaterThan(0);
      expect(impact.affectedTeachers.length).toBeGreaterThan(0);
      expect(impact.affectedRooms.length).toBeGreaterThan(0);
      expect(impact.affectedSubjects.length).toBeGreaterThan(0);
    });

    it('should handle empty timetable', () => {
      const timetable: TimetableData = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeSectionImpact(timetable, 'S1');

      expect(impact.days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      expect(impact.slots.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeDayImpact', () => {
    it('should identify all slots on a specific day', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
          { type: 'break' },
          null,
        ],
        Tue: [
          { type: 'theory', subjectCode: 'CS103', teacherId: 'T3', roomId: 'R3' },
          null,
        ],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeDayImpact(timetable, 'Mon');

      expect(impact.days).toEqual(['Mon']);
      expect(impact.slots).toContain(0);
      expect(impact.slots).toContain(1);
      expect(impact.slots).not.toContain(2); // Break slot
      expect(impact.affectedTeachers).toContain('T1');
      expect(impact.affectedTeachers).toContain('T2');
      expect(impact.affectedTeachers).not.toContain('T3');
    });

    it('should return empty impact for day with no classes', () => {
      const timetable: TimetableData = {
        Mon: [null, null, { type: 'break' }, null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeDayImpact(timetable, 'Mon');

      expect(impact.days).toEqual(['Mon']);
      expect(impact.slots).toEqual([]);
      expect(impact.affectedTeachers).toEqual([]);
    });
  });

  describe('analyzeSlotImpact', () => {
    it('should identify single slot impact', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeSlotImpact(timetable, 'Mon', 0);

      expect(impact.days).toEqual(['Mon']);
      expect(impact.slots).toEqual([0]);
      expect(impact.affectedTeachers).toContain('T1');
      expect(impact.affectedRooms).toContain('R1');
      expect(impact.affectedSubjects).toContain('CS101');
      expect(impact.isLab).toBe(false);
    });

    it('should identify lab block impact', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 0 },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeSlotImpact(timetable, 'Mon', 0);

      expect(impact.isLab).toBe(true);
      expect(impact.labDuration).toBe(2);
      expect(impact.slots).toContain(0);
      expect(impact.slots).toContain(1);
    });

    it('should handle null slot', () => {
      const timetable: TimetableData = {
        Mon: [null, null, null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = analyzeSlotImpact(timetable, 'Mon', 0);

      expect(impact.slots).toEqual([0]);
      expect(impact.affectedTeachers).toEqual([]);
      expect(impact.isLab).toBe(false);
    });
  });

  describe('unassignImpactedSlots', () => {
    it('should unassign only impacted slots', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
          { type: 'break' },
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = {
        sectionId: 'S1',
        days: ['Mon'],
        slots: [0, 3], // Only slots 0 and 3
        affectedTeachers: ['T1'],
        affectedRooms: ['R1'],
        affectedSubjects: ['CS101'],
      };

      const unassigned = unassignImpactedSlots(timetable, impact);

      expect(unassigned.Mon[0]).toBeNull();
      expect(unassigned.Mon[1]).not.toBeNull(); // T2's slot preserved
      expect(unassigned.Mon[2]?.type).toBe('break'); // Break preserved
      expect(unassigned.Mon[3]).toBeNull();
      expect(unassigned.Mon[4]).toBeNull();
    });

    it('should preserve timetable structure', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = {
        sectionId: 'S1',
        days: ['Mon'],
        slots: [0],
        affectedTeachers: ['T1'],
        affectedRooms: ['R1'],
        affectedSubjects: ['CS101'],
      };

      const unassigned = unassignImpactedSlots(timetable, impact);

      expect(unassigned.Mon).toBeDefined();
      expect(unassigned.Mon.length).toBe(timetable.Mon.length);
      expect(unassigned.Tue).toBeDefined();
      expect(unassigned.Wed).toBeDefined();
      expect(unassigned.Thu).toBeDefined();
      expect(unassigned.Fri).toBeDefined();
    });

    it('should preserve break slots', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'break' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = {
        sectionId: 'S1',
        days: ['Mon'],
        slots: [0, 2],
        affectedTeachers: ['T1', 'T2'],
        affectedRooms: ['R1', 'R2'],
        affectedSubjects: ['CS101', 'CS102'],
      };

      const unassigned = unassignImpactedSlots(timetable, impact);

      expect(unassigned.Mon[1]?.type).toBe('break');
    });

    it('should handle lab blocks correctly', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 0 },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const impact = {
        sectionId: 'S1',
        days: ['Mon'],
        slots: [0, 1], // Lab block
        affectedTeachers: ['T1'],
        affectedRooms: ['R1'],
        affectedSubjects: ['CS101'],
      };

      const unassigned = unassignImpactedSlots(timetable, impact);

      expect(unassigned.Mon[0]).toBeNull();
      expect(unassigned.Mon[1]).toBeNull();
    });
  });
});

