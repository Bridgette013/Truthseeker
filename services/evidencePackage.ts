export interface EvidenceItem {
  id: string;
  type: 'analysis' | 'journal' | 'conversation';
  date: string;
  title: string;
  summary: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  rawData?: string;
}

export interface EvidencePackage {
  caseId: string;
  generatedAt: string;
  items: EvidenceItem[];
  overallAssessment: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  date: string;
  event: string;
  evidenceId?: string;
  isConcern: boolean;
}

// Generate a simple hash for evidence integrity
export const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
};

// Format date for reports
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate case reference number
export const generateCaseId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${dateStr}-${random}`;
};