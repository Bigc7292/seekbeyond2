
import React from 'react';
import { GenerationState, AppStatus } from '../types';
import { Spinner } from './Spinner';

interface StatusDisplayProps {
  status: AppStatus;
  error: string | null;
}

const POLLING_MESSAGES = [
  "Warming up the AI director...",
  "The digital avatar is getting ready for their close-up...",
  "Rendering the Dubai skyline...",
  "Adding a touch of cinematic magic...",
  "Finalizing the video scenes...",
  "Polishing the golden and blue hues..."
];

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, error }) => {
  const [pollingMessage, setPollingMessage] = React.useState(POLLING_MESSAGES[0]);

  React.useEffect(() => {
    if (status.state === GenerationState.POLLING) {
      const interval = setInterval(() => {
        setPollingMessage(prev => {
          const currentIndex = POLLING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % POLLING_MESSAGES.length;
          return POLLING_MESSAGES[nextIndex];
        });
      }, 4000); // Change message every 4 seconds
      return () => clearInterval(interval);
    }
  }, [status.state]);
  
  const showStatus = status.state !== GenerationState.IDLE 
                    && status.state !== GenerationState.REFINED
                    && status.state !== GenerationState.SUCCESS;

  if (!showStatus) return null;

  const showSpinner = status.state === GenerationState.REFINING || 
                      status.state === GenerationState.GENERATING || 
                      status.state === GenerationState.POLLING ||
                      status.state === GenerationState.GENERATING_PORTRAITS ||
                      status.state === GenerationState.GENERATING_FULL_BODY;

  return (
    <div className="mt-8 p-6 bg-gray-900 bg-opacity-70 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-blue-200 mb-4">Generation Status</h2>
      <div className="flex items-center gap-4">
        {showSpinner && <Spinner />}
        <p className="text-gray-300">
          {status.state === GenerationState.POLLING ? pollingMessage : status.message}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          <p className="font-bold">An Error Occurred</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};