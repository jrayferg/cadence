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
