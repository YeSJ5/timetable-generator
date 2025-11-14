/**
 * Version Comparison Utility
 * 
 * Compares two timetable versions and produces detailed diffs
 * 
 * @example
 * ```typescript
 * const diff = await compareVersions(timetableId, 1, 2);
 * console.log(diff.summary); // { added: 5, removed: 3, modified: 10, unchanged: 200 }
 * console.log(diff.changes[0]); // { day: 'Mon', slot: 2, type: 'modified', ... }
 * ```
 */

import prisma from '../db';
import { TimetableData, TimetableCell, DAYS } from './utils';

export interface SlotDiff {
  day: string;
  slot: number;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldValue?: TimetableCell | null;
  newValue?: TimetableCell | null;
  semanticDiff?: {
    teacherChanged?: boolean;
    roomChanged?: boolean;
    subjectChanged?: boolean;
    typeChanged?: boolean; // theory <-> lab
  };
}

export interface VersionComparisonResult {
  version1: number;
  version2: number;
  timetableId: string;
  changes: SlotDiff[];
  summary: {
    total: number;
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
  topModified: SlotDiff[]; // Top N modified slots (sorted by significance)
}

/**
 * Normalize timetable JSON for comparison
 * - Ensures consistent day order
 * - Sorts arrays where order is non-semantic
 * - Canonicalizes keys
 * 
 * Performance: Uses shared static day order, only clones arrays when necessary
 * 
 * @internal
 * Exported for testing purposes
 */
export function normalizeTimetable(timetable: TimetableData): TimetableData {
  const normalized: TimetableData = {};
  
  // Use shared static day order (avoid repeated array creation)
  // DAYS is already a const array, but we iterate it directly for clarity
  for (const day of DAYS) {
    if (timetable[day]) {
      // Only clone if array exists (avoid unnecessary empty arrays)
      // Use spread operator for shallow copy (efficient for slot arrays)
      normalized[day] = [...timetable[day]];
    } else {
      // Use empty array reference (shared, not cloned)
      normalized[day] = [];
    }
  }
  
  return normalized;
}

/**
 * Compare two timetable cells and determine if they're semantically different
 */
function compareCells(
  oldCell: TimetableCell | null,
  newCell: TimetableCell | null
): { isEqual: boolean; semanticDiff?: SlotDiff['semanticDiff'] } {
  // Both null or both empty
  if (!oldCell && !newCell) {
    return { isEqual: true };
  }
  
  // One is null, other is not
  if (!oldCell || !newCell) {
    return { isEqual: false };
  }
  
  // Different types
  if (oldCell.type !== newCell.type) {
    return {
      isEqual: false,
      semanticDiff: {
        typeChanged: true,
        teacherChanged: oldCell.teacherId !== newCell.teacherId,
        roomChanged: oldCell.roomId !== newCell.roomId,
        subjectChanged: oldCell.subjectCode !== newCell.subjectCode,
      },
    };
  }
  
  // Same type, compare fields
  const teacherChanged = oldCell.teacherId !== newCell.teacherId;
  const roomChanged = oldCell.roomId !== newCell.roomId;
  const subjectChanged = oldCell.subjectCode !== newCell.subjectCode;
  
  const hasChanges = teacherChanged || roomChanged || subjectChanged;
  
  if (!hasChanges) {
    return { isEqual: true };
  }
  
  return {
    isEqual: false,
    semanticDiff: {
      teacherChanged,
      roomChanged,
      subjectChanged,
      typeChanged: false,
    },
  };
}

/**
 * Calculate significance score for a modified slot
 * Higher score = more significant change
 */
function calculateSignificance(diff: SlotDiff): number {
  if (diff.type === 'unchanged') {
    return 0;
  }
  
  let score = 0;
  
  if (diff.type === 'added' || diff.type === 'removed') {
    score += 10; // Additions/removals are significant
  }
  
  if (diff.type === 'modified' && diff.semanticDiff) {
    if (diff.semanticDiff.typeChanged) {
      score += 15; // Type change (theory <-> lab) is very significant
    }
    if (diff.semanticDiff.teacherChanged) {
      score += 5; // Teacher change is significant
    }
    if (diff.semanticDiff.roomChanged) {
      score += 3; // Room change is moderately significant
    }
    if (diff.semanticDiff.subjectChanged) {
      score += 8; // Subject change is very significant
    }
  }
  
  return score;
}

/**
 * Compare two timetable versions and produce detailed diff
 * 
 * @param timetableId - ID of the timetable
 * @param version1 - First version number
 * @param version2 - Second version number
 * @param topN - Number of top modified slots to include (default: 10)
 * @returns Detailed comparison result
 */
export async function compareVersions(
  timetableId: string,
  version1: number,
  version2: number,
  topN: number = 10
): Promise<VersionComparisonResult> {
  // Fetch both versions
  const v1 = await prisma.timetableVersion.findUnique({
    where: {
      timetableId_version: {
        timetableId,
        version: version1,
      },
    },
  });
  
  const v2 = await prisma.timetableVersion.findUnique({
    where: {
      timetableId_version: {
        timetableId,
        version: version2,
      },
    },
  });
  
  if (!v1) {
    throw new Error(`Version ${version1} not found`);
  }
  
  if (!v2) {
    throw new Error(`Version ${version2} not found`);
  }
  
  // Parse JSON
  const timetable1: TimetableData = JSON.parse(v1.json);
  const timetable2: TimetableData = JSON.parse(v2.json);
  
  // Normalize both timetables
  const normalized1 = normalizeTimetable(timetable1);
  const normalized2 = normalizeTimetable(timetable2);
  
  // Compare slot by slot
  const changes: SlotDiff[] = [];
  
  // Get all days and determine max slot count
  const allDays = [...DAYS];
  let maxSlots = 0;
  for (const day of allDays) {
    maxSlots = Math.max(
      maxSlots,
      normalized1[day]?.length || 0,
      normalized2[day]?.length || 0
    );
  }
  
  // Compare each slot
  for (const day of allDays) {
    const day1 = normalized1[day] || [];
    const day2 = normalized2[day] || [];
    
    for (let slot = 0; slot < maxSlots; slot++) {
      const cell1 = slot < day1.length ? day1[slot] : null;
      const cell2 = slot < day2.length ? day2[slot] : null;
      
      // Determine change type
      let type: SlotDiff['type'];
      if (!cell1 && cell2) {
        type = 'added';
      } else if (cell1 && !cell2) {
        type = 'removed';
      } else {
        const comparison = compareCells(cell1, cell2);
        type = comparison.isEqual ? 'unchanged' : 'modified';
        
        // Create diff entry
        const diff: SlotDiff = {
          day,
          slot,
          type,
          oldValue: cell1,
          newValue: cell2,
          semanticDiff: comparison.semanticDiff,
        };
        
        changes.push(diff);
        continue;
      }
      
      // For added/removed, create diff entry
      const diff: SlotDiff = {
        day,
        slot,
        type,
        oldValue: cell1 || null,
        newValue: cell2 || null,
      };
      
      changes.push(diff);
    }
  }
  
  // Calculate summary
  const summary = {
    total: changes.length,
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
    unchanged: changes.filter(c => c.type === 'unchanged').length,
  };
  
  // Get top N modified slots (sorted by significance)
  const modifiedSlots = changes
    .filter(c => c.type === 'modified')
    .map(c => ({
      ...c,
      significance: calculateSignificance(c),
    }))
    .sort((a, b) => b.significance - a.significance)
    .slice(0, topN)
    .map(({ significance, ...rest }) => rest); // Remove significance from output
  
  return {
    version1,
    version2,
    timetableId,
    changes,
    summary,
    topModified: modifiedSlots,
  };
}

/**
 * Compare current timetable with a specific version
 * 
 * @param timetableId - ID of the timetable
 * @param version - Version number to compare with current
 * @param topN - Number of top modified slots to include (default: 10)
 * @returns Detailed comparison result
 */
export async function compareWithCurrent(
  timetableId: string,
  version: number,
  topN: number = 10
): Promise<VersionComparisonResult> {
  // Get current timetable
  const current = await prisma.timetable.findUnique({
    where: { id: timetableId },
  });
  
  if (!current) {
    throw new Error(`Timetable ${timetableId} not found`);
  }
  
  // Get version to compare
  const versionData = await prisma.timetableVersion.findUnique({
    where: {
      timetableId_version: {
        timetableId,
        version,
      },
    },
  });
  
  if (!versionData) {
    throw new Error(`Version ${version} not found`);
  }
  
  // Parse JSON
  const currentTimetable: TimetableData = JSON.parse(current.json);
  const versionTimetable: TimetableData = JSON.parse(versionData.json);
  
  // Normalize both timetables
  const normalized1 = normalizeTimetable(versionTimetable);
  const normalized2 = normalizeTimetable(currentTimetable);
  
  // Compare slot by slot (same logic as compareVersions)
  const changes: SlotDiff[] = [];
  
  const allDays = [...DAYS];
  let maxSlots = 0;
  for (const day of allDays) {
    maxSlots = Math.max(
      maxSlots,
      normalized1[day]?.length || 0,
      normalized2[day]?.length || 0
    );
  }
  
  for (const day of allDays) {
    const day1 = normalized1[day] || [];
    const day2 = normalized2[day] || [];
    
    for (let slot = 0; slot < maxSlots; slot++) {
      const cell1 = slot < day1.length ? day1[slot] : null;
      const cell2 = slot < day2.length ? day2[slot] : null;
      
      let type: SlotDiff['type'];
      if (!cell1 && cell2) {
        type = 'added';
      } else if (cell1 && !cell2) {
        type = 'removed';
      } else {
        const comparison = compareCells(cell1, cell2);
        type = comparison.isEqual ? 'unchanged' : 'modified';
        
        const diff: SlotDiff = {
          day,
          slot,
          type,
          oldValue: cell1,
          newValue: cell2,
          semanticDiff: comparison.semanticDiff,
        };
        
        changes.push(diff);
        continue;
      }
      
      const diff: SlotDiff = {
        day,
        slot,
        type,
        oldValue: cell1 || null,
        newValue: cell2 || null,
      };
      
      changes.push(diff);
    }
  }
  
  const summary = {
    total: changes.length,
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
    unchanged: changes.filter(c => c.type === 'unchanged').length,
  };
  
  const modifiedSlots = changes
    .filter(c => c.type === 'modified')
    .map(c => ({
      ...c,
      significance: calculateSignificance(c),
    }))
    .sort((a, b) => b.significance - a.significance)
    .slice(0, topN)
    .map(({ significance, ...rest }) => rest);
  
  return {
    version1: version,
    version2: current.version,
    timetableId,
    changes,
    summary,
    topModified: modifiedSlots,
  };
}

