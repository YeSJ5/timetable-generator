import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsApi, timetableApi } from '../api/http';
import PrioritySettings from './PrioritySettings';
import toast from 'react-hot-toast';

export default function GeneratePage() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [generateAll, setGenerateAll] = useState(false);
  const [candidateCount, setCandidateCount] = useState(10);
  const [useAI, setUseAI] = useState(false);
  const [includeExtraSlots, setIncludeExtraSlots] = useState(true);
  const [generationMode, setGenerationMode] = useState<'strict' | 'adaptive' | 'free'>('adaptive');
  const [priorities, setPriorities] = useState({
    teacherPriority: 50,
    roomUtilization: 50,
    studentWorkloadBalance: 50,
    subjectSpreadQuality: 50,
    labPlacementImportance: 50,
    conflictAvoidanceStrictness: 50,
  });
  const [generationResult, setGenerationResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => timetableApi.generate(data),
    onSuccess: (data) => {
      setGenerationResult(data.data);
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable generated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Generation failed: ${error.response?.data?.message || error.message}`);
    },
  });

  const generateAllMutation = useMutation({
    mutationFn: (data: any) => timetableApi.generateAll(data),
    onSuccess: (data) => {
      setGenerationResult(data.data);
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('All timetables generated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Generation failed: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleGenerate = () => {
    if (generateAll) {
      generateAllMutation.mutate({
        candidateCount,
        useAI,
        includeExtraSlots,
        generationMode,
        priorities,
      });
    } else {
      if (selectedSections.length === 0) {
        toast.error('Please select at least one section');
        return;
      }
      generateMutation.mutate({
        sections: selectedSections,
        candidateCount,
        useAI,
        includeExtraSlots,
        generationMode,
        priorities,
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generate Timetable</h1>

      {/* Priority Settings */}
      <div className="mb-6">
        <PrioritySettings
          priorities={priorities}
          mode={generationMode}
          onPrioritiesChange={setPriorities}
          onModeChange={setGenerationMode}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="space-y-4">
          {/* Generate All Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={generateAll}
              onChange={(e) => {
                setGenerateAll(e.target.checked);
                if (e.target.checked) {
                  setSelectedSections([]);
                }
              }}
              className="w-4 h-4"
            />
            <span className="font-medium">Generate for all sections</span>
          </label>

          {/* Section Selection */}
          {!generateAll && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Sections</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border p-3 rounded">
                {sections?.map((section: any) => (
                  <label key={section.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4"
                    />
                    <span>{section.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Candidate Count</label>
              <input
                type="number"
                value={candidateCount}
                onChange={(e) => setCandidateCount(parseInt(e.target.value) || 10)}
                min="5"
                max="20"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeExtraSlots}
                  onChange={(e) => setIncludeExtraSlots(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Include Extra Slots (3:30-5:30)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Use AI Inspector (requires OpenAI key)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={
              (!generateAll && selectedSections.length === 0) ||
              generateMutation.isPending ||
              generateAllMutation.isPending
            }
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {generateMutation.isPending || generateAllMutation.isPending
              ? 'Generating...'
              : generateAll
              ? 'Generate All Timetables'
              : `Generate for ${selectedSections.length} Section(s)`}
          </button>
        </div>
      </div>

      {generationResult && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Generation Results</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {generationResult.score?.toFixed(1)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-red-600">
                {generationResult.conflicts?.length || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Used Slots</p>
              <p className="text-2xl font-bold text-green-600">
                {generationResult.diagnostics?.usedSlots || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-purple-600">
                {generationResult.diagnostics?.totalSlots || 0}
              </p>
            </div>
          </div>

          {/* Section Scores */}
          {generationResult.sectionScores && (
            <div>
              <h3 className="font-semibold mb-2">Section Scores:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(generationResult.sectionScores).map(([sectionId, score]: [string, any]) => {
                  const section = sections?.find((s: any) => s.id === sectionId);
                  return (
                    <div key={sectionId} className="bg-gray-100 p-2 rounded text-sm">
                      <span className="font-medium">{section?.name || sectionId}:</span>{' '}
                      <span className="text-blue-600">{score.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {generationResult.conflicts && generationResult.conflicts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Conflicts:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600 max-h-32 overflow-y-auto">
                {generationResult.conflicts.map((conflict: any, idx: number) => (
                  <li key={idx}>{conflict.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Explanation */}
          {generationResult.aiExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold mb-2 text-blue-800">AI Analysis:</h3>
              <p className="text-sm text-gray-700">{generationResult.aiExplanation.summary}</p>
              {generationResult.aiExplanation.suggestions && generationResult.aiExplanation.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Suggestions:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {generationResult.aiExplanation.suggestions.slice(0, 5).map((s: any, idx: number) => (
                      <li key={idx}>{s.suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
