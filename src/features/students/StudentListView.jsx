import { formatTime12Hour } from '@/utils/formatTime';

/**
 * StudentListView - Displays students in a table/list format.
 * Used in the list view mode of StudentsView.
 *
 * @param {Object} props
 * @param {Array} props.students - Filtered students array to display
 * @param {Array} props.lessons - All lessons array
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onViewProfile - Callback when a row is clicked to view profile
 */
    function StudentListView({ students, lessons, onEdit, onDelete, onViewProfile }) {
      // Get upcoming lesson for a student
      const getUpcomingLesson = (studentId) => {
        const now = new Date();
        return lessons
          .filter(l => l.studentId === studentId && l.status === 'scheduled')
          .filter(l => {
            const lessonDateTime = new Date(l.date + 'T' + l.time);
            return lessonDateTime >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
          })[0];
      };

      // Count total lessons for a student
      const getTotalLessons = (studentId) => {
        return lessons.filter(l => l.studentId === studentId).length;
      };

      // Format upcoming lesson
      const formatUpcomingLesson = (lesson) => {
        if (!lesson) return 'No upcoming lessons';
        const lessonDate = new Date(lesson.date + 'T00:00:00');
        const dayName = lessonDate.toLocaleDateString('en-US', { weekday: 'short' });
        const monthName = lessonDate.toLocaleDateString('en-US', { month: 'short' });
        const day = lessonDate.getDate();
        const time = formatTime12Hour(lesson.time);
        return `${dayName}, ${monthName} ${day}, ${time}`;
      };

      return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Upcoming Lesson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Lessons</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {students.map(student => {
                const upcomingLesson = getUpcomingLesson(student.id);
                const totalLessons = getTotalLessons(student.id);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer"
                    onClick={() => onViewProfile(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{student.name}</div>
                        {student.isMinor && student.parentName && (
                          <div className="text-xs text-stone-500 dark:text-stone-400">Parent: {student.parentName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                      {student.isMinor ? student.parentEmail : student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                      {student.isMinor ? student.parentPhone : student.phone || '\u2014'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${upcomingLesson ? 'text-teal-700 dark:text-teal-400 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                        {formatUpcomingLesson(upcomingLesson)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400">
                        {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                          className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

export default StudentListView;
