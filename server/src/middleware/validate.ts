/**
 * Validation Middleware
 * 
 * Centralized input validation using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation options
 */
export interface ValidationOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Structured validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validate request using Zod schemas
 * 
 * @param options - Schemas for body, params, and query
 * @returns Express middleware
 */
export function validate(options: ValidationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (options.body) {
        req.body = await options.body.parseAsync(req.body);
      }

      // Validate params
      if (options.params) {
        req.params = await options.params.parseAsync(req.params);
      }

      // Validate query
      if (options.query) {
        req.query = await options.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into structured format
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors,
          },
        });
      }

      // Re-throw non-Zod errors
      next(error);
    }
  };
}

/**
 * Type-safe request handler with validation
 * 
 * @example
 * ```typescript
 * router.post('/endpoint', validate({ body: mySchema }), async (req, res) => {
 *   // req.body is now typed and validated
 *   const data: MyType = req.body;
 * });
 * ```
 */
export function createValidatedHandler<TBody = any, TParams = any, TQuery = any>(
  options: ValidationOptions,
  handler: (req: Request<TParams, any, TBody, TQuery>, res: Response, next: NextFunction) => Promise<void> | void
) {
  return [validate(options), handler] as const;
}

