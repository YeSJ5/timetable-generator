/**
 * Health Check Endpoint
 * 
 * Provides system health and performance metrics
 */

import { Router, Request, Response } from 'express';
import { RegenerationProfiler } from '../engine/regeneration/performance';

const router = Router();

// Store last profiler sample (in-memory, resets on restart)
let lastProfilerSample: {
  scope: string;
  totalTime: number;
  phases: { [phase: string]: number };
  timestamp: number;
} | null = null;

/**
 * Update last profiler sample (called by regeneration endpoints)
 */
export function updateLastProfilerSample(scope: string, metrics: ReturnType<RegenerationProfiler['getMetrics']>): void {
  lastProfilerSample = {
    scope,
    totalTime: metrics.totalTime,
    phases: metrics.phases,
    timestamp: Date.now(),
  };
}

/**
 * GET /health
 * Returns system health status
 */
router.get('/', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime),
    },
    environment: process.env.NODE_ENV || 'development',
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
    lastProfilerSample: lastProfilerSample ? {
      ...lastProfilerSample,
      age: `${Math.floor((Date.now() - lastProfilerSample.timestamp) / 1000)}s`,
    } : null,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;

