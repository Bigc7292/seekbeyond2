
import React from 'react';

interface PromptInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  avatarLoading: boolean;
  avatarError: string | null;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  userInput,
  setUserInput,
  onGenerate,
  isLoading,
  avatarLoading,
  avatarError,
}) => {
  const isButtonDisabled = isLoading || avatarLoading || avatarError !== null || !userInput.trim();

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="prompt-input" className="text-lg font-semibold text-blue-200">
        1. Describe Your Video Scene
      </label>
      <textarea
        id="prompt-input"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="e.g., A 15-second video showcasing a luxury villa in Dubai Palm Jumeirah with narration..."
        className="w-full h-32 p-4 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-500"
        disabled={isLoading}
      />
      
      {avatarLoading && <p className="text-sm text-yellow-400">Loading company avatar...</p>}
      {avatarError && <p className="text-sm text-red-400">Error loading avatar: {avatarError}</p>}
      
      <button
        onClick={onGenerate}
        disabled={isButtonDisabled}
        className="w-full sm:w-auto self-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? 'Generating...' : '✨ Generate Video'}
      </button>
    </div>
  );
};
