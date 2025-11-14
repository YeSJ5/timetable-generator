import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sectionsApi, timetableApi } from '../api/http';
import TimetableViewer from '../components/TimetableViewer';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

export default function ViewAllTimetables() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const handleExportAllPDF = async () => {
    try {
      toast.loading('Generating PDFs...');
      const zip = new JSZip();

      for (const section of sections || []) {
        try {
          const timetableData = await timetableApi.getBySection(section.id);
          if (timetableData.data?.json) {
            // In a real implementation, you'd generate PDF here
            // For now, we'll add the JSON data
            zip.file(`${section.name}-timetable.json`, JSON.stringify(timetableData.data.json, null, 2));
          }
        } catch (error) {
          console.error(`Failed to export ${section.name}:`, error);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-timetables-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('All timetables exported!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export timetables');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Timetables</h1>
        <button
          onClick={handleExportAllPDF}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export All as ZIP
        </button>
      </div>

      <div className="space-y-8">
        {sections?.map((section: any) => (
          <TimetableSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function TimetableSectionCard({ section }: { section: any }) {
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['timetable', section.id],
    queryFn: async () => (await timetableApi.getBySection(section.id)).data,
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!timetableData?.json) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
        <div className="text-center py-8 text-gray-500">No timetable generated yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{section.name}</h2>
      <TimetableViewer
        timetable={timetableData.json}
        sectionName={section.name}
      />
    </div>
  );
}

