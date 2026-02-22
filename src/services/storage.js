/**
 * storage.js
 * The ONLY file that directly reads/writes to localStorage.
 *
 * Why this matters:
 * Right now the app stores everything in the browser's localStorage.
 * When we add a real backend/database later, we ONLY need to change
 * THIS file (and the service files that use it). No component code changes.
 *
 * Storage keys — every piece of data the app saves:
 */

export const STORAGE_KEYS = {
  USER: 'cadence_user',               // The logged-in user's info
  SETUP_COMPLETE: 'cadence_setup_complete', // Has onboarding finished?
  STUDENTS: 'cadence_students',        // Array of all students
  LESSONS: 'cadence_lessons',          // Array of all lessons
  DARK_MODE: 'cadence_dark_mode',      // Is dark mode on?
};

/**
 * Read a value from localStorage.
 * Returns the fallback if the key doesn't exist or there's an error.
 */
export function getItem(key, fallback = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Save a value to localStorage.
 */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * Remove a value from localStorage.
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}
