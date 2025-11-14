/**
 * Constraint Engine Entry Point
 * 
 * Exports all constraint-related functionality
 */

export * from './types';
export * from './registry';
export * from './hard';
export * from './soft';
export { constraintRegistry } from './registry';
export { registerHardConstraints } from './hard';
export { registerSoftConstraints } from './soft';

import { constraintRegistry } from './registry';
import { registerHardConstraints } from './hard';
import { registerSoftConstraints } from './soft';

/**
 * Initialize constraint engine with built-in constraints
 */
export function initializeConstraintEngine(): void {
  registerHardConstraints(constraintRegistry);
  registerSoftConstraints(constraintRegistry);
  
  // Load constraints from database (async, non-blocking)
  constraintRegistry.loadFromDatabase().catch(err => {
    console.error('Failed to load constraints from database:', err);
  });
}

