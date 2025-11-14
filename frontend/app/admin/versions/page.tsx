/**
 * Version History Page
 * 
 * Displays version history for all sections
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTimetableVersions } from '@/services/api';

export default function VersionsPage() {
  const [sectionId, setSectionId] = useState<string>('');

  const { data: versions, isLoading } = useQuery({
    queryKey: ['versions', sectionId],
    queryFn: () => getTimetableVersions(sectionId),
    enabled: !!sectionId,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Version History
          </h1>

          {/* Section Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section ID
            </label>
            <input
              type="text"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              placeholder="Enter section ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Versions List */}
          {isLoading ? (
            <div className="text-gray-600">Loading versions...</div>
          ) : versions ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Current Version: {versions.currentVersion}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Health
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.versions.map((version) => (
                      <tr key={version.version}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {version.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {version.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {version.healthScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(version.generatedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {version.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">
              Enter a section ID to view versions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

