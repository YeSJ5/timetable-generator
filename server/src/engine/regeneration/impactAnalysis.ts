/**
 * Impact Analysis for Partial Regeneration
 * 
 * Identifies which slots are affected by a regeneration request
 */

import { TimetableData, TimetableCell } from '../utils';
import { ImpactedRegion } from './types';
import { DAYS } from '../utils';

/**
 * Analyze impact of regenerating a teacher's schedule
 */
export function analyzeTeacherImpact(
  timetable: TimetableData,
  teacherId: string
): ImpactedRegion {
  const days: string[] = [];
  const slots: number[] = [];
  const affectedRooms: string[] = [];
  const affectedSubjects: string[] = [];

  for (const day of DAYS) {
    const dayData = timetable[day] || [];
    for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
      const cell = dayData[slotIndex];
      if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
        if (cell.teacherId === teacherId) {
          if (!days.includes(day)) {
            days.push(day);
          }
          slots.push(slotIndex);
          
          if (cell.roomId && !affectedRooms.includes(cell.roomId)) {
            affectedRooms.push(cell.roomId);
          }
          
          if (cell.subjectCode && !affectedSubjects.includes(cell.subjectCode)) {
            affectedSubjects.push(cell.subjectCode);
          }
        }
      }
    }
  }

  return {
    sectionId: '', // Will be set by caller
    days,
    slots,
    affectedTeachers: [teacherId],
    affectedRooms,
    affectedSubjects,
  };
}

/**
 * Analyze impact of regenerating a section's schedule
 * 
 * For section regeneration, we identify ALL slots in the timetable
 * since each timetable is section-specific
 */
export function analyzeSectionImpact(
  timetable: TimetableData,
  sectionId?: string
): ImpactedRegion {
  const days: string[] = [];
  const slots: number[] = [];
  const affectedTeachers: string[] = [];
  const affectedRooms: string[] = [];
  const affectedSubjects: string[] = [];

  // Track which slots have classes to determine max slot count
  let maxSlotCount = 0;

  for (const day of DAYS) {
    const dayData = timetable[day] || [];
    maxSlotCount = Math.max(maxSlotCount, dayData.length);
    
    for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
      const cell = dayData[slotIndex];
      if (cell && (cell.type === 'lab' || cell.type === 'theory')) {
        if (!days.includes(day)) {
          days.push(day);
        }
        if (!slots.includes(slotIndex)) {
          slots.push(slotIndex);
        }
        
        if (cell.teacherId && !affectedTeachers.includes(cell.teacherId)) {
          affectedTeachers.push(cell.teacherId);
        }
        
        if (cell.roomId && !affectedRooms.includes(cell.roomId)) {
          affectedRooms.push(cell.roomId);
        }
        
        if (cell.subjectCode && !affectedSubjects.includes(cell.subjectCode)) {
          affectedSubjects.push(cell.subjectCode);
        }
      }
    }
  }

  // If no classes found, still return all days and slots for full regeneration
  if (slots.length === 0) {
    return {
      sectionId: sectionId || '',
      days: [...DAYS],
      slots: Array.from({ length: maxSlotCount || 8 }, (_, i) => i),
      affectedTeachers: [],
      affectedRooms: [],
      affectedSubjects: [],
    };
  }

  return {
    sectionId: sectionId || '',
    days,
    slots,
    affectedTeachers,
    affectedRooms,
    affectedSubjects,
  };
}

/**
 * Analyze impact of regenerating a specific day
 */
export function analyzeDayImpact(
  timetable: TimetableData,
  day: string
): ImpactedRegion {
  const days: string[] = [day];
  const slots: number[] = [];
  const affectedTeachers: string[] = [];
  const affectedRooms: string[] = [];
  const affectedSubjects: string[] = [];

  const dayData = timetable[day] || [];
  for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
    const cell = dayData[slotIndex];
    if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
      slots.push(slotIndex);
      
      if (cell.teacherId && !affectedTeachers.includes(cell.teacherId)) {
        affectedTeachers.push(cell.teacherId);
      }
      
      if (cell.roomId && !affectedRooms.includes(cell.roomId)) {
        affectedRooms.push(cell.roomId);
      }
      
      if (cell.subjectCode && !affectedSubjects.includes(cell.subjectCode)) {
        affectedSubjects.push(cell.subjectCode);
      }
    }
  }

  return {
    sectionId: '', // Will be set by caller
    days,
    slots,
    affectedTeachers,
    affectedRooms,
    affectedSubjects,
  };
}

