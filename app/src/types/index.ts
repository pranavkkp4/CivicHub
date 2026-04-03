// User types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

// Dashboard types
export interface DashboardSummary {
  total_study_materials: number;
  total_mock_tests_taken: number;
  average_test_score: number;
  weak_topics_count: number;
  active_workout_plans: number;
  active_nutrition_plans: number;
  sustainability_actions_this_week: number;
  co2_saved_kg: number;
  unread_notifications: number;
  pending_recommendations: number;
}

// Education types
export interface StudyMaterial {
  id: number;
  title: string;
  content: string;
  source_type: string;
  subject?: string;
  tags?: string[];
  created_at: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  order_index: number;
}

export interface InterviewStartResponse {
  session_id: number;
  questions: InterviewQuestion[];
}

export interface InterviewAnswerResult {
  score: number;
  feedback: string;
  improved_answer: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface MockTest {
  id: number;
  title: string;
  description?: string;
  total_questions: number;
  time_limit_minutes?: number;
  questions: MockTestQuestion[];
}

export interface MockTestQuestion {
  id: number;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

export interface MockTestResult {
  attempt_id: number;
  score: number;
  percentage: number;
  total_points: number;
  earned_points: number;
  answers: {
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation?: string;
  }[];
  weak_topics: string[];
}

export interface WeakTopic {
  id: number;
  topic: string;
  subject?: string;
  miss_count: number;
  last_seen_at: string;
}

// Healthcare types
export interface WorkoutPlan {
  id: number;
  title: string;
  goal: string;
  fitness_level: string;
  days_per_week: number;
  time_per_session_minutes: number;
  plan_content: {
    description: string;
    weekly_schedule: {
      day: string;
      focus: string;
      exercises: {
        name: string;
        sets?: number;
        reps?: string;
        duration_minutes?: number;
      }[];
    }[];
  };
  is_active: boolean;
}

export interface NutritionPlan {
  id: number;
  title: string;
  goal: string;
  diet_type?: string;
  meals_per_day: number;
  plan_content: {
    description: string;
    daily_plans: {
      day: string;
      meals: {
        meal_type: string;
        items: {
          name: string;
          portion: string;
        }[];
      }[];
    }[];
  };
  is_active: boolean;
}

export interface SymptomCheck {
  id: number;
  symptoms: string[];
  ai_guidance?: string;
  self_care_suggestions?: string[];
  red_flags?: string[];
  disclaimer: string;
  created_at: string;
}

// Sustainability types
export interface SustainabilityLog {
  id: number;
  action_type: string;
  category: string;
  quantity?: number;
  unit?: string;
  co2_saved_kg?: number;
  notes?: string;
  logged_at: string;
}

export interface ImpactSummary {
  total_actions: number;
  co2_saved_kg: number;
  waste_diverted_kg: number;
  water_saved_liters: number;
  energy_saved_kwh: number;
  breakdown_by_category: Record<string, { count: number; co2_saved: number }>;
}

export interface EcoCoachTip {
  category: string;
  tip: string;
  impact: string;
  difficulty: string;
}

export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  score: number;
  rank: number;
}

// Accessibility types
export interface TextTransformResult {
  original_text: string;
  transformed_text: string;
  word_count_original: number;
  word_count_transformed: number;
}

export interface SimplifyResult extends TextTransformResult {
  key_points: string[];
  reading_level: string;
}

export interface TranslateResult extends TextTransformResult {
  detected_source_language?: string;
  target_language: string;
}

export interface SummarizeResult extends TextTransformResult {
  summary: string;
  key_takeaways: string[];
  compression_ratio: number;
  reading_time_saved_minutes: number;
}

// Agent types
export interface AgentResult {
  action: string;
  summary: string;
  recommendations: {
    title: string;
    description: string;
    link?: string;
  }[];
  follow_up_prompts: string[];
}

// Recommendation types
export interface Recommendation {
  id: number;
  title: string;
  description: string;
  module: string;
  priority: string;
  status: string;
  reason?: string;
  action_link?: string;
  created_at: string;
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// ML types
export interface DigitRecognitionResult {
  prediction: number;
  confidence: number;
  all_probabilities: Record<string, number>;
}
