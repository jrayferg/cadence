/**
 * LessonBlock.jsx
 * The colored lesson card used in Day, Week, and Month calendar views.
 *
 * Shows the lesson time, student name, and lesson type.
 * Color-coded by status:
 *   - Blue = Scheduled (upcoming)
 *   - Green = Completed
 *   - Red = Cancelled
 *
 * Supports drag-and-drop for rescheduling (only for scheduled lessons).
 */

import { formatTime12Hour } from '@/utils/formatTime';

function LessonBlock({ lesson, student, onClick, onDragStart, onHover, onHoverEnd, compact = false }) {
  const statusColors = {
    scheduled: 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-200',
    completed: 'bg-green-100 border-green-400 text-green-900 dark:bg-green-900/40 dark:border-green-500 dark:text-green-200',
    cancelled: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200',
  };

  return (
    <button
      onClick={onClick}
      draggable={lesson.status === 'scheduled'}
      onDragStart={() => onDragStart && onDragStart()}
      onMouseEnter={(e) => onHover && onHover(e)}
      onMouseMove={(e) => onHover && onHover(e)}
      onMouseLeave={() => onHoverEnd && onHoverEnd()}
      className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all hover:shadow-lg ${
        lesson.status === 'scheduled' ? 'cursor-move' : ''
      } ${statusColors[lesson.status] || statusColors.scheduled}`}
    >
      <div className="font-semibold text-sm">{formatTime12Hour(lesson.time)}</div>
      <div className={compact ? 'text-xs truncate' : 'text-sm font-medium'}>{student?.name}</div>
      {!compact && <div className="text-xs opacity-90">{lesson.lessonType}</div>}
    </button>
  );
}

export default LessonBlock;
