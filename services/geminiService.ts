
import { GoogleGenAI, Modality } from "@google/genai";
import type { Operation, GenerateVideosResponse } from "@google/genai";
import { CustomizationOptions, ImagePart, Avatar } from "../types";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

const checkApiKey = (): GoogleGenAI => {
  if (!ai) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
  }
  return ai;
};

export const isApiKeySet = (): boolean => {
    return !!API_KEY;
};

export const generateAvatarPortraits = async (options: CustomizationOptions): Promise<string[]> => {
    const ai = checkApiKey();
    const prompt = `
    **PRIMARY OBJECTIVE:** Generate four distinct, **ultra-realistic, photorealistic, 4K resolution close-up portrait shots** of a digital brand ambassador. Each image must be a masterpiece of photographic realism, captured with **cinematic lighting**, suitable for a high-end corporate marketing campaign.

    **GUIDELINES FOR SAFETY & COMPLIANCE:**
    - Focus on creating a professional persona. The subject should exude confidence and approachability. Avoid any sensitive, controversial, or inappropriate themes.

    **PERSONA & APPEARANCE (BASED ON USER INPUT):**
    - **Description:** ${options.personDescription}.
    - **Clothing (Visible in Portrait):** ${options.clothing}.
    - **Hairstyle:** ${options.hairstyle}.
    - **Overall Vibe:** Sophisticated, professional, globally appealing.

    **PHOTOGRAPHIC STYLE & EXECUTION (CRITICAL REQUIREMENTS):**
    - **Realism Level:** Ultra, ultra, ultra-realistic and **photorealistic**. The final images must be absolutely indistinguishable from a professional photoshoot captured on a high-end DSLR or mirrorless camera. Pay extremely close attention to hyper-realistic details like skin texture, pores, individual hair strands, and light reflection in the eyes.
    - **Lighting:** Employ **cinematic lighting**. Use techniques like softbox key lighting, rim lighting, and subtle fill lights to create depth and a professional, polished look.
    - **Cropping:** All shots must be **tightly cropped close-up portraits**, focusing on the face and shoulders.

    **DYNAMIC ANGLES & EXPRESSIONS (NON-NEGOTIABLE):**
    - You must generate four **unique** portraits. Each must feature a different angle or subtle expression to provide variety.
    - **Required Variations:**
        1. Front-facing, neutral expression.
        2. 3/4 profile, looking slightly away from the camera.
        3. Slight head tilt, subtle smile.
        4. Looking directly at the camera, confident expression.

    **BACKGROUND:**
    - A clean, minimalist, light-gray studio background.

    **ABSOLUTE CONSTRAINTS:**
    - **PORTRAIT ONLY:** The output **MUST** be a close-up portrait. Absolutely **NO** full-body or half-body shots are permitted in this step. The focus is exclusively on the face and shoulders.
    - **SINGLE SUBJECT:** Each image must contain only ONE person.
    - **NO TEXT/LOGOS/WATERMARKS.**
    - **NO COMPOSITES:** Each output must be a single, coherent portrait. DO NOT generate grids or collages.
    - **MAINTAIN CONSISTENCY:** The person's core facial features must be consistent across all four images.
    `;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 4,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        
        const allImages = response.generatedImages.map(img => img.image.imageBytes);

        if (allImages.length < 1) throw new Error("Avatar generation failed to return any images.");
        return allImages;
    } catch (error) {
        console.error("Error generating avatar portraits:", error);
        throw new Error(`Failed to generate portraits. ${error instanceof Error ? error.message : ''}`);
    }
};

