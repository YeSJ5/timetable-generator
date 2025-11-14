/**
 * Debug Tools Page
 * 
 * Access to debugging and admin utilities
 */

'use client';

import Link from 'next/link';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Debug Tools
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Slot Search</h2>
              <p className="text-gray-600 mb-4">
                Search for slots by teacher, room, subject, or day
              </p>
              <div className="text-sm text-gray-500">
                Endpoint: GET /debug/slot-search
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Usage Map</h2>
              <p className="text-gray-600 mb-4">
                View teacher and room usage maps
              </p>
              <div className="text-sm text-gray-500">
                Endpoint: GET /debug/usage-map
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Lab Debug</h2>
              <p className="text-gray-600 mb-4">
                View lab placement information
              </p>
              <div className="text-sm text-gray-500">
                Endpoint: GET /debug/labs
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Performance</h2>
              <p className="text-gray-600 mb-4">
                View performance metrics
              </p>
              <div className="text-sm text-gray-500">
                Endpoint: GET /debug/performance
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

