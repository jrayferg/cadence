# Calendar Page Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix hover tooltip bug, add scheduling conflict detection, improve calendar UX with Google Calendar-style lesson blocks, sticky headers, auto-scroll to 7 AM, and more spacious layout.

**Architecture:** Refactor Day/Week views from quarter-hour div grids to absolute-positioned lesson blocks within a continuous 1440px (24hr × 60px/hr) time column. Add conflict detection utility with warn+confirm UX. Use refs instead of state for tooltip positioning to eliminate re-render flickering.

**Tech Stack:** React 18, Tailwind CSS 3.4, Vite 5 (no test framework — verify via dev server at `localhost:5173`)

---

## Pre-Flight

**Start dev server:** `npm run dev` in `/Users/jordanferguson/Desktop/Cadence Lesson Scheduler`

**Log in with demo account:** `cadence.demo@mail.com` / `demome123`

This gives you 40+ students and 100+ lessons to test with.

---

### Task 1: Create Utility Files

**Files:**
- Create: `src/utils/conflictDetection.js`
- Create: `src/utils/overlapLayout.js`

**Step 1: Create conflict detection utility**

Create `src/utils/conflictDetection.js`:

```javascript
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
```

**Step 2: Create overlap layout utility**

Create `src/utils/overlapLayout.js`:

```javascript
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
```

**Step 3: Verify build**

Run: `npm run build`
Expected: No errors (new files aren't imported yet, just need valid JS)

**Step 4: Commit**

```bash
git add src/utils/conflictDetection.js src/utils/overlapLayout.js
git commit -m "feat: add conflict detection and overlap layout utilities"
```

---

### Task 2: Reduce Sidebar Width

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

**Step 1: Update desktop sidebar width and padding**

In `src/components/layout/Sidebar.jsx`, change the desktop sidebar:

Old (line 45):
```jsx
<nav className="hidden lg:block w-64 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 min-h-screen p-6 transition-colors flex-shrink-0">
```

New:
```jsx
<nav className="hidden lg:block w-48 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 min-h-screen p-4 transition-colors flex-shrink-0">
```

Changes: `w-64` → `w-48`, `p-6` → `p-4`

**Step 2: Verify in browser**

Run dev server, check that sidebar is narrower and calendar has more horizontal space. Nav items should still be readable with icon + text.

**Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "style: reduce sidebar width from 256px to 192px for more calendar space"
```

---

### Task 3: Refactor LessonBlock for Google Calendar Style

**Files:**
- Modify: `src/components/ui/LessonBlock.jsx`

**Step 1: Rewrite LessonBlock**

Replace the entire contents of `src/components/ui/LessonBlock.jsx` with:

```jsx
/**
 * LessonBlock.jsx
 * Google Calendar-style lesson card for Day and Week views.
 *
 * Displays 1-3 lines of content based on the lesson's duration height:
 *   - Short (≤20min):  Student name only
 *   - Medium (21-35min): Student name + lesson type
 *   - Long (36min+):   Student name + lesson type + time
 *
 * Color-coded by status with a left accent border:
 *   - Blue = Scheduled
 *   - Green = Completed
 *   - Red = Cancelled
 *
 * Supports drag-and-drop for rescheduling (scheduled lessons only).
 * Calls e.stopPropagation() on click/drag so parent column click
 * handlers (for empty-slot scheduling) don't fire.
 */

import { formatTime12Hour } from '@/utils/formatTime';

function LessonBlock({ lesson, student, onClick, onDragStart, onMouseEnter, onMouseMove, onMouseLeave }) {
  const statusColors = {
    scheduled: 'bg-blue-50 border-l-4 border-blue-500 text-blue-900 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-200',
    completed: 'bg-green-50 border-l-4 border-green-500 text-green-900 dark:bg-green-900/40 dark:border-green-400 dark:text-green-200',
    cancelled: 'bg-red-50 border-l-4 border-red-500 text-red-900 dark:bg-red-900/40 dark:border-red-400 dark:text-red-200',
  };

  const duration = lesson.duration || 30;
  const isShort = duration <= 20;
  const isMedium = duration > 20 && duration <= 35;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      draggable={lesson.status === 'scheduled'}
      onDragStart={(e) => { e.stopPropagation(); onDragStart && onDragStart(); }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`w-full h-full text-left px-2 py-0.5 rounded-md transition-all hover:opacity-90 hover:shadow-md overflow-hidden ${
        lesson.status === 'scheduled' ? 'cursor-move' : 'cursor-pointer'
      } ${statusColors[lesson.status] || statusColors.scheduled}`}
    >
      {isShort ? (
        <div className="text-[10px] font-semibold truncate leading-tight">{student?.name}</div>
      ) : isMedium ? (
        <>
          <div className="text-xs font-semibold truncate leading-tight">{student?.name}</div>
          <div className="text-[10px] truncate opacity-80 leading-tight">{lesson.lessonType}</div>
        </>
      ) : (
        <>
          <div className="text-xs font-semibold truncate leading-tight">{student?.name}</div>
          <div className="text-[10px] truncate opacity-80 leading-tight">{lesson.lessonType}</div>
          <div className="text-[10px] truncate opacity-70 leading-tight">{formatTime12Hour(lesson.time)}</div>
        </>
      )}
    </button>
  );
}

