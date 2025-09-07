import React, { useState, useCallback, useEffect } from 'react';
import { Project, Avatar, GenerationState, AppStatus, ImagePart, SavedVideo, DriveFileMeta } from '../types';
import { refinePrompt, generateVideo, pollVideoStatus, enhanceText } from '../services/geminiService';
import type { Operation, GenerateVideosResponse } from '@google/genai';
import { Header } from './Header';
import { StatusDisplay } from './StatusDisplay';
import { VideoPlayer } from './VideoPlayer';
import { EnhancePromptButton } from './EnhancePromptButton';
import { useGoogleDrive } from '../contexts/GoogleDriveContext';

interface VideoGeneratorProps {
  projects: Project[];
  avatars: Avatar[];
  onVideoGenerated: (video: SavedVideo) => void;
  fileCache: Record<string, File[]>;
  videoToEdit: SavedVideo | null;
  setVideoToEdit: (video: SavedVideo | null) => void;
}

const POLLING_INTERVAL = 10000;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ projects, avatars, onVideoGenerated, fileCache, videoToEdit, setVideoToEdit }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [musicMood, setMusicMood] = useState('');
  
  const [duration, setDuration] = useState('30');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [voiceStyle, setVoiceStyle] = useState('Professional');

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>({ state: GenerationState.IDLE, message: 'Ready.' });
  const [error, setError] = useState<string | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation<GenerateVideosResponse> | null>(null);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);

  const { fetchFileContent, isSignedIn } = useGoogleDrive();
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const linkedAvatar = avatars.find(a => a.id === activeProject?.linkedAvatarId);
  
  useEffect(() => {
    if (videoToEdit) {
      setSelectedProjectId(videoToEdit.projectId);
      setScript(videoToEdit.script);
      setMusicMood(videoToEdit.musicMood);
      setDuration(videoToEdit.duration);
      setAspectRatio(videoToEdit.aspectRatio);
      setVoiceStyle(videoToEdit.voiceStyle);
      setRefinedPrompt(videoToEdit.prompt);
      setStatus({ state: GenerationState.REFINED, message: 'Editing previous video. Review and generate.' });
      setVideoToEdit(null); // Clear after loading
    }
  }, [videoToEdit, setVideoToEdit]);

  const durationNum = parseInt(duration, 10);
  const isDurationValid = !isNaN(durationNum) && durationNum >= 5 && durationNum <= 60;

  const handleReset = useCallback(() => {
    setSelectedProjectId(null);
    setScript('');
    setMusicMood('');
    setDuration('30');
    setAspectRatio('16:9');
    setVoiceStyle('Professional');
    setVideoUrl(null);
    setStatus({ state: GenerationState.IDLE, message: 'Ready to generate.'});
    setError(null);
    setRefinedPrompt(null);
    setOperation(null);
  }, []);
  
  const handleEnhance = async (
    field: 'script' | 'musicMood',
    context: string
  ) => {
    let currentValue: string;
    let updateFunction: (newValue: string) => void;

    if (field === 'script') {
        currentValue = script;
        updateFunction = setScript;
    } else {
        currentValue = musicMood;
        updateFunction = setMusicMood;
    }

    if (!currentValue.trim()) return;

    setEnhancingField(field);
    setError(null);
    try {
        const enhanced = await enhanceText(currentValue, context);
        updateFunction(enhanced);
    } catch (e: any) {
        setError(`Failed to enhance ${field}: ${e.message}`);
    } finally {
        setEnhancingField(null);
    }
  };

  const processContext = async (projectFiles: File[], driveFiles: DriveFileMeta[]): Promise<{ contextText: string; contextImages: ImagePart[] }> => {
    let contextText = `Project Name: ${activeProject?.name}\nProject Description: ${activeProject?.description}\nProject URL: ${activeProject?.url}\n\n`;
    const contextImages: ImagePart[] = [];

    for (const file of projectFiles) {
        if (file.type.startsWith('image/')) {
            const base64Data = await fileToBase64(file);
            contextImages.push({ inlineData: { data: base64Data, mimeType: file.type } });
            contextText += `Reference to an uploaded image named "${file.name}".\n`;
        } else if (file.type === 'text/plain') {
            const text = await file.text();
            contextText += `Content from file "${file.name}":\n${text}\n\n`;
        } else {
            contextText += `Reference to a file (e.g. PDF, video): "${file.name}"\n`;
        }
    }

    if (isSignedIn && driveFiles.length > 0) {
        contextText += '\n--- Context from Google Drive ---\n';
        for (const driveFile of driveFiles) {
            const content = await fetchFileContent(driveFile.id, driveFile.mimeType, driveFile.name);
            contextText += content;
        }
    }

    return { contextText, contextImages };
  };

  const handleRefinePrompt = useCallback(async () => {
    if (!linkedAvatar?.fullBodyBase64 || !activeProject) {
      setError("A project with a linked, fully generated avatar must be selected."); return;
    }
    if (!isDurationValid) {
        setError("Please enter a valid duration between 5 and 60 seconds."); return;
    }

    setError(null);
    setRefinedPrompt(null);
    setStatus({ state: GenerationState.REFINING, message: 'Refining your prompt with AI...' });

    try {
      const projectFiles = fileCache[activeProject.id] || [];
      const driveFiles = activeProject.driveFilesMeta || [];
      const { contextText, contextImages } = await processContext(projectFiles, driveFiles);
      const fullScript = `Narration Script: ${script}`;
      const prompt = await refinePrompt(fullScript, musicMood, duration, aspectRatio, voiceStyle, contextText, contextImages);
      setRefinedPrompt(prompt);
      setStatus({ state: GenerationState.REFINED, message: 'Prompt refined. Review and generate.' });
    } catch (e: any) {
      setError(`Failed to refine prompt: ${e.message}`);
      setStatus({ state: GenerationState.ERROR, message: 'Error during prompt refinement.' });
    }
  }, [linkedAvatar, activeProject, fileCache, script, musicMood, duration, aspectRatio, voiceStyle, isDurationValid, isSignedIn, fetchFileContent]);

  const startVideoGeneration = useCallback(async () => {
    if (!refinedPrompt || !linkedAvatar?.fullBodyBase64 || !activeProject) {
      setError("Missing required information to start generation.");
      setStatus({ state: GenerationState.ERROR, message: "Missing info." });
      return;
    }

    setError(null);
    setStatus({ state: GenerationState.GENERATING, message: 'Sending request to video model...' });

    try {
      const startOperation = await generateVideo(refinedPrompt, linkedAvatar.fullBodyBase64);
      setOperation(startOperation);
      setStatus({ state: GenerationState.POLLING, message: 'Video generation in progress...' });

      const poll = async (op: Operation<GenerateVideosResponse>) => {
        try {
          const updatedOp = await pollVideoStatus(op);
          setOperation(updatedOp);
          if (updatedOp.done) {
            const videoUri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
            if (videoUri) {
              setStatus({ state: GenerationState.SUCCESS, message: 'Fetching video data...' });
              const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
              if (!response.ok) throw new Error(`Failed to fetch video file: ${response.statusText}`);
              const videoBlob = await response.blob();
              const blobUrl = URL.createObjectURL(videoBlob);

              const newVideo: SavedVideo = {
                id: `vid_${Date.now()}`, projectId: activeProject.id, projectName: activeProject.name,
                avatarName: linkedAvatar.name, videoUrl: blobUrl, prompt: refinedPrompt,
                script, musicMood, duration, aspectRatio, voiceStyle,
                createdAt: new Date().toISOString(),
              };
              onVideoGenerated(newVideo);
              setVideoUrl(blobUrl); 
              setStatus({ state: GenerationState.SUCCESS, message: 'Video generation complete!' });
            } else {
              throw new Error('Video generation finished, but no video URL was found.');
            }
          } else {
            setTimeout(() => poll(updatedOp), POLLING_INTERVAL);
          }
        } catch (e: any) {
           setError(`An error occurred during polling: ${e.message}`);
           setStatus({ state: GenerationState.ERROR, message: 'Failed to get video status.' });
        }
      };
      setTimeout(() => poll(startOperation), POLLING_INTERVAL);
    } catch (e: any) {
      setError(`Failed to start generation: ${e.message}`);
      setStatus({ state: GenerationState.ERROR, message: 'Generation failed to start.' });
    }
  }, [refinedPrompt, linkedAvatar, activeProject, onVideoGenerated, script, musicMood, duration, aspectRatio, voiceStyle]);

  const isFormDisabled = status.state === GenerationState.REFINING || status.state === GenerationState.GENERATING || status.state === GenerationState.POLLING || enhancingField !== null;
  const isRefineButtonDisabled = isFormDisabled || !selectedProjectId || !script.trim() || !linkedAvatar?.fullBodyBase64 || !isDurationValid;
  
  if (videoUrl && status.state === GenerationState.SUCCESS) {
    return <VideoPlayer videoUrl={videoUrl} onReset={handleReset} />;
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
        <Header welcomeUser="Video Generator" />
        <p className="text-center text-gray-400 mb-6">Create your video in two steps: first refine your script, then generate the final cut.</p>
        
        <div className={`transition-opacity duration-500 ${status.state === GenerationState.REFINED ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="max-w-3xl mx-auto space-y-6">
              <div>
                  <label htmlFor="project-select" className="block text-lg font-semibold text-blue-200 mb-2">1. Select a Project</label>
                  <select id="project-select" value={selectedProjectId || ''} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white" disabled={isFormDisabled}>
                      <option value="">{projects.length > 0 ? 'Choose a project...' : 'No projects available'}</option>
                      {projects.filter(p => p.linkedAvatarId && avatars.find(a => a.id === p.linkedAvatarId)?.fullBodyBase64).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Only projects with a finalized, full-body avatar are shown.</p>
              </div>
              
              {activeProject && linkedAvatar && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-wrap items-center gap-4">
                      <img src={`data:image/jpeg;base64,${linkedAvatar.fullBodyBase64}`} alt={linkedAvatar.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"/>
                      <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-200">Project: {activeProject.name}</h3>
                          <p className="text-sm text-gray-400">Using Avatar: {linkedAvatar.name}</p>
                      </div>
                      {(activeProject.contextFilesMeta.length > 0 || activeProject.driveFilesMeta.length > 0) && (
                        <div className="text-xs text-gray-400">
                            <p className="font-semibold">Context File(s):</p>
                            <ul className="list-disc list-inside">
                                {activeProject.contextFilesMeta.map(f => <li key={f.name} className="truncate" title={f.name}>{f.name}</li>)}
                                {activeProject.driveFilesMeta.map(f => <li key={f.id} className="truncate" title={f.name}>{f.name} (Drive)</li>)}
                            </ul>
                        </div>
                      )}
                  </div>
              )}
              
              <div>
                   <label htmlFor="script-input" className="block text-lg font-semibold text-blue-200 mb-2">2. Write the Video Script (Narration)</label>
                   <div className="relative">
                    <textarea id="script-input" value={script} onChange={(e) => setScript(e.target.value)} placeholder="e.g., Welcome to Binghatti Skyblade, where luxury meets innovation..." className="w-full h-32 p-4 bg-gray-900 border-2 border-gray-600 rounded-lg text-white pr-12" disabled={isFormDisabled} />
                     <EnhancePromptButton
                        isLoading={enhancingField === 'script'}
                        onClick={() => handleEnhance('script', 'The narration script for a luxury real estate promotional video.')}
                        className="top-3"
                    />
                   </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="music-mood" className="block text-lg font-semibold text-blue-200 mb-2">3. Background Music Mood</label>
                      <div className="relative">
                        <input type="text" id="music-mood" value={musicMood} onChange={(e) => setMusicMood(e.target.value)} placeholder="e.g., Upbeat and motivational" className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white pr-12" disabled={isFormDisabled}/>
                        <EnhancePromptButton
                            isLoading={enhancingField === 'musicMood'}
                            onClick={() => handleEnhance('musicMood', 'A description of the mood for background music in a promotional video.')}
                        />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="voice-style" className="block text-lg font-semibold text-blue-200 mb-2">4. Avatar Voice Style</label>
                      <select id="voice-style" value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white" disabled={isFormDisabled}>
                          <option>Professional</option>
                          <option>Friendly</option>
                          <option>Energetic</option>
                          <option>Calm</option>
                      </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="duration" className="block text-lg font-semibold text-blue-200 mb-2">5. Video Duration (sec)</label>
                      <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} min="5" max="60" placeholder="e.g., 30" className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white" disabled={isFormDisabled}/>
                  </div>
                   <div>
                      <label htmlFor="aspect-ratio" className="block text-lg font-semibold text-blue-200 mb-2">6. Aspect Ratio</label>
                      <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white" disabled={isFormDisabled}>
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Portrait)</option>
                          <option value="1:1">1:1 (Square)</option>
                      </select>
                  </div>
              </div>
              
              <div className="text-center pt-4">
                   <button onClick={handleRefinePrompt} disabled={isRefineButtonDisabled} className="px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg disabled:opacity-50 transform hover:scale-105 transition-transform">
                      {status.state === GenerationState.REFINING ? 'Refining...' : '✨ Step 1: Refine Prompt'}
                  </button>
              </div>
          </div>
        </div>

        {status.state === GenerationState.REFINED && refinedPrompt && (
          <div className="mt-8 max-w-3xl mx-auto space-y-4 p-6 bg-gray-900/50 rounded-lg border-2 border-blue-500 shadow-lg animate-fade-in">
              <h2 className="text-xl font-bold text-blue-200">Step 2: Review and Generate</h2>
              <p className="text-gray-400 text-sm">The AI has improved your prompt for cinematic results. You can make final edits below before generating the video.</p>
              <textarea 
                  value={refinedPrompt} 
                  onChange={(e) => setRefinedPrompt(e.target.value)} 
                  className="w-full h-48 p-4 bg-gray-900 border-2 border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button 
                      onClick={startVideoGeneration} 
                      disabled={!refinedPrompt.trim() || isFormDisabled} 
                      className="flex-1 px-6 py-3 font-bold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg shadow-lg disabled:opacity-50 hover:from-yellow-700 hover:to-yellow-600 transform hover:scale-105 transition-all">
                      🚀 Generate Video
                  </button>
                  <button 
                      onClick={() => {
                          setStatus({ state: GenerationState.IDLE, message: 'Ready.' });
                          setRefinedPrompt(null);
                      }} 
                      disabled={isFormDisabled}
                      className="flex-1 px-6 py-3 font-bold bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
                      Back to Edit Details
                  </button>
              </div>
          </div>
        )}

        <StatusDisplay status={status} error={error} />
    </div>
  );
};
