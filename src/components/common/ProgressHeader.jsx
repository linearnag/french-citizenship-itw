import React from 'react';

const ProgressHeader = ({ currentIndex, total, mode }) => {
  const percentage = ((currentIndex + 1) / total) * 100;
  const modeLabel = mode === 'learning' ? 'Apprentissage' : 'Quiz';
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">
          {mode === 'learning' ? 'Carte' : 'Question'} {currentIndex + 1} / {total}
        </h2>
        <div className="text-sm text-gray-600">
          Mode: {modeLabel}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            mode === 'learning' ? 'bg-blue-600' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressHeader;
