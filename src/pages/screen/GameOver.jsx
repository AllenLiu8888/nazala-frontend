import React from 'react';

const GameOver = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold mb-8">GAME OVER</h1>
      <div className="max-w-2xl text-center">
        <h2 className="text-2xl mb-6">The Future You Created</h2>
        <p className="text-lg text-gray-300 mb-8">
          Your collective decisions have shaped a world where...
        </p>
        {/* Final world visualization */}
        <div className="bg-gray-800 rounded-lg p-6 h-64">
          {/* Final radar chart will go here */}
        </div>
      </div>
    </div>
  );
};

export default GameOver;