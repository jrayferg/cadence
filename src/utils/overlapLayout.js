/**
 * overlapLayout.js
 * Computes side-by-side column layout for overlapping lessons
 * (Google Calendar style).
 */

import { timeToMinutes } from './conflictDetection';

/**
 * Compute layout positions for overlapping lessons on a single day.
 * Groups overlapping lessons and assigns each a column index and total
 * column count so they can be displayed side-by-side.
 *
 * @param {Array} lessons - All lessons for a single day
 * @returns {Map<number, {columnIndex: number, totalColumns: number}>}
 */
export function computeOverlapLayout(lessons) {
  if (!lessons || lessons.length === 0) return new Map();

  const sorted = [...lessons].sort((a, b) => {
    const aStart = timeToMinutes(a.time);
    const bStart = timeToMinutes(b.time);
    if (aStart !== bStart) return aStart - bStart;
    return (b.duration || 30) - (a.duration || 30);
  });

  const groups = [];
  let currentGroup = [sorted[0]];
  let groupEnd = timeToMinutes(sorted[0].time) + (sorted[0].duration || 30);

  for (let i = 1; i < sorted.length; i++) {
    const lessonStart = timeToMinutes(sorted[i].time);
    if (lessonStart < groupEnd) {
      currentGroup.push(sorted[i]);
      groupEnd = Math.max(groupEnd, lessonStart + (sorted[i].duration || 30));
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
      groupEnd = lessonStart + (sorted[i].duration || 30);
    }
  }
  groups.push(currentGroup);

  const result = new Map();
  for (const group of groups) {
    const totalColumns = group.length;
    group.forEach((lesson, colIndex) => {
      result.set(lesson.id, { columnIndex: colIndex, totalColumns });
    });
  }

  return result;
}
