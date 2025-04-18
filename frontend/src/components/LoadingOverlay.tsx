import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <FaSpinner className="animate-spin text-white text-4xl" />
    </div>
  );
};

export default LoadingOverlay;