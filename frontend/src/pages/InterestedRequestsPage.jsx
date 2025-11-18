import React from 'react';

export default function InterestedRequestsPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Interested Requests</h1>
        <p className="text-gray-600">Review adoption requests for your pets (placeholder)</p>
        <div className="mt-6">
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => onNavigate('home')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
;
