export interface Gloss {
  id: string;
  originalWord: string; // The French word(s) this maps to
  gloss: string; // The LSF Gloss (e.g., APPELER)
  type: 'noun' | 'verb' | 'adjective' | 'syntax' | 'other';
  description?: string; // Description of the movement
  facialExpression?: string; // Required facial expression
  duration?: number; // Estimated duration in seconds
  videoUrl?: string | null; // URL to the pre-recorded video (Mediapi-RGB / Matignon)
}

export interface TranslationResult {
  originalText: string;
  translatedGlosses: string; // The full gloss sentence
  glosses: Gloss[];
  grammarNotes?: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
}