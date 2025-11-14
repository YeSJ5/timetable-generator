export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export type Day = typeof DAYS[number];

export const DEFAULT_TIME_SLOTS = [
  '8:30-9:30',
  '9:30-10:30',
  '10:30-10:45',  // Tea
  '10:45-11:45',
  '11:45-12:45',
  '12:45-1:30',   // Lunch
  '1:30-2:30',
  '2:30-3:30',
  '3:30-4:30',    // optional
  '4:30-5:30',    // optional
] as const;

export const TIME_SLOTS = [
  '8:30-9:30',
  '9:30-10:30',
  '10:30-10:45',  // Tea
  '10:45-11:45',
  '11:45-12:45',
  '12:45-1:30',   // Lunch
  '1:30-2:30',
  '2:30-3:30',
] as const;

export const EXTRA_SLOTS = [
  '3:30-4:30',
  '4:30-5:30',
] as const;

export type TimeSlot = typeof TIME_SLOTS[number] | typeof EXTRA_SLOTS[number];

export interface TimetableEntry {
  subjectCode: string;
  subjectName?: string;
  teacherId: string;
  teacherInitials: string;
  room: string;
  roomId?: string;
  durationSlots: number;
  isLab: boolean;
  originalSlotIndex: number;
  labName?: string;
}

export interface TimetableCell {
  type: 'theory' | 'lab' | 'break' | 'empty';
  subjectCode?: string;
  subjectName?: string;
  teacherInitials?: string;
  teacherId?: string;
  roomName?: string;
  roomId?: string;
  labName?: string;
  durationSlots?: number;
  colSpan?: number;
  entry?: TimetableEntry;
}

export interface TimetableData {
  [day: string]: (TimetableCell | null)[];
}

export interface TimetableJson {
  [day: string]: Array<null | TimetableEntry>;
}

export function isBreakSlot(slot: string): boolean {
  return slot === '10:30-10:45' || slot === '12:45-1:30';
}

export function getBreakLabel(slot: string): string {
  if (slot === '10:30-10:45') return 'TEA';
  if (slot === '12:45-1:30') return 'LUNCH';
  return '';
}

export function getSlotIndex(slot: string, allSlots: string[]): number {
  return allSlots.indexOf(slot);
}

export function getAllSlots(includeExtra: boolean = true): string[] {
  return includeExtra ? [...TIME_SLOTS, ...EXTRA_SLOTS] : [...TIME_SLOTS];
}

export function getMorningSlots(slots: string[]): number[] {
  const morningIndices: number[] = [];
  slots.forEach((slot, idx) => {
    if (slot.startsWith('8:') || slot.startsWith('9:') || slot.startsWith('10:') || slot.startsWith('11:') || slot.startsWith('12:')) {
      if (!isBreakSlot(slot)) {
        morningIndices.push(idx);
      }
    }
  });
  return morningIndices;
}

export function getAfternoonSlots(slots: string[]): number[] {
  const afternoonIndices: number[] = [];
  slots.forEach((slot, idx) => {
    if (slot.startsWith('1:') || slot.startsWith('2:') || slot.startsWith('3:') || slot.startsWith('4:') || slot.startsWith('5:')) {
      if (!isBreakSlot(slot)) {
        afternoonIndices.push(idx);
      }
    }
  });
  return afternoonIndices;
}

export function findContiguousSlots(
  slots: string[],
  requiredLength: number,
  startFrom: number = 0,
  excludeIndices: Set<number> = new Set()
): number[] | null {
  for (let start = startFrom; start <= slots.length - requiredLength; start++) {
    let canUse = true;
    const candidate: number[] = [];

    for (let i = 0; i < requiredLength; i++) {
      const idx = start + i;
      if (idx >= slots.length || isBreakSlot(slots[idx]) || excludeIndices.has(idx)) {
        canUse = false;
        break;
      }
      candidate.push(idx);
    }

    if (canUse) {
      return candidate;
    }
  }
  return null;
}

export function hasTeacherConflict(
  teacherId: string,
  day: string,
  slotIndices: number[],
  teacherSlots: { [teacherId: string]: { [day: string]: Set<number> } }
): boolean {
  const teacherDaySlots = teacherSlots[teacherId]?.[day];
  if (!teacherDaySlots) return false;

  return slotIndices.some(idx => teacherDaySlots.has(idx));
}

export function hasRoomConflict(
  roomId: string,
  day: string,
  slotIndices: number[],
  roomSlots: { [roomId: string]: { [day: string]: Set<number> } }
): boolean {
  const roomDaySlots = roomSlots[roomId]?.[day];
  if (!roomDaySlots) return false;

  return slotIndices.some(idx => roomDaySlots.has(idx));
}

export function isSlotAvailable(
  day: string,
  slotIndex: number,
  timetable: TimetableData
): boolean {
  const dayData = timetable[day];
  if (!dayData || !dayData[slotIndex]) return true;
  const cell = dayData[slotIndex];
  return cell === null || cell.type === 'empty';
}
