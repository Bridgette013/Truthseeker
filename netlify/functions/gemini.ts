import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

function json(statusCode: number, data: unknown) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || "";
}

function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }
  return new GoogleGenAI({ apiKey });
}

type Action =
  | "analyzeImage"
  | "analyzeVideo"
  | "analyzeAudio"
  | "generateSimulationImage"
  | "verifyIdentity"
  | "deepForensicThink"
  | "analyzeConversation"
  | "extractTextFromImage";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const action: Action | undefined = parsed.action;
  const payload: any = parsed.payload || {};

  try {
    const ai = getClient();

    switch (action) {
      case "analyzeImage": {
        const { base64Data, mimeType, mode } = payload;
        if (!base64Data || !mimeType || !mode) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-pro-preview";
        const prompt =
          mode === "AI_AUTO"
            ? `
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
    `
            : `
      The user acts as the forensic investigator.
      Act as a senior mentor. Do not give the final verdict immediately.
      Instead, guide the user to look at specific parts of THIS image to find the truth themselves.

      Step 1: Ask them to zoom in on specific suspicious areas (hands, eyes, shadows).
      Step 2: Explain *exactly* what to look for (e.g., "Check if the reflection in the left eye matches the right eye" or "Look for blurred pixel edges here").
      Step 3: Point out any "perfect" symmetry or strange artifacts typical of AI.

      Teach them how to spot the difference between a bad camera and a manipulated photo.
    `;

        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }],
          },
          config: {
            thinkingConfig: { thinkingBudget: 1024 },
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "analyzeVideo": {
        const { base64Data, mimeType } = payload;
        if (!base64Data || !mimeType) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-pro-preview";
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

        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }],
          },
          config: {
            thinkingConfig: { thinkingBudget: 2048 },
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "analyzeAudio": {
        const { base64Data, mimeType } = payload;
        if (!base64Data || !mimeType) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-flash-preview";
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

        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }],
          },
          config: {
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "generateSimulationImage": {
        const { prompt, aspectRatio } = payload;
        if (!prompt || !aspectRatio) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-pro-image-preview";
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio,
              imageSize: "1K",
            },
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "verifyIdentity": {
        const { query } = payload;
        if (!query) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-flash-preview";
        const prompt = `
    Investigate the following identity or claim using Google Search to detect potential catfishing.
    Query: "${query}"

    Cross-reference public information. Look for inconsistencies in timeline, location, or career claims.
    If the person is a public figure or has a digital footprint, summarize key consistency points.
    If there are "red flags" (e.g., stolen photos often associated with this name, or scam reports), highlight them.
  `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "deepForensicThink": {
        const { scenarioDescription } = payload;
        if (!scenarioDescription) return json(400, { error: "Missing required fields" });

        const model = "gemini-3-pro-preview";
        const prompt = `
    You are a lead Digital Forensics Investigator.
    Analyze the following complex catfishing scenario. Connect the dots between behavioral patterns, digital evidence, and psychological manipulation tactics.

    Scenario:
    ${scenarioDescription}

    Provide a comprehensive risk assessment profile.
  `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingBudget: 32768 },
            safetySettings: SAFETY_SETTINGS,
          },
        });

        return json(200, { text: response.text || "", candidates: response.candidates || [] });
      }

      case "analyzeConversation": {
        const { conversationText, context } = payload;
        if (!conversationText) return json(400, { error: "Missing required fields" });

        const ANALYSIS_PROMPT = `
You are a forensic conversation analyst specializing in detecting online romance scams, catfishing, and manipulation tactics.
Analyze the following conversation and identify manipulation patterns.

DETECTION CATEGORIES:
1. LOVE BOMBING (excessive early affection)
   - "I love you" too soon, overwhelming compliments, claims of instant deep connection.
2. URGENCY/PRESSURE
   - Time-sensitive requests, guilt-tripping, emotional blackmail.
3. ISOLATION TACTICS
   - Discouraging contact with family/friends, secrecy requests.
4. FINANCIAL MANIPULATION
   - Sob stories building toward requests, investment opportunities, requests for gift cards/crypto.
5. INCONSISTENCIES
   - Changing story details, conflicting timelines, excuses for avoiding video calls.
6. SCAM SCRIPTS
   - Military deployment, oil rig, stuck in foreign country, inheritance.

RESPONSE FORMAT (JSON):
{
  "overallRiskScore": <0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence overall assessment>",
  "patterns": [
    {
      "type": "<LOVE_BOMBING|URGENCY|ISOLATION|FINANCIAL|INCONSISTENCY|SCRIPT|OTHER>",
      "severity": "<LOW|MEDIUM|HIGH>",
      "evidence": ["<exact quotes or paraphrased examples>"],
      "explanation": "<why this is concerning>"
    }
  ],
  "timeline": [
    {
      "approximate": "<Day 1, Week 2, etc.>",
      "event": "<what happened>",
      "concern": <true if red flag, false otherwise>
    }
  ],
  "redFlags": ["<list of specific warning signs found>"],
  "recommendations": ["<actionable advice for the user>"]
}

If the conversation appears genuine with no manipulation:
- Set overallRiskScore low (0-20)
- Still note any minor concerns or positive observations.

CONVERSATION TO ANALYZE:
`;

        const prompt =
          ANALYSIS_PROMPT +
          (context ? `\nCONTEXT FROM USER: ${context}\n\n` : "") +
          conversationText;

        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 4096 },
          },
        });

        const text = response.text || "";
        try {
          return json(200, JSON.parse(text));
        } catch {
          return json(200, {
            overallRiskScore: 0,
            riskLevel: "LOW",
            summary: "Error parsing analysis results. Please try again.",
            patterns: [],
            timeline: [],
            redFlags: [],
            recommendations: [],
          });
        }
      }

      case "extractTextFromImage": {
        const { imageBase64, mimeType } = payload;
        if (!imageBase64 || !mimeType) return json(400, { error: "Missing required fields" });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              {
                text:
                  "Extract all text from this chat/message screenshot. Preserve the conversation structure showing who said what. Format as a readable conversation transcript. Ignore UI elements like battery level or signal strength unless relevant.",
              },
            ],
          },
        });

        return json(200, { text: response.text || "" });
      }

      default:
        return json(400, { error: "Unknown action" });
    }
  } catch (error: any) {
    return json(500, { error: error?.message || "Server error" });
  }
};
