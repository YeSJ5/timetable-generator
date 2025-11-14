import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [slots, setSlots] = useState([
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
  ]);

  const [includeExtraSlots, setIncludeExtraSlots] = useState(true);
  const [candidateCount, setCandidateCount] = useState(10);
  const [labPlacementDays, setLabPlacementDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('timetableSettings', JSON.stringify({
      slots,
      includeExtraSlots,
      candidateCount,
      labPlacementDays,
    }));
    toast.success('Settings saved!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Time Slots Configuration */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Time Slots</h2>
          <div className="space-y-2">
            {slots.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => {
                    const newSlots = [...slots];
                    newSlots[idx] = e.target.value;
                    setSlots(newSlots);
                  }}
                  className="px-4 py-2 border rounded flex-1"
                />
                {(slot === '10:30-10:45' || slot === '12:45-1:30') && (
                  <span className="text-sm text-gray-500">(Break)</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Optional Slots */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Optional Slots</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeExtraSlots}
              onChange={(e) => setIncludeExtraSlots(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Include optional slots (3:30-4:30, 4:30-5:30)</span>
          </label>
        </section>

        {/* Engine Settings */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Engine Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Candidate Count (default: 10)
              </label>
              <input
                type="number"
                value={candidateCount}
                onChange={(e) => setCandidateCount(parseInt(e.target.value) || 10)}
                min="5"
                max="20"
                className="px-4 py-2 border rounded w-32"
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of timetable candidates to generate before selecting the best one
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lab Placement Preferred Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={labPlacementDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLabPlacementDays([...labPlacementDays, day]);
                        } else {
                          setLabPlacementDays(labPlacementDays.filter(d => d !== day));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* OpenAI Configuration */}
        <section>
          <h2 className="text-xl font-semibold mb-4">AI Inspector (Optional)</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm text-gray-700 mb-2">
              To enable AI-powered timetable analysis and suggestions:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Get your OpenAI API key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com</a></li>
              <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in the <code className="bg-gray-200 px-1 rounded">server</code> directory</li>
              <li>Add: <code className="bg-gray-200 px-1 rounded">OPENAI_API_KEY=your_key_here</code></li>
              <li>Restart the server</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Never commit your API key to version control. The key is only used server-side.
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

