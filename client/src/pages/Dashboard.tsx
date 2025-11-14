import { useQuery } from '@tanstack/react-query';
import { teachersApi, subjectsApi, sectionsApi, labsApi, mappingsApi } from '../api/http';

export default function Dashboard() {
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await teachersApi.getAll()).data,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await subjectsApi.getAll()).data,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const { data: labs } = useQuery({
    queryKey: ['labs'],
    queryFn: async () => (await labsApi.getAll()).data,
  });

  const { data: mappings } = useQuery({
    queryKey: ['mappings'],
    queryFn: async () => (await mappingsApi.getAll()).data,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Teachers</h2>
          <p className="text-3xl font-bold text-blue-600">
            {teachers?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Subjects</h2>
          <p className="text-3xl font-bold text-green-600">
            {subjects?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Sections</h2>
          <p className="text-3xl font-bold text-purple-600">
            {sections?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Labs</h2>
          <p className="text-3xl font-bold text-orange-600">
            {labs?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Mappings</h2>
          <p className="text-3xl font-bold text-red-600">
            {mappings?.length || 0}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Add Teachers, Subjects, Sections, and Rooms in <strong>Manage Data</strong></li>
          <li>Create Teacher-Subject-Section Mappings</li>
          <li>Add Labs for sections that need them</li>
          <li>Go to <strong>Generate</strong> to create timetables</li>
          <li>View generated timetables in <strong>View Timetable</strong></li>
        </ol>
      </div>
    </div>
  );
}

