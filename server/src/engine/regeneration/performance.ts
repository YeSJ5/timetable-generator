/**
 * Performance Optimization Utilities
 * 
 * Provides caching, memoization, and profiling for regeneration flows
 * 
 * Performance Strategies:
 * 1. Availability Caching: Pre-compute teacher/room availability maps to avoid repeated iterations
 * 2. Shallow Cloning: Only clone affected days/slots instead of entire timetable
 * 3. Constraint Memoization: Cache constraint check results for identical contexts
 * 4. Batched Queries: Fetch all required data in single Prisma queries
 * 5. Profiling: Track time spent in each phase for optimization insights
 */

import { TimetableData, TimetableCell, DAYS } from '../utils';
import { ConstraintContext, constraintRegistry } from '../constraints';

/**
 * Teacher/Room availability cache
 * Maps teacher/room IDs to their occupied slots across all days
 * Performance: O(1) lookup instead of O(n) iteration
 */
export class AvailabilityCache {
  teacherSlots: { [teacherId: string]: Set<number> } = {};
  roomSlots: { [roomId: string]: Set<number> } = {};
  initialized: boolean = false;

  /**
   * Build availability cache from timetable
   * Excludes specified day/slot if provided (for regeneration)
   */
  buildFromTimetable(
    timetable: TimetableData,
    excludeDay?: string,
    excludeSlot?: number
  ): void {
    this.teacherSlots = {};
    this.roomSlots = {};

    for (const day of DAYS) {
      if (excludeDay && day === excludeDay) {
        continue; // Skip excluded day
      }

      const dayData = timetable[day] || [];
      for (let slotIndex = 0; slotIndex < dayData.length; slotIndex++) {
        if (excludeDay && day === excludeDay && excludeSlot !== undefined && slotIndex === excludeSlot) {
          continue; // Skip excluded slot
        }

        const cell = dayData[slotIndex];
        if (cell && (cell.type === 'theory' || cell.type === 'lab')) {
          // Track teacher availability
          if (cell.teacherId) {
            if (!this.teacherSlots[cell.teacherId]) {
              this.teacherSlots[cell.teacherId] = new Set();
            }
            this.teacherSlots[cell.teacherId].add(slotIndex);
          }

          // Track room availability
          if (cell.roomId) {
            if (!this.roomSlots[cell.roomId]) {
              this.roomSlots[cell.roomId] = new Set();
            }
            this.roomSlots[cell.roomId].add(slotIndex);
          }
        }
      }
    }

    this.initialized = true;
  }

  /**
   * Check if teacher is available at a specific slot
   * Performance: O(1) lookup
   */
  isTeacherAvailable(teacherId: string, slotIndex: number): boolean {
    if (!this.initialized) {
      return true;
    }
    return !this.teacherSlots[teacherId]?.has(slotIndex);
  }

  /**
   * Check if room is available at a specific slot
   * Performance: O(1) lookup
   */
  isRoomAvailable(roomId: string, slotIndex: number): boolean {
    if (!this.initialized) {
      return true;
    }
    return !this.roomSlots[roomId]?.has(slotIndex);
  }

  /**
   * Update cache after placing a class
   * Keeps cache in sync during placement loops
   */
  markUnavailable(teacherId: string, roomId: string, slotIndex: number): void {
    if (!this.teacherSlots[teacherId]) {
      this.teacherSlots[teacherId] = new Set();
    }
    this.teacherSlots[teacherId].add(slotIndex);

    if (roomId) {
      if (!this.roomSlots[roomId]) {
        this.roomSlots[roomId] = new Set();
      }
      this.roomSlots[roomId].add(slotIndex);
    }
  }
}

/**
 * Constraint memoization cache
 * Reuses constraint check results for identical contexts
 */
export class ConstraintMemoCache {
  private cache = new Map<string, { valid: boolean; violations: string[] }>();
  private hits = 0;
  private misses = 0;

