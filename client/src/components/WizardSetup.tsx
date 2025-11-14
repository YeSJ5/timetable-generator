import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/http';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface WizardSetupProps {
  onComplete?: () => void;
}

type Step = 'teachers' | 'subjects' | 'rooms' | 'sections' | 'mappings' | 'labs' | 'complete';

export default function WizardSetup({ onComplete }: WizardSetupProps) {
  const [currentStep, setCurrentStep] = useState<Step>('teachers');
  const [csvData, setCsvData] = useState<string>('');

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return adminApi.uploadCSV(formData);
    },
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.data.imported} ${currentStep}`);
      if (data.data.errors) {
        toast.error(`Some errors occurred: ${data.data.errors.join(', ')}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to import: ${error.message}`);
    },
  });

  const steps: Step[] = ['teachers', 'subjects', 'rooms', 'sections', 'mappings', 'labs', 'complete'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      
      // Preview
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          console.log('CSV Preview:', results.data);
        },
      });
    };
    reader.readFile(file);
  };

  const handleUpload = () => {
    if (!csvData) {
      toast.error('Please select a CSV file');
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const file = new File([blob], `import-${currentStep}.csv`, { type: 'text/csv' });
    uploadMutation.mutate({ type: currentStep, file });
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await adminApi.getCSVTemplate(currentStep);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStep}-template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const getStepTitle = (step: Step): string => {
    const titles: Record<Step, string> = {
      teachers: 'Import Teachers',
      subjects: 'Import Subjects',
      rooms: 'Import Rooms',
      sections: 'Create Sections',
      mappings: 'Create Teacher-Subject Mappings',
      labs: 'Create Labs',
      complete: 'Setup Complete',
    };
    return titles[step];
  };

  const getStepDescription = (step: Step): string => {
    const descriptions: Record<Step, string> = {
      teachers: 'Upload a CSV file with teacher information (name, initials, preferredTime)',
      subjects: 'Upload a CSV file with subject information (code, name, hoursPerWeek)',
      rooms: 'Upload a CSV file with room information (name, type)',
      sections: 'Upload a CSV file with section names',
      mappings: 'Create mappings between teachers, subjects, and sections',
      labs: 'Create lab sessions with duration and room assignments',
      complete: 'Your timetable system is ready!',
    };
    return descriptions[step];
  };

  if (currentStep === 'complete') {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-4">Setup Complete!</h2>
        <p className="text-gray-600 mb-6">Your timetable system is ready to use.</p>
        <button
          onClick={() => {
            onComplete?.();
            setCurrentStep('teachers');
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Using Timetable Generator
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{getStepTitle(currentStep)}</h2>
          <span className="text-sm text-gray-500">
            Step {steps.indexOf(currentStep) + 1} of {steps.length - 1}
          </span>
        </div>
        <p className="text-gray-600">{getStepDescription(currentStep)}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          {steps.slice(0, -1).map((step, idx) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded ${
                steps.indexOf(currentStep) >= idx
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {csvData && (
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm text-gray-600 mb-2">CSV Preview (first 5 rows):</p>
            <pre className="text-xs overflow-x-auto">
              {csvData.split('\n').slice(0, 6).join('\n')}
            </pre>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Download Template
          </button>
          <button
            onClick={handleUpload}
            disabled={!csvData || uploadMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload & Import'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            const currentIdx = steps.indexOf(currentStep);
            if (currentIdx > 0) {
              setCurrentStep(steps[currentIdx - 1]);
              setCsvData('');
            }
          }}
          disabled={currentStep === 'teachers'}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => {
            const currentIdx = steps.indexOf(currentStep);
            if (currentIdx < steps.length - 2) {
              setCurrentStep(steps[currentIdx + 1]);
              setCsvData('');
            } else {
              setCurrentStep('complete');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {currentStep === 'labs' ? 'Complete Setup' : 'Next'}
        </button>
      </div>
    </div>
  );
}

