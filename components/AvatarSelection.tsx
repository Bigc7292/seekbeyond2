import React, { useState } from 'react';

interface AvatarSelectionProps {
  avatars: string[];
  onSaveAndContinue: (avatarBase64: string) => void;
}

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  avatars,
  onSaveAndContinue,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-blue-200">
        Choose Your Influencer
      </h2>
      <p className="text-gray-400">Select one of the AI-generated avatars to be the face of your video.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {avatars.map((base64, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedAvatar(base64)}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105 ${selectedAvatar === base64 ? 'ring-4 ring-yellow-400 shadow-lg' : 'ring-2 ring-gray-600 hover:ring-blue-400'}`}
            role="button"
            aria-pressed={selectedAvatar === base64}
            aria-label={`Select avatar variation ${index + 1}`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedAvatar(base64)}
          >
            <img 
              src={`data:image/jpeg;base64,${base64}`} 
              alt={`Avatar Variation ${index + 1}`}
              className="w-full h-full object-cover aspect-square"
            />
            {selectedAvatar === base64 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" aria-hidden="true">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => selectedAvatar && onSaveAndContinue(selectedAvatar)}
        disabled={!selectedAvatar}
        className="w-full sm:w-auto self-center px-8 py-3 mt-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        Save Avatar & Continue
      </button>
    </div>
  );
};