export const generateFullBodyAvatar = async (selectedAvatar: Avatar, clothing: string, pose: string): Promise<string[]> => {
    const ai = checkApiKey();
    const prompt = `
    **PRIMARY OBJECTIVE:** Generate four distinct, **ultra-realistic, photorealistic, 4K resolution full-body shots** of a digital brand ambassador, maintaining **perfect character consistency** with their established portrait.

    **CRITICAL CONTEXT - THE AVATAR'S FACE (NON-NEGOTIABLE CONSISTENCY):**
    - The person in this image is a/an **${selectedAvatar.portraitPrompt.personDescription}**.
    - Their hairstyle is **${selectedAvatar.portraitPrompt.hairstyle}**.
    - It is absolutely critical that the face, hair, skin tone, and all facial features in the generated full-body image are an **exact match** to this description. The goal is that this new image looks like it's from the same photoshoot as the original portrait.

    **NEW FULL-BODY REQUIREMENTS (USER INPUT):**
    - **Clothing:** ${clothing}.
    - **Pose:** ${pose}.
    - **Overall Vibe:** Professional, confident, standing in a well-lit studio.

    **PHOTOGRAPHIC STYLE & EXECUTION:**
    - **Realism Level:** Ultra-realistic and photorealistic, matching the quality of the original portrait.
    - **Lighting:** Cinematic lighting consistent with a professional studio environment.
    - **Shot Type:** Full-body shot, showing the person from head to toe.

    **BACKGROUND:**
    - A clean, minimalist, light-gray studio background.

    **ABSOLUTE CONSTRAINTS:**
    - **CHARACTER CONSISTENCY:** The face must be a perfect match to the description provided. This is the most important rule.
    - **SINGLE SUBJECT:** Each image must contain only ONE person.
    - **NO TEXT/LOGOS/WATERMARKS.**
    - **NO COMPOSITES.**
    `;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              outputMimeType: 'image/jpeg',
              aspectRatio: '9:16',
              numberOfImages: 4,
            },
        });
        
        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        console.error("Error generating full body avatar:", error);
        throw new Error(`Failed to generate full body avatar. ${error instanceof Error ? error.message : ''}`);
    }
};


const PROMPT_REFINEMENT_INSTRUCTIONS = `You are an AI assistant for a luxury real estate company in Dubai called 'Seek Beyond Realty'.
Your task is to take a user's detailed video plan and ensure it is a perfect, compliant prompt for a video generation AI (Veo).
The final prompt MUST be a single, coherent paragraph.

**--- PRIMARY COMMAND: FULL, AUDIBLE AUDIO TRACK GENERATION (NON-NEGOTIABLE) ---**

**This is the single most important instruction. Failure to generate a complete and audible audio track as described below is a total failure of the task.**

**1. AUDIBLE NARRATION IS MANDATORY:**
- The influencer's narration script, as provided by the user, MUST be generated as a clear, audible, and well-paced voice.
- The narrator's voice should match the style requested by the user (e.g., professional, friendly, energetic).
- **CRITICAL LOGIC:** If the video shows the influencer's lips moving, their corresponding voice MUST be heard. A video of a speaking person without sound is an unacceptable error.

**2. BACKGROUND AUDIO INTEGRATION:**
- You WILL generate and include all specified background music and ambient sound effects.
- The audio mix must be professional, ensuring the narration is always clear and easy to understand over the background audio.

**--- OTHER NON-NEGOTIABLE CORE REQUIREMENTS ---**

**1. VISUALIZE AND INTERACT WITH ALL PROVIDED CONTEXT:**
- **PRIMARY DIRECTIVE**: This is the most critical visual instruction. If context is provided (from files like PDFs, text, images, or a URL), you MUST visually represent that specific information within the video. Do not just mention it; it must be shown.
- **VISUAL EXAMPLES**: A floor plan from a PDF must appear on a sleek digital screen or as a graphical overlay. Key features from a text file must be displayed as elegant on-screen text. An image of a room must be shown in the video.
- **INFLUENCER INTERACTION**: The influencer MUST actively interact with these visual elements. She must be seen pointing to the floor plan on the screen, gesturing towards the on-screen text, or walking through a scene that contains the visual context. The interaction must be natural and relevant.

**2. COMMAND: FLAWLESS LIP-SYNC (LINKED TO AUDIBLE VOICE):**
- The influencer's lip movements WILL BE perfectly and flawlessly synchronized with the **GENERATED AUDIBLE NARRATION**.
- If her lips are moving, her generated voice MUST be heard. This is non-negotiable.

**3. COMMAND: ACCURATE BURNED-IN SUBTITLES (LINKED TO AUDIBLE VOICE):**
- You WILL burn subtitles directly into the video.
- The subtitles WILL BE an exact, word-for-word transcript of the **HEARD NARRATION**.
- They WILL BE legible, clean, and positioned at the bottom-center of the screen.

**--- ADDITIONAL DETAILS ---**

**Video Style:**
- The video should be approximately the duration specified by the user.
- The aspect ratio (e.g., 16:9 for landscape, 9:16 for vertical) MUST be followed.
- The style must be cinematic, ultra, ultra, ultra realistic, and high-quality (8K if possible).
- It must feature the consistent, branded, ultra-realistic digital influencer provided by the user's reference image.

**Influencer Action:**
- The influencer should be dynamic, such as walking through the scene or gesturing towards features, while looking towards the camera as if addressing an audience.

**Branding Details:**
- The 'Seek Beyond Realty' logo (stylized 'SB' infinity symbol with text) must be naturally integrated into the scene (e.g., on a brochure, a screen, a subtle sign).
- The brand colors, blue and gold, should be subtly integrated into the scene's lighting, decor, or graphics.

**Output Format:**
- Only output the single, refined prompt text. Do not add conversational text.
- The prompt must explicitly state the narration script, the requirement for a generated audio track, perfect lip-sync, and exact subtitles.`;

