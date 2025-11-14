/**
 * Type Definitions
 * 
 * Shared TypeScript types for the frontend
 */

export interface TimetableCell {
  type: 'theory' | 'lab' | 'break' | null;
  subjectCode?: string;
  teacherId?: string;
  teacherInitials?: string;
  roomId?: string;
  roomName?: string;
  labName?: string;
  durationSlots?: number;
  colSpan?: number;
}

export interface TimetableData {
  Mon: (TimetableCell | null)[];
  Tue: (TimetableCell | null)[];
  Wed: (TimetableCell | null)[];
  Thu: (TimetableCell | null)[];
  Fri: (TimetableCell | null)[];
}

export interface Section {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
  initials: string | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
}

