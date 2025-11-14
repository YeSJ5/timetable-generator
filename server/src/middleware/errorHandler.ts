/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and formats consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Error codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Custom application errors
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Map internal errors to user-facing error codes
 */
function mapErrorToCode(error: Error): { code: ErrorCode; statusCode: number; message: string; details?: any } {
  // Zod validation errors (should be caught by validate middleware, but handle just in case)
  if (error instanceof ZodError) {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      statusCode: 400,
      message: 'Validation failed',
      details: error.errors,
    };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          code: ErrorCode.CONFLICT,
          statusCode: 409,
          message: 'Unique constraint violation',
          details: { field: error.meta?.target },
        };
      case 'P2025':
        return {
          code: ErrorCode.NOT_FOUND,
          statusCode: 404,
          message: 'Record not found',
        };
      default:
        return {
          code: ErrorCode.SERVER_ERROR,
          statusCode: 500,
          message: 'Database error',
        };
    }
  }

  // Custom AppError
  if (error instanceof AppError) {
    return {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    };
  }

  // Common error patterns
  if (error.message.includes('not found')) {
    return {
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
      message: error.message,
    };
  }

  if (error.message.includes('already exists') || error.message.includes('duplicate')) {
    return {
      code: ErrorCode.CONFLICT,
      statusCode: 409,
      message: error.message,
    };
  }

  // Default: server error
  return {
    code: ErrorCode.SERVER_ERROR,
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { code, statusCode, message, details } = mapErrorToCode(error);

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Handler]', {
      code,
      message,
      details,
      path: req.path,
      method: req.method,
      stack: error.stack,
    });
  }

  // Send error response
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

