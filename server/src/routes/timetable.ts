import { Router } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { generateTimetable } from '../engine/generateTimetable';
import { analyzeTimetable, generateAIFixes, Conflict } from '../engine/aiInspector';
import { saveTimetables, getTimetableVersions, getTimetableVersion, restoreTimetableVersion, compareVersions } from '../engine/saveTimetables';
import { validate } from '../middleware/validate';
import { versionComparisonParamsSchema } from '../schemas/version';
import { DAYS } from '../engine/utils';

/**
 * Helper: Extract restoration metadata from notes
 */
function extractRestorationMetadata(notes: string | null): { restoredFrom?: number; restoredAt?: string } | null {
  if (!notes) return null;

  const restoredFromMatch = notes.match(/restoredFrom:(\d+)/);
  if (!restoredFromMatch) return null;

  const restoredAtMatch = notes.match(/restoredAt:([^)]+)/);
  const restoredAt = restoredAtMatch ? restoredAtMatch[1] : null;

  return {
    restoredFrom: parseInt(restoredFromMatch[1], 10),
    restoredAt: restoredAt || null,
  };
}

const router = Router();

// POST generate timetable (enhanced for multi-section)
router.post('/generate', async (req, res) => {
  try {
    const {
      sections,
      slots,
      candidateCount,
      seed,
      includeExtraSlots,
      useAI,
      constraints,
      generationMode,
      priorities,
    } = req.body;

    if (!sections) {
      return res.status(400).json({ error: 'sections is required (array of section IDs or "all")' });
    }

    const result = await generateTimetable({
      sections: sections === 'all' ? 'all' : Array.isArray(sections) ? sections : [sections],
      slots,
      candidateCount: candidateCount || 10,
      seed,
      includeExtraSlots: includeExtraSlots !== false,
      useAI: useAI === true,
      constraints,
      generationMode: generationMode || 'adaptive',
      priorities,
    });

    // Save timetables to database with version tracking
    await saveTimetables({
      timetables: result.timetables,
      score: result.score,
      conflicts: result.conflicts,
      generationMode: generationMode || 'adaptive',
      priorities,
      solverMetadata: result.solverMetadata,
    });

    // Optional AI analysis
    let aiExplanation = null;
    if (useAI) {
      const sectionNames = await prisma.section.findMany({
        where: { id: { in: Object.keys(result.timetables) } },
        select: { id: true, name: true },
      });
      aiExplanation = await analyzeTimetable(
        result.timetables,
        result.conflicts,
        result.diagnostics,
        sectionNames
      );
    }

    res.json({
      success: true,
      score: result.score,
      conflicts: result.conflicts,
      timetables: result.timetables,
      diagnostics: result.diagnostics,
      sectionScores: result.sectionScores,
      aiExplanation,
    });
  } catch (error: any) {
    console.error('Timetable generation error:', error);
    res.status(500).json({
      error: 'Failed to generate timetable',
      message: error.message,
    });
  }
});

// POST generate for all sections
router.post('/generate-all', async (req, res) => {
  try {
    const { candidateCount, seed, includeExtraSlots, useAI, constraints, generationMode, priorities } = req.body;

    const result = await generateTimetable({
      sections: 'all',
      candidateCount: candidateCount || 10,
      seed,
      includeExtraSlots: includeExtraSlots !== false,
      useAI: useAI === true,
      constraints,
      generationMode: generationMode || 'adaptive',
      priorities,
    });

    // Save all timetables with version tracking
    await saveTimetables({
      timetables: result.timetables,
      score: result.score,
      conflicts: result.conflicts,
      generationMode: generationMode || 'adaptive',
      priorities,
      solverMetadata: result.solverMetadata,
    });

    res.json({
      success: true,
      score: result.score,
      conflicts: result.conflicts,
      timetables: result.timetables,
      diagnostics: result.diagnostics,
      sectionScores: result.sectionScores,
    });
  } catch (error: any) {
    console.error('Timetable generation error:', error);
    res.status(500).json({
      error: 'Failed to generate timetables',
      message: error.message,
    });
  }
});

