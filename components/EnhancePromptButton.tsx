import React from 'react';
import { Spinner } from './Spinner';

interface EnhancePromptButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

export const EnhancePromptButton: React.FC<EnhancePromptButtonProps> = ({ onClick, isLoading, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-yellow-400 ${className}`}
      title="Enhance with AI"
    >
      {isLoading ? (
        <div className="w-4 h-4">
          <Spinner />
        </div>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 9.293a1 1 0 011.414 0l.001.001c.39.39.39 1.023 0 1.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293zM9 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM3.293 3.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L3.293 4.707a1 1 0 010-1.414zM15 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM2 9a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm11.707 3.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM4.707 13.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM12 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
          <path d="M10 4a6 6 0 100 12 6 6 0 000-12zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" />
        </svg>
      )}
    </button>
  );
};
