import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsApi, preferencesApi } from '../api/http';
import toast from 'react-hot-toast';

export default function SubjectConstraints() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await subjectsApi.getAll();
        setSubjects(res.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        const res = await preferencesApi.getSubject(selected);
        setConstraints(res.data || {});
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selected]);

  const save = async () => {
    if (!selected) return;
    try {
      await preferencesApi.updateSubject(selected, constraints);
      toast.success('Subject constraints saved');
    } catch (e: any) {
      toast.error('Failed to save');
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subject Constraints</h1>
      <div className="flex gap-4">
        <div className="w-1/4 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Subjects</h2>
          <ul>
            {subjects.map((s) => (
              <li key={s.id}>
                <button
                  className={`text-left w-full py-1 ${selected === s.id ? 'font-bold text-blue-600' : ''}`}
                  onClick={() => setSelected(s.id)}
                >
                  {s.code} - {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white p-4 rounded shadow">
          {!selected ? (
            <div>Select a subject to edit constraints</div>
          ) : (
            <div>
              <h2 className="font-semibold mb-2">Constraints</h2>
              <label className="block mb-2">
                <span className="text-sm">Spread across week</span>
                <input
                  type="checkbox"
                  checked={!!constraints.spreadAcrossWeek}
                  onChange={(e) => setConstraints({ ...constraints, spreadAcrossWeek: e.target.checked })}
                  className="ml-2"
                />
              </label>

              <label className="block mb-2">
                <span className="text-sm">Avoid consecutive days</span>
                <input
                  type="checkbox"
                  checked={!!constraints.noConsecutiveDays}
                  onChange={(e) => setConstraints({ ...constraints, noConsecutiveDays: e.target.checked })}
                  className="ml-2"
                />
              </label>

              <label className="block mb-2">
                <span className="text-sm">Preferred time</span>
                <select
                  value={constraints.preferredTimes?.[0] || ''}
                  onChange={(e) => setConstraints({ ...constraints, preferredTimes: e.target.value ? [e.target.value] : [] })}
                  className="ml-2 border rounded px-2 py-1"
                >
                  <option value="">Flexible</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </label>

              <h3 className="mt-4 font-semibold">Lab Constraints</h3>
              <label className="block mb-2">
                <span className="text-sm">Must be continuous</span>
                <input
                  type="checkbox"
                  checked={!!constraints.labConstraints?.mustBeContinuous}
                  onChange={(e) => setConstraints({ ...constraints, labConstraints: { ...(constraints.labConstraints || {}), mustBeContinuous: e.target.checked } })}
                  className="ml-2"
                />
              </label>

              <label className="block mb-2">
                <span className="text-sm">Allowed rooms (comma separated ids)</span>
                <input
                  type="text"
                  value={(constraints.labConstraints?.allowedRooms || []).join(',')}
                  onChange={(e) => setConstraints({ ...constraints, labConstraints: { ...(constraints.labConstraints || {}), allowedRooms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                  className="ml-2 border rounded px-2 py-1 w-full"
                />
              </label>

              <label className="block mb-2">
                <span className="text-sm">Required teachers (comma separated ids)</span>
                <input
                  type="text"
                  value={(constraints.labConstraints?.requiredTeachers || []).join(',')}
                  onChange={(e) => setConstraints({ ...constraints, labConstraints: { ...(constraints.labConstraints || {}), requiredTeachers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                  className="ml-2 border rounded px-2 py-1 w-full"
                />
              </label>

              <div className="mt-4">
                <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
