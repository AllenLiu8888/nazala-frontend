import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-4">Memory Trading & Editing</h1>
      <p className="text-xl text-gray-300 mb-8">An Interactive Art Installation</p>
      <div className="animate-pulse">
        <p className="text-lg">Press any key to start</p>
      </div>
    </div>
  );
};

export default HomePage;