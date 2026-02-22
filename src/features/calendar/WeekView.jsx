import React from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * WeekView - Renders a 7-day weekly schedule as a time grid with day columns.
 * Supports 15-minute interval slots, drag-and-drop lesson rescheduling,
 * click-to-add on empty slots, and a current-time indicator for today.
 *
 * @param {Object} props
 * @param {Date} props.date - A date within the week to display
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Array} props.students - Array of student objects
 * @param {Function} props.onTimeSlotClick - Called when an empty time slot is clicked
 * @param {Function} props.onLessonClick - Called when a lesson block is clicked
 * @param {Function} props.onDragStart - Called when a lesson drag begins
 * @param {Function} props.onDrop - Called when a lesson is dropped on a time slot
 * @param {Object|null} props.hoveredLesson - Currently hovered lesson data for tooltip
 * @param {Function} props.setHoveredLesson - Sets the hovered lesson state
 */
function WeekView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, hoveredLesson, setHoveredLesson }) {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
      });

      const hours = Array.from({ length: 24 }, (_, i) => i); // All 24 hours

      const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleDropOnSlot = (e, day, hour, quarter) => {
        e.preventDefault();
        const dateStr = day.toISOString().split('T')[0];
        const minutes = quarter * 15;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onDrop(dateStr, timeStr);
      };

      return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="overflow-x-auto">
          {/* Day Headers */}
          <div className="flex border-b border-stone-200 dark:border-stone-700 calendar-grid min-w-[600px]">
            <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900" />
            {days.map(day => (
              <div key={day.toISOString()} className="flex-1 p-2 sm:p-3 text-center border-l border-stone-200 dark:border-stone-700 min-w-[70px]">
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base sm:text-lg font-bold ${
                  day.toDateString() === new Date().toDateString() ? 'text-teal-700 dark:text-teal-400' : 'text-stone-900 dark:text-stone-100'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="overflow-auto max-h-[600px] min-w-[600px]">
            {hours.map(hour => (
              <div key={hour} className="flex border-b border-stone-100 dark:border-stone-700 relative">
                <div className="w-14 sm:w-20 flex-shrink-0 p-1 sm:p-2 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    {formatTime12Hour(`${hour.toString().padStart(2, '0')}:00`)}
                  </span>
                </div>
                {days.map(day => {
                  const dateStr = day.toISOString().split('T')[0];
                  const now = new Date();
                  const isToday = dateStr === now.toISOString().split('T')[0];
                  const isCurrentHour = isToday && now.getHours() === hour;
                  const currentMinute = now.getMinutes();

                  const dayLessons = lessons.filter(l => {
                    if (l.date !== dateStr) return false;
                    const lessonHour = parseInt(l.time.split(':')[0]);
                    return lessonHour === hour;
                  }).sort((a, b) => a.time.localeCompare(b.time));

                  return (
                    <div key={day.toISOString()} className="flex-1 border-l border-stone-200 dark:border-stone-700 relative flex flex-col">
                      {/* Current time indicator for today */}
                      {isCurrentHour && (
                        <div
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                          style={{ top: `${(currentMinute / 60) * 60}px` }}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1"></div>
                        </div>
                      )}

                      {/* Divide into 4 quarters for 15-min intervals */}
                      {[0, 1, 2, 3].map(quarter => {
                        const quarterMinutes = quarter * 15;
                        const quarterTime = `${hour.toString().padStart(2, '0')}:${quarterMinutes.toString().padStart(2, '0')}`;
                        const quarterLessons = dayLessons.filter(l => l.time === quarterTime);

                        return (
                          <div
                            key={quarter}
                            className="flex-1 p-1 relative"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnSlot(e, day, hour, quarter)}
                            style={{ minHeight: '15px' }}
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
                                    compact
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          </div>
        </div>
      );
    }

export default WeekView;
