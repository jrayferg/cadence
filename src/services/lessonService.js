/**
 * lessonService.js
 * All lesson-related business logic lives here.
 *
 * These functions take the current lessons array and return
 * a NEW array (they never mutate the original). The component
 * then calls setLessons() with the new array.
 *
 * When we add a backend, these functions will call an API instead.
 */

import { generateRecurringDates } from '@/utils/recurringDates';

/**
 * Add a single lesson to the list.
 */
export function addLesson(lessons, lessonData) {
  const newLesson = {
    ...lessonData,
    id: Date.now(),
    status: 'scheduled',
  };
  return [...lessons, newLesson];
}

/**
 * Add multiple lessons for a recurring schedule.
 * This replaces the duplicated recurring logic that was in
 * both CalendarView and MonthView.
 */
export function addRecurringLessons(lessons, { dates, time, studentId, lessonType, duration, rate }) {
  const newLessons = dates.map((date, index) => ({
    id: Date.now() + index,
    studentId,
    date,
    time,
    lessonType,
    duration,
    rate,
    status: 'scheduled',
  }));
  return [...lessons, ...newLessons];
}

/**
 * Update an existing lesson (e.g., change time, mark complete).
 */
export function updateLesson(lessons, updatedLesson) {
  return lessons.map(lesson =>
    lesson.id === updatedLesson.id ? { ...lesson, ...updatedLesson } : lesson
  );
}

/**
 * Delete a lesson by ID.
 */
export function deleteLesson(lessons, lessonId) {
  return lessons.filter(lesson => lesson.id !== lessonId);
}

/**
 * Get all lessons for a specific date.
 */
export function getLessonsForDate(lessons, dateStr) {
  return lessons.filter(lesson => lesson.date === dateStr);
}

/**
 * Get all lessons for a specific student.
 */
export function getLessonsForStudent(lessons, studentId) {
  return lessons.filter(lesson => lesson.studentId === studentId);
}