/**
 * Analyze impact of regenerating a specific slot
 * 
 * For lab blocks, identifies the entire block and returns all affected slots
 */
export function analyzeSlotImpact(
  timetable: TimetableData,
  day: string,
  slot: number
): ImpactedRegion & { isLab?: boolean; labDuration?: number } {
  const days: string[] = [day];
  const slots: number[] = [slot];
  const affectedTeachers: string[] = [];
  const affectedRooms: string[] = [];
  const affectedSubjects: string[] = [];

  const dayData = timetable[day] || [];
  const cell = dayData[slot];
  
  let isLab = false;
  let labDuration = 0;
  
  if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
    if (cell.type === 'lab') {
      isLab = true;
      labDuration = cell.durationSlots || cell.colSpan || 1;
      
      // Include all slots in the lab block
      for (let i = 0; i < labDuration && slot + i < dayData.length; i++) {
        if (!slots.includes(slot + i)) {
          slots.push(slot + i);
        }
      }
    }
    
    if (cell.teacherId && !affectedTeachers.includes(cell.teacherId)) {
      affectedTeachers.push(cell.teacherId);
    }
    
    if (cell.roomId && !affectedRooms.includes(cell.roomId)) {
      affectedRooms.push(cell.roomId);
    }
    
    if (cell.subjectCode && !affectedSubjects.includes(cell.subjectCode)) {
      affectedSubjects.push(cell.subjectCode);
    }
  }

  return {
    sectionId: '', // Will be set by caller
    days,
    slots,
    affectedTeachers,
    affectedRooms,
    affectedSubjects,
    isLab,
    labDuration,
  };
}

/**
 * Unassign slots in the impacted region
 */
export function unassignImpactedSlots(
  timetable: TimetableData,
  region: ImpactedRegion
): TimetableData {
  const unassigned = JSON.parse(JSON.stringify(timetable)) as TimetableData;

  for (const day of region.days) {
    const dayData = unassigned[day] || [];
    for (const slotIndex of region.slots) {
      if (slotIndex < dayData.length) {
        const cell = dayData[slotIndex];
        // Only unassign if it's a class (not break, not already null)
        if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
          dayData[slotIndex] = null;
        }
      }
    }
    unassigned[day] = dayData;
  }

  return unassigned;
}

/**
 * Track changes between old and new timetable
 */
export function trackChanges(
  oldTimetable: TimetableData,
  newTimetable: TimetableData,
  sectionId: string
): Array<{
  sectionId: string;
  day: string;
  slot: number;
  action: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
}> {
  const changes: Array<{
    sectionId: string;
    day: string;
    slot: number;
    action: 'added' | 'removed' | 'modified';
    oldValue?: any;
    newValue?: any;
  }> = [];

  for (const day of DAYS) {
    const oldDayData = oldTimetable[day] || [];
    const newDayData = newTimetable[day] || [];
    const maxLength = Math.max(oldDayData.length, newDayData.length);

    for (let slotIndex = 0; slotIndex < maxLength; slotIndex++) {
      const oldCell = oldDayData[slotIndex];
      const newCell = newDayData[slotIndex];

      // Skip break slots
      if (oldCell?.type === 'break' || newCell?.type === 'break') {
        continue;
      }

      // Added
      if (!oldCell && newCell && (newCell.type === 'theory' || newCell.type === 'lab')) {
        changes.push({
          sectionId,
          day,
          slot: slotIndex,
          action: 'added',
          newValue: newCell,
        });
      }
      // Removed
      else if (oldCell && (oldCell.type === 'theory' || oldCell.type === 'lab') && !newCell) {
        changes.push({
          sectionId,
          day,
          slot: slotIndex,
          action: 'removed',
          oldValue: oldCell,
        });
      }
      // Modified
      else if (oldCell && newCell && 
               (oldCell.type === 'theory' || oldCell.type === 'lab') &&
               (newCell.type === 'theory' || newCell.type === 'lab')) {
        // Check if actually changed
        const oldKey = `${oldCell.teacherId}-${oldCell.roomId}-${oldCell.subjectCode}`;
        const newKey = `${newCell.teacherId}-${newCell.roomId}-${newCell.subjectCode}`;
        
        if (oldKey !== newKey) {
          changes.push({
            sectionId,
            day,
            slot: slotIndex,
            action: 'modified',
            oldValue: oldCell,
            newValue: newCell,
          });
        }
      }
    }
  }

  return changes;
}

