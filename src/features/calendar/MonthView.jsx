import React, { useState } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { generateRecurringDates } from '@/utils/recurringDates';
import { X } from '@/components/icons';
import AddLessonModal from '@/features/calendar/AddLessonModal';

/**
 * MonthView - Renders a full calendar month grid with lesson indicators.
 * Supports clicking empty days to schedule lessons, a day-popup for days
 * with many lessons, and an embedded AddLessonModal with its own save logic
 * (including recurring lesson generation).
 *
 * @param {Object} props
 * @param {Date} props.date - A date within the month to display
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Array} props.students - Array of student objects
 * @param {Function} props.onLessonClick - Called when a lesson is clicked
 * @param {Object} props.user - Current user object (for lesson types)
 * @param {Function} props.setLessons - State setter for lessons
 * @param {Function} props.setStudents - State setter for students
 */
function MonthView({ date, lessons, students, onLessonClick, user, setLessons, setStudents }) {
      const [showDayPopup, setShowDayPopup] = useState(null); // {day, lessons}
      const [showAddLesson, setShowAddLesson] = useState(null); // {date, time}

      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      const days = [];
      for (let i = 0; i < startDay; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);

      const getLessonsForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return lessons
          .filter(l => l.date === dateStr)
          .sort((a, b) => a.time.localeCompare(b.time));
      };

      const getLessonColor = (lesson) => {
        if (lesson.status === 'completed') return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40';
        if (lesson.status === 'cancelled') return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40';
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40';
      };

      const handleDayClick = (day) => {
        const dayLessons = getLessonsForDay(day);
        if (dayLessons.length === 0) {
          // Open schedule lesson modal with 7:00 AM default
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          setShowAddLesson({ date: dateStr, time: '07:00' });
        }
      };

      return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-stone-50 dark:bg-stone-700 border-b border-stone-200 dark:border-stone-700">
            {[['Sun','S'], ['Mon','M'], ['Tue','T'], ['Wed','W'], ['Thu','T'], ['Fri','F'], ['Sat','S']].map(([dayName, shortName], idx) => (
              <div
                key={dayName}
                className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 ${idx < 6 ? 'border-r border-stone-200 dark:border-stone-600' : ''}`}
              >
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{shortName}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayLessons = getLessonsForDay(day);
              const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const columnIndex = idx % 7;
              const maxVisible = window.innerWidth < 640 ? 1 : 3;

              return (
                <div
                  key={idx}
                  className={`min-h-[60px] sm:min-h-[120px] p-1 sm:p-2 border-b border-stone-200 dark:border-stone-700 ${columnIndex < 6 ? 'border-r border-stone-200 dark:border-stone-700' : ''} relative`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 ${isToday ? 'text-teal-700 dark:text-teal-400 font-bold' : 'text-stone-700 dark:text-stone-300'}`}
                        onClick={() => handleDayClick(day)}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {/* On mobile: show dots; on desktop: show full lesson text */}
                        {dayLessons.slice(0, maxVisible).map(lesson => (
                          <button
                            key={lesson.id}
                            onClick={() => onLessonClick(lesson)}
                            className={`w-full text-left rounded text-xs transition-colors truncate ${getLessonColor(lesson)}`}
                          >
                            <span className="hidden sm:inline px-2 py-1 block">{formatTime12Hour(lesson.time)} - {students.find(s => s.id === lesson.studentId)?.name}</span>
                            <span className="sm:hidden block w-2 h-2 rounded-full mx-auto" style={{background: lesson.status === 'completed' ? '#16a34a' : lesson.status === 'cancelled' ? '#dc2626' : '#2563eb'}}></span>
                          </button>
                        ))}
                        {dayLessons.length > maxVisible && (
                          <button
                            onClick={() => setShowDayPopup({ day, lessons: dayLessons })}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium px-1 sm:px-2"
                          >
                            +{dayLessons.length - maxVisible}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day Lessons Popup */}
          {showDayPopup && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={() => setShowDayPopup(null)}
            >
              <div
                className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {date.toLocaleDateString('en-US', { month: 'long' })} {showDayPopup.day}, {year}
                  </h3>
                  <button
                    onClick={() => setShowDayPopup(null)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  {showDayPopup.lessons.map(lesson => {
                    const student = students.find(s => s.id === lesson.studentId);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setShowDayPopup(null);
                          onLessonClick(lesson);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${getLessonColor(lesson)}`}
                      >
                        <div className="font-medium">{formatTime12Hour(lesson.time)} - {student?.name}</div>
                        <div className="text-xs mt-1 opacity-75">{lesson.lessonType} • {lesson.duration} min • ${lesson.rate}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
        </div>
      );
    }

export default MonthView;
