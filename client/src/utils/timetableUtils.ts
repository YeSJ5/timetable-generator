export function isBreakSlot(slot: string): boolean {
  return slot === '10:30-10:45' || slot === '12:45-1:30';
}

export function getBreakLabel(slot: string): string {
  if (slot === '10:30-10:45') return 'TEA';
  if (slot === '12:45-1:30') return 'LUNCH';
  return '';
}

export const DEFAULT_SLOTS = [
  '8:30-9:30',
  '9:30-10:30',
  '10:30-10:45',
  '10:45-11:45',
  '11:45-12:45',
  '12:45-1:30',
  '1:30-2:30',
  '2:30-3:30',
  '3:30-4:30',
  '4:30-5:30',
];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

