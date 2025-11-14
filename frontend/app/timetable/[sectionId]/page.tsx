/**
 * Timetable View Page
 * 
 * Displays timetable for a specific section
 */

'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTimetableSnapshot } from '@/services/api';

export default function TimetablePage() {
  const params = useParams();
  const sectionId = params.sectionId as string;

  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: ['timetable', sectionId, 'snapshot'],
    queryFn: () => getTimetableSnapshot(sectionId),
    enabled: !!sectionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading timetable...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading timetable</div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No timetable found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Timetable - Section {snapshot.sectionId}
            </h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Version: {snapshot.version}</span>
              <span>Score: {snapshot.score}</span>
              <span>Health: {snapshot.healthScore}</span>
            </div>
          </div>

          {/* Timetable will be rendered here */}
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-center">
              Timetable viewer component will be implemented here
            </p>
            <pre className="mt-4 text-xs overflow-auto">
              {JSON.stringify(snapshot.timetable, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

