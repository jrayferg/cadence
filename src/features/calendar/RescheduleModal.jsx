import React, { useState } from 'react';
import { X } from '@/components/icons';

/**
 * RescheduleModal - A modal for rescheduling an existing lesson to a new
 * date and time. Shows the current date/time and provides inputs for the
 * new schedule.
 *
 * @param {Object} props
 * @param {Object} props.lesson - The lesson object to reschedule
 * @param {Function} props.onClose - Called to close the modal
 * @param {Function} props.onSave - Called with the updated lesson (new date/time)
 */
function RescheduleModal({ lesson, onClose, onSave }) {
      const [newDate, setNewDate] = useState(lesson.date);
      const [newTime, setNewTime] = useState(lesson.time);

      const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...lesson, date: newDate, time: newTime });
      };

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-8 max-w-md w-full animate-slide-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">Reschedule Lesson</h3>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Current: {new Date(lesson.date + 'T00:00:00').toLocaleDateString()} at {lesson.time}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700"
                >
                  Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

export default RescheduleModal;
