/**
 * Request Logging Middleware
 * 
 * Logs requests in development mode with timing and payload info
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Request metadata
 */
interface RequestMetadata {
  method: string;
  path: string;
  payloadSize?: number;
  startTime: number;
}

/**
 * Extend Request type to store metadata
 */
declare global {
  namespace Express {
    interface Request {
      _metadata?: RequestMetadata;
    }
  }
}

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Only log in development/test mode
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return next();
  }

  // Store request metadata
  req._metadata = {
    method: req.method,
    path: req.path,
    payloadSize: req.body ? JSON.stringify(req.body).length : undefined,
    startTime: Date.now(),
  };

  // Log request start
  console.log(`[Request] ${req.method} ${req.path}`, {
    payloadSize: req._metadata.payloadSize ? `${req._metadata.payloadSize} bytes` : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req._metadata!.startTime;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`[Response] ${statusColor} ${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      payloadSize: req._metadata!.payloadSize ? `${req._metadata!.payloadSize} bytes` : undefined,
    });
  });

  next();
}

