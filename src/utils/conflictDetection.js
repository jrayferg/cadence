/**
 * conflictDetection.js
 * Utilities for detecting scheduling conflicts between lessons.
 */

/**
 * Convert "HH:MM" time string to total minutes from midnight.
 * @param {string} time - Time in "HH:MM" format
 * @returns {number} Minutes from midnight (0-1439)
 */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Detect scheduling conflicts for a lesson against existing lessons.
 * Two lessons conflict if they overlap in time on the same date.
 *
 * @param {Object} newLesson - { date, time, duration, id? }
 * @param {Array} existingLessons - Full lessons array
 * @returns {Array} Conflicting lesson objects
 */
export function detectConflicts(newLesson, existingLessons) {
  const newStart = timeToMinutes(newLesson.time);
  const newEnd = newStart + (newLesson.duration || 30);

  return existingLessons.filter(lesson => {
    if (lesson.date !== newLesson.date) return false;
    if (lesson.status !== 'scheduled') return false;
    if (lesson.id && lesson.id === newLesson.id) return false;

    const existStart = timeToMinutes(lesson.time);
    const existEnd = existStart + (lesson.duration || 30);

    return newStart < existEnd && existStart < newEnd;
  });
}
