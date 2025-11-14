/**
 * Home Dashboard
 * 
 * Main landing page with overview and quick actions
 */

import Link from 'next/link';
import { getHealth } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI Timetable Generator
            </h1>
            <p className="text-xl text-gray-600">
              Enterprise-grade timetable generation system
            </p>
          </div>

          {/* Health Status */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">System Status</h2>
            {isLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : health ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      health.status === 'ok'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {health.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="text-gray-900 font-medium">
                    {health.uptime.formatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="text-gray-900 font-medium">
                    {health.environment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Memory:</span>
                  <span className="text-gray-900 font-medium">
                    {health.memory.heapUsed} / {health.memory.heapTotal}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-red-600">Unable to connect to API</div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/timetable"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                View Timetables
              </h3>
              <p className="text-gray-600">
                Browse and manage timetable schedules
              </p>
            </Link>

            <Link
              href="/admin/versions"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Version History
              </h3>
              <p className="text-gray-600">
                View and compare timetable versions
              </p>
            </Link>

            <Link
              href="/debug"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Debug Tools
              </h3>
              <p className="text-gray-600">
                Access debugging and admin utilities
              </p>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Generate Timetable
              </h3>
              <p className="text-gray-600">
                Create new timetable schedules
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

