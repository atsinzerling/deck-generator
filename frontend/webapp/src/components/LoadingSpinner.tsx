import React from 'react';
// import { Spinner } from 'shadcn-ui';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      {/* <Spinner /> */}
	  <div className="w-10 h-10 border-4 border-t-4 border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner; 