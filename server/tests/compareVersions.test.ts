/**
 * Unit tests for version comparison utility
 */

import { compareVersions } from '../src/engine/compareVersions';
import { TimetableData, TimetableCell } from '../src/engine/utils';
import prisma from '../src/db';

// Mock Prisma
jest.mock('../src/db', () => ({
  __esModule: true,
  default: {
    timetableVersion: {
      findUnique: jest.fn(),
    },
  },
}));

describe('compareVersions', () => {
  const mockTimetableId = 'test-timetable-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  /**
   * Test 1: Identical versions => only unchanged
   */
  it('should return only unchanged slots for identical versions', async () => {
    const timetable: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        null,
      ],
      Tue: [
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 0 },
        null,
        null,
      ],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const jsonString = JSON.stringify(timetable);
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: jsonString }) // version 1
      .mockResolvedValueOnce({ json: jsonString }); // version 2
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.unchanged).toBeGreaterThan(0);
    expect(result.summary.added).toBe(0);
    expect(result.summary.removed).toBe(0);
    expect(result.summary.modified).toBe(0);
    expect(result.changes.every(c => c.type === 'unchanged')).toBe(true);
  });
  
  /**
   * Test 2: Single-slot change => one modified
   */
  it('should detect single slot modification', async () => {
    const timetable1: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        { type: 'break' },
        { type: 'theory', subjectCode: 'CS103', teacherId: 'T3', roomId: 'R3' }, // Changed
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.modified).toBe(1);
    expect(result.summary.unchanged).toBeGreaterThan(0);
    
    const modifiedSlot = result.changes.find(c => c.type === 'modified');
    expect(modifiedSlot).toBeDefined();
    expect(modifiedSlot?.day).toBe('Mon');
    expect(modifiedSlot?.slot).toBe(2);
    expect(modifiedSlot?.semanticDiff?.subjectChanged).toBe(true);
    expect(modifiedSlot?.semanticDiff?.teacherChanged).toBe(true);
    expect(modifiedSlot?.semanticDiff?.roomChanged).toBe(true);
  });
  
  /**
   * Test 3: Lab block shifts => multiple modified
   */
  it('should detect lab block shifts as multiple modified slots', async () => {
    const timetable1: TimetableData = {
      Mon: [
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 0 },
        null,
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const timetable2: TimetableData = {
      Mon: [
        null,
        null,
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 0 },
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    // Lab block shifted from slots 0-1 to slots 2-3
    // This should result in:
    // - 2 removed (slots 0-1 in v1)
    // - 2 added (slots 2-3 in v2)
    // Or alternatively, 4 modified if we consider them as changes
    
    expect(result.summary.modified + result.summary.added + result.summary.removed).toBeGreaterThanOrEqual(2);
    
    // Check that lab block slots are identified
    const labSlots = result.changes.filter(
      c => c.oldValue?.type === 'lab' || c.newValue?.type === 'lab'
    );
    expect(labSlots.length).toBeGreaterThan(0);
  });
  
  /**
   * Test 4: Reordering of arrays that should be ignored => unchanged
   * Note: Since we normalize timetables, day order is already consistent
   * This test verifies that slot order within a day is preserved (which is semantic)
   */
  it('should handle empty/null slots correctly', async () => {
    const timetable1: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        null,
        null,
        { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        null,
        null,
        { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' },
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.modified).toBe(0);
    expect(result.summary.added).toBe(0);
    expect(result.summary.removed).toBe(0);
  });
  
  /**
   * Test 5: Added slot
   */
  it('should detect added slots', async () => {
    const timetable1: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        { type: 'theory', subjectCode: 'CS102', teacherId: 'T2', roomId: 'R2' }, // Added
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.added).toBe(1);
    const addedSlot = result.changes.find(c => c.type === 'added');
    expect(addedSlot).toBeDefined();
    expect(addedSlot?.day).toBe('Mon');
    expect(addedSlot?.slot).toBe(1);
  });
  
  /**
   * Test 6: Removed slot
   */
  it('should detect removed slots', async () => {
    const timetable1: TimetableData = {
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
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        null, // Removed
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.removed).toBe(1);
    const removedSlot = result.changes.find(c => c.type === 'removed');
    expect(removedSlot).toBeDefined();
    expect(removedSlot?.day).toBe('Mon');
    expect(removedSlot?.slot).toBe(1);
  });
  
  /**
   * Test 7: Type change (theory <-> lab)
   */
  it('should detect type changes with high significance', async () => {
    const timetable1: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'lab', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1', durationSlots: 2, colSpan: 2 },
        null,
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    expect(result.summary.modified).toBeGreaterThan(0);
    const typeChangedSlot = result.changes.find(
      c => c.type === 'modified' && c.semanticDiff?.typeChanged
    );
    expect(typeChangedSlot).toBeDefined();
    
    // Type changes should appear in topModified
    const topModified = result.topModified.filter(
      c => c.semanticDiff?.typeChanged
    );
    expect(topModified.length).toBeGreaterThan(0);
  });
  
  /**
   * Test 8: Error handling - version not found
   */
  it('should throw error when version not found', async () => {
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce(null); // version 1 not found
    
    await expect(
      compareVersions(mockTimetableId, 1, 2)
    ).rejects.toThrow('Version 1 not found');
  });
  
  /**
   * Test 9: Summary totals should match
   */
  it('should have consistent summary totals', async () => {
    const timetable1: TimetableData = {
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
    
    const timetable2: TimetableData = {
      Mon: [
        { type: 'theory', subjectCode: 'CS101', teacherId: 'T1', roomId: 'R1' },
        { type: 'theory', subjectCode: 'CS103', teacherId: 'T3', roomId: 'R3' },
        { type: 'theory', subjectCode: 'CS104', teacherId: 'T4', roomId: 'R4' },
      ],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };
    
    (prisma.timetableVersion.findUnique as jest.Mock)
      .mockResolvedValueOnce({ json: JSON.stringify(timetable1) })
      .mockResolvedValueOnce({ json: JSON.stringify(timetable2) });
    
    const result = await compareVersions(mockTimetableId, 1, 2);
    
    const calculatedTotal = 
      result.summary.added +
      result.summary.removed +
      result.summary.modified +
      result.summary.unchanged;
    
    expect(calculatedTotal).toBe(result.summary.total);
  });
});

