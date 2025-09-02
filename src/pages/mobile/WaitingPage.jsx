import React from 'react';

const WaitingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Vote Submitted!</h2>
        <p className="text-gray-400">Waiting for other players...</p>
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Players voted</p>
          <p className="text-2xl font-bold">3/8</p>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;