export default LessonBlock;
```

Key changes from original:
- `border-2` → `border-l-4` (Google Calendar left-accent style)
- `bg-blue-100` → `bg-blue-50` (lighter background for softer look)
- Removed `compact` prop — size adapts to duration instead
- Changed hover handlers: `onHover`/`onHoverEnd` → `onMouseEnter`/`onMouseMove`/`onMouseLeave` (raw DOM events)
- Added `e.stopPropagation()` on click and drag to prevent bubbling to column handlers
- 3-tier content display based on duration

**Step 2: Commit** (will break Day/Week views temporarily — fixed in Tasks 4-5)

```bash
git add src/components/ui/LessonBlock.jsx
git commit -m "refactor: LessonBlock to Google Calendar style with duration-adaptive content"
```

---

### Task 4: Rewrite DayView with Absolute Positioning

**Files:**
- Modify: `src/features/calendar/DayView.jsx`

**Step 1: Replace entire DayView**

Replace the entire contents of `src/features/calendar/DayView.jsx` with:

```jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { timeToMinutes } from '@/utils/conflictDetection';
import { computeOverlapLayout } from '@/utils/overlapLayout';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * DayView - Google Calendar-style single-day view.
 *
 * Architecture:
 *   - Full 24-hour grid at 60px per hour (1440px total)
 *   - Lessons are absolutely positioned: top = minutes from midnight,
 *     height = duration in minutes (1px per minute)
 *   - Overlapping lessons laid out side-by-side via computeOverlapLayout
 *   - Auto-scrolls to 7 AM on mount
 *   - Clicking empty space opens Schedule Lesson (snapped to 15-min)
 *
 * @param {Date} props.date - The day to display
 * @param {Array} props.lessons - All lesson objects
 * @param {Array} props.students - All student objects
 * @param {Function} props.onTimeSlotClick - ({date, time}) => void
 * @param {Function} props.onLessonClick - (lesson) => void
 * @param {Function} props.onDragStart - (lesson) => void
 * @param {Function} props.onDrop - (dateStr, timeStr) => void
 * @param {Function} props.onLessonHover - (lesson, student, event) => void
 * @param {Function} props.onLessonHoverMove - (event) => void
 * @param {Function} props.onLessonHoverEnd - () => void
 */

const HOUR_HEIGHT = 60;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;

