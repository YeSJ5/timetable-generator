export interface TeacherAvailabilityMatrix {
  [day: string]: {
    [slot: string]: 'available' | 'preferred' | 'not_available' | 'no_labs';
  };
}

export interface TeacherPreferences {
  availabilityMatrix?: TeacherAvailabilityMatrix;
  maxClassesPerDay?: number;
  maxClassesPerWeek?: number;
  gapPreference?: 'prefer_gaps' | 'prefer_consecutive' | 'no_preference';
  consecutivePreference?: boolean;
}

export interface SubjectConstraints {
  spreadAcrossWeek?: boolean;
  noConsecutiveDays?: boolean;
  preferredTimes?: string[];
  labConstraints?: {
    mustBeContinuous: boolean;
    allowedRooms?: string[];
    requiredTeachers?: string[];
  };
}

export interface SectionWorkloadRules {
  maxHoursPerDay?: number;
  maxBackToBack?: number;
  minimumBreaks?: number;
  preferredStart?: 'early' | 'late' | 'flexible';
}

export interface RoomAllocationRules {
  capacity?: number;
  equipment?: string[];
  availability?: {
    [day: string]: {
      [slot: string]: boolean;
    };
  };
}

export interface GenerationPriorities {
  teacherPriority: number; // 0-100
  roomUtilization: number;
  studentWorkloadBalance: number;
  subjectSpreadQuality: number;
  labPlacementImportance: number;
  conflictAvoidanceStrictness: number;
}

export type GenerationMode = 'strict' | 'adaptive' | 'free';

