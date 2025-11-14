/**
 * Solver Selection Layer
 * 
 * Central entry point for all solver strategies.
 * Allows easy injection of different solvers without modifying generateTimetable.ts
 */

import { solveGreedy, GreedySolverOptions, GreedySolverResult } from './greedy';
// Future solvers will be imported here:
// import { solveHillClimbing } from './hillClimbing';
// import { solveSimulatedAnnealing } from './simulatedAnnealing';
// import { solveGeneticAlgorithm } from './geneticAlgorithm';

export type SolverType = 'greedy' | 'hillClimbing' | 'simulatedAnnealing' | 'geneticAlgorithm';

export interface SolverOptions {
  type: SolverType;
  sections: any[];
  slots?: string[];
  lectureRooms: any[];
  labRooms: any[];
  seed?: number;
  generationMode?: string;
  priorities?: any;
  constraints?: any;
}

export interface SolverResult {
  timetables: { [sectionId: string]: any };
  score: number;
  conflicts: Array<{
    type: string;
    day: string;
    slot: string;
    message: string;
    sectionId?: string;
  }>;
  diagnostics: {
    totalSlots: number;
    usedSlots: number;
    labSlots: number;
    theorySlots: number;
    teacherLoad: { [teacherId: string]: number };
    roomUtilization: { [roomId: string]: number };
  };
  sectionScores: { [sectionId: string]: number };
  constraintViolations?: string[];
  metadata?: {
    solver: string;
    iterations?: number;
    placements?: number;
    generationTime?: number;
  };
}

/**
 * Run the specified solver
 */
export async function runSolver(options: SolverOptions): Promise<SolverResult> {
  const startTime = Date.now();
  
  let result: SolverResult;

  switch (options.type) {
    case 'greedy':
      const greedyResult = await solveGreedy({
        sections: options.sections,
        slots: options.slots,
        lectureRooms: options.lectureRooms,
        labRooms: options.labRooms,
        seed: options.seed,
        generationMode: options.generationMode as any,
        priorities: options.priorities,
        constraints: options.constraints,
      });
      
      result = {
        ...greedyResult,
        metadata: {
          solver: 'greedy',
          generationTime: Date.now() - startTime,
        },
      };
      break;

    // Future solvers:
    // case 'hillClimbing':
    //   result = await solveHillClimbing(options);
    //   break;
    // case 'simulatedAnnealing':
    //   result = await solveSimulatedAnnealing(options);
    //   break;
    // case 'geneticAlgorithm':
    //   result = await solveGeneticAlgorithm(options);
    //   break;

    default:
      throw new Error(`Unknown solver type: ${options.type}`);
  }

  // Add metadata if not present
  if (!result.metadata) {
    result.metadata = {
      solver: options.type,
      generationTime: Date.now() - startTime,
    };
  }

  return result;
}

/**
 * Get available solvers
 */
export function getAvailableSolvers(): SolverType[] {
  return ['greedy']; // Add more as they're implemented
}

/**
 * Get default solver
 */
export function getDefaultSolver(): SolverType {
  return 'greedy';
}

