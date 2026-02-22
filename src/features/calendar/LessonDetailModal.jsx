import React, { useState } from 'react';
import { X } from '@/components/icons';

/**
 * LessonDetailModal - Displays full details for a selected lesson including
 * status, student info, date/time, type, duration, rate, attendance, and notes.
 * Provides actions to mark as complete (with attendance tracking and notes),
 * cancel, reschedule, or delete the lesson.
 *
 * @param {Object} props
 * @param {Object} props.lesson - The lesson object to display
 * @param {Object} props.student - The student associated with the lesson
 * @param {Object} props.lessonType - The lesson type definition from user settings
 * @param {Function} props.onClose - Called to close the modal
 * @param {Function} props.onUpdate - Called with the updated lesson object
 * @param {Function} props.onDelete - Called to delete the lesson
 * @param {Function} props.onReschedule - Called to open the reschedule flow
 */
function LessonDetailModal({ lesson, student, lessonType, onClose, onUpdate, onDelete, onReschedule }) {
      const [isEditing, setIsEditing] = useState(false);
      const [notes, setNotes] = useState(lesson.notes || '');
      const [attendance, setAttendance] = useState(lesson.attendance || 'present');
      const [showNotesInput, setShowNotesInput] = useState(false);

      const handleStatusChange = (status) => {
        if (status === 'completed') {
          setShowNotesInput(true);
        } else {
          onUpdate({ ...lesson, status });
        }
      };

      const handleComplete = () => {
        onUpdate({
          ...lesson,
          status: 'completed',
          notes,
          attendance,
          completedAt: new Date().toISOString()
        });
      };

      // Format date properly
      const lessonDate = new Date(lesson.date + 'T00:00:00');
      const dayOfWeek = lessonDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = lessonDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-8 max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">Lesson Details</h3>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            {showNotesInput ? (
              <div className="space-y-4">
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <p className="text-sm text-teal-800 dark:text-teal-300 mb-2">Mark lesson as complete</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">Track attendance and add notes about this lesson</p>
                </div>

                {/* Attendance Toggle */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">Attendance</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAttendance('present')}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        attendance === 'present'
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : 'bg-white dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Present
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendance('absent')}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        attendance === 'absent'
                          ? 'bg-red-500 text-white border-2 border-red-600'
                          : 'bg-white dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:border-red-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Absent
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Lesson Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Student mastered C major scale. Homework: Practice arpeggios daily."
                    rows="5"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNotesInput(false)}
                    className="px-6 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Complete Lesson
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-700">
                    <span className="text-sm text-stone-600 dark:text-stone-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lesson.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      lesson.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
                    }`}>
                      {lesson.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {lesson.sessionNumber && lesson.totalSessions && (
                      <div className="flex justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <span className="text-sm font-medium text-amber-900 dark:text-amber-400">Session Progress</span>
                        <span className="text-sm font-bold text-amber-900 dark:text-amber-400">
                          {lesson.sessionNumber} of {lesson.totalSessions}
                        </span>
                      </div>
                    )}

                    {lesson.attendance && (
                      <div className={`flex justify-between rounded-lg p-3 border ${
                        lesson.attendance === 'present'
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      }`}>
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Attendance</span>
                        <span className={`text-sm font-bold flex items-center gap-1 ${
                          lesson.attendance === 'present' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {lesson.attendance === 'present' ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Present
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Absent
                            </>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Student</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{student?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Date</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{dayOfWeek}, {formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Time</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{lesson.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Type</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{lesson.lessonType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Duration</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{lesson.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Rate</span>
                      <span className="font-medium text-teal-700 dark:text-teal-400">${lesson.rate}</span>
                    </div>
                  </div>

                  {lesson.notes && (
                    <div className="bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">Lesson Notes</h4>
                      <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">{lesson.notes}</p>
                    </div>
                  )}

                  {lesson.completedAt && (
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      Completed: {new Date(lesson.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {lesson.status === 'scheduled' && (
                  <>
                    <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-700 mb-3">
                      <button
                        onClick={() => handleStatusChange('completed')}
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange('cancelled')}
                        className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                    <button
                      onClick={onReschedule}
                      className="w-full py-3 border-2 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium"
                    >
                      Reschedule Lesson
                    </button>
                  </>
                )}

                <button
                  onClick={onDelete}
                  className="w-full mt-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Delete Lesson
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

export default LessonDetailModal;