function DayView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, onLessonHover, onLessonHoverMove, onLessonHoverEnd }) {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateStr = date.toISOString().split('T')[0];
  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];

  // Auto-scroll to 7 AM on mount and when date changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [dateStr]);

  // Filter and sort lessons for this day
  const dayLessons = useMemo(() =>
    lessons
      .filter(l => l.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [lessons, dateStr]
  );

  // Compute overlap layout for side-by-side display
  const overlapLayout = useMemo(
    () => computeOverlapLayout(dayLessons),
    [dayLessons]
  );

  // Click empty area → schedule lesson (snap to 15-min)
  const handleColumnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSlotClick({ date: dateStr, time: timeStr });
  };

  const handleDragOver = (e) => e.preventDefault();

  // Drop → reschedule lesson (snap to 15-min)
  const handleDrop = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onDrop(dateStr, timeStr);
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="flex relative" style={{ height: `${TOTAL_HEIGHT}px` }}>

          {/* Time labels column */}
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 px-1 sm:px-2 leading-none">
                  {formatTime12Hour(`${hour.toString().padStart(2, '0')}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            className="flex-1 relative cursor-pointer"
            onClick={handleColumnClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Hour gridlines */}
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-stone-200 dark:border-stone-700 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT}px` }}
              />
            ))}

            {/* Half-hour gridlines (subtle) */}
            {hours.map(hour => (
              <div
                key={`half-${hour}`}
                className="absolute left-0 right-0 border-b border-stone-100 dark:border-stone-800 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT + 30}px` }}
              />
            ))}

            {/* Current time indicator */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${now.getHours() * HOUR_HEIGHT + now.getMinutes()}px` }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 flex-shrink-0"></div>
                  <div className="flex-1 border-t-2 border-red-500"></div>
                </div>
              </div>
            )}

            {/* Lesson blocks (absolutely positioned) */}
            {dayLessons.map(lesson => {
              const student = students.find(s => s.id === lesson.studentId);
              const layout = overlapLayout.get(lesson.id) || { columnIndex: 0, totalColumns: 1 };
              const startMin = timeToMinutes(lesson.time);
              const duration = lesson.duration || 30;

              return (
                <div
                  key={lesson.id}
                  className="absolute z-10 px-0.5"
                  style={{
                    top: `${startMin}px`,
                    height: `${duration}px`,
                    left: `${(layout.columnIndex / layout.totalColumns) * 100}%`,
                    width: `${(1 / layout.totalColumns) * 100}%`,
                  }}
                >
                  <LessonBlock
                    lesson={lesson}
                    student={student}
                    onClick={() => onLessonClick(lesson)}
                    onDragStart={() => onDragStart(lesson)}
                    onMouseEnter={(e) => onLessonHover(lesson, student, e)}
                    onMouseMove={onLessonHoverMove}
                    onMouseLeave={onLessonHoverEnd}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
```

**Step 2: Commit**

```bash
git add src/features/calendar/DayView.jsx
git commit -m "refactor: DayView to absolute-positioned Google Calendar layout with auto-scroll"
```

---

### Task 5: Rewrite WeekView with Absolute Positioning and Sticky Header

**Files:**
- Modify: `src/features/calendar/WeekView.jsx`

**Step 1: Replace entire WeekView**

Replace the entire contents of `src/features/calendar/WeekView.jsx` with:

```jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { timeToMinutes } from '@/utils/conflictDetection';
import { computeOverlapLayout } from '@/utils/overlapLayout';
import LessonBlock from '@/components/ui/LessonBlock';

/**
 * WeekView - Google Calendar-style 7-day weekly view.
 *
 * Architecture:
 *   - Sticky day headers inside the scroll container (fixes column alignment)
 *   - Full 24-hour grid at 60px per hour (1440px total) per day column
 *   - Lessons absolutely positioned within their day column
 *   - Overlapping lessons side-by-side via computeOverlapLayout
 *   - Auto-scrolls to 7 AM on mount
 *
 * @param {Date} props.date - A date within the week to display
 * @param {Array} props.lessons - All lesson objects
 * @param {Array} props.students - All student objects
 * @param {Function} props.onTimeSlotClick - ({date, time}) => void
 * @param {Function} props.onLessonClick - (lesson) => void
 * @param {Function} props.onDragStart - (lesson) => void
 * @param {Function} props.onDrop - (dateStr, timeStr) => void
 * @param {Function} props.onLessonHover - (lesson, student, event) => void
 * @param {Function} props.onLessonHoverMove - (event) => void
 * @param {Function} props.onLessonHoverEnd - () => void
 */

const HOUR_HEIGHT = 60;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;

function WeekView({ date, lessons, students, onTimeSlotClick, onLessonClick, onDragStart, onDrop, onLessonHover, onLessonHoverMove, onLessonHoverEnd }) {
  const scrollRef = useRef(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const now = new Date();

  // Auto-scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [date.toISOString().split('T')[0]]);

  const handleDragOver = (e) => e.preventDefault();

  // Click empty area in a day column → schedule lesson
  const handleColumnClick = (e, day) => {
    const dateStr = day.toISOString().split('T')[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSlotClick({ date: dateStr, time: timeStr });
  };

  // Drop on a day column → reschedule lesson
  const handleDropOnColumn = (e, day) => {
    e.preventDefault();
    const dateStr = day.toISOString().split('T')[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 45, Math.round(y / 15) * 15));
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onDrop(dateStr, timeStr);
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>

        {/* Sticky Day Headers — inside scroll container to fix column alignment */}
        <div className="flex sticky top-0 z-20 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 min-w-[600px]">
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900" />
          {days.map(day => {
            const isToday = day.toDateString() === now.toDateString();
            return (
              <div key={day.toISOString()} className="flex-1 p-2 sm:p-3 text-center border-l border-stone-200 dark:border-stone-700 min-w-[70px]">
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-teal-700 dark:text-teal-400' : 'text-stone-900 dark:text-stone-100'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex relative min-w-[600px]" style={{ height: `${TOTAL_HEIGHT}px` }}>

          {/* Time labels column */}
          <div className="w-14 sm:w-20 flex-shrink-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 relative">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-xs text-stone-600 dark:text-stone-400 px-1 sm:px-2 leading-none">
                  {formatTime12Hour(`${hour.toString().padStart(2, '0')}:00`)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dayDateStr = day.toISOString().split('T')[0];
            const isDayToday = dayDateStr === now.toISOString().split('T')[0];

            const dayLessons = lessons
              .filter(l => l.date === dayDateStr)
              .sort((a, b) => a.time.localeCompare(b.time));

            const overlapLayout = computeOverlapLayout(dayLessons);

            return (
              <div
                key={day.toISOString()}
                className="flex-1 relative border-l border-stone-200 dark:border-stone-700 min-w-[70px] cursor-pointer"
                onClick={(e) => handleColumnClick(e, day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, day)}
              >
                {/* Hour gridlines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-stone-200 dark:border-stone-700 pointer-events-none"
                    style={{ top: `${hour * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour gridlines */}
                {hours.map(hour => (
                  <div
                    key={`half-${hour}`}
                    className="absolute left-0 right-0 border-b border-stone-100 dark:border-stone-800 pointer-events-none"
                    style={{ top: `${hour * HOUR_HEIGHT + 30}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isDayToday && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${now.getHours() * HOUR_HEIGHT + now.getMinutes()}px` }}
                  >
                    <div className="border-t-2 border-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1"></div>
                    </div>
                  </div>
                )}

                {/* Lesson blocks */}
                {dayLessons.map(lesson => {
                  const student = students.find(s => s.id === lesson.studentId);
                  const layout = overlapLayout.get(lesson.id) || { columnIndex: 0, totalColumns: 1 };
                  const startMin = timeToMinutes(lesson.time);
                  const duration = lesson.duration || 30;

                  return (
                    <div
                      key={lesson.id}
                      className="absolute z-10 px-0.5"
                      style={{
                        top: `${startMin}px`,
                        height: `${duration}px`,
                        left: `${(layout.columnIndex / layout.totalColumns) * 100}%`,
                        width: `${(1 / layout.totalColumns) * 100}%`,
                      }}
                    >
                      <LessonBlock
                        lesson={lesson}
                        student={student}
                        onClick={() => onLessonClick(lesson)}
                        onDragStart={() => onDragStart(lesson)}
                        onMouseEnter={(e) => onLessonHover(lesson, student, e)}
                        onMouseMove={onLessonHoverMove}
                        onMouseLeave={onLessonHoverEnd}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
```

**Step 2: Commit**

```bash
git add src/features/calendar/WeekView.jsx
git commit -m "refactor: WeekView to absolute positioning with sticky header and auto-scroll"
```

---

### Task 6: Update CalendarView — New Hover System, View Wiring, Drag Conflict Detection

**Files:**
- Modify: `src/features/calendar/CalendarView.jsx`

This task rewires CalendarView to:
1. Use ref-based tooltip positioning (fixes hover flicker bug)
2. Pass new prop signatures to DayView/WeekView
3. Add conflict detection to drag-and-drop
4. Pass `lessons` to AddLessonModal for conflict checking

**Step 1: Update imports**

At the top of `CalendarView.jsx`, add these imports after the existing ones:

```jsx
import { useCallback, useRef } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import { detectConflicts } from '@/utils/conflictDetection';
```

Update the React import to include `useCallback` and `useRef`:

Change:
```jsx
import React, { useState, useEffect } from 'react';
```
To:
```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
```

**Step 2: Replace hover state with ref-based system**

Inside the `CalendarView` function, replace the `hoveredLesson` state:

Remove:
```jsx
const [hoveredLesson, setHoveredLesson] = useState(null);
```

Add in its place:
```jsx
const [hoveredLessonId, setHoveredLessonId] = useState(null);
const tooltipRef = useRef(null);
const tooltipDataRef = useRef(null);
const leaveTimeoutRef = useRef(null);

const handleLessonHover = useCallback((lesson, student, e) => {
  clearTimeout(leaveTimeoutRef.current);
  tooltipDataRef.current = { lesson, student };
  setHoveredLessonId(lesson.id);
  // Position tooltip at initial mouse location
  requestAnimationFrame(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 12}px`;
      tooltipRef.current.style.top = `${e.clientY + 12}px`;
    }
  });
}, []);

const handleLessonHoverMove = useCallback((e) => {
  if (tooltipRef.current) {
    tooltipRef.current.style.left = `${e.clientX + 12}px`;
    tooltipRef.current.style.top = `${e.clientY + 12}px`;
  }
}, []);

const handleLessonHoverEnd = useCallback(() => {
  leaveTimeoutRef.current = setTimeout(() => {
    tooltipDataRef.current = null;
    setHoveredLessonId(null);
  }, 50);
}, []);
```

**Step 3: Add drag conflict detection state and handlers**

After the hover code, add:

```jsx
const [showDragConflictConfirm, setShowDragConflictConfirm] = useState(null);
```

Replace the existing `handleDrop` function:

Old:
```jsx
const handleDrop = (date, time) => {
  if (!draggedLesson) return;

  const updatedLesson = {
    ...draggedLesson,
    date: date,
    time: time || draggedLesson.time
  };

  setLessons(lessons.map(l => l.id === draggedLesson.id ? updatedLesson : l));
  setDraggedLesson(null);
};
```

New:
```jsx
const handleDrop = (date, time) => {
  if (!draggedLesson) return;

  const updatedLesson = {
    ...draggedLesson,
    date: date,
    time: time || draggedLesson.time
  };

  const conflicts = detectConflicts(updatedLesson, lessons);
  if (conflicts.length > 0) {
    setShowDragConflictConfirm({ lesson: updatedLesson, conflicts });
    setDraggedLesson(null);
    return;
  }

  setLessons(lessons.map(l => l.id === draggedLesson.id ? updatedLesson : l));
  setDraggedLesson(null);
};

const handleDragConflictConfirm = () => {
  if (!showDragConflictConfirm) return;
  const { lesson } = showDragConflictConfirm;
  setLessons(lessons.map(l => l.id === lesson.id ? lesson : l));
  setShowDragConflictConfirm(null);
};
```

**Step 4: Update DayView and WeekView props**

Replace the DayView render block:

Old:
```jsx
<DayView
  date={currentDate}
  lessons={filteredLessons}
  students={students}
  onTimeSlotClick={setShowAddLesson}
  onLessonClick={setSelectedLesson}
  onDragStart={handleDragStart}
  onDrop={handleDrop}
  hoveredLesson={hoveredLesson}
  setHoveredLesson={setHoveredLesson}
/>
```

New:
```jsx
<DayView
  date={currentDate}
  lessons={filteredLessons}
  students={students}
  onTimeSlotClick={setShowAddLesson}
  onLessonClick={setSelectedLesson}
  onDragStart={handleDragStart}
  onDrop={handleDrop}
  onLessonHover={handleLessonHover}
  onLessonHoverMove={handleLessonHoverMove}
  onLessonHoverEnd={handleLessonHoverEnd}
/>
```

Replace the WeekView render block the same way:

Old:
```jsx
<WeekView
  date={currentDate}
  lessons={filteredLessons}
  students={students}
  onTimeSlotClick={setShowAddLesson}
  onLessonClick={setSelectedLesson}
  onDragStart={handleDragStart}
  onDrop={handleDrop}
  hoveredLesson={hoveredLesson}
  setHoveredLesson={setHoveredLesson}
/>
```

New:
```jsx
<WeekView
  date={currentDate}
  lessons={filteredLessons}
  students={students}
  onTimeSlotClick={setShowAddLesson}
  onLessonClick={setSelectedLesson}
  onDragStart={handleDragStart}
  onDrop={handleDrop}
  onLessonHover={handleLessonHover}
  onLessonHoverMove={handleLessonHoverMove}
  onLessonHoverEnd={handleLessonHoverEnd}
/>
```

**Step 5: Update AddLessonModal to receive lessons**

In the AddLessonModal render block, add `lessons={lessons}`:

Old:
```jsx
<AddLessonModal
  slot={showAddLesson}
  students={students}
  lessonTypes={user.lessonTypes}
  onClose={() => setShowAddLesson(null)}
  onSave={(lesson) => {
```

New:
```jsx
<AddLessonModal
  slot={showAddLesson}
  students={students}
  lessons={lessons}
  lessonTypes={user.lessonTypes}
  onClose={() => setShowAddLesson(null)}
  onSave={(lesson) => {
```

**Step 6: Replace hover tooltip rendering**

Replace the old hover preview block:

Old:
```jsx
{/* Hover Preview */}
{hoveredLesson && (
  <div
    className="fixed z-40 bg-stone-900 text-white p-4 rounded-lg shadow-2xl max-w-xs"
    style={{
      left: hoveredLesson.x + 10,
      top: hoveredLesson.y + 10,
      pointerEvents: 'none'
    }}
  >
    <div className="font-bold mb-1">{hoveredLesson.student?.name}</div>
    <div className="text-sm text-stone-300">{hoveredLesson.lesson.lessonType}</div>
    <div className="text-sm text-stone-300">{formatTime12Hour(hoveredLesson.lesson.time)} • {hoveredLesson.lesson.duration} min</div>
    <div className="text-sm text-stone-400 mt-1">${hoveredLesson.lesson.rate}</div>
    {hoveredLesson.lesson.sessionNumber && (
      <div className="text-xs text-amber-300 mt-1">
        Session {hoveredLesson.lesson.sessionNumber}/{hoveredLesson.lesson.totalSessions}
      </div>
    )}
  </div>
)}
```

New:
```jsx
{/* Hover Preview — positioned via ref to avoid re-render flicker */}
{hoveredLessonId && tooltipDataRef.current && (
  <div
    ref={tooltipRef}
    className="fixed z-50 bg-stone-900 text-white p-4 rounded-lg shadow-2xl max-w-xs"
    style={{ pointerEvents: 'none' }}
  >
    <div className="font-bold mb-1">{tooltipDataRef.current.student?.name}</div>
    <div className="text-sm text-stone-300">{tooltipDataRef.current.lesson.lessonType}</div>
    <div className="text-sm text-stone-300">{formatTime12Hour(tooltipDataRef.current.lesson.time)} • {tooltipDataRef.current.lesson.duration} min</div>
    <div className="text-sm text-stone-400 mt-1">${tooltipDataRef.current.lesson.rate}</div>
    {tooltipDataRef.current.lesson.sessionNumber && (
      <div className="text-xs text-amber-300 mt-1">
        Session {tooltipDataRef.current.lesson.sessionNumber}/{tooltipDataRef.current.lesson.totalSessions}
      </div>
    )}
  </div>
)}
```

**Step 7: Add drag conflict confirmation modal**

Add this right before the closing `</div>` of the component (after the Reschedule Modal block):

```jsx
{/* Drag Conflict Confirmation */}
{showDragConflictConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-md w-full animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Scheduling Conflict</h3>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
        Moving this lesson creates an overlap with:
      </p>
      <div className="space-y-2 mb-6">
        {showDragConflictConfirm.conflicts.map(c => {
          const student = students.find(s => s.id === c.studentId);
          return (
            <div key={c.id} className="text-sm bg-stone-50 dark:bg-stone-700 rounded px-3 py-2">
              <span className="font-medium">{student?.name}</span> — {formatTime12Hour(c.time)} ({c.duration} min)
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowDragConflictConfirm(null)}
          className="px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
        >
          Cancel
        </button>
        <button
          onClick={handleDragConflictConfirm}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
        >
          Move Anyway
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 8: Verify in browser**

Open dev server. Log in with demo account. Check:
- Week view: sticky headers aligned with columns, lessons at correct heights, auto-scrolled to 7 AM
- Day view: same behavior
- Hover over a lesson: tooltip appears without flicker, follows mouse
- Drag a lesson to overlapping time: conflict confirmation appears

**Step 9: Commit**

```bash
git add src/features/calendar/CalendarView.jsx
git commit -m "feat: ref-based hover tooltip, new view wiring, drag-drop conflict detection"
```

---

### Task 7: Month View — Click Any Day to Schedule

**Files:**
- Modify: `src/features/calendar/MonthView.jsx`

**Step 1: Update handleDayClick to always open modal**

In `MonthView.jsx`, replace the `handleDayClick` function:

Old (lines 51-57):
```jsx
const handleDayClick = (day) => {
  const dayLessons = getLessonsForDay(day);
  if (dayLessons.length === 0) {
    // Open schedule lesson modal with 7:00 AM default
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setShowAddLesson({ date: dateStr, time: '07:00' });
  }
};
```

New:
```jsx
const handleDayClick = (day) => {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  setShowAddLesson({ date: dateStr, time: '07:00' });
};
```

**Step 2: Add hover "+" button on each day cell**

In the calendar grid cell rendering, add a "+" button. Replace the day cell content block:

Old (lines 88-118):
```jsx
{day && (
  <>
    <div
      className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 ${isToday ? 'text-teal-700 dark:text-teal-400 font-bold' : 'text-stone-700 dark:text-stone-300'}`}
      onClick={() => handleDayClick(day)}
    >
      {day}
    </div>
    <div className="space-y-0.5 sm:space-y-1">
      {/* On mobile: show dots; on desktop: show full lesson text */}
      {dayLessons.slice(0, maxVisible).map(lesson => (
        <button
          key={lesson.id}
          onClick={() => onLessonClick(lesson)}
          className={`w-full text-left rounded text-xs transition-colors truncate ${getLessonColor(lesson)}`}
        >
          <span className="hidden sm:inline px-2 py-1 block">{formatTime12Hour(lesson.time)} - {students.find(s => s.id === lesson.studentId)?.name}</span>
          <span className="sm:hidden block w-2 h-2 rounded-full mx-auto" style={{background: lesson.status === 'completed' ? '#16a34a' : lesson.status === 'cancelled' ? '#dc2626' : '#2563eb'}}></span>
        </button>
      ))}
      {dayLessons.length > maxVisible && (
        <button
          onClick={() => setShowDayPopup({ day, lessons: dayLessons })}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium px-1 sm:px-2"
        >
          +{dayLessons.length - maxVisible}
        </button>
      )}
    </div>
  </>
)}
```

New:
```jsx
{day && (
  <>
    <div className="flex items-center justify-between mb-1 sm:mb-2 group">
      <div
        className={`text-xs sm:text-sm font-medium cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 ${isToday ? 'text-teal-700 dark:text-teal-400 font-bold' : 'text-stone-700 dark:text-stone-300'}`}
        onClick={() => handleDayClick(day)}
      >
        {day}
      </div>
      <button
        onClick={() => handleDayClick(day)}
        className="hidden sm:group-hover:flex w-5 h-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/60 text-xs font-bold transition-colors"
        title="Schedule lesson"
      >
        +
      </button>
    </div>
    <div className="space-y-0.5 sm:space-y-1">
      {dayLessons.slice(0, maxVisible).map(lesson => (
        <button
          key={lesson.id}
          onClick={() => onLessonClick(lesson)}
          className={`w-full text-left rounded text-xs transition-colors truncate ${getLessonColor(lesson)}`}
        >
          <span className="hidden sm:inline px-2 py-1 block">{formatTime12Hour(lesson.time)} - {students.find(s => s.id === lesson.studentId)?.name}</span>
          <span className="sm:hidden block w-2 h-2 rounded-full mx-auto" style={{background: lesson.status === 'completed' ? '#16a34a' : lesson.status === 'cancelled' ? '#dc2626' : '#2563eb'}}></span>
        </button>
      ))}
      {dayLessons.length > maxVisible && (
        <button
          onClick={() => setShowDayPopup({ day, lessons: dayLessons })}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium px-1 sm:px-2"
        >
          +{dayLessons.length - maxVisible}
        </button>
      )}
    </div>
  </>
)}
```

**Step 3: Pass `lessons` to AddLessonModal in MonthView**

In the MonthView's AddLessonModal render block, add `lessons={lessons}`:

Old (line 170):
```jsx
<AddLessonModal
  slot={showAddLesson}
  students={students}
  lessonTypes={user.lessonTypes}
```

New:
```jsx
<AddLessonModal
  slot={showAddLesson}
  students={students}
  lessons={lessons}
  lessonTypes={user.lessonTypes}
```

**Step 4: Verify**

Switch to Month view. Click any day number (including days with lessons) → Schedule Lesson modal opens. Hover over a day cell to see the "+" button appear on desktop.

**Step 5: Commit**

```bash
git add src/features/calendar/MonthView.jsx
git commit -m "feat: click any day in month view to schedule, add hover + button"
```

---

### Task 8: Add Conflict Detection to AddLessonModal

**Files:**
- Modify: `src/features/calendar/AddLessonModal.jsx`

**Step 1: Add imports and props**

At the top, add the import:

```jsx
import { detectConflicts } from '@/utils/conflictDetection';
import { formatTime12Hour } from '@/utils/formatTime';
```

Note: `formatTime12Hour` is already imported. Just add `detectConflicts`.

Update the function signature to accept `lessons`:

Old:
```jsx
function AddLessonModal({ slot, students, lessonTypes, onClose, onSave, setStudents }) {
```

New:
```jsx
function AddLessonModal({ slot, students, lessons = [], lessonTypes, onClose, onSave, setStudents }) {
```

**Step 2: Add conflict state**

After the existing state declarations (around line 26), add:

```jsx
const [conflicts, setConflicts] = useState([]);
const [showConflictWarning, setShowConflictWarning] = useState(false);
```

**Step 3: Replace handleSubmit with conflict-aware version**

Replace the existing `handleSubmit` function:

Old:
```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  if (!formData.studentId) return;
  onSave(formData);
};
```

New:
```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  if (!formData.studentId) return;

  // Check for conflicts
  if (formData.recurring) {
    try {
      const dates = generateRecurringDates({
        startDate: formData.date,
        frequency: formData.recurringFrequency,
        repeatDays: formData.repeatDays,
        endType: formData.endType,
        endDate: formData.endDate,
        count: formData.recurringCount
      });
      const allConflicts = [];
      dates.forEach(d => {
        const lessonForDate = { ...formData, date: d };
        const found = detectConflicts(lessonForDate, lessons);
        allConflicts.push(...found);
      });
      const uniqueConflicts = [...new Map(allConflicts.map(c => [c.id, c])).values()];
      if (uniqueConflicts.length > 0) {
        setConflicts(uniqueConflicts);
        setShowConflictWarning(true);
        return;
      }
    } catch { /* proceed if date generation fails */ }
  } else {
    const found = detectConflicts(formData, lessons);
    if (found.length > 0) {
      setConflicts(found);
      setShowConflictWarning(true);
      return;
    }
  }

  onSave(formData);
};

const handleForceSchedule = () => {
  setShowConflictWarning(false);
  setConflicts([]);
  onSave(formData);
};
```

**Step 4: Add conflict warning panel**

Inside the form, just before the action buttons div (`{/* Actions */}`), add:

```jsx
{/* Conflict Warning */}
{showConflictWarning && (
  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="font-semibold text-amber-800 dark:text-amber-300">Scheduling Conflict</span>
    </div>
    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
      This lesson overlaps with {conflicts.length} existing lesson{conflicts.length > 1 ? 's' : ''}:
    </p>
    <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
      {conflicts.map(conflict => {
        const student = students.find(s => s.id === conflict.studentId);
        return (
          <div key={conflict.id} className="text-sm bg-white dark:bg-stone-700 rounded px-3 py-2">
            <span className="font-medium">{student?.name}</span> — {formatTime12Hour(conflict.time)} ({conflict.duration} min)
          </div>
        );
      })}
    </div>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => { setShowConflictWarning(false); setConflicts([]); }}
        className="px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
      >
        Go Back
      </button>
      <button
        type="button"
        onClick={handleForceSchedule}
        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
      >
        Schedule Anyway
      </button>
    </div>
  </div>
)}
```

**Step 5: Hide normal action buttons when conflict warning is showing**

Wrap the existing action buttons in a condition:

Old:
```jsx
{/* Actions */}
<div className="flex gap-3 pt-4">
```

New:
```jsx
{/* Actions */}
{!showConflictWarning && (
<div className="flex gap-3 pt-4">
```

And close the conditional after the action buttons div:

Old:
```jsx
              </div>
```

New:
```jsx
              </div>
)}
```

**Step 6: Verify**

In the demo account, schedule a new lesson at a time that overlaps with an existing one. The amber conflict warning should appear with the overlapping lesson details. "Go Back" dismisses it. "Schedule Anyway" creates the lesson.

**Step 7: Commit**

```bash
git add src/features/calendar/AddLessonModal.jsx
git commit -m "feat: conflict detection with warn+confirm in AddLessonModal"
```

---

### Task 9: Final Verification and Cleanup

**Step 1: Full manual test checklist**

Run the dev server and log in with the demo account. Verify each change:

- [ ] **Sidebar** is narrower (~192px), nav items still readable
- [ ] **Week view** opens scrolled to 7 AM
- [ ] **Week view** headers are sticky and aligned with grid columns when scrolling
- [ ] **Day view** opens scrolled to 7 AM
- [ ] **Lesson blocks** are sized by duration (15-min blocks are short, 60-min blocks are tall)
- [ ] **Lesson blocks** show student name, lesson type, and time (for 45+ min lessons)
- [ ] **Overlapping lessons** display side-by-side
- [ ] **Hover tooltip** appears without flickering, follows mouse, disappears on leave
- [ ] **Click empty space** in Day/Week view opens Schedule Lesson at correct time
- [ ] **Drag and drop** works — moving a lesson to an occupied slot shows conflict warning
- [ ] **Month view** — clicking any day number opens Schedule Lesson (even days with existing lessons)
- [ ] **Month view** — "+" button appears on hover in day cells
- [ ] **AddLessonModal** — scheduling at an occupied time shows amber conflict warning
- [ ] **AddLessonModal** — "Schedule Anyway" proceeds, "Go Back" dismisses
- [ ] **Dark mode** — all changes look correct in dark mode

**Step 2: Build verification**

Run: `npm run build`
Expected: No errors

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any issues found during final verification"
```

---

## File Summary

| # | File | Action | Task |
|---|------|--------|------|
| 1 | `src/utils/conflictDetection.js` | Create | 1 |
| 2 | `src/utils/overlapLayout.js` | Create | 1 |
| 3 | `src/components/layout/Sidebar.jsx` | Modify | 2 |
| 4 | `src/components/ui/LessonBlock.jsx` | Rewrite | 3 |
| 5 | `src/features/calendar/DayView.jsx` | Rewrite | 4 |
| 6 | `src/features/calendar/WeekView.jsx` | Rewrite | 5 |
| 7 | `src/features/calendar/CalendarView.jsx` | Modify | 6 |
| 8 | `src/features/calendar/MonthView.jsx` | Modify | 7 |
| 9 | `src/features/calendar/AddLessonModal.jsx` | Modify | 8 |
