
import React, { useState, useEffect } from 'react';
import { Project, Avatar, ProjectContextFileMeta, DriveFileMeta } from '../types';
import { Header } from './Header';
import { enhanceText } from '../services/geminiService';
import { EnhancePromptButton } from './EnhancePromptButton';
import { useGoogleDrive } from '../contexts/GoogleDriveContext';

// Helper functions for file persistence (unchanged)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
    var arr = dataurl.split(','), 
        mimeMatch = arr[0].match(/:(.*?);/),
        mime = mimeMatch ? mimeMatch[1] : '',
        bstr = atob(arr[arr.length - 1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
};

interface StoredFile {
  name: string;
  type: string;
  data: string; // data URL
}

const saveFilesToLocalStorage = async (projectId: string, files: File[]) => {
  try {
    if (files.length === 0) {
      localStorage.removeItem(`sbr-filecache-${projectId}`);
      return;
    }
    const storableFiles: StoredFile[] = await Promise.all(
      files.map(async file => ({
        name: file.name,
        type: file.type,
        data: await fileToBase64(file),
      }))
    );
    localStorage.setItem(`sbr-filecache-${projectId}`, JSON.stringify(storableFiles));
  } catch (error) {
    console.error(`Failed to save files for project ${projectId}`, error);
    alert('Failed to save files. Local storage might be full.');
  }
};

const loadFilesFromLocalStorage = (projectId: string): File[] => {
  try {
    const storedData = localStorage.getItem(`sbr-filecache-${projectId}`);
    if (!storedData) return [];
    const storedFiles: StoredFile[] = JSON.parse(storedData);
    return storedFiles.map(sf => dataURLtoFile(sf.data, sf.name));
  } catch (error) {
    console.error(`Failed to load files for project ${projectId}`, error);
    return [];
  }
};

const deleteFilesFromLocalStorage = (projectId: string) => {
    try {
        localStorage.removeItem(`sbr-filecache-${projectId}`);
    } catch (error) {
        console.error(`Failed to delete files for project ${projectId}`, error);
    }
};

const GoogleDriveManager: React.FC = () => {
    const { isSignedIn, signIn, signOut, isApiLoaded, isConfigured } = useGoogleDrive();

    if (!isConfigured) {
        return (
            <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-sm text-yellow-400">
                    Google Drive integration is not configured.
                </p>
                 <p className="text-xs text-gray-500 mt-1">
                    To enable it, provide a valid `GOOGLE_CLIENT_ID` in your environment.
                </p>
            </div>
        );
    }

    if (!isApiLoaded) {
        return <p className="text-sm text-gray-400 text-center">Loading Google Drive integration...</p>;
    }
    
    return (
        <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
            {isSignedIn ? (
                <div className="flex items-center justify-center gap-4">
                    <p className="text-green-400 font-semibold">✓ Connected to Google Drive</p>
                    <button onClick={signOut} className="text-sm text-red-400 hover:underline">Sign Out</button>
                </div>
            ) : (
                <button onClick={signIn} className="px-4 py-2 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    Connect to Google Drive
                </button>
            )}
        </div>
    );
};


interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  avatars: Avatar[];
  fileCache: Record<string, File[]>;
  setFileCache: React.Dispatch<React.SetStateAction<Record<string, File[]>>>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, avatars, fileCache, setFileCache }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [linkedAvatarId, setLinkedAvatarId] = useState<string | null>(null);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentDriveFiles, setCurrentDriveFiles] = useState<DriveFileMeta[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const { isSignedIn, openPicker, isApiLoaded } = useGoogleDrive();

  useEffect(() => {
    const projectsToLoad = projects.filter(p => fileCache[p.id] === undefined);
    if (projectsToLoad.length > 0) {
        const newCacheEntries: Record<string, File[]> = {};
        projectsToLoad.forEach(p => {
            newCacheEntries[p.id] = loadFilesFromLocalStorage(p.id);
        });
        setFileCache(prev => ({ ...prev, ...newCacheEntries }));
    }
  }, [projects, fileCache, setFileCache]);

  const clearForm = () => {
    setName('');
    setDescription('');
    setUrl('');
    setLinkedAvatarId(null);
    setCurrentFiles([]);
    setCurrentDriveFiles([]);
    setEditingProject(null);
    setError('');
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description);
    setUrl(project.url);
    setLinkedAvatarId(project.linkedAvatarId);
    setCurrentFiles(fileCache[project.id] || []);
    setCurrentDriveFiles(project.driveFilesMeta || []);
  };
  
  const handleDeleteClick = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This will also delete its saved files.")) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setFileCache(prev => {
            const newCache = {...prev};
            delete newCache[projectId];
            return newCache;
        });
        deleteFilesFromLocalStorage(projectId);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim()) return;
    setIsEnhancing(true);
    setError('');
    try {
        const enhanced = await enhanceText(description, "A compelling and detailed description of a luxury real estate project.");
        setDescription(enhanced);
    } catch (e: any) {
        setError(`Failed to enhance description: ${e.message}`);
    } finally {
        setIsEnhancing(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setCurrentFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setCurrentFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleDrivePicker = () => {
    openPicker((docs) => {
        setCurrentDriveFiles(prev => {
            const newFiles = docs.filter(doc => !prev.some(f => f.id === doc.id));
            return [...prev, ...newFiles];
        });
    });
  };

  const handleRemoveDriveFile = (fileId: string) => {
    setCurrentDriveFiles(prev => prev.filter(f => f.id !== fileId));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    
    const filesMeta: ProjectContextFileMeta[] = currentFiles.map(f => ({ name: f.name, type: f.type, size: f.size }));

    if (editingProject) {
      const updatedProject = { ...editingProject, name, description, url, linkedAvatarId, contextFilesMeta: filesMeta, driveFilesMeta: currentDriveFiles };
      setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
      setFileCache(prev => ({ ...prev, [editingProject.id]: currentFiles }));
      await saveFilesToLocalStorage(editingProject.id, currentFiles);
    } else {
      const projectId = `proj_${Date.now()}`;
      const newProject: Project = {
        id: projectId, name, description, url,
        contextFilesMeta: filesMeta,
        driveFilesMeta: currentDriveFiles,
        linkedAvatarId,
      };
      setProjects(prev => [...prev, newProject]);
      setFileCache(prev => ({ ...prev, [projectId]: currentFiles }));
      await saveFilesToLocalStorage(projectId, currentFiles);
    }
    clearForm();
  };
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
      <Header welcomeUser="Project Manager" />
       <div className="max-w-md mx-auto my-6">
          <GoogleDriveManager />
       </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-200 mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
             <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-1">Project Name*</label>
                <input type="text" id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Binghatti Skyblade" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-white" required/>
             </div>
             <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-1">Project Description</label>
                <div className="relative">
                  <textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed info about the property..." className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md text-white pr-10" />
                  <EnhancePromptButton isLoading={isEnhancing} onClick={handleEnhanceDescription} className="top-2 right-2"/>
                </div>
             </div>
             <div>
                <label htmlFor="project-url" className="block text-sm font-medium text-gray-300 mb-1">Property URL</label>
                <input type="url" id="project-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/property" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-white"/>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Context Files</label>
                <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="context-files" className="w-full text-center p-2 rounded-md font-semibold bg-blue-800 text-blue-100 hover:bg-blue-700 cursor-pointer">Upload Local Files</label>
                    <input type="file" id="context-files" multiple onChange={handleFileChange} accept="image/*,video/mp4,application/pdf,.txt" className="hidden"/>
                    <button type="button" onClick={handleDrivePicker} disabled={!isSignedIn || !isApiLoaded} className="w-full p-2 rounded-md font-semibold bg-yellow-600 text-white hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed">Select from Drive</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Local files are saved in your browser's storage.</p>
                {currentFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {currentFiles.map(file => (
                            <div key={file.name} className="flex justify-between items-center bg-gray-800 p-1 px-2 rounded-md text-xs">
                                <span className="text-gray-300 truncate" title={file.name}>{file.name}</span>
                                <button type="button" onClick={() => handleRemoveFile(file.name)} className="text-red-400 hover:text-red-300">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
                {currentDriveFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {currentDriveFiles.map(file => (
                           <div key={file.id} className="flex justify-between items-center bg-gray-800 p-1 px-2 rounded-md text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <img src={file.iconLink} alt="file icon" className="w-4 h-4 flex-shrink-0"/>
                                    <span className="text-gray-300 truncate" title={file.name}>{file.name}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveDriveFile(file.id)} className="text-red-400 hover:text-red-300">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
             <div>
                <label htmlFor="avatar-link" className="block text-sm font-medium text-gray-300 mb-1">Link Avatar</label>
                <select id="avatar-link" value={linkedAvatarId || ''} onChange={(e) => setLinkedAvatarId(e.target.value || null)} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-white" disabled={avatars.length === 0}>
                    <option value="">{avatars.length > 0 ? 'Select an avatar...' : 'No avatars available'}</option>
                    {avatars.map(avatar => <option key={avatar.id} value={avatar.id}>{avatar.name}</option>)}
                </select>
             </div>
             {error && <p className="text-sm text-red-400 text-center">{error}</p>}
             <div className="flex gap-4 mt-4">
                <button type="submit" className="flex-1 px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg" disabled={isEnhancing}>
                    {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
                {editingProject && <button type="button" onClick={clearForm} className="px-6 py-3 font-bold bg-gray-600 text-gray-200 rounded-lg">Cancel</button>}
             </div>
          </form>
        </div>
        <div>
           <h2 className="text-2xl font-bold text-blue-200 mb-4">Existing Projects</h2>
           {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-2">
              {projects.map(p => {
                  const linkedAvatar = avatars.find(a => a.id === p.linkedAvatarId);
                  const totalFiles = (p.contextFilesMeta?.length || 0) + (p.driveFilesMeta?.length || 0);
                  return (
                    <div key={p.id} className="p-4 rounded-lg bg-gray-900 border border-gray-700 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-white text-lg">{p.name}</h3>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleEditClick(p)} className="p-1 text-gray-400 hover:text-yellow-400" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg></button>
                                    <button onClick={() => handleDeleteClick(p.id)} className="p-1 text-gray-400 hover:text-red-400" title="Delete"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2" title={p.description}>{p.description || 'No description provided.'}</p>
                        </div>
                        <div className="mt-auto pt-3">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <img src={linkedAvatar?.portraitBase64 ? `data:image/jpeg;base64,${linkedAvatar.portraitBase64}` : 'https://i.pravatar.cc/32'} alt={linkedAvatar?.name || 'Unlinked'} className="w-8 h-8 rounded-full object-cover"/>
                                    <span>{linkedAvatar?.name || 'No Avatar'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span>{totalFiles} file(s)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
              })}
            </div>
           ) : (
            <p className="text-center text-gray-500 mt-8">No projects created yet. Use the form to get started.</p>
           )}
        </div>
      </div>
    </div>
  );
};