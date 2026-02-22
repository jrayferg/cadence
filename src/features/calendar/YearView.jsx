import React from 'react';

/**
 * YearView - Renders a 12-month overview grid showing lesson counts per month.
 * Clicking a month navigates to the MonthView for that month.
 *
 * @param {Object} props
 * @param {Date} props.date - A date within the year to display
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Function} props.onDateClick - Called with a Date object when a month is clicked
 */
function YearView({ date, lessons, onDateClick }) {
      const year = date.getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i);

      const getDaysInMonth = (month) => {
        return new Date(year, month + 1, 0).getDate();
      };

      const getLessonsForMonth = (month) => {
        return lessons.filter(l => {
          const lessonDate = new Date(l.date + 'T00:00:00');
          return lessonDate.getFullYear() === year && lessonDate.getMonth() === month;
        });
      };

      const handleMonthClick = (month) => {
        const newDate = new Date(year, month, 1);
        onDateClick(newDate);
      };

      return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {months.map(month => {
              const monthLessons = getLessonsForMonth(month);
              const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' });

              return (
                <button
                  key={month}
                  onClick={() => handleMonthClick(month)}
                  className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg border border-stone-200 dark:border-stone-600 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
                >
                  <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">{monthName}</div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">{monthLessons.length} lessons</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{getDaysInMonth(month)} days</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

export default YearView;
