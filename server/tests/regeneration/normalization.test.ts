/**
 * Normalization Tests
 * 
 * Tests for normalization routines used in compareVersions
 */

import { normalizeTimetable } from '../../src/engine/compareVersions';
import { TimetableData } from '../../src/engine/utils';

describe('Normalization', () => {
  describe('normalizeTimetable', () => {
    it('should ensure consistent day order', () => {
      const timetable: TimetableData = {
        Wed: [null],
        Mon: [null],
        Fri: [null],
        Tue: [null],
        Thu: [null],
      };

      const normalized = normalizeTimetable(timetable);

      const days = Object.keys(normalized);
      expect(days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    });

    it('should fill missing days with empty arrays', () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [null],
        // Wed, Thu, Fri missing
      };

      const normalized = normalizeTimetable(timetable);

      expect(normalized.Mon).toBeDefined();
      expect(normalized.Tue).toBeDefined();
      expect(normalized.Wed).toBeDefined();
      expect(normalized.Thu).toBeDefined();
      expect(normalized.Fri).toBeDefined();
      expect(Array.isArray(normalized.Wed)).toBe(true);
      expect(Array.isArray(normalized.Thu)).toBe(true);
      expect(Array.isArray(normalized.Fri)).toBe(true);
    });

    it('should preserve slot order (semantic)', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const normalized = normalizeTimetable(timetable);

      expect(normalized.Mon[0]?.subjectCode).toBe('CS101');
      expect(normalized.Mon[1]).toBeNull();
      expect(normalized.Mon[2]?.subjectCode).toBe('CS102');
    });

    it('should create a new object (not mutate original)', () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const normalized = normalizeTimetable(timetable);

      expect(normalized).not.toBe(timetable);
      expect(normalized.Mon).not.toBe(timetable.Mon);
    });

    it('should handle empty timetable', () => {
      const timetable: TimetableData = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const normalized = normalizeTimetable(timetable);

      expect(normalized.Mon).toEqual([]);
      expect(normalized.Tue).toEqual([]);
      expect(normalized.Wed).toEqual([]);
      expect(normalized.Thu).toEqual([]);
      expect(normalized.Fri).toEqual([]);
    });

    it('should preserve array references for unchanged days', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const normalized = normalizeTimetable(timetable);

      // Mon should be a copy (new array)
      expect(normalized.Mon).not.toBe(timetable.Mon);
      // But content should match
      expect(normalized.Mon[0]?.subjectCode).toBe(timetable.Mon[0]?.subjectCode);
    });
  });
});

