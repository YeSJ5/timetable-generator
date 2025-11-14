/**
 * Debug & Admin API Routes
 * 
 * Endpoints for debugging utilities and administrative tasks
 */

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../db';
import { TimetableData, DAYS } from '../engine/utils';

const router = Router();

/**
 * GET /debug/slot-search
 * Search for slots matching criteria
 */
router.get('/slot-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId, roomId, subjectId, day, sectionId } = req.query;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sectionId query parameter is required',
        },
      });
    }

    const timetable = await prisma.timetable.findFirst({
      where: { sectionId: sectionId as string },
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

    const timetableData: TimetableData = JSON.parse(timetable.json);
    const matches: Array<{ day: string; slot: number; cell: any }> = [];

    const searchDays = day ? [day as string] : DAYS;

    for (const d of searchDays) {
      const dayData = timetableData[d] || [];
      for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
        const cell = dayData[slotIndex];
        if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
          let matchesCriteria = true;

          if (teacherId && cell.teacherId !== teacherId) {
            matchesCriteria = false;
          }
          if (roomId && cell.roomId !== roomId) {
            matchesCriteria = false;
          }
          if (subjectId && cell.subjectCode !== subjectId) {
            matchesCriteria = false;
          }

          if (matchesCriteria) {
            matches.push({ day: d, slot: slotIndex, cell });
          }
        }
      }
    }

    res.json({
      success: true,
      query: { teacherId, roomId, subjectId, day, sectionId },
      matches,
      count: matches.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /debug/usage-map
 * Returns teacher and room usage maps
 */
router.get('/usage-map', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.query;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sectionId query parameter is required',
        },
      });
    }

    const timetable = await prisma.timetable.findFirst({
      where: { sectionId: sectionId as string },
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

    const timetableData: TimetableData = JSON.parse(timetable.json);
    const teacherMap: { [teacherId: string]: Array<{ day: string; slot: number }> } = {};
    const roomMap: { [roomId: string]: Array<{ day: string; slot: number }> } = {};

    for (const day of DAYS) {
      const dayData = timetableData[day] || [];
      for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
        const cell = dayData[slotIndex];
        if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
          // Track teacher usage
          if (cell.teacherId) {
            if (!teacherMap[cell.teacherId]) {
              teacherMap[cell.teacherId] = [];
            }
            teacherMap[cell.teacherId].push({ day, slot: slotIndex });
          }

          // Track room usage
          if (cell.roomId) {
            if (!roomMap[cell.roomId]) {
              roomMap[cell.roomId] = [];
            }
            roomMap[cell.roomId].push({ day, slot: slotIndex });
          }
        }
      }
    }

    res.json({
      success: true,
      sectionId,
      teacherUsage: teacherMap,
      roomUsage: roomMap,
      summary: {
        teachers: Object.keys(teacherMap).length,
        rooms: Object.keys(roomMap).length,
        totalTeacherSlots: Object.values(teacherMap).reduce((sum, slots) => sum + slots.length, 0),
        totalRoomSlots: Object.values(roomMap).reduce((sum, slots) => sum + slots.length, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /debug/labs
 * Returns all labs with their placement information
 */
router.get('/labs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.query;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sectionId query parameter is required',
        },
      });
    }

    // Get labs from database
    const labs = await prisma.lab.findMany({
      where: { sectionId: sectionId as string },
      include: {
        teacher: true,
        room: true,
        section: true,
      },
    });

    // Get current timetable
    const timetable = await prisma.timetable.findFirst({
      where: { sectionId: sectionId as string },
      orderBy: { version: 'desc' },
    });

    const labPlacements: Array<{
      lab: any;
      placements: Array<{ day: string; startSlot: number; duration: number }>;
    }> = [];

    if (timetable) {
      const timetableData: TimetableData = JSON.parse(timetable.json);

      for (const lab of labs) {
        const placements: Array<{ day: string; startSlot: number; duration: number }> = [];

        for (const day of DAYS) {
          const dayData = timetableData[day] || [];
          for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
            const cell = dayData[slotIndex];
            if (cell && cell.type === 'lab' && cell.labName === lab.name) {
              // Check if this is the start of a lab block (colSpan > 0)
              if (cell.colSpan && cell.colSpan > 0) {
                placements.push({
                  day,
                  startSlot: slotIndex,
                  duration: cell.durationSlots || lab.durationSlots || 2,
                });
              }
            }
          }
        }

        labPlacements.push({
          lab: {
            id: lab.id,
            name: lab.name,
            durationSlots: lab.durationSlots,
            teacher: lab.teacher,
            room: lab.room,
          },
          placements,
        });
      }
    }

    res.json({
      success: true,
      sectionId,
      labs: labPlacements,
      summary: {
        totalLabs: labs.length,
        placedLabs: labPlacements.filter(lp => lp.placements.length > 0).length,
        unplacedLabs: labPlacements.filter(lp => lp.placements.length === 0).length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /debug/performance
 * Returns performance metrics and cache statistics
 */
router.get('/performance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get last profiler sample from health endpoint
    // Note: In a real implementation, this would access a shared store
    // For now, we'll return a note about using profiler logs
    
    res.json({
      success: true,
      performance: {
        note: 'Performance metrics are logged during regeneration. Check console logs or use /health endpoint for last profiler sample.',
        healthEndpoint: '/health',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

