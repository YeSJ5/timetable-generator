import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { teachersApi, roomsApi, sectionsApi, timetableApi } from '../api/http';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await teachersApi.getAll()).data,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await roomsApi.getAll()).data,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  // Calculate teacher workload
  const teacherWorkload = teachers?.map((teacher: any) => {
    const load = teacher.mappings?.length || 0;
    return {
      name: teacher.initials || teacher.name.substring(0, 10),
      hours: load * 3, // Approximate
      slots: load * 3,
    };
  }) || [];

  // Calculate room utilization
  const roomData = rooms?.map((room: any) => ({
    name: room.name,
    value: room.labs?.length || 0,
  })) || [];

  // Calculate free slots per section
  const freeSlotsData = sections?.map((section: any) => {
    // This would need timetable data to calculate accurately
    return {
      section: section.name,
      free: 40, // Placeholder
      used: 20, // Placeholder
    };
  }) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Workload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Teacher Workload</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teacherWorkload}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="slots" fill="#0088FE" name="Slots" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Room Utilization */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Room Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roomData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Free Slots */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Slot Utilization by Section</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={freeSlotsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="section" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="used" fill="#00C49F" name="Used Slots" />
              <Bar dataKey="free" fill="#FFBB28" name="Free Slots" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Teachers</p>
          <p className="text-2xl font-bold text-blue-600">{teachers?.length || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-2xl font-bold text-green-600">{rooms?.length || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Sections</p>
          <p className="text-2xl font-bold text-purple-600">{sections?.length || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Generated Timetables</p>
          <p className="text-2xl font-bold text-orange-600">
            {sections?.filter((s: any) => s.timetables?.length > 0).length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

