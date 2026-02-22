/**
 * recurringDates.js
 * Generates an array of date strings for recurring lessons.
 * Supports daily, weekly, biweekly, and monthly frequencies.
 * Used by AddLessonModal when scheduling repeating lessons.
 *
 * Google Calendar-style behavior:
 * - "Repeat On" lets you pick specific days of the week
 * - "Ends" can be Never, On a specific date, or After X occurrences
 */

export const generateRecurringDates = ({ startDate, frequency, repeatDays, endType, endDate, count }) => {
  const dates = [];
  const start = new Date(startDate + 'T12:00:00'); // noon to avoid DST issues
  const maxOccurrences = 52; // safety cap for 'never'

  if (frequency === 'daily') {
    const limit = endType === 'after' ? count : endType === 'never' ? maxOccurrences : 365;
    const endDt = endType === 'on' && endDate ? new Date(endDate + 'T23:59:59') : null;
    let current = new Date(start);
    while (dates.length < limit) {
      if (endDt && current > endDt) break;
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  } else if (frequency === 'weekly' || frequency === 'biweekly') {
    const limit = endType === 'after' ? count : endType === 'never' ? maxOccurrences : 365;
    const endDt = endType === 'on' && endDate ? new Date(endDate + 'T23:59:59') : null;
    const days = repeatDays && repeatDays.length > 0 ? repeatDays : [start.getDay()];
    let current = new Date(start);
    // Find the start of the week containing our start date (Sunday)
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    // Scan up to 2 years out max
    const scanLimit = new Date(start);
    scanLimit.setFullYear(scanLimit.getFullYear() + 2);

    while (dates.length < limit && current <= scanLimit) {
      if (endDt && current > endDt) break;
      // Calculate which week we're in relative to start
      const daysSinceStart = Math.floor((current - weekStart) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.floor(daysSinceStart / 7);
      const isValidWeek = frequency === 'weekly' || (currentWeek % 2 === 0);

      if (isValidWeek && days.includes(current.getDay())) {
        // Only include dates on or after the original start date
        if (current >= start) {
          dates.push(current.toISOString().split('T')[0]);
        }
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (frequency === 'monthly') {
    const limit = endType === 'after' ? count : endType === 'never' ? maxOccurrences : 24;
    const endDt = endType === 'on' && endDate ? new Date(endDate + 'T23:59:59') : null;
    const dayOfMonth = start.getDate();
    let current = new Date(start);
    for (let i = 0; i < limit; i++) {
      if (endDt && current > endDt) break;
      dates.push(current.toISOString().split('T')[0]);
      // Move to next month, clamping to last day if needed
      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(Math.min(dayOfMonth, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
      current = nextMonth;
    }
  }

  return dates;
};
