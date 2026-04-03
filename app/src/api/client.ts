import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(error)
    );
  }

  // Auth
  async login(email: string, password: string) {
    void email;
    void password;
    return {
      access_token: 'demo-access-token',
      token_type: 'bearer',
    };
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    void email;
    void password;
    void firstName;
    void lastName;
    return {
      access_token: 'demo-access-token',
      token_type: 'bearer',
    };
  }

  async getMe() {
    return {
      id: 0,
      email: 'demo@civichub.app',
      first_name: 'Demo',
      last_name: 'User',
      is_active: true,
      created_at: new Date().toISOString(),
      roles: [
        {
          id: 0,
          name: 'student',
          description: 'Demo access role',
        },
      ],
    };
  }

  // Dashboard
  async getDashboardSummary() {
    const response = await this.client.get('/dashboard/summary');
    return response.data;
  }

  // Education
  async getStudyMaterials() {
    const response = await this.client.get('/education/materials');
    return response.data;
  }

  async createStudyMaterial(data: { title: string; content: string; subject?: string }) {
    const response = await this.client.post('/education/materials', data);
    return response.data;
  }

  async getFlashcards(materialId: number) {
    const response = await this.client.get(`/education/materials/${materialId}/flashcards`);
    return response.data;
  }

  async generateFlashcards(materialId: number, count: number = 10) {
    const response = await this.client.post(`/education/materials/${materialId}/flashcards`, {
      study_material_id: materialId,
      count,
    });
    return response.data;
  }

  async getMockTests(materialId: number) {
    const response = await this.client.get(`/education/materials/${materialId}/mock-tests`);
    return response.data;
  }

  async generateMockTest(materialId: number, questionCount: number = 10) {
    const response = await this.client.post(`/education/materials/${materialId}/mock-test`, {
      title: 'Practice Test',
      study_material_id: materialId,
      question_count: questionCount,
      difficulty: 'medium',
    });
    return response.data;
  }

  async submitMockTest(testId: number, answers: { question_id: number; answer: string }[]) {
    const response = await this.client.post(`/education/mock-tests/${testId}/submit`, { answers });
    return response.data;
  }

  async getWeakTopics() {
    const response = await this.client.get('/education/weak-topics');
    return response.data;
  }

  async sendEducationEmail(data: {
    recipient_email: string;
    subject: string;
    content: string;
    email_type: string;
    source_page?: string;
  }) {
    const response = await this.client.post('/email/send', data);
    return response.data;
  }

  // Healthcare
  async createWorkoutPlan(data: {
    goal: string;
    fitness_level: string;
    days_per_week: number;
    time_per_session_minutes: number;
    equipment_available: string[];
    injuries_or_limitations?: string;
  }) {
    const response = await this.client.post('/healthcare/workout-plan', data);
    return response.data;
  }

  async getWorkoutPlans() {
    const response = await this.client.get('/healthcare/workout-plans');
    return response.data;
  }

  async createNutritionPlan(data: {
    goal: string;
    diet_type?: string;
    allergies?: string[];
    meals_per_day: number;
    cooking_time_available: string;
    calorie_target?: number;
  }) {
    const response = await this.client.post('/healthcare/nutrition-plan', data);
    return response.data;
  }

  async getNutritionPlans() {
    const response = await this.client.get('/healthcare/nutrition-plans');
    return response.data;
  }

  async checkSymptoms(symptoms: string[], duration?: string, severity?: string) {
    const response = await this.client.post('/healthcare/symptom-check', {
      symptoms,
      duration,
      severity,
    });
    return response.data;
  }

  // Sustainability
  async logEcoAction(data: {
    action_type: string;
    category: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) {
    const response = await this.client.post('/sustainability/logs', data);
    return response.data;
  }

  async getEcoLogs() {
    const response = await this.client.get('/sustainability/logs');
    return response.data;
  }

  async getImpactSummary(period: string = 'all') {
    const response = await this.client.get(`/sustainability/impact-summary?period=${period}`);
    return response.data;
  }

  async getEcoCoachTips() {
    const response = await this.client.get('/sustainability/eco-coach');
    return response.data;
  }

  async getLeaderboard(category: string = 'overall') {
    const response = await this.client.get(`/sustainability/leaderboard?category=${category}`);
    return response.data;
  }

  // Accessibility
  async simplifyText(text: string, level: string = 'intermediate') {
    const response = await this.client.post('/accessibility/simplify', { text, level });
    return response.data;
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string) {
    const response = await this.client.post('/accessibility/translate', {
      text,
      target_language: targetLanguage,
      source_language: sourceLanguage,
    });
    return response.data;
  }

  async summarizeText(text: string, maxLength: number = 200) {
    const response = await this.client.post('/accessibility/summarize', { text, max_length: maxLength });
    return response.data;
  }

  async getTransformHistory() {
    const response = await this.client.get('/accessibility/history');
    return response.data;
  }

  // Agents
  async runEducationAgent(currentPage?: string, selectedMaterialId?: number) {
    const response = await this.client.post('/agents/education/run', {
      current_page: currentPage,
      selected_material_id: selectedMaterialId,
    });
    return response.data;
  }

  async runWellnessAgent(currentPage?: string) {
    const response = await this.client.post('/agents/wellness/run', {
      current_page: currentPage,
    });
    return response.data;
  }

  async runSustainabilityAgent(currentPage?: string) {
    const response = await this.client.post('/agents/sustainability/run', {
      current_page: currentPage,
    });
    return response.data;
  }

  async startInterview(data: {
    topic: string;
    difficulty?: string;
    question_count?: number;
    study_material_id?: number;
  }) {
    const response = await this.client.post('/education/interview/start', data);
    return response.data;
  }

  async startInterviewSession(data: {
    topic: string;
    difficulty?: string;
    question_count?: number;
    study_material_id?: number;
  }) {
    return this.startInterview(data);
  }

  async submitInterviewAnswer(responseId: number, answer: string) {
    const response = await this.client.post(`/education/interview/${responseId}/answer`, { answer });
    return response.data;
  }

  // Recommendations
  async getRecommendations(module?: string, status: string = 'pending') {
    const params = new URLSearchParams();
    if (module) params.append('module', module);
    params.append('status', status);
    const response = await this.client.get(`/recommendations?${params.toString()}`);
    return response.data;
  }

  async generateRecommendations() {
    const response = await this.client.post('/recommendations/generate');
    return response.data;
  }

  // Notifications
  async getNotifications(unreadOnly: boolean = false) {
    const response = await this.client.get(`/notifications?unread_only=${unreadOnly}`);
    return response.data;
  }

  async markNotificationRead(notificationId: number) {
    const response = await this.client.post(`/notifications/${notificationId}/read`);
    return response.data;
  }

  // ML
  async recognizeDigit(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/ml/digit-recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
