
import { useState, useEffect } from 'react';

// Helper function to convert a blob to a Base64 string
const blobToBase64 = <T,>(blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as Base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Custom hook to fetch the avatar image and convert it to Base64
export const useAvatar = () => {
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndEncodeAvatar = async () => {
      try {
        // Using a placeholder image. In a real app, this might come from a static asset.
        // Prompt used for this image: "A realistic digital avatar for Seek Beyond Realty, a Dubai real estate company: Professional Middle Eastern woman in business attire with company logo, friendly expression, high detail, studio lighting"
        const response = await fetch('https://picsum.photos/seed/realty-avatar/1024/1024.jpg');
        if (!response.ok) {
          throw new Error('Failed to fetch avatar image.');
        }
        const imageBlob = await response.blob();
        const base64String = await blobToBase64(imageBlob);
        setAvatarBase64(base64String);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndEncodeAvatar();
  }, []); // Empty dependency array ensures this runs only once on mount

  return { avatarBase64, loading, error };
};
