import React from 'react';

const GameLobby = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="grid grid-cols-2 h-screen">
        {/* Left side - Background story */}
        <div className="p-8 overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6">Background Story</h2>
          <div className="text-lg leading-relaxed space-y-4">
            <p>In the year 2045, memory has become a tradable commodity...</p>
            {/* Story content will scroll here */}
          </div>
        </div>
        
        {/* Right side - QR Code and Players */}
        <div className="bg-gray-800 p-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl mb-6">Scan to Join</h2>
          <div className="bg-white p-4 rounded-lg mb-6">
            {/* QR Code will be here */}
            <div className="w-64 h-64 bg-gray-200"></div>
          </div>
          <div className="text-xl">
            Players: <span className="font-bold">0 / 8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;