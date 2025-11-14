/**
 * Custom Hooks
 * 
 * React hooks for timetable operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTimetableSnapshot,
  getTimetableVersions,
  regenerateTeacher,
  regenerateSection,
  regenerateDay,
  regenerateSlot,
  RegenerationRequest,
} from '@/services/api';

/**
 * Hook to fetch timetable snapshot
 */
export function useTimetableSnapshot(sectionId: string) {
  return useQuery({
    queryKey: ['timetable', sectionId, 'snapshot'],
    queryFn: () => getTimetableSnapshot(sectionId),
    enabled: !!sectionId,
  });
}

/**
 * Hook to fetch timetable versions
 */
export function useTimetableVersions(sectionId: string) {
  return useQuery({
    queryKey: ['timetable', sectionId, 'versions'],
    queryFn: () => getTimetableVersions(sectionId),
    enabled: !!sectionId,
  });
}

/**
 * Hook to regenerate teacher schedule
 */
export function useRegenerateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegenerationRequest) => regenerateTeacher(request),
    onSuccess: (data, variables) => {
      // Invalidate timetable queries
      queryClient.invalidateQueries({
        queryKey: ['timetable', variables.sectionId],
      });
    },
  });
}

/**
 * Hook to regenerate section
 */
export function useRegenerateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegenerationRequest) => regenerateSection(request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timetable', variables.sectionId],
      });
    },
  });
}

/**
 * Hook to regenerate day
 */
export function useRegenerateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegenerationRequest & { day: string }) =>
      regenerateDay(request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timetable', variables.sectionId],
      });
    },
  });
}

/**
 * Hook to regenerate slot
 */
export function useRegenerateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegenerationRequest & { day: string; slotIndex: number }) =>
      regenerateSlot(request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timetable', variables.sectionId],
      });
    },
  });
}

