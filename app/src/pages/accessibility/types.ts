export type AccessibilityTransformType =
  | 'simplify'
  | 'translate'
  | 'summarize'
  | 'read_assist'
  | string;

export interface AccessibilityTransformHistoryItem {
  id: number;
  transform_type: AccessibilityTransformType;
  original_preview: string;
  transformed_preview: string;
  created_at: string;
}

export interface AccessibilityAssistantSuggestion {
  recommended_transformation?: {
    type: string;
    settings?: Record<string, unknown>;
  };
  accessibility_suggestions: string[];
}

export interface SimplifyResult {
  original_text: string;
  simplified_text: string;
  key_points: string[];
  reading_level: string;
  word_count_original: number;
  word_count_simplified: number;
}

export interface TranslateResult {
  original_text: string;
  translated_text: string;
  detected_source_language?: string | null;
  target_language: string;
  word_count: number;
}

export interface SummarizeResult {
  original_text: string;
  summary: string;
  key_takeaways: string[];
  compression_ratio: number;
  reading_time_saved_minutes: number;
}

export interface ReadAssistKeyTerm {
  term: string;
  definition: string;
  phonetic?: string;
}

export interface ReadAssistResult {
  original_text: string;
  assisted_text: string;
  key_terms: ReadAssistKeyTerm[];
  chunks: string[];
  estimated_reading_level: string;
}
