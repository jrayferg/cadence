/**
 * userService.js
 * Handles user authentication and profile management.
 *
 * Right now "login" just checks if the email matches a stored user.
 * When we add a real backend, this will call an auth API instead.
 */

import { STORAGE_KEYS, getItem, setItem, removeItem } from './storage';

/**
 * Get the currently logged-in user (from localStorage).
 * Returns null if no one is logged in.
 */
export function getCurrentUser() {
  return getItem(STORAGE_KEYS.USER, null);
}

/**
 * Save user data after login or profile update.
 */
export function saveUser(userData) {
  setItem(STORAGE_KEYS.USER, userData);
}

/**
 * Log the user out by clearing their data.
 */
export function logout() {
  removeItem(STORAGE_KEYS.USER);
  removeItem(STORAGE_KEYS.SETUP_COMPLETE);
}

/**
 * Check if onboarding/setup has been completed.
 */
export function isSetupComplete() {
  return getItem(STORAGE_KEYS.SETUP_COMPLETE, false);
}

/**
 * Mark onboarding as complete.
 */
export function completeSetup() {
  setItem(STORAGE_KEYS.SETUP_COMPLETE, true);
}
