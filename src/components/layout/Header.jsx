/**
 * Header.jsx
 * The top bar that appears on every page once logged in.
 *
 * Contains:
 * - Hamburger menu button (mobile/tablet only)
 * - Cadence logo and name
 * - Dark mode toggle with tooltip
 * - Studio/user name
 * - Logout button
 */

import { useState, useRef } from 'react';
import { Music, Moon, Sun, Menu } from '@/components/icons';

function Header({ user, setUser, setSetupComplete, darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
  const [showModeTooltip, setShowModeTooltip] = useState(false);
  const hoverTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const handleToggleMouseEnter = () => {
    clearTimeout(hideTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowModeTooltip(true);
      hideTimerRef.current = setTimeout(() => setShowModeTooltip(false), 3000);
    }, 1000);
  };

  const handleToggleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(hideTimerRef.current);
    setShowModeTooltip(false);
  };

  return (
    <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-3 lg:px-8 lg:py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu - mobile/tablet only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-stone-700 dark:text-stone-300" />
          </button>
          <div className="w-10 h-10 bg-teal-700 dark:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 transition-colors">Cadence</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 transition-colors hidden sm:block">Music Lesson Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark Mode Toggle */}
          <div className="relative">
            <button
              onClick={() => setDarkMode(!darkMode)}
              onMouseEnter={handleToggleMouseEnter}
              onMouseLeave={handleToggleMouseLeave}
              className="p-2 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              ) : (
                <Moon className="w-5 h-5 text-stone-700" />
              )}
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 z-50 ${showModeTooltip ? 'opacity-100' : 'opacity-0'}`}>
              {darkMode ? 'Day Mode' : 'Night Mode'}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-stone-900 dark:border-b-stone-100"></div>
            </div>
          </div>

          <span className="text-stone-700 dark:text-stone-300 font-medium transition-colors hidden sm:inline">{user.businessName || user.name}</span>
          <button
            onClick={() => {
              setUser(null);
              setSetupComplete(false);
            }}
            className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
