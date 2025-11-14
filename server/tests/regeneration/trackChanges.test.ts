/**
 * Track Changes Tests
 * 
 * Tests for trackChanges utility
 */

import { trackChanges } from '../../src/engine/regeneration/impactAnalysis';
import { TimetableData } from '../../src/engine/utils';

describe('trackChanges', () => {
  const sectionId = 'test-section';

  describe('added slots', () => {
    it('should detect added slots', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' }, // Added
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const added = changes.filter(c => c.action === 'added');
      expect(added.length).toBe(1);
      expect(added[0].day).toBe('Mon');
      expect(added[0].slot).toBe(1);
      expect(added[0].newValue?.subjectCode).toBe('CS102');
    });

    it('should not detect break slots as added', () => {
      const oldTimetable: TimetableData = {
        Mon: [null, null],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          null,
          { type: 'break' }, // Break slot
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const added = changes.filter(c => c.action === 'added');
      expect(added.length).toBe(0);
    });
  });

  describe('removed slots', () => {
    it('should detect removed slots', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null, // Removed
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const removed = changes.filter(c => c.action === 'removed');
      expect(removed.length).toBe(1);
      expect(removed[0].day).toBe('Mon');
      expect(removed[0].slot).toBe(1);
      expect(removed[0].oldValue?.subjectCode).toBe('CS102');
    });
  });

  describe('modified slots', () => {
    it('should detect modified slots', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS103', teacherId: 'T3', roomId: 'R3' }, // Modified
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const modified = changes.filter(c => c.action === 'modified');
      expect(modified.length).toBe(1);
      expect(modified[0].day).toBe('Mon');
      expect(modified[0].slot).toBe(1);
      expect(modified[0].oldValue?.subjectCode).toBe('CS102');
      expect(modified[0].newValue?.subjectCode).toBe('CS103');
    });

    it('should detect teacher change', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T2', roomId: 'R1' }, // Teacher changed
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const modified = changes.filter(c => c.action === 'modified');
      expect(modified.length).toBe(1);
      expect(modified[0].oldValue?.teacherId).toBe('T1');
      expect(modified[0].newValue?.teacherId).toBe('T2');
    });

    it('should detect room change', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R2' }, // Room changed
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const modified = changes.filter(c => c.action === 'modified');
      expect(modified.length).toBe(1);
      expect(modified[0].oldValue?.roomId).toBe('R1');
      expect(modified[0].newValue?.roomId).toBe('R2');
    });

    it('should detect type change (theory <-> lab)', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const modified = changes.filter(c => c.action === 'modified');
      expect(modified.length).toBe(1);
      expect(modified[0].oldValue?.type).toBe('theory');
      expect(modified[0].newValue?.type).toBe('lab');
    });
  });

  describe('unchanged slots', () => {
    it('should not track unchanged slots', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          null,
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' }, // Unchanged
          null, // Unchanged
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      expect(changes.length).toBe(0);
    });
  });

  describe('array length consistency', () => {
    it('should handle different array lengths', () => {
      const oldTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const newTimetable: TimetableData = {
        Mon: [
          { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
          { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' }, // Added
          null, // Added
        ],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      };

      const changes = trackChanges(oldTimetable, newTimetable, sectionId);

      const added = changes.filter(c => c.action === 'added');
      expect(added.length).toBe(1);
      expect(added[0].slot).toBe(1);
    });
  });
});

