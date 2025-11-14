/**
 * Regeneration API Routes
 * 
 * Endpoints for partial timetable regeneration
 */

import { Router } from 'express';
import { regenerateTeacher, regenerateSection, regenerateDay, regenerateSlot } from '../engine/regeneration';
import { validate } from '../middleware/validate';
import { rateLimit, RATE_LIMITS } from '../middleware/rateLimit';
import {
  teacherRegenerationSchema,
  sectionRegenerationSchema,
  dayRegenerationSchema,
  slotRegenerationSchema,
} from '../schemas/regeneration';

const router = Router();

// Apply rate limiting to all regeneration endpoints (stricter limits)
router.use(rateLimit(RATE_LIMITS.REGENERATION));

/**
 * POST /regenerate/teacher
 * Regenerate timetable for a specific teacher
 * 
 * Body: { timetableId, sectionId, targetId (teacherId), preserveUnchanged?, solverType? }
 */
router.post(
  '/teacher',
  validate({ body: teacherRegenerationSchema }),
  async (req, res, next) => {
    try {
      const result = await regenerateTeacher({
        timetableId: req.body.timetableId,
        sectionId: req.body.sectionId,
        targetId: req.body.targetId,
        scope: 'teacher',
        preserveUnchanged: req.body.preserveUnchanged,
        solverType: req.body.solverType,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /regenerate/section
 * Regenerate entire section timetable
 * 
 * Body: { timetableId, sectionId, targetId (sectionId), preserveUnchanged?, solverType? }
 */
router.post(
  '/section',
  validate({ body: sectionRegenerationSchema }),
  async (req, res, next) => {
    try {
      const result = await regenerateSection({
        timetableId: req.body.timetableId,
        sectionId: req.body.sectionId,
        targetId: req.body.targetId,
        scope: 'section',
        preserveUnchanged: req.body.preserveUnchanged,
        solverType: req.body.solverType,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /regenerate/day
 * Regenerate timetable for a specific day
 * 
 * Body: { timetableId, sectionId, targetId (day), day, preserveUnchanged?, solverType? }
 */
router.post(
  '/day',
  validate({ body: dayRegenerationSchema }),
  async (req, res, next) => {
    try {
      const result = await regenerateDay({
        timetableId: req.body.timetableId,
        sectionId: req.body.sectionId,
        targetId: req.body.targetId,
        scope: 'day',
        day: req.body.day,
        preserveUnchanged: req.body.preserveUnchanged,
        solverType: req.body.solverType,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /regenerate/slot
 * Regenerate a specific slot
 * 
 * Body: { timetableId, sectionId, targetId (day:slotIndex), day, slotIndex, preserveUnchanged?, solverType? }
 */
router.post(
  '/slot',
  validate({ body: slotRegenerationSchema }),
  async (req, res, next) => {
    try {
      const result = await regenerateSlot({
        timetableId: req.body.timetableId,
        sectionId: req.body.sectionId,
        targetId: req.body.targetId,
        scope: 'slot',
        day: req.body.day,
        slotIndex: req.body.slotIndex,
        preserveUnchanged: req.body.preserveUnchanged,
        solverType: req.body.solverType,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

