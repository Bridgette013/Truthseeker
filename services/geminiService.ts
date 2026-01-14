

import { AnalysisMode, AspectRatio } from "../types";
import { logger } from "./logger";

export interface GeminiResponse {
  text?: string;
  candidates?: any[];
}

async function callGemini(action: string, payload: Record<string, any>): Promise<any> {
  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Gemini request failed (${response.status})`);
  }
  return data;
}

/**
 * Helper to handle streaming responses securely with logging
 */
async function handleStream(
  streamResult: any, 
  onChunk?: (text: string) => void,
  context: string = "Unknown"
): Promise<GeminiResponse> {
  let fullText = "";
  try {
    const text = typeof streamResult === "string" ? streamResult : (streamResult?.text || "");
    fullText = text;
    if (text && onChunk) onChunk(text);
    logger.info(`Stream completed for ${context}`, { length: fullText.length }, "GeminiService");
    return {
      text: fullText,
      candidates: streamResult?.candidates || [{ content: { parts: [{ text: fullText }] } }]
    };
  } catch (error) {
    logger.error(`Stream error in ${context}`, error, "GeminiService");
    throw new Error("Analysis stream interrupted due to network or quota issues.");
  }
}

/**
 * Analyzes an image for forensic signs of tampering.
 */
export const analyzeImage = async (
  base64Data: string, 
  mimeType: string, 
  mode: AnalysisMode,
  onChunk?: (text: string) => void
): Promise<GeminiResponse> => {
  logger.info("Starting Image Analysis", { mode, mimeType }, "GeminiService");
  
  let prompt = "";
  if (mode === AnalysisMode.AI_AUTO) {
    prompt = `
      Perform a rigorous forensic authentication of this image. Act as a digital forensics expert.

      OBJECTIVE: Detect AI-Generated content (GANs, Diffusion models) AND Human Manipulation (Photoshop, Editing).

      ANALYSIS PROTOCOL:
      1. **AI Generation Indicators:**
         - **Anatomical Consistency:** Check hands (finger count/shape), ears, teeth, and pupils (shape/reflection symmetry).
         - **Texture & Detail:** Look for "painterly" or "waxy" skin textures, undefined hair strands blending into background, or incoherent text/logos.
         - **Background Logic:** Check for nonsensical geometry, furniture blending into walls, or impossible perspectives.

      2. **Manual Manipulation (Photoshop) Indicators:**
         - **Edge Analysis:** Look for jagged edges, halo effects, or pixelation mismatches around subjects (masking artifacts).
         - **Lighting & Shadows:** Verify shadow direction matches light sources. Look for inconsistent shadow fall-off or missing shadows.
         - **Clone/Heal Artifacts:** Identify repeated texture patterns indicative of the clone stamp tool.
         - **Noise/Grain:** Check for smooth areas in a grainy image (blurring/smoothing) or mismatched noise profiles between subject and background.

      OUTPUT FORMAT (Markdown):
      ## Forensic Analysis Report

      **AUTHENTICITY VERDICT:** [Likely Authentic | Suspicious | Highly Edited | AI-Generated]
      **CONFIDENCE SCORE:** [0-100]%

      ### 🚩 Critical Findings
      * List the most significant red flags found.

      ### 🔍 Detailed Inspection
      * **Anatomy/Objects:** [Notes on physical plausibility]
      * **Lighting/Physics:** [Notes on light coherence and reflections]
      * **Digital Artifacts:** [Notes on pixel-level irregularities or AI textures]

      ### 💡 Technical Assessment
      [Explain *why* specific artifacts suggest a specific tool (e.g., "Mismatched noise suggests composite" or "Asymmetrical pupils suggest GAN/Diffusion generation").]
    `;
  } else {
    prompt = `
      The user acts as the forensic investigator. 
      Act as a senior mentor. Do not give the final verdict immediately.
      Instead, guide the user to look at specific parts of THIS image to find the truth themselves.
      
      Step 1: Ask them to zoom in on specific suspicious areas (hands, eyes, shadows).
      Step 2: Explain *exactly* what to look for (e.g., "Check if the reflection in the left eye matches the right eye" or "Look for blurred pixel edges here").
      Step 3: Point out any "perfect" symmetry or strange artifacts typical of AI.
      
      Teach them how to spot the difference between a bad camera and a manipulated photo.
    `;
  }

  try {
    const result = await callGemini("analyzeImage", { base64Data, mimeType, mode });
    return handleStream(result?.text || "", onChunk, "ImageAnalysis");
  } catch (e) {
    logger.error("Image Analysis Failed", e, "GeminiService");
    throw e;
  }
};

/**
 * Analyzes video content for Deepfake artifacts.
 */
export const analyzeVideo = async (
  base64Data: string, 
  mimeType: string,
  onChunk?: (text: string) => void
): Promise<GeminiResponse> => {
  logger.info("Starting Video Analysis", { mimeType }, "GeminiService");

  const prompt = `
    Perform a forensic video analysis on this clip. Focus on detecting Deepfakes, Face Swaps, and Editing Tampering.

    ANALYSIS PROTOCOL:
    1. **Facial Forensics:**
       - **Landmark Stability:** Do facial features (eyes, nose, mouth) jitter or "slide" when the head turns?
       - **Boundary Blending:** Check the hairline and jawline for blurring or mismatched skin tones (masking artifacts).
       - **Eye Behavior:** Are blink patterns natural? Do reflections in eyes match the scene?
       - **Lip Sync:** Does mouth movement precisely match the phonemes of the audio?

    2. **Frame Integrity:**
       - **Temporal Consistency:** Look for flickering lighting or texture popping between frames.
       - **Motion Artifacts:** Do objects warp or bend unnaturaly during movement?

    3. **Editing Forensics:**
       - **Jump Cuts:** Identify sudden breaks in continuity used to hide context.
       - **Audio-Visual Sync:** Is there a delay or mismatch indicating replaced audio?

    OUTPUT FORMAT (Markdown):
    ## Video Forensic Report

    **RISK LEVEL:** [Low | Medium | High | Critical]
    **MANIPULATION TYPE:** [None Detected | Deepfake/Face Swap | AI Lip Sync | Traditional Editing]

    ### 🚩 Anomalies Detected
    * [Timestamp/Frame description]: [Description of anomaly]

    ### 🔬 Technical Analysis
    * **Facial Consistency:** [Notes on face stability and blending]
    * **Lighting/Physics:** [Notes on temporal lighting consistency]
    * **Sync & Motion:** [Notes on lip-sync and object motion]

    ### 🛡️ Conclusion
    [Final assessment of the clip's legitimacy]
  `;

  try {
    const result = await callGemini("analyzeVideo", { base64Data, mimeType });
    return handleStream(result?.text || "", onChunk, "VideoAnalysis");
  } catch (e) {
    logger.error("Video Analysis Failed", e, "GeminiService");
    throw e;
  }
};

/**
 * Transcribes and analyzes audio.
 */
export const analyzeAudio = async (
  base64Data: string, 
  mimeType: string,
  onChunk?: (text: string) => void
): Promise<GeminiResponse> => {
  logger.info("Starting Audio Analysis", { mimeType }, "GeminiService");

  const prompt = `
    Perform a forensic audio analysis.

    Task 1: **Verbatim Transcript**
    Transcribe the audio accurately.

    Task 2: **Forensic Authenticity Check**
    Analyze for signs of Synthetic Voice (AI/TTS) and Audio Splicing.

    ANALYSIS PROTOCOL:
    1. **Synthetic Indicators:**
       - **Prosody & Intonation:** Is the speech rhythm robotic, too perfect, or lacking natural emotional variance?
       - **Breathing:** Are natural breath sounds missing between long phrases?
       - **Artifacts:** Listen for metallic/robotic ringing, clicking, or phase issues often found in vocoders.

    2. **Splicing/Editing Indicators:**
       - **Noise Floor:** Does the background hiss/room tone cut out or change abruptly between words?
       - **Spectral Continuity:** Are there unnatural shifts in pitch or formant frequencies suggestive of copy-pasting words?

    OUTPUT FORMAT (Markdown):
    ## Audio Forensic Report

    **TRANSCRIPT:**
    > "[Transcript here...]"

    **AUTHENTICITY VERDICT:** [Likely Human | Suspected AI/Synthetic | Manipulated/Spliced]

    ### 🚩 Detected Artifacts
    * **Voice Quality:** [Natural vs Metallic/Flat]
    * **Breathing/Pauses:** [Presence of natural breath vs unnatural silence]
    * **Background Ambience:** [Consistent room tone vs gated/spliced silence]

    ### 📉 Technical Observation
    [Detailed explanation of specific auditory clues found]
  `;

  try {
    const result = await callGemini("analyzeAudio", { base64Data, mimeType });
    return handleStream(result?.text || "", onChunk, "AudioAnalysis");
  } catch (e) {
    logger.error("Audio Analysis Failed", e, "GeminiService");
    throw e;
  }
};

/**
 * Generates an image to simulate catfish profiles (educational).
 */
export const generateSimulationImage = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<GeminiResponse> => {
  logger.info("Generating Simulation Image", { aspectRatio }, "GeminiService");
  
  try {
    return await callGemini("generateSimulationImage", { prompt, aspectRatio });
  } catch (e) {
    logger.error("Simulation Generation Failed", e, "GeminiService");
    throw e;
  }
};

/**
 * Uses Search Grounding to verify identity claims.
 */
export const verifyIdentity = async (
  query: string, 
  onChunk?: (text: string) => void
): Promise<GeminiResponse> => {
  logger.info("Starting Identity Verification", { query }, "GeminiService");
  
  const prompt = `
    Investigate the following identity or claim using Google Search to detect potential catfishing.
    Query: "${query}"
    
    Cross-reference public information. Look for inconsistencies in timeline, location, or career claims.
    If the person is a public figure or has a digital footprint, summarize key consistency points.
    If there are "red flags" (e.g., stolen photos often associated with this name, or scam reports), highlight them.
  `;

  try {
    const result = await callGemini("verifyIdentity", { query });
    // Emit text as a single chunk but keep candidates for grounding metadata.
    if (result?.text && onChunk) onChunk(result.text);
    return { text: result?.text || "", candidates: result?.candidates || [] };
  } catch (e) {
    logger.error("Identity Verification Failed", e, "GeminiService");
    throw e;
  }
};

/**
 * Deep Thinking Mode for complex scenario analysis.
 */
export const deepForensicThink = async (
  scenarioDescription: string,
  onChunk?: (text: string) => void
): Promise<GeminiResponse> => {
  logger.info("Starting Deep Forensic Analysis", { length: scenarioDescription.length }, "GeminiService");
  
  const prompt = `
    You are a lead Digital Forensics Investigator. 
    Analyze the following complex catfishing scenario. Connect the dots between behavioral patterns, digital evidence, and psychological manipulation tactics.
    
    Scenario:
    ${scenarioDescription}
    
    Provide a comprehensive risk assessment profile.
  `;

  try {
    const result = await callGemini("deepForensicThink", { scenarioDescription });
    return handleStream(result?.text || "", onChunk, "DeepForensicThink");
  } catch (e) {
    logger.error("Deep Forensic Analysis Failed", e, "GeminiService");
    throw e;
  }
};
