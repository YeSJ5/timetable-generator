/**
 * Zod Schemas for Version Comparison Endpoints
 */

import { z } from 'zod';

/**
 * Version comparison params schema
 */
export const versionComparisonParamsSchema = z.object({
  version1: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error('version1 must be a positive integer');
    }
    return num;
  }),
  version2: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      throw new Error('version2 must be a positive integer');
    }
    return num;
  }),
});

/**
 * Type exports
 */
export type VersionComparisonParams = z.infer<typeof versionComparisonParamsSchema>;

