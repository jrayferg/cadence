import React, { useState, useEffect } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { generateRecurringDates } from '@/utils/recurringDates';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, X } from '@/components/icons';
import DayView from '@/features/calendar/DayView';
import WeekView from '@/features/calendar/WeekView';
import MonthView from '@/features/calendar/MonthView';
import YearView from '@/features/calendar/YearView';
import ScheduleListView from '@/features/calendar/ScheduleListView';
import AddLessonModal from '@/features/calendar/AddLessonModal';
import LessonDetailModal from '@/features/calendar/LessonDetailModal';
import RescheduleModal from '@/features/calendar/RescheduleModal';

/**
 * CalendarView - The main calendar container component that orchestrates
 * all calendar sub-views (Day, Week, Month, Year, Schedule list).
 * Manages view switching, date navigation, keyboard shortcuts, search
 * filtering, drag-and-drop, print/export, and modals for adding,
 * viewing, and rescheduling lessons.
 *
 * @param {Object} props
 * @param {Object} props.user - Current user object (includes lessonTypes, businessName)
 * @param {Array} props.students - Array of student objects
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Function} props.setLessons - State setter for lessons
 * @param {Function} props.setStudents - State setter for students
 */
function CalendarView({ user, students, lessons, setLessons, setStudents }) {
      const [view, setView] = useState('week'); // 'day', 'week', 'month', 'schedule'
      const [currentDate, setCurrentDate] = useState(new Date());
      const [showAddLesson, setShowAddLesson] = useState(null); // {date, time}
      const [selectedLesson, setSelectedLesson] = useState(null);
      const [searchQuery, setSearchQuery] = useState('');
      const [showRescheduleModal, setShowRescheduleModal] = useState(null);
      const [draggedLesson, setDraggedLesson] = useState(null);
      const [hoveredLesson, setHoveredLesson] = useState(null);

      // Keyboard shortcuts visibility - show by default on first visit
      const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(() => {
        const saved = window.localStorage.getItem('cadence_show_keyboard_shortcuts');
        return saved === null ? true : saved === 'true'; // Default to true on first visit
      });

      // Save keyboard shortcuts visibility to localStorage
      useEffect(() => {
        window.localStorage.setItem('cadence_show_keyboard_shortcuts', showKeyboardShortcuts.toString());
      }, [showKeyboardShortcuts]);

      // Keyboard navigation
      useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

          const newDate = new Date(currentDate);

          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (view === 'day') newDate.setDate(newDate.getDate() - 1);
            if (view === 'week') newDate.setDate(newDate.getDate() - 7);
            if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
            if (view === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (view === 'day') newDate.setDate(newDate.getDate() + 1);
            if (view === 'week') newDate.setDate(newDate.getDate() + 7);
            if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
            if (view === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
          } else if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            setCurrentDate(new Date());
          } else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            setView('day');
          } else if (e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            setView('week');
          } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            setView('month');
          } else if (e.key === 'y' || e.key === 'Y') {
            e.preventDefault();
            setView('year');
          } else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setView('schedule');
          } else if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
            handlePrint();
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [currentDate, view]);

      // Print calendar
      const handlePrint = () => {
        window.print();
      };

      // Export calendar as text
      const handleExport = () => {
        let exportText = `${user.businessName || 'Music Studio'} - Calendar\n`;
        exportText += `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n`;

        const sortedLessons = [...lessons].sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time);
          return a.date.localeCompare(b.date);
        });

        sortedLessons.forEach(lesson => {
          const student = students.find(s => s.id === lesson.studentId);
          const date = new Date(lesson.date + 'T00:00:00');
          exportText += `${date.toLocaleDateString()} - ${formatTime12Hour(lesson.time)} - ${student?.name} - ${lesson.lessonType} (${lesson.status})\n`;
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      };

      // Handle drag and drop
      const handleDragStart = (lesson) => {
        setDraggedLesson(lesson);
      };

      const handleDrop = (date, time) => {
        if (!draggedLesson) return;

        const updatedLesson = {
          ...draggedLesson,
          date: date,
          time: time || draggedLesson.time
        };

        setLessons(lessons.map(l => l.id === draggedLesson.id ? updatedLesson : l));
        setDraggedLesson(null);
      };

      // Filter lessons by search
      const filteredLessons = lessons.filter(lesson => {
        if (!searchQuery) return true;
        const student = students.find(s => s.id === lesson.studentId);
        const searchLower = searchQuery.toLowerCase();
        return (
          student?.name.toLowerCase().includes(searchLower) ||
          lesson.lessonType.toLowerCase().includes(searchLower) ||
          lesson.date.includes(searchQuery)
        );
      });

      return (
        <div className="animate-fade-in space-y-4 sm:space-y-6">
          {/* Calendar Header - Row 1: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Calendar</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons or students..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full sm:w-80 transition-colors"
              />
              <svg className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Calendar Header - Row 2: Schedule Lesson + Navigation + Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Left: Schedule Lesson Button */}
            <button
              onClick={() => setShowAddLesson({ date: currentDate.toISOString().split('T')[0], time: '07:00' })}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Schedule Lesson</span>
              <span className="sm:hidden">Schedule</span>
            </button>

            {/* Center: Date Navigation - Hidden in Schedule view */}
            {view !== 'schedule' && (
              <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center order-last sm:order-none w-full sm:w-auto">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 sm:px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors text-sm font-medium"
                  title="Today (T)"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
                    if (view === 'week') newDate.setDate(newDate.getDate() - 7);
                    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
                    if (view === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  title="Previous (←)"
                >
                  <ChevronLeft className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                </button>
                <span className="px-2 sm:px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg font-medium text-stone-900 dark:text-stone-100 min-w-[120px] sm:min-w-[200px] text-center transition-colors text-xs sm:text-base">
                  {view === 'month'
                    ? currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : view === 'year'
                    ? currentDate.getFullYear()
                    : currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </span>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
                    if (view === 'week') newDate.setDate(newDate.getDate() + 7);
                    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
                    if (view === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  title="Next (→)"
                >
                  <ChevronRight className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                </button>
              </div>
            )}

            {/* Right: View Dropdown + Print/Export */}
            <div className="flex items-center gap-2 ml-auto">
              {/* View Dropdown */}
              <div className="relative">
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                  className="appearance-none px-3 sm:px-4 py-2 pr-8 sm:pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="schedule">List</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Print (P)"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Export"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Help - Hidden on mobile */}
          {showKeyboardShortcuts && (
            <div className="hidden lg:flex bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 no-print items-center justify-between">
              <div>
                <strong>Keyboard Shortcuts:</strong> ← → Navigate | T Today | D Day | W Week | M Month | Y Year | S Schedule | P Print
              </div>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="ml-4 p-1 hover:bg-amber-100 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-amber-700" />
              </button>
            </div>
          )}

          {/* Print-Only Header */}
          <div className="calendar-print-header" style={{ display: 'none' }}>
            <div className="print-header">
              <div className="print-title">{user.businessName || 'Music Studio'} - Calendar</div>
              <div className="print-date">
                {view === 'month'
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                } - {view.charAt(0).toUpperCase() + view.slice(1)} View
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
          {view === 'day' && (
            <DayView
              date={currentDate}
              lessons={filteredLessons}
              students={students}
              onTimeSlotClick={setShowAddLesson}
              onLessonClick={setSelectedLesson}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              hoveredLesson={hoveredLesson}
              setHoveredLesson={setHoveredLesson}
            />
          )}
          {view === 'week' && (
            <WeekView
              date={currentDate}
              lessons={filteredLessons}
              students={students}
              onTimeSlotClick={setShowAddLesson}
              onLessonClick={setSelectedLesson}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              hoveredLesson={hoveredLesson}
              setHoveredLesson={setHoveredLesson}
            />
          )}
          {view === 'month' && (
            <MonthView
              date={currentDate}
              lessons={filteredLessons}
              students={students}
              onLessonClick={setSelectedLesson}
              user={user}
              setLessons={setLessons}
              setStudents={setStudents}
            />
          )}
          {view === 'year' && (
            <YearView
              date={currentDate}
              lessons={filteredLessons}
              onDateClick={(newDate) => {
                setCurrentDate(newDate);
                setView('month');
              }}
            />
          )}
          </div>
          {view === 'schedule' && (
            <ScheduleListView
              user={user}
              students={students}
              lessons={filteredLessons}
              setLessons={setLessons}
              setSelectedLesson={setSelectedLesson}
              setShowRescheduleModal={setShowRescheduleModal}
            />
          )}

          {/* Hover Preview */}
          {hoveredLesson && (
            <div
              className="fixed z-40 bg-stone-900 text-white p-4 rounded-lg shadow-2xl max-w-xs"
              style={{
                left: hoveredLesson.x + 10,
                top: hoveredLesson.y + 10,
                pointerEvents: 'none'
              }}
            >
              <div className="font-bold mb-1">{hoveredLesson.student?.name}</div>
              <div className="text-sm text-stone-300">{hoveredLesson.lesson.lessonType}</div>
              <div className="text-sm text-stone-300">{formatTime12Hour(hoveredLesson.lesson.time)} • {hoveredLesson.lesson.duration} min</div>
              <div className="text-sm text-stone-400 mt-1">${hoveredLesson.lesson.rate}</div>
              {hoveredLesson.lesson.sessionNumber && (
                <div className="text-xs text-amber-300 mt-1">
                  Session {hoveredLesson.lesson.sessionNumber}/{hoveredLesson.lesson.totalSessions}
                </div>
              )}
            </div>
          )}

          {/* Add Lesson Modal */}
          {showAddLesson && (
            <AddLessonModal
              slot={showAddLesson}
              students={students}
              lessonTypes={user.lessonTypes}
              onClose={() => setShowAddLesson(null)}
              onSave={(lesson) => {
                if (lesson.recurring) {
                  const dates = generateRecurringDates({
                    startDate: lesson.date,
                    frequency: lesson.recurringFrequency,
                    repeatDays: lesson.repeatDays,
                    endType: lesson.endType,
                    endDate: lesson.endDate,
                    count: lesson.recurringCount
                  });
                  const newLessons = dates.map((d, i) => ({
                    ...lesson,
                    id: Date.now() + i,
                    date: d,
                    recurring: undefined,
                    recurringCount: undefined,
                    recurringFrequency: undefined,
                    repeatDays: undefined,
                    endType: undefined,
                    endDate: undefined,
                    status: 'scheduled',
                    sessionNumber: i + 1,
                    totalSessions: dates.length
                  }));
                  setLessons([...lessons, ...newLessons]);
                } else {
                  setLessons([...lessons, { ...lesson, id: Date.now(), status: 'scheduled' }]);
                }
                setShowAddLesson(null);
              }}
              setStudents={setStudents}
            />
          )}

          {/* Lesson Detail Modal */}
          {selectedLesson && (
            <LessonDetailModal
              lesson={selectedLesson}
              student={students.find(s => s.id === selectedLesson.studentId)}
              lessonType={user.lessonTypes.find(t => t.name === selectedLesson.lessonType)}
              onClose={() => setSelectedLesson(null)}
              onUpdate={(updated) => {
                setLessons(lessons.map(l => l.id === updated.id ? updated : l));
                setSelectedLesson(null);
              }}
              onDelete={() => {
                if (confirm('Delete this lesson?')) {
                  setLessons(lessons.filter(l => l.id !== selectedLesson.id));
                  setSelectedLesson(null);
                }
              }}
              onReschedule={() => {
                setShowRescheduleModal(selectedLesson);
                setSelectedLesson(null);
              }}
            />
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && (
            <RescheduleModal
              lesson={showRescheduleModal}
              onClose={() => setShowRescheduleModal(null)}
              onSave={(updated) => {
                setLessons(lessons.map(l => l.id === updated.id ? updated : l));
                setShowRescheduleModal(null);
              }}
            />
          )}
        </div>
      );
    }

export default CalendarView;
