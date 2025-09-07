
import React from 'react';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 max-w-2xl w-full transform transition-all animate-fade-in-up">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400 mb-4">
          Welcome to the AI Video Suite!
        </h2>
        <p className="text-gray-300 mb-6">Here's a quick guide to creating ultra-realistic videos:</p>
        
        <div className="space-y-4 text-gray-400">
            <div className="flex gap-4 items-start">
                <div className="bg-blue-800 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">1</div>
                <div>
                    <h3 className="font-semibold text-blue-200">Create Your Avatar</h3>
                    <p>Go to the <span className="font-bold">Avatar Studio</span>. First, generate hyper-realistic close-up portraits. Then, customize and generate the full body for a consistent look.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="bg-blue-800 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">2</div>
                <div>
                    <h3 className="font-semibold text-blue-200">Manage Your Project</h3>
                    <p>In the <span className="font-bold">Project Manager</span>, create a new project for your property and link your newly created avatar to it. This provides context for the video.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="bg-blue-800 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">3</div>
                <div>
                    <h3 className="font-semibold text-blue-200">Generate Your Video</h3>
                    <p>Finally, head to the <span className="font-bold">Video Generator</span>. Select your project, write the script, and let the AI create a stunning video with your avatar, complete with audio and lip-sync.</p>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600"
            >
                Let's Get Started
            </button>
        </div>
      </div>
    </div>
  );
};