export const refinePrompt = async (
  userInput: string,
  musicMood: string,
  duration: string,
  aspectRatio: string,
  voiceStyle: string,
  contextText: string,
  contextImages: ImagePart[]
): Promise<string> => {
  const ai = checkApiKey();
  const refinementRequest = `
    As an expert video prompt engineer, your task is to synthesize the following inputs into a single, flawless, and compliant prompt for the Veo video generation model.

    **User's Core Video Plan:**
    """
    ${userInput}
    """
    
    **Customization Details:**
    - Video Duration: Approximately ${duration} seconds.
    - Aspect Ratio: ${aspectRatio}.
    - Narrator Voice Style: ${voiceStyle}.
    - Background Music Mood: ${musicMood || "None specified."}

    **CRITICAL CONTEXTUAL ASSETS (MUST BE VISUALLY REPRESENTED):**
    The following information, derived from user-uploaded files and URLs, is not just text—it represents visual assets that MUST be shown in the video. The influencer MUST be seen interacting with these elements (e.g., pointing to them on a screen, walking through a scene depicted in an image).
    """
    ${contextText || "No additional context provided."}
    """

    **Your final output must be a single paragraph that masterfully integrates all the above elements, adhering to all instructions in the system prompt.**
  `;

  const parts = [
    { text: refinementRequest },
    ...contextImages
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: PROMPT_REFINEMENT_INSTRUCTIONS,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error refining prompt:", error);
    throw new Error("Failed to refine the prompt. Please check the API key and network connection.");
  }
};

export const generateVideo = async (refinedPrompt: string, selectedAvatarBase64: string): Promise<Operation<GenerateVideosResponse>> => {
    const ai = checkApiKey();
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: refinedPrompt,
            image: {
                imageBytes: selectedAvatarBase64,
                mimeType: 'image/jpeg',
            },
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to start video generation.");
    }
};

export const pollVideoStatus = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
    const ai = checkApiKey();
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error polling video status:", error);
        throw new Error("Failed to get video generation status.");
    }
}

