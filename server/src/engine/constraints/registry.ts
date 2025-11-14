/**
 * Constraint Registry
 * 
 * Runtime constraint registration and management
 */

import { Constraint, HardConstraint, SoftConstraint, ConstraintContext, ConstraintType, EntityType } from './types';
import prisma from '../../db';

class ConstraintRegistry {
  private hardConstraints: Map<string, HardConstraint> = new Map();
  private softConstraints: Map<string, SoftConstraint> = new Map();

  /**
   * Register a hard constraint
   */
  registerHard(constraint: HardConstraint): void {
    this.hardConstraints.set(constraint.name, constraint);
  }

  /**
   * Register a soft constraint
   */
  registerSoft(constraint: SoftConstraint): void {
    this.softConstraints.set(constraint.name, constraint);
  }

  /**
   * Get all hard constraints
   */
  getHardConstraints(): HardConstraint[] {
    return Array.from(this.hardConstraints.values());
  }

  /**
   * Get all soft constraints
   */
  getSoftConstraints(): SoftConstraint[] {
    return Array.from(this.softConstraints.values());
  }

  /**
   * Get constraint by name
   */
  getConstraint(name: string): Constraint | undefined {
    return this.hardConstraints.get(name) || this.softConstraints.get(name);
  }

  /**
   * Validate all hard constraints for a given context
   */
  validateHardConstraints(context: ConstraintContext): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    for (const constraint of this.hardConstraints.values()) {
      if (constraint.isActive !== false) {
        try {
          if (!constraint.validate(context)) {
            violations.push(constraint.message || `Hard constraint violated: ${constraint.name}`);
          }
        } catch (error) {
          violations.push(`Error validating ${constraint.name}: ${error}`);
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Score all soft constraints for a given context
   */
  scoreSoftConstraints(context: ConstraintContext): number {
    let totalPenalty = 0;

    for (const constraint of this.softConstraints.values()) {
      if (constraint.isActive !== false) {
        try {
          const penalty = constraint.score(context);
          const weightedPenalty = penalty * (constraint.weight || 1.0);
          totalPenalty += weightedPenalty;
        } catch (error) {
          console.error(`Error scoring ${constraint.name}:`, error);
        }
      }
    }

    return totalPenalty;
  }

  /**
   * Load constraints from database
   */
  async loadFromDatabase(): Promise<void> {
    const dbConstraints = await prisma.constraint.findMany({
      where: { isActive: true },
    });

    for (const dbConstraint of dbConstraints) {
      const payload = JSON.parse(dbConstraint.payload);
      const constraint: Constraint = {
        id: dbConstraint.id,
        type: dbConstraint.type as ConstraintType,
        name: dbConstraint.name,
        entityType: dbConstraint.entityType as EntityType,
        entityId: dbConstraint.entityId || undefined,
        payload,
        weight: dbConstraint.weight,
        isActive: dbConstraint.isActive,
      };

      // Note: Runtime constraints from DB need to have validate/score functions
      // This is a simplified version - in production, you'd need a way to
      // serialize/deserialize constraint functions or use a constraint DSL
      if (constraint.type === 'hard') {
        // For now, we'll skip DB-loaded hard constraints that need functions
        // They should be registered programmatically
      } else {
        // Soft constraints can be loaded if they have a standard scoring function
        // For now, we'll skip them too
      }
    }
  }

  /**
   * Save constraint to database
   */
  async saveToDatabase(constraint: Constraint): Promise<void> {
    await prisma.constraint.upsert({
      where: { id: constraint.id || '' },
      create: {
        type: constraint.type,
        name: constraint.name,
        entityType: constraint.entityType,
        entityId: constraint.entityId || null,
        payload: JSON.stringify(constraint.payload),
        weight: constraint.weight || 1.0,
        isActive: constraint.isActive !== false,
      },
      update: {
        type: constraint.type,
        name: constraint.name,
        entityType: constraint.entityType,
        entityId: constraint.entityId || null,
        payload: JSON.stringify(constraint.payload),
        weight: constraint.weight || 1.0,
        isActive: constraint.isActive !== false,
      },
    });
  }
}

// Singleton instance
export const constraintRegistry = new ConstraintRegistry();

