/**
 * App.jsx
 * The root component of Cadence — the "brain" of the app.
 *
 * This file does three things:
 * 1. Manages the top-level state (user, students, lessons, dark mode)
 * 2. Decides which screen to show (login → onboarding → main app)
 * 3. Renders the layout (Header + Sidebar + active page)
 *
 * All the actual features live in the /features/ folder.
 * All the shared UI pieces live in the /components/ folder.
 */

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Layout components
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

// Feature pages
import AuthScreen from '@/features/auth/AuthScreen';
import OnboardingFlow from '@/features/auth/OnboardingFlow';
import CalendarView from '@/features/calendar/CalendarView';
import StudentsView from '@/features/students/StudentsView';
import BillingView from '@/features/billing/BillingView';

function CadenceApp() {
  const [user, setUser] = useLocalStorage('cadence_user', null);
  const [setupComplete, setSetupComplete] = useLocalStorage('cadence_setup_complete', false);
  const [students, setStudents] = useLocalStorage('cadence_students', []);
  const [lessons, setLessons] = useLocalStorage('cadence_lessons', []);
  const [currentView, setCurrentView] = useState('calendar');
  const [darkMode, setDarkMode] = useLocalStorage('cadence_dark_mode', false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide loading spinner when component mounts
  useEffect(() => {
    const loader = document.getElementById('loading');
    if (loader) loader.style.display = 'none';
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // If no user, show auth
  if (!user) {
    return <AuthScreen setUser={setUser} />;
  }

  // If user but setup not complete, show onboarding
  if (!setupComplete) {
    return <OnboardingFlow user={user} setUser={setUser} setSetupComplete={setSetupComplete} setStudents={setStudents} setLessons={setLessons} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors">
      <Header user={user} setUser={setUser} setSetupComplete={setSetupComplete} darkMode={darkMode} setDarkMode={setDarkMode} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'calendar' && (
            <CalendarView
              user={user}
              students={students}
              lessons={lessons}
              setLessons={setLessons}
              setStudents={setStudents}
            />
          )}
          {currentView === 'students' && (
            <StudentsView students={students} lessons={lessons} setStudents={setStudents} user={user} />
          )}
          {currentView === 'billing' && (
            <BillingView
              lessons={lessons}
              students={students}
              setStudents={setStudents}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default CadenceApp;
