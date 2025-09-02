import React, { useState } from 'react';

const VotingPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Timer */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold">00:45</div>
          <p className="text-gray-400">Time Remaining</p>
        </div>

        {/* Event */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Memory Cloud Storage Launch</h2>
          <p className="text-gray-300">
            A large company announces a memory storage service...
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={() => setSelectedOption('A')}
            className={`w-full p-4 rounded-lg text-left transition ${
              selectedOption === 'A'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="font-bold mb-1">Option A</div>
            <div className="text-sm text-gray-300">Allow the service...</div>
          </button>

          <button
            onClick={() => setSelectedOption('B')}
            className={`w-full p-4 rounded-lg text-left transition ${
              selectedOption === 'B'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="font-bold mb-1">Option B</div>
            <div className="text-sm text-gray-300">Oppose the service...</div>
          </button>
        </div>

        {/* Submit */}
        <button
          disabled={!selectedOption}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Submit Vote
        </button>
      </div>
    </div>
  );
};

export default VotingPage;