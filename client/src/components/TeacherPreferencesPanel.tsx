import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '../api/http';
import { DAYS, DEFAULT_SLOTS } from '../utils/timetableUtils';
import toast from 'react-hot-toast';

interface TeacherPreferencesPanelProps {
  teacherId: string;
  onClose: () => void;
}

type AvailabilityStatus = 'available' | 'preferred' | 'not_available' | 'no_labs';

export default function TeacherPreferencesPanel({ teacherId, onClose }: TeacherPreferencesPanelProps) {
  const queryClient = useQueryClient();
  const [availabilityMatrix, setAvailabilityMatrix] = useState<{ [day: string]: { [slot: string]: AvailabilityStatus } }>({});
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(4);
  const [maxClassesPerWeek, setMaxClassesPerWeek] = useState(20);
  const [gapPreference, setGapPreference] = useState<'prefer_gaps' | 'prefer_consecutive' | 'no_preference'>('no_preference');
  const [consecutivePreference, setConsecutivePreference] = useState(false);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['teacherPreferences', teacherId],
    queryFn: async () => (await preferencesApi.getTeacher(teacherId)).data,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => preferencesApi.updateTeacher(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherPreferences', teacherId] });
      toast.success('Preferences saved!');
    },
  });

  useEffect(() => {
    if (preferences) {
      setAvailabilityMatrix(preferences.availabilityMatrix || {});
      setMaxClassesPerDay(preferences.maxClassesPerDay || 4);
      setMaxClassesPerWeek(preferences.maxClassesPerWeek || 20);
      setGapPreference(preferences.gapPreference || 'no_preference');
      setConsecutivePreference(preferences.consecutivePreference || false);
    } else {
      // Initialize empty matrix
      const matrix: { [day: string]: { [slot: string]: AvailabilityStatus } } = {};
      DAYS.forEach(day => {
        matrix[day] = {};
        DEFAULT_SLOTS.forEach(slot => {
          matrix[day][slot] = 'available';
        });
      });
      setAvailabilityMatrix(matrix);
    }
  }, [preferences]);

  const handleCellClick = (day: string, slot: string) => {
    const statuses: AvailabilityStatus[] = ['available', 'preferred', 'not_available', 'no_labs'];
    const current = availabilityMatrix[day]?.[slot] || 'available';
    const currentIdx = statuses.indexOf(current);
    const nextIdx = (currentIdx + 1) % statuses.length;
    const next = statuses[nextIdx];

    setAvailabilityMatrix(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: next,
      },
    }));
  };

  const getStatusColor = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'preferred': return 'bg-green-500';
      case 'available': return 'bg-blue-400';
      case 'not_available': return 'bg-red-500';
      case 'no_labs': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      availabilityMatrix,
      maxClassesPerDay,
      maxClassesPerWeek,
      gapPreference,
      consecutivePreference,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Teacher Preferences</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Availability Matrix */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Availability Matrix</h3>
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">Day/Time</th>
                  {DEFAULT_SLOTS.map(slot => (
                    <th key={slot} className="border border-gray-300 p-2 bg-gray-100 text-xs">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day}>
                    <td className="border border-gray-300 p-2 font-semibold">{day}</td>
                    {DEFAULT_SLOTS.map(slot => {
                      const status = availabilityMatrix[day]?.[slot] || 'available';
                      return (
                        <td
                          key={slot}
                          className={`border border-gray-300 p-2 cursor-pointer hover:opacity-80 ${getStatusColor(status)}`}
                          onClick={() => handleCellClick(day, slot)}
                          title={`${status} - Click to change`}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span>Preferred</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>Not Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500"></div>
              <span>No Labs</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Classes Per Day</label>
            <input
              type="number"
              value={maxClassesPerDay}
              onChange={(e) => setMaxClassesPerDay(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded"
              min="1"
              max="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Classes Per Week</label>
            <input
              type="number"
              value={maxClassesPerWeek}
              onChange={(e) => setMaxClassesPerWeek(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded"
              min="1"
              max="40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gap Preference</label>
            <select
              value={gapPreference}
              onChange={(e) => setGapPreference(e.target.value as any)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="no_preference">No Preference</option>
              <option value="prefer_gaps">Prefer Gaps</option>
              <option value="prefer_consecutive">Prefer Consecutive</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={consecutivePreference}
                onChange={(e) => setConsecutivePreference(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Prefer Consecutive Classes</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

