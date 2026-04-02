import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from './hooks/useLenis';
import { siteConfig } from './config';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import AppShell from './components/layout/AppShell';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard
import Dashboard from './pages/Dashboard';

// Education
import EducationDashboard from './pages/education/EducationDashboard';
import StudyMaterials from './pages/education/StudyMaterials';
import Flashcards from './pages/education/Flashcards';
import MockTests from './pages/education/MockTests';
import WeakTopics from './pages/education/WeakTopics';
import InterviewPractice from './pages/education/InterviewPractice';
import DigitRecognizer from './pages/education/DigitRecognizer';

// Healthcare
import HealthcareDashboard from './pages/healthcare/HealthcareDashboard';
import WorkoutPlanner from './pages/healthcare/WorkoutPlanner';
import NutritionPlanner from './pages/healthcare/NutritionPlanner';
import SymptomChecker from './pages/healthcare/SymptomChecker';
import WellnessHistory from './pages/healthcare/WellnessHistory';

// Sustainability
import SustainabilityDashboard from './pages/sustainability/SustainabilityDashboard';
import EcoTracker from './pages/sustainability/EcoTracker';
import EcoCoach from './pages/sustainability/EcoCoach';
import EcoTrivia from './pages/sustainability/EcoTrivia';
import RecyclingGame from './pages/sustainability/RecyclingGame';
import Leaderboard from './pages/sustainability/Leaderboard';

// Accessibility
import AccessibilityDashboard from './pages/accessibility/AccessibilityDashboard';
import TextSimplifier from './pages/accessibility/TextSimplifier';
import Translator from './pages/accessibility/Translator';
import Summarizer from './pages/accessibility/Summarizer';
import ReadAssist from './pages/accessibility/ReadAssist';

// Shared
import Notifications from './pages/Notifications';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';

import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kaleo-terracotta"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  useLenis();

  useEffect(() => {
    if (siteConfig.language) {
      document.documentElement.lang = siteConfig.language;
    }

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('load', handleLoad);
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(refreshTimeout);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Education Routes */}
        <Route
          path="/education"
          element={
            <ProtectedRoute>
              <AppShell>
                <EducationDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/materials"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudyMaterials />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/flashcards"
          element={
            <ProtectedRoute>
              <AppShell>
                <Flashcards />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/mock-tests"
          element={
            <ProtectedRoute>
              <AppShell>
                <MockTests />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/weak-topics"
          element={
            <ProtectedRoute>
              <AppShell>
                <WeakTopics />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/interview"
          element={
            <ProtectedRoute>
              <AppShell>
                <InterviewPractice />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/digit-recognizer"
          element={
            <ProtectedRoute>
              <AppShell>
                <DigitRecognizer />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Healthcare Routes */}
        <Route
          path="/healthcare"
          element={
            <ProtectedRoute>
              <AppShell>
                <HealthcareDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare/workout"
          element={
            <ProtectedRoute>
              <AppShell>
                <WorkoutPlanner />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare/nutrition"
          element={
            <ProtectedRoute>
              <AppShell>
                <NutritionPlanner />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare/symptoms"
          element={
            <ProtectedRoute>
              <AppShell>
                <SymptomChecker />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare/history"
          element={
            <ProtectedRoute>
              <AppShell>
                <WellnessHistory />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Sustainability Routes */}
        <Route
          path="/sustainability"
          element={
            <ProtectedRoute>
              <AppShell>
                <SustainabilityDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability/tracker"
          element={
            <ProtectedRoute>
              <AppShell>
                <EcoTracker />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability/coach"
          element={
            <ProtectedRoute>
              <AppShell>
                <EcoCoach />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability/trivia"
          element={
            <ProtectedRoute>
              <AppShell>
                <EcoTrivia />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability/recycling-game"
          element={
            <ProtectedRoute>
              <AppShell>
                <RecyclingGame />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability/leaderboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Leaderboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Accessibility Routes */}
        <Route
          path="/accessibility"
          element={
            <ProtectedRoute>
              <AppShell>
                <AccessibilityDashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accessibility/simplify"
          element={
            <ProtectedRoute>
              <AppShell>
                <TextSimplifier />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accessibility/translate"
          element={
            <ProtectedRoute>
              <AppShell>
                <Translator />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accessibility/summarize"
          element={
            <ProtectedRoute>
              <AppShell>
                <Summarizer />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accessibility/read-assist"
          element={
            <ProtectedRoute>
              <AppShell>
                <ReadAssist />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppShell>
                <Notifications />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <AppShell>
                <Recommendations />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <Profile />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
