/**
 * Test Assertion Helpers
 * 
 * Utilities for asserting timetable equality and diff correctness
 */

import { TimetableData } from '../../src/engine/utils';

/**
 * Assert two timetables are equal
 */
export function assertTimetableEqual(
  actual: TimetableData,
  expected: TimetableData,
  message?: string
): void {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  for (const day of days) {
    const actualDay = actual[day] || [];
    const expectedDay = expected[day] || [];
    
    expect(actualDay.length).toBe(
      expectedDay.length,
      `${message || 'Timetable'} - ${day} length mismatch`
    );
    
    for (let i = 0; i < Math.max(actualDay.length, expectedDay.length); i++) {
      const actualCell = actualDay[i];
      const expectedCell = expectedDay[i];
      
      // Normalize for comparison (ignore colSpan for lab continuation slots)
      if (actualCell && expectedCell) {
        if (actualCell.type === 'lab' && actualCell.colSpan === 0) {
          // Lab continuation slot - only check type
          expect(actualCell.type).toBe(expectedCell.type);
        } else {
          // Full comparison
          expect(actualCell).toEqual(expectedCell);
        }
      } else {
        expect(actualCell).toBe(expectedCell);
      }
    }
  }
}

/**
 * Assert timetable structure is consistent
 */
export function assertTimetableStructure(timetable: TimetableData): void {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  for (const day of days) {
    expect(timetable[day]).toBeDefined();
    expect(Array.isArray(timetable[day])).toBe(true);
    
    const dayData = timetable[day] || [];
    for (let i = 0; i < dayData.length; i++) {
      const cell = dayData[i];
      if (cell !== null) {
        expect(cell).toHaveProperty('type');
        if (cell.type === 'theory' || cell.type === 'lab') {
          expect(cell).toHaveProperty('subjectCode');
          expect(cell).toHaveProperty('teacherId');
          expect(cell).toHaveProperty('roomId');
        }
      }
    }
  }
}

/**
 * Assert diff matches expected changes
 */
export function assertDiffMatchesExpected(
  diff: any,
  expectedChanges: {
    added?: number;
    removed?: number;
    modified?: number;
    unchanged?: number;
  }
): void {
  if (expectedChanges.added !== undefined) {
    expect(diff.summary.added).toBe(expectedChanges.added);
  }
  if (expectedChanges.removed !== undefined) {
    expect(diff.summary.removed).toBe(expectedChanges.removed);
  }
  if (expectedChanges.modified !== undefined) {
    expect(diff.summary.modified).toBe(expectedChanges.modified);
  }
  if (expectedChanges.unchanged !== undefined) {
    expect(diff.summary.unchanged).toBeGreaterThanOrEqual(expectedChanges.unchanged);
  }
  
  // Verify changes array matches summary
  const actualAdded = diff.changes.filter((c: any) => c.type === 'added').length;
  const actualRemoved = diff.changes.filter((c: any) => c.type === 'removed').length;
  const actualModified = diff.changes.filter((c: any) => c.type === 'modified').length;
  
  expect(actualAdded).toBe(diff.summary.added);
  expect(actualRemoved).toBe(diff.summary.removed);
  expect(actualModified).toBe(diff.summary.modified);
}

/**
 * Assert version metadata is correct
 */
export function assertVersionMetadata(
  version: any,
  expected: {
    version: number;
    notes?: string;
    restoredFrom?: number;
  }
): void {
  expect(version.version).toBe(expected.version);
  if (expected.notes) {
    expect(version.notes).toContain(expected.notes);
  }
  if (expected.restoredFrom) {
    expect(version.notes).toContain(`restoredFrom:${expected.restoredFrom}`);
  }
}

/**
 * Count non-null slots in timetable
 */
export function countSlots(timetable: TimetableData): number {
  let count = 0;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  for (const day of days) {
    const dayData = timetable[day] || [];
    for (const cell of dayData) {
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Get slots for a specific teacher
 */
export function getTeacherSlots(
  timetable: TimetableData,
  teacherId: string
): Array<{ day: string; slot: number; cell: any }> {
  const slots: Array<{ day: string; slot: number; cell: any }> = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  for (const day of days) {
    const dayData = timetable[day] || [];
    for (let i = 0; i < dayData.length; i++) {
      const cell = dayData[i];
      if (cell && (cell.type === 'theory' || cell.type === 'lab') && cell.teacherId === teacherId) {
        slots.push({ day, slot: i, cell });
      }
    }
  }
  
  return slots;
}

