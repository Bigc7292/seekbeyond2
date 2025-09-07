import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { DriveFileMeta } from '../types';

// In a real app, these would be in a .env file.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = process.env.API_KEY;

// Scopes for the Google Drive API. Read-only is sufficient and safer.
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
  }
}

interface GoogleDriveContextType {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  openPicker: (callback: (docs: DriveFileMeta[]) => void) => void;
  fetchFileContent: (fileId: string, mimeType: string, name: string) => Promise<string>;
  isApiLoaded: boolean;
  isConfigured: boolean;
}

export const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    if (API_KEY && CLIENT_ID && CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      setIsConfigured(true);
    }
  }, []);

  const gapiLoaded = useCallback(() => {
    window.gapi.load('client:picker', () => {
        window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        }).then(() => {
            setIsGapiLoaded(true);
        });
    });
  }, []);

  const gsiLoaded = useCallback(() => {
    window.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp: any) => {
            if (resp.error !== undefined) {
                console.error(resp);
                return;
            }
            window.gapi.client.setToken({ access_token: resp.access_token });
            setIsSignedIn(true);
        },
    });
    setIsGsiLoaded(true);
  }, []);

  useEffect(() => {
    if (!isConfigured || scriptsLoadedRef.current) return;
    
    scriptsLoadedRef.current = true;

    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.onload = () => gapiLoaded();
    document.body.appendChild(gapiScript);

    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.onload = () => gsiLoaded();
    document.body.appendChild(gsiScript);
  }, [isConfigured, gapiLoaded, gsiLoaded]);
  
  const isApiLoaded = isConfigured && isGapiLoaded && isGsiLoaded;

  const signIn = () => {
    if (window.tokenClient) {
        window.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  };

  const signOut = () => {
    const token = window.gapi.client.getToken();
    if (token) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {});
        window.gapi.client.setToken(null);
        setIsSignedIn(false);
    }
  };

  const openPicker = (callback: (docs: DriveFileMeta[]) => void) => {
    const token = window.gapi.client.getToken();
    if (!token) {
        console.error("Not signed in, cannot open picker.");
        signIn();
        return;
    }
    
    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

    const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(CLIENT_ID.split('-')[0])
        .setOAuthToken(token.access_token)
        .addView(docsView)
        .setDeveloperKey(API_KEY!)
        .setCallback((data: any) => {
            if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const docs: DriveFileMeta[] = data[window.google.picker.Response.DOCUMENTS].map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    mimeType: doc.mimeType,
                    iconLink: doc.iconUrl,
                }));
                callback(docs);
            }
        })
        .build();
    picker.setVisible(true);
  };
  
  const fetchFileContent = async (fileId: string, mimeType: string, name: string): Promise<string> => {
     try {
        if (mimeType === 'application/vnd.google-apps.document') {
             const response = await window.gapi.client.drive.files.export({
                fileId: fileId,
                mimeType: 'text/plain',
             });
             return `Content from Google Doc "${name}":\n${response.body}\n`;
        } else if (mimeType.startsWith('text/')) {
             const response = await window.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            });
            return `Content from text file "${name}":\n${response.body}\n`;
        } else {
            return `Reference to a file from Google Drive named "${name}" of type ${mimeType}.\n`;
        }
     } catch (err: any) {
        console.error(`Error fetching file content for ${name}:`, err);
        return `Error fetching content for file "${name}".\n`;
     }
  };

  const value = { isSignedIn, signIn, signOut, openPicker, fetchFileContent, isApiLoaded, isConfigured };

  return (
    <GoogleDriveContext.Provider value={value}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (context === undefined) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};
