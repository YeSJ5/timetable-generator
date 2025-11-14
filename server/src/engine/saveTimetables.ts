import prisma from '../db';
import { TimetableData } from './utils';
import { Conflict } from './aiInspector';
import { GenerationMode, GenerationPriorities } from '../types/preferences';

/**
 * Calculate health score (0-100) based on conflicts and timetable quality
 */
function calculateHealthScore(timetable: TimetableData, conflicts: Conflict[]): number {
  let score = 100;
  
  // Penalize conflicts
  score -= conflicts.length * 10;
  
  // Check for empty days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  let emptyDays = 0;
  for (const day of days) {
    const dayData = timetable[day] || [];
    const hasClasses = dayData.some(cell => cell && (cell.type === 'theory' || cell.type === 'lab'));
    if (!hasClasses) {
      emptyDays++;
    }
  }
  score -= emptyDays * 5;
  
  return Math.max(0, Math.min(100, score));
}

export interface SaveTimetablesOptions {
  timetables: { [sectionId: string]: TimetableData };
  score: number;
  conflicts: Conflict[];
  generationMode?: GenerationMode;
  priorities?: GenerationPriorities;
  notes?: string;
  solverMetadata?: {
    solver: string;
    generationTime?: number;
    iterations?: number;
    placements?: number;
    constraintViolations?: string[];
  };
}

/**
 * Saves timetables to database with version tracking
 * Creates new versions for each section's timetable
 */
export async function saveTimetables(options: SaveTimetablesOptions): Promise<void> {
  const {
    timetables,
    score,
    conflicts,
    generationMode = 'adaptive',
    priorities,
    notes,
  } = options;

  for (const [sectionId, timetable] of Object.entries(timetables)) {
    // Find existing timetable to determine next version
    const existing = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
    });

    const newVersion = existing ? existing.version + 1 : 1;

    // Create new timetable entry
    const healthScore = calculateHealthScore(timetable, conflicts);
    
    // Build notes with solver metadata if available
    let notesWithMetadata = notes;
    if (options.solverMetadata) {
      const metadata = options.solverMetadata;
      const metadataNote = `Solver: ${metadata.solver}` +
        (metadata.generationTime ? ` | Time: ${metadata.generationTime}ms` : '') +
        (metadata.placements ? ` | Placements: ${metadata.placements}` : '') +
        (metadata.constraintViolations && metadata.constraintViolations.length > 0
          ? ` | Constraint Violations: ${metadata.constraintViolations.length}`
          : '');
      notesWithMetadata = notesWithMetadata
        ? `${notesWithMetadata}\n${metadataNote}`
        : metadataNote;
    }

    const saved = await prisma.timetable.create({
      data: {
        sectionId,
        json: JSON.stringify(timetable),
        score,
        version: newVersion,
        generationMode,
        priorities: priorities ? JSON.stringify(priorities) : null,
        generatedAt: new Date(),
        healthScore,
        notes: notesWithMetadata || null,
      },
    });

      // Save to version history
      await prisma.timetableVersion.create({
        data: {
          timetableId: saved.id,
          version: newVersion,
          json: JSON.stringify(timetable),
          score,
          healthScore: saved.healthScore,
          generatedAt: new Date(),
          notes: notes || null,
        },
      });
  }
}

/**
 * Get all versions for a section
 */
export async function getTimetableVersions(sectionId: string) {
  const timetable = await prisma.timetable.findFirst({
    where: { sectionId },
    orderBy: { version: 'desc' },
    include: {
      versionHistory: {
        orderBy: { version: 'desc' },
      },
    },
  });

  return timetable?.versionHistory || [];
}

/**
 * Get specific version of a timetable
 */
export async function getTimetableVersion(timetableId: string, version: number) {
  const versionData = await prisma.timetableVersion.findUnique({
    where: {
      timetableId_version: {
        timetableId,
        version,
      },
    },
    include: {
      timetable: {
        include: {
          section: true,
        },
      },
    },
  });

  if (!versionData) {
    return null;
  }

  return {
    ...versionData,
    json: JSON.parse(versionData.json as string),
  };
}

/**
 * Restore a specific version (creates new version from old one)
 */
export async function restoreTimetableVersion(
  timetableId: string,
  versionToRestore: number,
  notes?: string
): Promise<void> {
  const versionData = await prisma.timetableVersion.findUnique({
    where: {
      timetableId_version: {
        timetableId,
        version: versionToRestore,
      },
    },
    include: {
      timetable: true,
    },
  });

  if (!versionData) {
    throw new Error(`Version ${versionToRestore} not found`);
  }

  // Get current highest version
  const current = await prisma.timetable.findFirst({
    where: { id: timetableId },
    orderBy: { version: 'desc' },
  });

  const newVersion = current ? current.version + 1 : 1;

  // Create new timetable entry from restored version
  const newTimetable = await prisma.timetable.create({
    data: {
      sectionId: versionData.timetable.sectionId,
      json: versionData.json,
      score: versionData.score,
      version: newVersion,
      generationMode: versionData.timetable.generationMode,
      priorities: versionData.timetable.priorities,
      healthScore: versionData.healthScore,
      generatedAt: new Date(),
    },
  });

  // Save to version history with restoration metadata
  const restoredAt = new Date();
  const restorationNotes = notes 
    ? `${notes} (restoredFrom:${versionToRestore}, restoredAt:${restoredAt.toISOString()})`
    : `Restored from version ${versionToRestore} (restoredAt:${restoredAt.toISOString()})`;
  
  await prisma.timetableVersion.create({
    data: {
      timetableId: newTimetable.id,
      version: newVersion,
      json: versionData.json,
      score: versionData.score,
      healthScore: versionData.healthScore,
      generatedAt: restoredAt,
      notes: restorationNotes,
    },
  });
}

/**
 * Compare two timetable versions
 * @deprecated Use compareVersions from './compareVersions' instead
 * This function is kept for backward compatibility and returns the old format
 */
export async function compareVersions(
  timetableId: string,
  version1: number,
  version2: number
) {
  // Use the new compareVersions and convert to old format for backward compatibility
  const { compareVersions: newCompareVersions } = await import('./compareVersions');
  const result = await newCompareVersions(timetableId, version1, version2);
  
  // Convert to old format
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

  if (!v1 || !v2) {
    throw new Error('One or both versions not found');
  }

  return {
    version1: {
      version: v1.version,
      score: v1.score,
      generatedAt: v1.generatedAt,
    },
    version2: {
      version: v2.version,
      score: v2.score,
      generatedAt: v2.generatedAt,
    },
    differences: result.changes
      .filter(c => c.type !== 'unchanged')
      .map(c => ({
        day: c.day,
        slot: c.slot,
        version1: c.oldValue,
        version2: c.newValue,
      })),
    totalDifferences: result.summary.added + result.summary.removed + result.summary.modified,
  };
}

