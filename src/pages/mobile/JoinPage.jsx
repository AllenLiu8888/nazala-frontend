import React, { useState } from 'react';

const JoinPage = () => {
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col justify-center">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Join Game</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
            Join Game
          </button>
        </div>
        <p className="text-center mt-4 text-gray-400">
          Waiting for game to start...
        </p>
      </div>
    </div>
  );
};

export default JoinPage;