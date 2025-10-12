import React from 'react';

const LoadingOverlay = ({ text = 'Generating...', small = false }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-cyan-300">
        <div className={small ? 'w-12 h-12' : 'w-16 h-16'}>
          <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div className="font-pixel text-2xl">{text}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;


