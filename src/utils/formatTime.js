/**
 * formatTime.js
 * Converts 24-hour time strings (like "14:30") to 12-hour format ("2:30 PM").
 * Used by calendar views, lesson cards, and modals throughout the app.
 */

export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};
