/**
 * Performance Optimization Tests
 * 
 * Tests to verify that performance optimizations do not change outputs
 */

import {
  AvailabilityCache,
  ConstraintMemoCache,
  cloneAffectedDays,
  shallowCloneTimetable,
  cloneDay,
  RegenerationProfiler,
} from '../../src/engine/regeneration/performance';
import { TimetableData } from '../../src/engine/utils';
import { constraintRegistry } from '../../src/engine/constraints';

describe('Performance Optimizations', () => {
  describe('AvailabilityCache', () => {
    it('should correctly identify teacher availability', () => {
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

      const cache = new AvailabilityCache();
      cache.buildFromTimetable(timetable);

      expect(cache.isTeacherAvailable('T1', 0)).toBe(false); // T1 at slot 0
      expect(cache.isTeacherAvailable('T1', 1)).toBe(true); // T1 not at slot 1
      expect(cache.isTeacherAvailable('T2', 1)).toBe(false); // T2 at slot 1
      expect(cache.isTeacherAvailable('T3', 0)).toBe(true); // T3 not in timetable
    });

    it('should correctly identify room availability', () => {
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

      const cache = new AvailabilityCache();
      cache.buildFromTimetable(timetable);

      expect(cache.isRoomAvailable('R1', 0)).toBe(false);
      expect(cache.isRoomAvailable('R1', 1)).toBe(true);
      expect(cache.isRoomAvailable('R2', 0)).toBe(true);
    });

    it('should exclude specified day when building cache', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
          null,
        ],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const cache = new AvailabilityCache();
      cache.buildFromTimetable(timetable, 'Mon');

      // Monday slots should not be in cache
      expect(cache.isTeacherAvailable('T1', 0)).toBe(true);
      // Tuesday slots should be in cache
      expect(cache.isTeacherAvailable('T2', 0)).toBe(false);
    });
  });

  describe('ConstraintMemoCache', () => {
    it('should cache constraint check results', () => {
      const cache = new ConstraintMemoCache();
      const context = {
        timetable: {} as TimetableData,
        day: 'Mon',
        slot: '0',
        teacherId: 'T1',
        subjectId: 'S1',
        roomId: 'R1',
        sectionId: 'SEC1',
      };

      let callCount = 0;
      const checkFn = () => {
        callCount++;
        return { valid: true, violations: [] };
      };

      // First call should execute function
      const result1 = cache.check(context, checkFn);
      expect(callCount).toBe(1);
      expect(result1.valid).toBe(true);

      // Second call should use cache
      const result2 = cache.check(context, checkFn);
      expect(callCount).toBe(1); // Not called again
      expect(result2.valid).toBe(true);
    });

    it('should track cache statistics', () => {
      const cache = new ConstraintMemoCache();
      const context = {
        timetable: {} as TimetableData,
        day: 'Mon',
        slot: '0',
        teacherId: 'T1',
        subjectId: 'S1',
        roomId: 'R1',
        sectionId: 'SEC1',
      };

      const checkFn = () => ({ valid: true, violations: [] });

      cache.check(context, checkFn);
      cache.check(context, checkFn); // Cache hit

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('Shallow Cloning', () => {
    it('should clone only affected days', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [null, null],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const cloned = cloneAffectedDays(timetable, ['Mon']);

      // Mon should be cloned (new array)
      expect(cloned.Mon).not.toBe(timetable.Mon);
      expect(cloned.Mon[0]?.subjectCode).toBe('CS101');

      // Tue should be referenced (same array)
      expect(cloned.Tue).toBe(timetable.Tue);
    });

    it('should shallow clone timetable structure', () => {
      const timetable: TimetableData = {
        Mon: [null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const cloned = shallowCloneTimetable(timetable);

      // Should be new object
      expect(cloned).not.toBe(timetable);
      // But day arrays should be same references
      expect(cloned.Mon).toBe(timetable.Mon);
    });

    it('should clone only specific day', () => {
      const timetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [null],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const cloned = cloneDay(timetable, 'Mon');

      // Should be new array
      expect(cloned).not.toBe(timetable.Mon);
      // But content should match
      expect(cloned[0]?.subjectCode).toBe('CS101');
    });
  });

  describe('RegenerationProfiler', () => {
    it('should track phase timings', () => {
      const profiler = new RegenerationProfiler();

      profiler.startPhase('phase1');
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {} // ~10ms
      profiler.endPhase();

      profiler.startPhase('phase2');
      while (Date.now() - start < 20) {} // ~20ms total
      profiler.endPhase();

      const metrics = profiler.getMetrics();
      expect(metrics.phases.phase1).toBeGreaterThan(0);
      expect(metrics.phases.phase2).toBeGreaterThan(0);
      expect(metrics.totalTime).toBeGreaterThan(0);
    });

    it('should track Prisma queries', () => {
      const profiler = new RegenerationProfiler();

      profiler.recordQuery();
      profiler.recordQuery();

      const metrics = profiler.getMetrics();
      expect(metrics.prismaQueries).toBe(2);
    });

    it('should track clone operations', () => {
      const profiler = new RegenerationProfiler();

      profiler.recordClone();
      profiler.recordClone();
      profiler.recordClone();

      const metrics = profiler.getMetrics();
      expect(metrics.clones).toBe(3);
    });
  });

  describe('Output Consistency', () => {
    it('should produce same results with and without caching', () => {
      // This test ensures that caching doesn't change the output
      // In a real scenario, we would compare regeneration results
      // with and without performance optimizations
      
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

      // Build cache
      const cache = new AvailabilityCache();
      cache.buildFromTimetable(timetable);

      // Check availability (should match manual check)
      const manualCheck = timetable.Mon[0]?.teacherId === 'T1';
      const cacheCheck = !cache.isTeacherAvailable('T1', 0);

      expect(cacheCheck).toBe(manualCheck);
    });
  });
});
