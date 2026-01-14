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

export interface ConversationAnalysisResult {
  overallRiskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  patterns: DetectedPattern[];
  timeline: TimelineEvent[];
  redFlags: string[];
  recommendations: string[];
}

export interface DetectedPattern {
  type: 'LOVE_BOMBING' | 'URGENCY' | 'ISOLATION' | 'FINANCIAL' | 'INCONSISTENCY' | 'SCRIPT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence: string[];
  explanation: string;
}

export interface TimelineEvent {
  approximate: string; // "Day 1", "Week 2", etc.
  event: string;
  concern: boolean;
}

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

export const analyzeConversation = async (
  conversationText: string,
  context?: string
): Promise<ConversationAnalysisResult> => {
  return await callGemini("analyzeConversation", { conversationText, context });
};

// OCR for screenshot uploads
export const extractTextFromImage = async (
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  const result = await callGemini("extractTextFromImage", { imageBase64, mimeType });
  return result?.text || '';
};
