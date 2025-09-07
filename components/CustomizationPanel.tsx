
import React, { useState } from 'react';
import { Avatar, GenerationState, CustomizationOptions, AppStatus, AppPage } from '../types';
import { generateAvatarPortraits, generateFullBodyAvatar, enhanceText, enhanceImageRealism } from '../services/geminiService';
import { StatusDisplay } from './StatusDisplay';
import { Header } from './Header';
import { EnhancePromptButton } from './EnhancePromptButton';
import { Spinner } from './Spinner';

interface AvatarStudioProps {
  avatars: Avatar[];
  setAvatars: React.Dispatch<React.SetStateAction<Avatar[]>>;
  setPage: (page: AppPage) => void;
}

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ avatars, setAvatars, setPage }) => {
  const [step, setStep] = useState<'list' | 'create_portrait' | 'select_portrait' | 'create_body' | 'select_body'>('list');
  const [status, setStatus] = useState<AppStatus>({ state: GenerationState.IDLE, message: '' });
  const [error, setError] = useState<string | null>(null);
  
  // Text prompt enhancement state
  const [enhancingField, setEnhancingField] = useState<string | null>(null);

  // Image enhancement state
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [tentativelySelectedPortrait, setTentativelySelectedPortrait] = useState<string | null>(null);
  const [tentativelySelectedBody, setTentativelySelectedBody] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState('');

  // Image Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<string|null>(null);

  // Step 1: Portrait creation
  const [portraitOptions, setPortraitOptions] = useState<CustomizationOptions>({
    personDescription: 'A professional and confident woman, of Middle Eastern descent, in her late 20s',
    clothing: 'A professional blue business suit jacket',
    hairstyle: 'Long, dark hair in a professional bun',
  });
  const [generatedPortraits, setGeneratedPortraits] = useState<string[]>([]);
  
  // For transitioning between steps
  const [activeAvatar, setActiveAvatar] = useState<Avatar | null>(null);

  // Step 2: Body creation
  const [bodyOptions, setBodyOptions] = useState({ clothing: 'A full professional blue business suit with trousers', pose: 'Standing confidently, with a welcoming posture' });
  const [generatedBodies, setGeneratedBodies] = useState<string[]>([]);
  
  const handleEnhanceTextPrompt = async (
    fieldKey: string,
    currentValue: string,
    context: string,
    updateFunction: (newValue: string) => void
  ) => {
    if (!currentValue.trim()) return;
    setEnhancingField(fieldKey);
    setError(null);
    try {
        const enhancedText = await enhanceText(currentValue, context);
        updateFunction(enhancedText);
    } catch (e: any) {
        setError(`Failed to enhance field: ${e.message}`);
    } finally {
        setEnhancingField(null);
    }
  };

  const handleEnhanceImage = async (type: 'portrait' | 'body') => {
    const imageToEnhance = type === 'portrait' ? tentativelySelectedPortrait : tentativelySelectedBody;
    if (!imageToEnhance) return;

    setIsEnhancingImage(true);
    setError(null);
    try {
        const enhancedImage = await enhanceImageRealism(
            imageToEnhance,
            type === 'portrait' ? 'portrait' : 'full body'
        );
        if (type === 'portrait') {
            setTentativelySelectedPortrait(enhancedImage);
        } else {
            setTentativelySelectedBody(enhancedImage);
        }
    } catch (e: any) {
        setError(`Failed to enhance image: ${e.message}`);
    } finally {
        setIsEnhancingImage(false);
    }
  };


  const handleGeneratePortraits = async () => {
    setError(null);
    setStatus({ state: GenerationState.GENERATING_PORTRAITS, message: 'Generating ultra-realistic portrait shots...' });
    try {
      const portraits = await generateAvatarPortraits(portraitOptions);
      setGeneratedPortraits(portraits);
      setStatus({ state: GenerationState.IDLE, message: '' });
      setStep('select_portrait');
    } catch (e: any) {
      setError(`Failed to generate portraits: ${e.message}`);
      setStatus({ state: GenerationState.ERROR, message: 'Error during portrait generation.' });
    }
  };
  
  const handleSelectPortrait = (portraitBase64: string, name: string) => {
    const newAvatar: Avatar = {
      id: `avatar_${Date.now()}`,
      name: name,
      portraitBase64,
      fullBodyBase64: null,
      portraitPrompt: portraitOptions,
    };
    setActiveAvatar(newAvatar);
    setTentativelySelectedBody(null); // Reset for next step
    setStep('create_body');
  };

  const handleGenerateBody = async () => {
    if (!activeAvatar) return;
    setError(null);
    setStatus({ state: GenerationState.GENERATING_FULL_BODY, message: 'Generating full body avatar...' });
    try {
        const bodies = await generateFullBodyAvatar(activeAvatar, bodyOptions.clothing, bodyOptions.pose);
        setGeneratedBodies(bodies);
        setStatus({ state: GenerationState.IDLE, message: '' });
        setStep('select_body');
    } catch (e: any) {        
        setError(`Failed to generate full body: ${e.message}`);
        setStatus({ state: GenerationState.ERROR, message: 'Error during full body generation.' });
    }
  };
  
  const handleSelectBody = (bodyBase64: string) => {
    if (!activeAvatar) return;
    const finalAvatar: Avatar = {
      ...activeAvatar,
      fullBodyBase64: bodyBase64,
      bodyPrompt: bodyOptions,
    };
    setAvatars(prev => [...prev, finalAvatar]);
    setStep('list');
    setActiveAvatar(null);
  };

  const startNewAvatar = () => {
    setStep('create_portrait');
    setTentativelySelectedPortrait(null);
    setTentativelySelectedBody(null);
    setAvatarName('');
    setError(null);
    setStatus({ state: GenerationState.IDLE, message: '' });
  };

  const renderList = () => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <Header welcomeUser="Avatar Studio" />
            <button onClick={startNewAvatar} className="px-5 py-2.5 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300">
                Create New Avatar
            </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {avatars.map(avatar => (
                <div key={avatar.id} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
                    <img src={`data:image/jpeg;base64,${avatar.fullBodyBase64 || avatar.portraitBase64}`} alt={avatar.name} className="w-full h-48 object-cover rounded-md mb-2"/>
                    <p className="font-semibold text-gray-200">{avatar.name}</p>
                </div>
            ))}
        </div>
        {avatars.length === 0 && <p className="text-center text-gray-500 mt-8">No avatars created yet. Click "Create New Avatar" to start.</p>}
    </div>
  );

  const renderCreatePortrait = () => (
    <div className="max-w-3xl mx-auto">
        <Header welcomeUser="Step 1: Create Close-Up Portrait" />
        <p className="text-center text-gray-400 mb-6">Generate ultra-realistic close-up shots. Focus on facial features for hyper-realism. The AI will create several angles for you.</p>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div>
                <label htmlFor="personDescription" className="block text-sm font-medium text-gray-300 mb-1">Base Persona Description</label>
                <div className="relative">
                    <input type="text" id="personDescription" value={portraitOptions.personDescription} onChange={(e) => setPortraitOptions({...portraitOptions, personDescription: e.target.value})} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md pr-10" />
                    <EnhancePromptButton
                        isLoading={enhancingField === 'personDescription'}
                        onClick={() => handleEnhanceTextPrompt(
                            'personDescription',
                            portraitOptions.personDescription,
                            'A description of a brand ambassador persona.',
                            (newValue) => setPortraitOptions(prev => ({ ...prev, personDescription: newValue }))
                        )}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="clothing" className="block text-sm font-medium text-gray-300 mb-1">Clothing (Visible in Portrait)</label>
                 <div className="relative">
                    <input type="text" id="clothing" value={portraitOptions.clothing} onChange={(e) => setPortraitOptions({...portraitOptions, clothing: e.target.value})} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md pr-10" />
                    <EnhancePromptButton
                        isLoading={enhancingField === 'portrait_clothing'}
                        onClick={() => handleEnhanceTextPrompt(
                            'portrait_clothing',
                            portraitOptions.clothing,
                            'A description of professional clothing for a portrait.',
                            (newValue) => setPortraitOptions(prev => ({ ...prev, clothing: newValue }))
                        )}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="hairstyle" className="block text-sm font-medium text-gray-300 mb-1">Hairstyle</label>
                <div className="relative">
                    <input type="text" id="hairstyle" value={portraitOptions.hairstyle} onChange={(e) => setPortraitOptions({...portraitOptions, hairstyle: e.target.value})} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md pr-10" />
                    <EnhancePromptButton
                        isLoading={enhancingField === 'hairstyle'}
                        onClick={() => handleEnhanceTextPrompt(
                            'hairstyle',
                            portraitOptions.hairstyle,
                            'A description of a professional hairstyle.',
                            (newValue) => setPortraitOptions(prev => ({ ...prev, hairstyle: newValue }))
                        )}
                    />
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGeneratePortraits} disabled={status.state === GenerationState.GENERATING_PORTRAITS || enhancingField !== null} className="px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg disabled:opacity-50">
                    {status.state === GenerationState.GENERATING_PORTRAITS ? 'Generating...' : 'Generate Portraits'}
                </button>
            </div>
        </div>
        <StatusDisplay status={status} error={error} />
    </div>
  );
  
  const ImageSelectionGrid: React.FC<{
    images: string[];
    selectedImage: string | null;
    onSelect: (base64: string) => void;
    onZoom: (base64: string) => void;
    disabled?: boolean;
    aspectRatio?: 'square' | 'portrait';
  }> = ({ images, selectedImage, onSelect, onZoom, disabled, aspectRatio = 'square' }) => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full`}>
      {images.map((base64, index) => (
        <div
          key={index}
          onClick={() => !disabled && onSelect(base64)}
          className={`group relative rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selectedImage === base64 ? 'ring-4 ring-yellow-400' : 'ring-2 ring-gray-600'}`}
        >
          <img src={`data:image/jpeg;base64,${base64}`} alt={`Variation ${index + 1}`} className={`w-full h-full object-cover ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-[9/16]'}`} />
          {selectedImage === base64 && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>}
           <button 
             onClick={(e) => { e.stopPropagation(); onZoom(base64); }}
             className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full transition-opacity opacity-80 hover:opacity-100"
             title="Zoom In"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8zm6-3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H6a1 1 0 110-2h1V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      ))}
    </div>
  );
  
  const renderSelectPortrait = () => (
    <div className="max-w-5xl mx-auto">
      <Header welcomeUser="Select Your Favorite Portrait" />
      <p className="text-center text-gray-400 mb-6">Choose the portrait that best represents your brand ambassador. This face will be used for all future generations.</p>
      <ImageSelectionGrid
        images={generatedPortraits}
        selectedImage={tentativelySelectedPortrait}
        onSelect={setTentativelySelectedPortrait}
        onZoom={setZoomedImage}
        disabled={isEnhancingImage}
        aspectRatio="square"
      />
      {tentativelySelectedPortrait && (
        <div className="mt-6 p-6 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col items-center gap-4 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-200">Finalize Your Selection</h3>
            <div className="relative">
                <img src={`data:image/jpeg;base64,${tentativelySelectedPortrait}`} alt="Selected Portrait" className="w-48 h-48 object-cover rounded-lg shadow-lg"/>
                {isEnhancingImage && <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"><Spinner /> <p className="ml-2 text-white">Enhancing...</p></div>}
            </div>
            <div className="w-full max-w-sm space-y-4">
                 <div className="flex flex-col items-center gap-2">
                    <label htmlFor="avatarName" className="font-semibold text-blue-200">Name Your Avatar:</label>
                    <input type="text" id="avatarName" value={avatarName} onChange={e => setAvatarName(e.target.value)} placeholder="e.g., Agent Alex" className="p-2 bg-gray-900 border border-gray-600 rounded-md w-full text-center"/>
                </div>
                <button
                    onClick={() => handleEnhanceImage('portrait')}
                    disabled={isEnhancingImage}
                    className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 9.293a1 1 0 011.414 0l.001.001c.39.39.39 1.023 0 1.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293zM9 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM3.293 3.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L3.293 4.707a1 1 0 010-1.414zM15 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM2 9a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm11.707 3.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM4.707 13.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM12 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" /><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" /></svg>
                    Enhance Realism with AI
                </button>
                <button
                    onClick={() => handleSelectPortrait(tentativelySelectedPortrait, avatarName)}
                    disabled={isEnhancingImage || !avatarName.trim()}
                    className="w-full px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg disabled:opacity-50"
                >
                    Save and Continue
                </button>
            </div>
            {error && <p className="text-sm text-red-400 text-center mt-2">{error}</p>}
        </div>
      )}
    </div>
  );

  const renderCreateBody = () => (
    <div className="max-w-3xl mx-auto">
        <Header welcomeUser="Step 2: Customize the Full Body" />
        <p className="text-center text-gray-400 mb-6">Now, describe the full-body appearance. The AI will generate a complete avatar while keeping the face consistent.</p>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
                <p className="text-sm font-semibold text-center mb-2 text-gray-300">Selected Portrait</p>
                <img src={`data:image/jpeg;base64,${activeAvatar?.portraitBase64}`} alt="Selected Portrait" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"/>
                <p className="text-lg font-bold text-center mt-2">{activeAvatar?.name}</p>
            </div>
            <div className="space-y-4 flex-1">
                <div>
                    <label htmlFor="bodyClothing" className="block text-sm font-medium text-gray-300 mb-1">Full Body Clothing</label>
                    <div className="relative">
                        <input type="text" id="bodyClothing" value={bodyOptions.clothing} onChange={(e) => setBodyOptions({...bodyOptions, clothing: e.target.value})} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md pr-10" />
                        <EnhancePromptButton
                            isLoading={enhancingField === 'body_clothing'}
                            onClick={() => handleEnhanceTextPrompt(
                                'body_clothing',
                                bodyOptions.clothing,
                                'A description of a full professional outfit.',
                                (newValue) => setBodyOptions(prev => ({ ...prev, clothing: newValue }))
                            )}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="bodyPose" className="block text-sm font-medium text-gray-300 mb-1">Pose / Stance</label>
                    <div className="relative">
                        <input type="text" id="bodyPose" value={bodyOptions.pose} onChange={(e) => setBodyOptions({...bodyOptions, pose: e.target.value})} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md pr-10" />
                         <EnhancePromptButton
                            isLoading={enhancingField === 'body_pose'}
                            onClick={() => handleEnhanceTextPrompt(
                                'body_pose',
                                bodyOptions.pose,
                                'A description of a confident and professional pose.',
                                (newValue) => setBodyOptions(prev => ({ ...prev, pose: newValue }))
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-center pt-6">
            <button onClick={handleGenerateBody} disabled={status.state === GenerationState.GENERATING_FULL_BODY || enhancingField !== null} className="px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg disabled:opacity-50">
                {status.state === GenerationState.GENERATING_FULL_BODY ? 'Generating...' : 'Generate Full Body'}
            </button>
        </div>
        <StatusDisplay status={status} error={error} />
    </div>
  );

  const renderSelectBody = () => (
    <div className="max-w-5xl mx-auto">
      <Header welcomeUser="Select The Final Full-Body Avatar" />
      <p className="text-center text-gray-400 mb-6">Choose the best full-body version. This will be saved as the final avatar for use in videos.</p>
      <ImageSelectionGrid
        images={generatedBodies}
        selectedImage={tentativelySelectedBody}
        onSelect={setTentativelySelectedBody}
        onZoom={setZoomedImage}
        disabled={isEnhancingImage}
        aspectRatio="portrait"
      />
      {tentativelySelectedBody && (
        <div className="mt-6 p-6 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col items-center gap-4 animate-fade-in">
          <h3 className="text-xl font-bold text-blue-200">Finalize Your Selection</h3>
          <div className="relative">
            <img src={`data:image/jpeg;base64,${tentativelySelectedBody}`} alt="Selected full body" className="w-40 h-[284px] object-cover rounded-lg shadow-lg" />
            {isEnhancingImage && <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"><Spinner /> <p className="ml-2 text-white">Enhancing...</p></div>}
          </div>
          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => handleEnhanceImage('body')}
              disabled={isEnhancingImage}
              className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 9.293a1 1 0 011.414 0l.001.001c.39.39.39 1.023 0 1.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293zM9 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM3.293 3.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L3.293 4.707a1 1 0 010-1.414zM15 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM2 9a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm11.707 3.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM4.707 13.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM12 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" /><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" /></svg>
               Enhance Realism with AI
            </button>
            <button
              onClick={() => handleSelectBody(tentativelySelectedBody)}
              disabled={isEnhancingImage}
              className="w-full px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg disabled:opacity-50"
            >
              Finalize and Save Avatar
            </button>
          </div>
          {error && <p className="text-sm text-red-400 text-center mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
  
  const ZoomModal = () => {
    if (!zoomedImage) return null;
    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
        >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                 <img src={`data:image/jpeg;base64,${zoomedImage}`} alt="Zoomed View" className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg"/>
                 <button 
                    onClick={() => setZoomedImage(null)}
                    className="absolute -top-4 -right-4 bg-white text-black rounded-full p-1.5"
                    aria-label="Close zoom view"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'list': return renderList();
      case 'create_portrait': return renderCreatePortrait();
      case 'select_portrait': return renderSelectPortrait();
      case 'create_body': return renderCreateBody();
      case 'select_body': return renderSelectBody();
      default: return renderList();
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
      {renderContent()}
      <ZoomModal />
    </div>
  );
};
