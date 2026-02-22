import React from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * DayView - Renders a single day's schedule as a 24-hour vertical time grid.
 * Supports 15-minute interval slots, drag-and-drop lesson rescheduling,
 * click-to-add on empty slots, and a current-time indicator for today.
 *
 * @param {Object} props
 * @param {Date} props.date - The date to display
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Array} props.students - Array of student objects
 * @param {Function} props.onTimeSlotClick - Called when an empty time slot is clicked
 * @param {Function} props.onLessonClick - Called when a lesson block is clicked
 * @param {Function} props.onDragStart - Called when a lesson drag begins
 * @param {Function} props.onDrop - Called when a lesson is dropped on a time slot
 * @param {Object|null} props.hoveredLesson - Currently hovered lesson data for tooltip
 * @param {Function} props.setHoveredLesson - Sets the hovered lesson state
 */
function DayView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, hoveredLesson, setHoveredLesson }) {
      const hours = Array.from({ length: 24 }, (_, i) => i); // All 24 hours
      const dateStr = date.toISOString().split('T')[0];
      const now = new Date();
      const isToday = dateStr === now.toISOString().split('T')[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const getLessonsForHour = (hour) => {
        return lessons.filter(l => {
          if (l.date !== dateStr) return false;
          const lessonHour = parseInt(l.time.split(':')[0]);
          return lessonHour === hour;
        }).sort((a, b) => a.time.localeCompare(b.time)); // FIX: Sort by time
      };

      const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleDropOnSlot = (e, hour, quarter) => {
        e.preventDefault();
        const minutes = quarter * 15;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onDrop(dateStr, timeStr);
      };

      return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden relative">
          {hours.map(hour => {
            const hourLessons = getLessonsForHour(hour);
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const isCurrentHour = isToday && currentHour === hour;

            return (
              <div key={hour} className="flex border-b border-stone-100 dark:border-stone-700 last:border-b-0 min-h-[60px] sm:min-h-[80px] relative">
                {/* Current time indicator */}
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                    style={{ top: `${(currentMinute / 60) * 80}px` }}
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
                  </div>
                )}

                <div className="w-14 sm:w-20 flex-shrink-0 p-2 sm:p-3 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700">
                  <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                    {formatTime12Hour(timeStr)}
                  </span>
                </div>

                {/* Divided into 4 quarters for 15-min intervals */}
                <div className="flex-1 flex flex-col">
                  {[0, 1, 2, 3].map(quarter => {
                    const quarterMinutes = quarter * 15;
                    const quarterTime = `${hour.toString().padStart(2, '0')}:${quarterMinutes.toString().padStart(2, '0')}`;

                    // Find lessons that start in this quarter
                    const quarterLessons = hourLessons.filter(l => l.time === quarterTime);

                    return (
                      <div
                        key={quarter}
                        className="flex-1 p-2 relative"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnSlot(e, hour, quarter)}
                        style={{ minHeight: '20px' }}
                      >
                        {quarterLessons.length === 0 ? (
                          <button
                            onClick={() => onTimeSlotClick({ date: dateStr, time: quarterTime })}
                            className="w-full h-full hover:bg-teal-50 rounded transition-colors absolute inset-0"
                          />
                        ) : (
                          <div className="space-y-1">
                            {quarterLessons.map(lesson => (
                              <LessonBlock
                                key={lesson.id}
                                lesson={lesson}
                                student={students.find(s => s.id === lesson.studentId)}
                                onClick={() => onLessonClick(lesson)}
                                onDragStart={() => onDragStart(lesson)}
                                onHover={(e) => setHoveredLesson({
                                  lesson,
                                  student: students.find(s => s.id === lesson.studentId),
                                  x: e.clientX,
                                  y: e.clientY
                                })}
                                onHoverEnd={() => setHoveredLesson(null)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

export default DayView;
