
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { AvatarStudio } from './components/CustomizationPanel';
import { ProjectManager } from './components/ProjectSelectionPage';
import { VideoGenerator } from './components/VideoGenerator';
import { OnboardingModal } from './components/OnboardingModal';
import { GenerationState, AppStatus, AppPage, Project, Avatar, SavedVideo } from './types';
import { isApiKeySet } from './services/geminiService';

const LoginPage: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@') && password.length > 0) {
      setError('');
      onLogin(email);
    } else {
      setError('Please enter a valid email and password.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">
            Seek Beyond Realty
            </h1>
            <p className="mt-2 text-lg text-blue-200">AI-Powered Video Generator</p>
        </header>
        <main className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-blue-200 mb-6">Team Member Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white" required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white" required
                />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" className="w-full px-8 py-3 mt-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                Log In
            </button>
            </form>
        </main>
    </div>
  );
};

const ApiKeyErrorScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
    <div className="text-center bg-gray-800 p-8 rounded-lg border border-red-500 shadow-2xl max-w-2xl">
      <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <h1 className="text-3xl font-bold text-yellow-300 mt-4">Configuration Error</h1>
      <p className="mt-4 text-lg text-gray-200">The application cannot start because the AI model API key is missing.</p>
      <p className="mt-2 text-gray-300">Please ensure the <code className="bg-gray-700 p-1 rounded font-mono">API_KEY</code> environment variable is set correctly in your deployment configuration.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [apiKeyMissing] = useState(!isApiKeySet());
  const [page, setPage] = useState<AppPage>(AppPage.LOGIN);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [videos, setVideos] = useState<SavedVideo[]>([]);

  // Session state (not persisted)
  const [fileCache, setFileCache] = useState<Record<string, File[]>>({});
  const [videoToEdit, setVideoToEdit] = useState<SavedVideo | null>(null);


  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('sbr-projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      const savedAvatars = localStorage.getItem('sbr-avatars');
      if (savedAvatars) setAvatars(JSON.parse(savedAvatars));
      const savedVideos = localStorage.getItem('sbr-videos');
      if (savedVideos) setVideos(JSON.parse(savedVideos));

      const hasOnboarded = localStorage.getItem('sbr-hasOnboarded');
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
    } catch (error) { console.error("Failed to load data from localStorage", error); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sbr-projects', JSON.stringify(projects));
    } catch (error) { console.error("Failed to save projects", error); }
  }, [projects]);
  
  useEffect(() => {
    try {
      localStorage.setItem('sbr-avatars', JSON.stringify(avatars));
    } catch (error) { console.error("Failed to save avatars", error); }
  }, [avatars]);

  useEffect(() => {
    try {
      localStorage.setItem('sbr-videos', JSON.stringify(videos));
    } catch (error) { console.error("Failed to save videos", error); }
  }, [videos]);
  
  const handleLogin = (email: string) => {
    setUserEmail(email.split('@')[0]);
    setPage(AppPage.DASHBOARD);
  };
  
  const handleLogout = () => {
    setUserEmail('');
    setPage(AppPage.LOGIN);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('sbr-hasOnboarded', 'true');
    setShowOnboarding(false);
  };
  
  const handleVideoGenerated = (video: SavedVideo) => {
    setVideos(prevVideos => [video, ...prevVideos]);
    setVideoToEdit(null); // Clear editing state after generation
    setPage(AppPage.DASHBOARD); // Navigate to dashboard to see the video album
  };

  const renderPage = () => {
    switch (page) {
      case AppPage.DASHBOARD:
        return <DashboardHome projects={projects} avatars={avatars} videos={videos} setPage={setPage} setVideoToEdit={setVideoToEdit} />;
      case AppPage.AVATAR_STUDIO:
        return <AvatarStudio avatars={avatars} setAvatars={setAvatars} setPage={setPage} />;
      case AppPage.PROJECT_MANAGER:
        return <ProjectManager projects={projects} setProjects={setProjects} avatars={avatars} fileCache={fileCache} setFileCache={setFileCache} />;
      case AppPage.VIDEO_GENERATOR:
        return <VideoGenerator projects={projects} avatars={avatars} onVideoGenerated={handleVideoGenerated} fileCache={fileCache} videoToEdit={videoToEdit} setVideoToEdit={setVideoToEdit} />;
      case AppPage.PROFILE:
        return <div className="p-8"><h1 className="text-2xl font-bold text-blue-200">User Profile</h1><p className="text-gray-400 mt-2">This feature is coming soon.</p></div>;
      case AppPage.SETTINGS:
        return <div className="p-8"><h1 className="text-2xl font-bold text-blue-200">Settings</h1><p className="text-gray-400 mt-2">This feature is coming soon.</p></div>;
      default:
        return null;
    }
  };

  if (apiKeyMissing) {
    return <ApiKeyErrorScreen />;
  }

  if (page === AppPage.LOGIN) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
      {showOnboarding && <OnboardingModal onClose={handleOnboardingComplete} />}
      <Sidebar currentPage={page} setPage={setPage} onLogout={handleLogout} userEmail={userEmail}/>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
