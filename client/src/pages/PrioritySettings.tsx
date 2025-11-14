import { useState } from 'react';

interface PrioritySettingsProps {
  priorities: {
    teacherPriority: number;
    roomUtilization: number;
    studentWorkloadBalance: number;
    subjectSpreadQuality: number;
    labPlacementImportance: number;
    conflictAvoidanceStrictness: number;
  };
  mode: 'strict' | 'adaptive' | 'free';
  onPrioritiesChange: (priorities: any) => void;
  onModeChange: (mode: 'strict' | 'adaptive' | 'free') => void;
}

export default function PrioritySettings({
  priorities,
  mode,
  onPrioritiesChange,
  onModeChange,
}: PrioritySettingsProps) {
  const updatePriority = (key: string, value: number) => {
    onPrioritiesChange({
      ...priorities,
      [key]: value,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Generation Priorities & Mode</h2>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Generation Mode</label>
        <div className="flex gap-4">
          {(['strict', 'adaptive', 'free'] as const).map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => onModeChange(m)}
                className="w-4 h-4"
              />
              <span className="capitalize">{m}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {mode === 'strict' && 'All constraints strictly enforced'}
          {mode === 'adaptive' && 'Constraints balanced with flexibility'}
          {mode === 'free' && 'Maximum flexibility, minimal constraints'}
        </p>
      </div>

      {/* Priority Sliders */}
      <div className="space-y-4">
        {Object.entries(priorities).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
              <span className="text-sm text-gray-600">{value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => updatePriority(key, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