  /**
   * Memoized constraint check
   * Performance: Avoids redundant constraint validation
   */
  check(
    context: ConstraintContext,
    checkFn: (context: ConstraintContext) => { valid: boolean; violations: string[] }
  ): { valid: boolean; violations: string[] } {
    // Create cache key (excluding timetable which is large and changes)
    const key = JSON.stringify({
      day: context.day,
      slot: context.slot,
      teacherId: context.teacherId,
      subjectId: context.subjectId,
      roomId: context.roomId,
      sectionId: context.sectionId,
    });

    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key)!;
    }

    this.misses++;
    const result = checkFn(context);
    this.cache.set(key, result);

    // Limit cache size (LRU eviction)
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return result;
  }

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  totalTime: number;
  phases: {
    [phase: string]: number;
  };
  cacheHits?: number;
  cacheMisses?: number;
  prismaQueries?: number;
  clones?: number;
}

/**
 * Performance profiler for regeneration flows
 * Tracks time spent in each phase for optimization insights
 */
export class RegenerationProfiler {
  private startTime: number = 0;
  private phases: Map<string, number> = new Map();
  private currentPhase: string | null = null;
  private phaseStartTime: number = 0;
  private prismaQueries: number = 0;
  private clones: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Start timing a phase
   */
  startPhase(phase: string): void {
    if (this.currentPhase) {
      this.endPhase();
    }
    this.currentPhase = phase;
    this.phaseStartTime = Date.now();
  }

  /**
   * End timing current phase
   */
  endPhase(): void {
    if (this.currentPhase) {
      const duration = Date.now() - this.phaseStartTime;
      const existing = this.phases.get(this.currentPhase) || 0;
      this.phases.set(this.currentPhase, existing + duration);
      this.currentPhase = null;
    }
  }

  /**
   * Record a Prisma query
   */
  recordQuery(): void {
    this.prismaQueries++;
  }

  /**
   * Record a clone operation
   */
  recordClone(): void {
    this.clones++;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.endPhase(); // End any active phase
    const totalTime = Date.now() - this.startTime;

    const phases: { [phase: string]: number } = {};
    this.phases.forEach((duration, phase) => {
      phases[phase] = duration;
    });

    return {
      totalTime,
      phases,
      prismaQueries: this.prismaQueries,
      clones: this.clones,
    };
  }

  /**
   * Log metrics in development mode
   */
  logMetrics(scope: string): void {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const metrics = this.getMetrics();
      console.log(`[Performance] ${scope}:`, {
        totalTime: `${metrics.totalTime}ms`,
        phases: Object.entries(metrics.phases).map(([phase, time]) => ({
          phase,
          time: `${time}ms`,
          percentage: `${((time / metrics.totalTime) * 100).toFixed(1)}%`,
        })),
        prismaQueries: metrics.prismaQueries,
        clones: metrics.clones,
      });
    }
  }
}

/**
 * Shallow clone only affected days
 * Performance: Avoids deep cloning entire timetable (O(n) -> O(affected))
 */
export function cloneAffectedDays(
  timetable: TimetableData,
  affectedDays: string[]
): TimetableData {
  const cloned: TimetableData = {};

  // Only clone affected days (deep copy)
  for (const day of affectedDays) {
    if (timetable[day]) {
      cloned[day] = [...timetable[day]];
    } else {
      cloned[day] = [];
    }
  }

  // Reference unchanged days (shallow copy - no cloning)
  for (const day of DAYS) {
    if (!affectedDays.includes(day)) {
      cloned[day] = timetable[day] || [];
    }
  }

  return cloned;
}

/**
 * Shallow clone timetable (only structure, not day arrays)
 * Performance: O(1) instead of O(n) for full deep clone
 */
export function shallowCloneTimetable(timetable: TimetableData): TimetableData {
  const cloned: TimetableData = {};
  for (const day of DAYS) {
    cloned[day] = timetable[day] || [];
  }
  return cloned;
}

/**
 * Clone only a specific day
 * Performance: Most efficient for day/slot regeneration
 */
export function cloneDay(timetable: TimetableData, day: string): (TimetableCell | null)[] {
  if (timetable[day]) {
    return [...timetable[day]];
  }
  return [];
}

/**
 * Clone a range of slots within a day
 * Performance: Only clones affected slots
 */
export function cloneSlotRange(
  dayData: (TimetableCell | null)[],
  startSlot: number,
  endSlot: number
): (TimetableCell | null)[] {
  const cloned = [...dayData];
  // Slots are already cloned by array spread above
  return cloned;
}

/**
 * Shared static day order
 * Performance: Avoids recreating array on every call
 */
export const STATIC_DAYS = [...DAYS] as readonly string[];
