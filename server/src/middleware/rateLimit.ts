/**
 * Rate Limiting Middleware
 * 
 * Lightweight in-memory token-bucket rate limiter
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

/**
 * Token bucket state
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory store for rate limiters
 */
const rateLimitStore = new Map<string, TokenBucket>();

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Stricter limits for regeneration endpoints
  REGENERATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'Too many regeneration requests. Please try again later.',
  },
  // More relaxed for read-only endpoints
  READ_ONLY: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests. Please try again later.',
  },
  // Default limit
  DEFAULT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please try again later.',
  },
} as const;

/**
 * Get client identifier from request
 */
function getClientId(req: Request): string {
  // Use IP address as identifier
  // In production, consider using user ID or API key
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Refill tokens in bucket
 */
function refillBucket(bucket: TokenBucket, config: RateLimitConfig): void {
  const now = Date.now();
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((timePassed / config.windowMs) * config.maxRequests);
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, config.maxRequests);
    bucket.lastRefill = now;
  }
}

/**
 * Create rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientId(req);
    const key = `${clientId}:${req.path}`;

    // Get or create bucket
    let bucket = rateLimitStore.get(key);
    if (!bucket) {
      bucket = {
        tokens: config.maxRequests,
        lastRefill: Date.now(),
      };
      rateLimitStore.set(key, bucket);
    }

    // Refill tokens
    refillBucket(bucket, config);

    // Check if request is allowed
    if (bucket.tokens > 0) {
      bucket.tokens--;
      next();
    } else {
      // Rate limit exceeded
      const retryAfter = Math.ceil((config.windowMs - (Date.now() - bucket.lastRefill)) / 1000);
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message || 'Too many requests. Please try again later.',
          details: {
            retryAfter,
            limit: config.maxRequests,
            window: config.windowMs,
          },
        },
      });
    }
  };
}

/**
 * Cleanup old rate limit entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

