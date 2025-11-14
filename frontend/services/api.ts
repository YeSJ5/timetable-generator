/**
 * API Service
 * 
 * Wrapper functions for backend API endpoints
 */

import apiClient from '@/lib/api';
import { AxiosResponse } from 'axios';

// Types
export interface HealthResponse {
  status: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  environment: string;
  memory: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
  };
  lastProfilerSample: any;
  timestamp: string;
}

export interface TimetableSnapshot {
  success: boolean;
  sectionId: string;
  version: number;
  score: number;
  healthScore: number;
  generatedAt: string;
  generationMode: string;
  timetable: any;
  metadata: {
    slotCount: number;
    daysWithClasses: number;
    lastUpdated: string;
  };
}

export interface Version {
  version: number;
  notes: string | null;
  score: number;
  healthScore: number;
  generatedAt: string;
  restorationMetadata: {
    restoredFrom?: number;
    restoredAt?: string;
  } | null;
}

export interface VersionsResponse {
  success: boolean;
  sectionId: string;
  currentVersion: number;
  versions: Version[];
}

export interface RegenerationRequest {
  timetableId: string;
  sectionId: string;
  targetId: string;
  preserveUnchanged?: boolean;
  solverType?: string;
  day?: string;
  slotIndex?: number;
}

export interface RegenerationResponse {
  success: boolean;
  timetables: { [sectionId: string]: any };
  score: number;
  conflicts: any[];
  changedSlots: any[];
  solverMetadata: any;
}

export interface VersionComparisonResponse {
  success: boolean;
  version1: number;
  version2: number;
  timetableId: string;
  changes: any[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
  topModified: any[];
}

/**
 * Health Check
 */
export async function getHealth(): Promise<HealthResponse> {
  const response: AxiosResponse<HealthResponse> = await apiClient.get('/health');
  return response.data;
}

/**
 * Get Timetable Snapshot
 */
export async function getTimetableSnapshot(sectionId: string): Promise<TimetableSnapshot> {
  const response: AxiosResponse<TimetableSnapshot> = await apiClient.get(
    `/timetable/${sectionId}/snapshot`
  );
  return response.data;
}

/**
 * Get Timetable Versions
 */
export async function getTimetableVersions(sectionId: string): Promise<VersionsResponse> {
  const response: AxiosResponse<VersionsResponse> = await apiClient.get(
    `/timetable/${sectionId}/versions`
  );
  return response.data;
}

/**
 * Regenerate Teacher
 */
export async function regenerateTeacher(
  request: RegenerationRequest
): Promise<RegenerationResponse> {
  const response: AxiosResponse<RegenerationResponse> = await apiClient.post(
    '/regenerate/teacher',
    request
  );
  return response.data;
}

/**
 * Regenerate Section
 */
export async function regenerateSection(
  request: RegenerationRequest
): Promise<RegenerationResponse> {
  const response: AxiosResponse<RegenerationResponse> = await apiClient.post(
    '/regenerate/section',
    request
  );
  return response.data;
}

/**
 * Regenerate Day
 */
export async function regenerateDay(
  request: RegenerationRequest & { day: string }
): Promise<RegenerationResponse> {
  const response: AxiosResponse<RegenerationResponse> = await apiClient.post(
    '/regenerate/day',
    request
  );
  return response.data;
}

/**
 * Regenerate Slot
 */
export async function regenerateSlot(
  request: RegenerationRequest & { day: string; slotIndex: number }
): Promise<RegenerationResponse> {
  const response: AxiosResponse<RegenerationResponse> = await apiClient.post(
    '/regenerate/slot',
    request
  );
  return response.data;
}

/**
 * Compare Versions
 */
export async function compareVersions(
  timetableId: string,
  version1: number,
  version2: number,
  topN: number = 10
): Promise<VersionComparisonResponse> {
  const response: AxiosResponse<VersionComparisonResponse> = await apiClient.get(
    `/timetable/versions/${version1}/compare/${version2}`,
    {
      params: { timetableId, topN },
    }
  );
  return response.data;
}

