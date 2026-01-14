
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ANALYZE_IMAGE = 'ANALYZE_IMAGE',
  ANALYZE_VIDEO = 'ANALYZE_VIDEO',
  ANALYZE_AUDIO = 'ANALYZE_AUDIO',
  ANALYZE_CONVERSATION = 'ANALYZE_CONVERSATION',
  VERIFY_IDENTITY = 'VERIFY_IDENTITY', // Google Search Grounding
  REVERSE_SEARCH = 'REVERSE_SEARCH',
  EVIDENCE_PACKAGE = 'EVIDENCE_PACKAGE', // New
  SIMULATOR = 'SIMULATOR', // Image Generation
  TUTORIAL = 'TUTORIAL',
  JOURNAL = 'JOURNAL',
  LEARNING_CENTER = 'LEARNING_CENTER',
  // Static Pages
  ABOUT = 'ABOUT',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  CONTACT = 'CONTACT',
}

export enum AnalysisMode {
  AI_AUTO = 'AI_AUTO',
  USER_GUIDED = 'USER_GUIDED',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export interface AnalysisResult {
  text: string;
  confidence?: number; // 0-100
  flagged?: boolean;
  groundingUrls?: Array<{uri: string, title: string}>;
  timestamp: string;
}

export interface CaseHistoryItem {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio';
  date: string;
  resultSummary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  createdAt?: string;
  title: string;
  content: string;
  tags: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
  dailyScansUsed: number;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export const ASPECT_RATIOS = [
  "1:1",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
] as const;

export type AspectRatio = typeof ASPECT_RATIOS[number];
