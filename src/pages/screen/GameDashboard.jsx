import React from 'react';

const GameDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="grid grid-cols-12 gap-6 h-screen">
        {/* Left - Current Event */}
        <div className="col-span-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Current World Event</h2>
          <div className="space-y-4">
            <h3 className="text-xl">Memory Cloud Storage Launch</h3>
            <p className="text-gray-300">Event description here...</p>
          </div>
        </div>
        
        {/* Right - Data Visualization */}
        <div className="col-span-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">World Status</h2>
          {/* Radar chart will go here */}
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
        
        {/* Bottom - Player Status and Progress */}
        <div className="col-span-12 bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-400">Players Voted:</span>
              <span className="ml-2 font-bold">0/8</span>
            </div>
            <div>
              <span className="text-sm text-gray-400">Round:</span>
              <span className="ml-2 font-bold">1/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;