export const enhanceText = async (textToEnhance: string, context: string): Promise<string> => {
  const ai = checkApiKey();
  if (!textToEnhance.trim()) {
    return textToEnhance;
  }
  
  const prompt = `
    You are an AI assistant and an expert prompt engineer.
    Your task is to rewrite and enhance the following text to make it more descriptive, vivid, and effective for an AI generation model.
    The context for this text is: "${context}".
    Only return the enhanced text. Do not add any conversational preamble, sign-off, or markdown formatting like quotes or titles. The output should be plain text only.

    Original text:
    ---
    ${textToEnhance}
    ---
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing text:", error);
    throw new Error("Failed to enhance text with AI.");
  }
};

export const enhanceImageRealism = async (base64ImageData: string, imageContext: 'portrait' | 'full body'): Promise<string> => {
  const ai = checkApiKey();
  const prompt = `
    **PRIMARY COMMAND:** Your mission is to perform a photographic enhancement on this image, elevating it to the absolute pinnacle of **ultra-photorealism**. The final result must be utterly **indistinguishable from a photograph taken by a world-class portrait photographer using a high-end DSLR camera with a prime lens**. The test is simple: a human viewer should not be able to tell this is a generated image.

    **CONTEXT:** This is a ${imageContext} shot of a corporate brand ambassador. The expectation is not just realism, but photographic perfection.

    **CRITICAL PHOTOGRAPHIC ENHANCEMENT DIRECTIVES (NON-NEGOTIABLE):**

    1.  **MICROSCOPIC DETAIL & TEXTURE (THE CORE TASK):**
        -   **Skin:** This is the most critical area. Do not just add texture; **recreate the microscopic reality of human skin**. This means rendering visible, but subtle, skin pores, the finest vellus hair (peach fuzz), and natural, slight imperfections. The skin should have a healthy luminosity, not a flat, airbrushed look. It must look like real, living tissue with depth and translucency.
        -   **Hair:** Every single strand must be rendered with precision. Introduce individual, slightly imperfect flyaway hairs. The light should catch individual strands, creating a realistic, dynamic sheen. It must not look like a single sculpted mass.
        -   **Eyes:** Enhance the eyes to be the focal point. Add hyper-realistic detail to the iris, including limbal rings and subtle color variations. Ensure there is a natural, clear catchlight reflecting the studio lighting setup, giving the eyes life and depth.
        -   **Clothing Fabric:** Intensify the texture of the fabric. The weave of a suit, the subtle sheen of silk, or the texture of cotton must be palpable.

    2.  **MASTERFUL CINEMATIC LIGHTING:**
        -   Re-evaluate and perfect the lighting. It should mimic a sophisticated multi-point studio lighting setup (e.g., a large softbox as a key light, a reflector for fill, and a subtle rim light for separation).
        -   Create a gentle, realistic falloff of light. Shadows should be soft and natural, adding depth and dimension to the facial features. Avoid harsh, flat lighting.

    **ABSOLUTE CONSTRAINTS (IMMEDIATE FAILURE IF VIOLATED):**

    -   **PRESERVE IDENTITY & POSE:** You are enhancing, **not changing**. The subject's core identity, facial structure, expression, hairstyle, clothing, and pose must remain exactly as they are in the source image.
    -   **NO DIGITAL ARTIFACTS:** The output must be perfectly clean, sharp, and high-resolution. Eliminate any trace of digital generation, including blurring, pixelation, or painterly effects.
    -   **MAINTAIN BACKGROUND:** The background must remain the simple, light-gray studio setting. Do not add or change it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: 'image/jpeg', // Assuming jpeg from previous steps
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    } else {
      // If no image, find a text part to include in the error for debugging.
      const textPart = parts?.find(part => part.text);
      const modelFeedback = textPart ? `Model response: "${textPart.text}"` : "The model returned no image or text feedback.";
      throw new Error(`AI did not return an enhanced image. ${modelFeedback}`);
    }
  } catch (error) {
    console.error("Error enhancing image realism:", error);
    throw new Error(`Failed to enhance image. ${error instanceof Error ? error.message : ''}`);
  }
};
