import React, { useRef, useEffect, useMemo } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { timeToMinutes } from '@/utils/conflictDetection';
import { computeOverlapLayout } from '@/utils/overlapLayout';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * WeekView - Google Calendar-style 7-day weekly view.
 *
 * Architecture:
 *   - Sticky day headers inside the scroll container (fixes column alignment)
 *   - Full 24-hour grid at 60px per hour (1440px total) per day column
 *   - Lessons absolutely positioned within their day column
 *   - Overlapping lessons side-by-side via computeOverlapLayout
 *   - Auto-scrolls to 7 AM on mount
 *
 * @param {Date} props.date - A date within the week to display
 * @param {Array} props.lessons - All lesson objects
 * @param {Array} props.students - All student objects
 * @param {Function} props.onTimeSlotClick - ({date, time}) => void
 * @param {Function} props.onLessonClick - (lesson) => void
 * @param {Function} props.onDragStart - (lesson) => void
 * @param {Function} props.onDrop - (dateStr, timeStr) => void
 * @param {Function} props.onLessonHover - (lesson, student, event) => void
 * @param {Function} props.onLessonHoverMove - (event) => void
 * @param {Function} props.onLessonHoverEnd - () => void
 */

const HOUR_HEIGHT = 60;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;

function WeekView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, onLessonHover, onLessonHoverMove, onLessonHoverEnd }) {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const now = new Date();

  // Auto-scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [date.toISOString().split('T')[0]]);

  const handleDragOver = (e) => e.preventDefault();

  // Click empty area in a day column → schedule lesson
  const handleColumnClick = (e, day) => {
    const dateStr = day.toISOString().split('T')[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSlotClick({ date: dateStr, time: timeStr });
  };

  // Drop on a day column → reschedule lesson
  const handleDropOnColumn = (e, day) => {
    e.preventDefault();
    const dateStr = day.toISOString().split('T')[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onDrop(dateStr, timeStr);
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>

        {/* Sticky Day Headers — inside scroll container to fix column alignment */}
        <div className="flex sticky top-0 z-20 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 min-w-[600px]">
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900" />
          {days.map(day => {
            const isToday = day.toDateString() === now.toDateString();
            return (
              <div key={day.toISOString()} className="flex-1 p-2 sm:p-3 text-center border-l border-stone-200 dark:border-stone-700 min-w-[70px]">
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-teal-700 dark:text-teal-400' : 'text-stone-900 dark:text-stone-100'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex relative min-w-[600px]" style={{ height: `${TOTAL_HEIGHT}px` }}>

          {/* Time labels column */}
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-xs text-stone-600 dark:text-stone-400 px-1 sm:px-2 leading-none">
                  {formatTime12Hour(`${hour.toString().padStart(2, '0')}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dayDateStr = day.toISOString().split('T')[0];
            const isDayToday = dayDateStr === now.toISOString().split('T')[0];

            const dayLessons = lessons
              .filter(l => l.date === dayDateStr)
              .sort((a, b) => a.time.localeCompare(b.time));

            const overlapLayout = computeOverlapLayout(dayLessons);

            return (
              <div
                key={day.toISOString()}
                className="flex-1 relative border-l border-stone-200 dark:border-stone-700 min-w-[70px] cursor-pointer"
                onClick={(e) => handleColumnClick(e, day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, day)}
              >
                {/* Hour gridlines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-stone-200 dark:border-stone-700 pointer-events-none"
                    style={{ top: `${hour * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour gridlines */}
                {hours.map(hour => (
                  <div
                    key={`half-${hour}`}
                    className="absolute left-0 right-0 border-b border-stone-100 dark:border-stone-800 pointer-events-none"
                    style={{ top: `${hour * HOUR_HEIGHT + 30}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isDayToday && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${now.getHours() * HOUR_HEIGHT + now.getMinutes()}px` }}
                  >
                    <div className="border-t-2 border-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1"></div>
                    </div>
                  </div>
                )}

                {/* Lesson blocks */}
                {dayLessons.map(lesson => {
                  const student = students.find(s => s.id === lesson.studentId);
                  const layout = overlapLayout.get(lesson.id) || { columnIndex: 0, totalColumns: 1 };
                  const startMin = timeToMinutes(lesson.time);
                  const duration = lesson.duration || 30;

                  return (
                    <div
                      key={lesson.id}
                      className="absolute z-10 px-0.5"
                      style={{
                        top: `${startMin}px`,
                        height: `${duration}px`,
                        left: `${(layout.columnIndex / layout.totalColumns) * 100}%`,
                        width: `${(1 / layout.totalColumns) * 100}%`,
                      }}
                    >
                      <LessonBlock
                        lesson={lesson}
                        student={student}
                        onClick={() => onLessonClick(lesson)}
                        onDragStart={() => onDragStart(lesson)}
                        onMouseEnter={(e) => onLessonHover(lesson, student, e)}
                        onMouseMove={onLessonHoverMove}
                        onMouseLeave={onLessonHoverEnd}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
