/**
 * Sidebar.jsx
 * Left navigation panel with Calendar, Students, and Billing links.
 *
 * Two modes:
 * - Desktop (lg+): Always visible as a fixed left column
 * - Mobile/Tablet: Hidden by default, slides in as a drawer overlay
 *   when the hamburger menu in the Header is tapped
 */

import { Calendar, Users, DollarSign, Music, X } from '@/components/icons';

function Sidebar({ currentView, setCurrentView, darkMode, sidebarOpen, setSidebarOpen }) {
  const navItems = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'billing', label: 'Billing', icon: DollarSign },
  ];

  const navContent = (
    <div className="space-y-2">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => {
            setCurrentView(item.id);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === item.id
              ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-48 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 min-h-screen p-4 transition-colors flex-shrink-0">
        {navContent}
      </nav>

      {/* Mobile/Tablet drawer overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <nav className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 p-6 shadow-xl animate-slide-in-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-700 dark:bg-teal-600 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-stone-900 dark:text-stone-100">Cadence</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
              </button>
            </div>
            {navContent}
          </nav>
        </div>
      )}
    </>
  );
}

export default Sidebar;
