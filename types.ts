
export enum GenerationState {
  IDLE,
  // Avatar states
  GENERATING_PORTRAITS,
  GENERATING_FULL_BODY,
  // Video states
  REFINING,
  REFINED,
  GENERATING,
  POLLING,
  SUCCESS,
  ERROR,
}

export interface AppStatus {
  state: GenerationState;
  message: string;
}

export interface CustomizationOptions {
  clothing: string;
  hairstyle: string;
  personDescription: string;
}

export enum AppPage {
  LOGIN,
  DASHBOARD,
  AVATAR_STUDIO,
  PROJECT_MANAGER,
  VIDEO_GENERATOR,
  PROFILE,
  SETTINGS,
}

export interface Avatar {
  id: string;
  name: string;
  portraitBase64: string;
  fullBodyBase64: string | null;
  portraitPrompt: CustomizationOptions;
  bodyPrompt?: {
    clothing: string;
    pose: string;
  };
}


export interface ProjectContextFileMeta {
    name: string;
    type: string;
    size: number;
}

export interface DriveFileMeta {
    id: string;
    name: string;
    mimeType: string;
    iconLink: string;
}

export interface Project {
  id:string;
  name: string;
  description: string;
  url: string;
  contextFilesMeta: ProjectContextFileMeta[];
  driveFilesMeta: DriveFileMeta[];
  linkedAvatarId: string | null;
}

export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface SavedVideo {
  id: string;
  projectId: string;
  projectName: string;
  avatarName: string;
  videoUrl: string; // Blob URL
  prompt: string; // The final, refined prompt
  script: string;
  musicMood: string;
  duration: string;
  aspectRatio: string;
  voiceStyle: string;
  createdAt: string;
}