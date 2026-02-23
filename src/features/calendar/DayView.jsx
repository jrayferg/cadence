import React, { useRef, useEffect, useMemo } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { timeToMinutes } from '@/utils/conflictDetection';
import { computeOverlapLayout } from '@/utils/overlapLayout';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * DayView - Google Calendar-style single-day view.
 *
 * Architecture:
 *   - Full 24-hour grid at 60px per hour (1440px total)
 *   - Lessons are absolutely positioned: top = minutes from midnight,
 *     height = duration in minutes (1px per minute)
 *   - Overlapping lessons laid out side-by-side via computeOverlapLayout
 *   - Auto-scrolls to 7 AM on mount
 *   - Clicking empty space opens Schedule Lesson (snapped to 15-min)
 *
 * @param {Date} props.date - The day to display
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

function DayView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, onLessonHover, onLessonHoverMove, onLessonHoverEnd }) {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateStr = date.toISOString().split('T')[0];
  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];

  // Auto-scroll to 7 AM on mount and when date changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [dateStr]);

  // Filter and sort lessons for this day
  const dayLessons = useMemo(() =>
    lessons
      .filter(l => l.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [lessons, dateStr]
  );

  // Compute overlap layout for side-by-side display
  const overlapLayout = useMemo(
    () => computeOverlapLayout(dayLessons),
    [dayLessons]
  );

  // Click empty area → schedule lesson (snap to 15-min)
  const handleColumnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSlotClick({ date: dateStr, time: timeStr });
  };

  const handleDragOver = (e) => e.preventDefault();

  // Drop → reschedule lesson (snap to 15-min)
  const handleDrop = (e) => {
    e.preventDefault();
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
        <div className="flex relative" style={{ height: `${TOTAL_HEIGHT}px` }}>

          {/* Time labels column */}
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 px-1 sm:px-2 leading-none">
                  {formatTime12Hour(`${hour.toString().padStart(2, '0')}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            className="flex-1 relative cursor-pointer"
            onClick={handleColumnClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Hour gridlines */}
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-stone-200 dark:border-stone-700 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT}px` }}
              />
            ))}

            {/* Half-hour gridlines (subtle) */}
            {hours.map(hour => (
              <div
                key={`half-${hour}`}
                className="absolute left-0 right-0 border-b border-stone-100 dark:border-stone-800 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT + 30}px` }}
              />
            ))}

            {/* Current time indicator */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${now.getHours() * HOUR_HEIGHT + now.getMinutes()}px` }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 flex-shrink-0"></div>
                  <div className="flex-1 border-t-2 border-red-500"></div>
                </div>
              </div>
            )}

            {/* Lesson blocks (absolutely positioned) */}
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
        </div>
      </div>
    </div>
  );
}

export default DayView;
