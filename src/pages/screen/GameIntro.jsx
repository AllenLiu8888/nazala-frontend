import React from 'react';

const GameIntro = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">The Memory Era Begins</h1>
        <div className="text-lg leading-relaxed space-y-4 auto-scroll">
          <p>Welcome to a world where memories can be edited, traded, and shared...</p>
          <p>Your collective decisions will shape the future of humanity.</p>
          <p>Each choice affects six core attributes of our world.</p>
          <p>Choose wisely. The future depends on you.</p>
        </div>
      </div>
    </div>
  );
};

export default GameIntro;