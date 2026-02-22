import { formatTime12Hour } from '@/utils/formatTime';

/**
 * StudentCard - Displays a student as a card with contact info and upcoming lesson.
 * Used in the cards view mode of StudentsView.
 *
 * @param {Object} props
 * @param {Object} props.student - The student object
 * @param {Array} props.lessons - All lessons array
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onViewProfile - Callback when card is clicked to view profile
 * @param {Array} props.lessonTypes - Available lesson types from user settings
 */
    function StudentCard({ student, lessons, onEdit, onDelete, onViewProfile, lessonTypes }) {
      const defaultType = lessonTypes.find(t => t.name === student.defaultLessonType);

      // Find next upcoming lesson for this student
      const now = new Date();
      const upcomingLesson = lessons
        .filter(l => l.studentId === student.id && l.status === 'scheduled')
        .filter(l => {
          const lessonDateTime = new Date(l.date + 'T' + l.time);
          return lessonDateTime >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.time);
          const dateB = new Date(b.date + 'T' + b.time);
          return dateA - dateB;
        })[0];

      // Format upcoming lesson date
      const formatUpcomingLesson = (lesson) => {
        if (!lesson) return null;
        const lessonDate = new Date(lesson.date + 'T00:00:00');
        const dayName = lessonDate.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = lessonDate.toLocaleDateString('en-US', { month: 'long' });
        const day = lessonDate.getDate();
        const year = lessonDate.getFullYear();
        const time = formatTime12Hour(lesson.time);
        return `${dayName}, ${monthName} ${day}, ${year}, ${time}`;
      };

      return (
        <div
          className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 hover:shadow-md transition-all cursor-pointer"
          onClick={() => onViewProfile(student)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{student.name}</h3>
              {student.isMinor && student.parentName && (
                <p className="text-sm text-stone-500 dark:text-stone-400">Parent: {student.parentName}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{student.isMinor ? student.parentEmail : student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{student.isMinor ? student.parentPhone : student.phone}</span>
              </div>
            )}
            {upcomingLesson ? (
              <div className="flex items-start gap-2 pt-3 border-t border-stone-100 dark:border-stone-700">
                <div className="flex-1">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">Upcoming Lesson</span>
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">{formatUpcomingLesson(upcomingLesson)}</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
                <span className="text-xs text-stone-400 dark:text-stone-500">No upcoming lessons</span>
              </div>
            )}
          </div>
        </div>
      );
    }

export default StudentCard;
