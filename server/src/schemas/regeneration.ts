/**
 * Zod Schemas for Regeneration Endpoints
 * 
 * Validates inputs for all regeneration API endpoints
 */

import { z } from 'zod';
import { DAYS } from '../engine/utils';

/**
 * Base regeneration options schema
 */
const baseRegenerationSchema = z.object({
  timetableId: z.string().uuid('timetableId must be a valid UUID'),
  sectionId: z.string().uuid('sectionId must be a valid UUID'),
  preserveUnchanged: z.boolean().optional().default(true),
  solverType: z.enum(['greedy', 'hill-climbing', 'simulated-annealing', 'genetic']).optional().default('greedy'),
});

/**
 * Teacher regeneration schema
 */
export const teacherRegenerationSchema = baseRegenerationSchema.extend({
  targetId: z.string().uuid('targetId (teacherId) must be a valid UUID'),
  scope: z.literal('teacher').optional().default('teacher'),
});

/**
 * Section regeneration schema
 */
export const sectionRegenerationSchema = baseRegenerationSchema.extend({
  targetId: z.string().uuid('targetId (sectionId) must be a valid UUID'),
  scope: z.literal('section').optional().default('section'),
});

/**
 * Day regeneration schema
 */
export const dayRegenerationSchema = baseRegenerationSchema.extend({
  targetId: z.string().refine(
    (val) => DAYS.includes(val as any),
    { message: `targetId (day) must be one of: ${DAYS.join(', ')}` }
  ),
  day: z.enum(DAYS as [string, ...string[]], {
    errorMap: () => ({ message: `day must be one of: ${DAYS.join(', ')}` }),
  }),
  scope: z.literal('day').optional().default('day'),
});

/**
 * Slot regeneration schema
 */
export const slotRegenerationSchema = baseRegenerationSchema.extend({
  targetId: z.string().regex(
    /^(Mon|Tue|Wed|Thu|Fri):\d+$/,
    'targetId must be in format "Day:slotIndex" (e.g., "Mon:0")'
  ),
  day: z.enum(DAYS as [string, ...string[]], {
    errorMap: () => ({ message: `day must be one of: ${DAYS.join(', ')}` }),
  }),
  slotIndex: z.number().int('slotIndex must be an integer').min(0, 'slotIndex must be >= 0'),
  scope: z.literal('slot').optional().default('slot'),
});

/**
 * Type exports (inferred from schemas)
 */
export type TeacherRegenerationInput = z.infer<typeof teacherRegenerationSchema>;
export type SectionRegenerationInput = z.infer<typeof sectionRegenerationSchema>;
export type DayRegenerationInput = z.infer<typeof dayRegenerationSchema>;
export type SlotRegenerationInput = z.infer<typeof slotRegenerationSchema>;

