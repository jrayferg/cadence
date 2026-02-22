/**
 * settingsService.js
 * Manages app-wide settings like dark mode and preferences.
 *
 * When we add a backend, user preferences can be synced to the server
 * so they persist across devices.
 */

import { STORAGE_KEYS, getItem, setItem } from './storage';

/**
 * Get the current dark mode setting.
 */
export function getDarkMode() {
  return getItem(STORAGE_KEYS.DARK_MODE, false);
}

/**
 * Save the dark mode setting.
 */
export function setDarkMode(enabled) {
  setItem(STORAGE_KEYS.DARK_MODE, enabled);
}
