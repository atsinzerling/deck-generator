import React from 'react';

const WordPairPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
      <div className="text-2xl font-medium text-center">
        Generated word pairs will appear here
      </div>
      <div className="text-sm text-gray-500 text-center max-w-md">
        Fill in the form and click Generate to create your custom language learning deck
      </div>
    </div>
  );
};

export default WordPairPlaceholder; 