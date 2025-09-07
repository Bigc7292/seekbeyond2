
import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onReset: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onReset }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">
        Your Video is Ready!
      </h2>
      <div className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-blue-500">
        <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover bg-black" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <a
          href={videoUrl}
          download="seek-beyond-realty-video.mp4"
          className="flex-1 text-center px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg shadow-lg hover:from-yellow-700 hover:to-yellow-600 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Download Video
        </a>
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 text-lg font-bold text-blue-200 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition-colors"
        >
          Generate Another
        </button>
      </div>
    </div>
  );
};
