import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from './hooks/useLenis';
import { siteConfig } from './config';

// Layout
import Navbar from './components/layout/Navbar';
import AppShell from './components/layout/AppShell';

// Education
import EducationDashboard from './pages/education/EducationDashboard';
import StudyMaterials from './pages/education/StudyMaterials';
import Flashcards from './pages/education/Flashcards';
import MockTests from './pages/education/MockTests';
import WeakTopics from './pages/education/WeakTopics';
import InterviewPractice from './pages/education/InterviewPractice';
import DigitRecognizer from './pages/education/DigitRecognizer';

import './App.css';

gsap.registerPlugin(ScrollTrigger);

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
        <Route
          path="/"
          element={
            <Navigate to="/education" replace />
          }
        />
        <Route
          path="/education"
          element={
            <AppShell>
              <EducationDashboard />
            </AppShell>
          }
        />
        <Route
          path="/education/materials"
          element={
            <AppShell>
              <StudyMaterials />
            </AppShell>
          }
        />
        <Route
          path="/education/flashcards"
          element={
            <AppShell>
              <Flashcards />
            </AppShell>
          }
        />
        <Route
          path="/education/mock-tests"
          element={
            <AppShell>
              <MockTests />
            </AppShell>
          }
        />
        <Route
          path="/education/weak-topics"
          element={
            <AppShell>
              <WeakTopics />
            </AppShell>
          }
        />
        <Route
          path="/education/interview"
          element={
            <AppShell>
              <InterviewPractice />
            </AppShell>
          }
        />
        <Route
          path="/education/digit-recognizer"
          element={
            <AppShell>
              <DigitRecognizer />
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/education" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
