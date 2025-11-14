import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sectionsApi, timetableApi } from '../api/http';
import TimetableViewer from '../components/TimetableViewer';

export default function ViewTimetable() {
  const [selectedSection, setSelectedSection] = useState<string>('');

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['timetable', selectedSection],
    queryFn: async () => (await timetableApi.getBySection(selectedSection)).data,
    enabled: !!selectedSection,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">View Timetable</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-2">Select Section</label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">-- Select Section --</option>
          {sections?.map((section: any) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && selectedSection && (
        <div className="text-center py-8">Loading timetable...</div>
      )}

      {timetableData && timetableData.json && (
        <TimetableViewer
          timetable={timetableData.json}
          sectionName={sections?.find((s: any) => s.id === selectedSection)?.name || 'Unknown'}
        />
      )}

      {!selectedSection && (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          Please select a section to view its timetable
        </div>
      )}
    </div>
  );
}

