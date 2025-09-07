
import React from 'react';
import { Project, Avatar, AppPage, SavedVideo } from '../types';

interface DashboardHomeProps {
  projects: Project[];
  avatars: Avatar[];
  videos: SavedVideo[];
  setPage: (page: AppPage) => void;
  setVideoToEdit: (video: SavedVideo) => void;
}

const StatCard: React.FC<{ title: string; value: number; children: React.ReactNode }> = ({ title, value, children }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center gap-4">
    <div className="bg-blue-900 p-3 rounded-full">
      {children}
    </div>
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-gray-400">{title}</p>
    </div>
  </div>
);

const ActionButton: React.FC<{ title: string; description: string; onClick: () => void; children: React.ReactNode }> = ({ title, description, onClick, children }) => (
    <button onClick={onClick} className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-left hover:border-blue-500 hover:bg-gray-700/50 transition-colors w-full">
        <div className="flex items-center gap-4">
            <div className="text-blue-400">{children}</div>
            <div>
                <p className="font-semibold text-lg text-blue-200">{title}</p>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
        </div>
    </button>
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({ projects, avatars, videos, setPage, setVideoToEdit }) => {
  const handleEditVideo = (video: SavedVideo) => {
    setVideoToEdit(video);
    setPage(AppPage.VIDEO_GENERATOR);
  };
    
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's a summary of your workspace.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Saved Avatars" value={avatars.length}>
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </StatCard>
            <StatCard title="Active Projects" value={projects.length}>
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </StatCard>
            <StatCard title="Generated Videos" value={videos.length}>
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </StatCard>
        </div>

        {/* Quick Actions */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-4 max-w-2xl">
                <ActionButton title="Create a New Avatar" description="Start by designing a new hyper-realistic digital ambassador." onClick={() => setPage(AppPage.AVATAR_STUDIO)}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                </ActionButton>
                 <ActionButton title="Start a New Video" description="Select a project and avatar to generate a new promotional video." onClick={() => setPage(AppPage.VIDEO_GENERATOR)}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </ActionButton>
            </div>
        </div>

        {/* Recently Generated Videos */}
        {videos.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recently Generated Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => (
                        <div key={video.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                            <video src={video.videoUrl} controls loop className="w-full h-48 object-cover bg-black" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold text-white truncate" title={video.projectName}>Project: {video.projectName}</h3>
                                <p className="text-sm text-gray-400">Avatar: {video.avatarName}</p>
                                <p className="text-xs text-gray-500 mt-2">{new Date(video.createdAt).toLocaleString()}</p>
                                <div className="mt-auto pt-4">
                                    <button 
                                        onClick={() => handleEditVideo(video)}
                                        className="w-full text-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                                    >
                                        Edit & Regenerate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