// POST AI fix suggestions
router.post('/ai-fix', async (req, res) => {
  try {
    const { timetables, conflicts } = req.body;

    if (!timetables || !conflicts) {
      return res.status(400).json({ error: 'timetables and conflicts are required' });
    }

    const fixes = await generateAIFixes(timetables, conflicts);

    res.json({
      success: true,
      fixes,
    });
  } catch (error: any) {
    console.error('AI Fix error:', error);
    res.status(500).json({
      error: 'Failed to generate AI fixes',
      message: error.message,
    });
  }
});

// GET timetable versions for a section (must come before /:sectionId)
// Returns ordered list with metadata
router.get('/:sectionId/versions', async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const timetable = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
      include: {
        versionHistory: {
          orderBy: { version: 'asc' },
        },
      },
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Timetable not found',
        },
      });
    }

    // Format versions with metadata
    const versions = timetable.versionHistory.map(v => ({
      version: v.version,
      notes: v.notes,
      score: v.score,
      healthScore: v.healthScore,
      generatedAt: v.generatedAt,
      restorationMetadata: extractRestorationMetadata(v.notes),
    }));

    res.json({
      success: true,
      sectionId,
      currentVersion: timetable.version,
      versions,
    });
  } catch (error) {
    next(error);
  }
});

// GET specific version (must come before /:sectionId)
router.get('/:sectionId/version/:version', async (req, res) => {
  try {
    const { sectionId, version } = req.params;
    const timetable = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
    });
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    const versionData = await getTimetableVersion(timetable.id, parseInt(version));
    if (!versionData) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(versionData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch version', message: error.message });
  }
});

// POST restore version (must come before /:sectionId)
router.post('/:sectionId/restore/:version', async (req, res, next) => {
  try {
    const { sectionId, version } = req.params;
    const { notes } = req.body;

    const timetable = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
    });

    if (!timetable) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Timetable not found',
        },
      });
    }

    await restoreTimetableVersion(timetable.id, parseInt(version), notes);

    // Get the restored timetable
    const restored = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
      include: {
        section: true,
      },
    });

    res.json({
      success: true,
      message: `Version ${version} restored successfully`,
      timetable: restored ? {
        ...restored,
        json: JSON.parse(restored.json),
      } : null,
    });
  } catch (error) {
    next(error);
  }
});

// GET compare versions (must come before /:sectionId)
// This route uses the old compareVersions for backward compatibility
router.get('/:sectionId/compare/:version1/:version2', async (req, res) => {
  try {
    const { sectionId, version1, version2 } = req.params;

    const timetable = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
    });

    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    const comparison = await compareVersions(
      timetable.id,
      parseInt(version1),
      parseInt(version2)
    );

    res.json(comparison);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compare versions', message: error.message });
  }
});

/**
 * GET /versions/:version1/compare/:version2
 * Compare two timetable versions (new improved endpoint)
 * 
 * Query params:
 * - timetableId: string (required)
 * - topN?: number (default: 10) - Number of top modified slots to return
 * 
 * Returns detailed diff between two versions
 */
const versionComparisonQuerySchema = z.object({
  timetableId: z.string().uuid('timetableId must be a valid UUID'),
  topN: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error('topN must be a positive integer');
    }
    return num;
  }).optional(),
});

router.get(
  '/versions/:version1/compare/:version2',
  validate({
    params: versionComparisonParamsSchema,
    query: versionComparisonQuerySchema,
  }),
  async (req, res, next) => {
    try {
      const { version1, version2 } = req.params;
      const { timetableId, topN } = req.query;
      
      const topNValue = topN || 10;
      
      const { compareVersions: newCompareVersions } = await import('../engine/compareVersions');
      const result = await newCompareVersions(timetableId as string, version1, version2, topNValue);
      
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET timetable for section (latest version) - must be last
router.get('/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    const timetable = await prisma.timetable.findFirst({
      where: { sectionId },
      orderBy: { version: 'desc' },
      include: {
        section: true,
      },
    });

    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    // Parse JSON string back to object
    const parsedTimetable = {
      ...timetable,
      json: JSON.parse(timetable.json as string),
    };

    res.json(parsedTimetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

export default router;
