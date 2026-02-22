import React, { useState } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { Calendar } from '@/components/icons';

/**
 * ScheduleListView - Displays all lessons in a filterable, grouped list format.
 * Supports filtering by date range and status, with summary stats at the top.
 *
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {Array} props.students - Array of student objects
 * @param {Array} props.lessons - Array of lesson objects
 * @param {Function} props.setLessons - State setter for lessons
 * @param {Function} props.setSelectedLesson - Sets the currently selected lesson for detail view
 * @param {Function} props.setShowRescheduleModal - Opens the reschedule modal for a lesson
 */
function ScheduleListView({ user, students, lessons, setLessons, setSelectedLesson, setShowRescheduleModal }) {
      const [filterStatus, setFilterStatus] = useState('all'); // all, scheduled, completed, cancelled
      const [filterDays, setFilterDays] = useState(30); // 7, 30, 90, all

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter lessons by date range and status
      const filteredLessons = lessons
        .filter(lesson => {
          // Status filter
          if (filterStatus !== 'all' && lesson.status !== filterStatus) return false;

          // Date filter
          const lessonDate = new Date(lesson.date + 'T00:00:00');
          const daysDiff = Math.ceil((lessonDate - today) / (1000 * 60 * 60 * 24));

          if (filterDays === 'all') return true;
          if (filterDays === 'past') return daysDiff < 0;
          return daysDiff >= 0 && daysDiff <= filterDays;
        })
        .sort((a, b) => {
          // Sort by date, then time
          if (a.date === b.date) {
            return a.time.localeCompare(b.time);
          }
          return a.date.localeCompare(b.date);
        });

      // Group lessons by date
      const groupedLessons = filteredLessons.reduce((groups, lesson) => {
        const date = lesson.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(lesson);
        return groups;
      }, {});

      const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      };

      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">View all your lessons in a list format</p>

            <div className="flex gap-2 sm:gap-3">
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(e.target.value === 'all' || e.target.value === 'past' ? e.target.value : parseInt(e.target.value))}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-stone-900 dark:text-stone-100"
              >
                <option value="past">Past Lessons</option>
                <option value="7">Next 7 Days</option>
                <option value="30">Next 30 Days</option>
                <option value="90">Next 90 Days</option>
                <option value="all">All Upcoming</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-stone-900 dark:text-stone-100"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{filteredLessons.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Total Lessons</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                {filteredLessons.filter(l => l.status === 'scheduled').length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-400">Scheduled</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-900 dark:text-green-400">
                {filteredLessons.filter(l => l.status === 'completed').length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-400">Completed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-900 dark:text-red-400">
                {filteredLessons.filter(l => l.status === 'cancelled').length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-400">Cancelled</div>
            </div>
          </div>

          {/* Lessons List */}
          {Object.keys(groupedLessons).length === 0 ? (
            <div className="bg-white dark:bg-stone-800 rounded-xl p-12 border border-stone-200 dark:border-stone-700 text-center">
              <Calendar className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">No lessons found</h3>
              <p className="text-stone-600 dark:text-stone-400">Try adjusting your filters or add some lessons to your calendar.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLessons).map(([date, dayLessons]) => (
                <div key={date} className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                  {/* Date Header */}
                  <div className="bg-stone-50 dark:bg-stone-700 border-b border-stone-200 dark:border-stone-600 px-4 sm:px-6 py-3">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">{formatDateHeader(date)}</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Lessons for this date */}
                  <div className="divide-y divide-stone-100 dark:divide-stone-700">
                    {dayLessons.map(lesson => {
                      const student = students.find(s => s.id === lesson.studentId);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className="px-4 py-3 sm:px-6 sm:py-4 hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            {/* Left: Time & Student Info */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                                  {formatTime12Hour(lesson.time)}
                                </div>
                                <div className="text-xs text-stone-500 dark:text-stone-400">{lesson.duration} min</div>
                              </div>

                              <div className="h-12 w-px bg-stone-200 dark:bg-stone-600"></div>

                              <div>
                                <div className="font-semibold text-stone-900 dark:text-stone-100">{student?.name}</div>
                                <div className="text-sm text-stone-600 dark:text-stone-400">{lesson.lessonType}</div>
                              </div>
                            </div>

                            {/* Right: Status & Details */}
                            <div className="flex items-center gap-4">
                              {lesson.sessionNumber && (
                                <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                                  Session {lesson.sessionNumber}/{lesson.totalSessions}
                                </div>
                              )}

                              {lesson.attendance && (
                                <div className={`text-sm px-3 py-1 rounded-full ${
                                  lesson.attendance === 'present'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {lesson.attendance === 'present' ? '\u2713 Present' : '\u2717 Absent'}
                                </div>
                              )}

                              <div className={`px-4 py-2 rounded-lg font-medium ${
                                lesson.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                lesson.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {lesson.status}
                              </div>

                              <div className="text-lg font-bold text-teal-700 dark:text-teal-400">${lesson.rate}</div>

                              <svg className="w-5 h-5 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

export default ScheduleListView;
