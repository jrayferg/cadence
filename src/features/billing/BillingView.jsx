import { useState } from 'react';
import { formatTime12Hour } from '@/utils/formatTime';
import {
  Calendar, CheckCircle, ChevronDown, DollarSign
} from '@/components/icons';

/**
 * BillingView - Displays billing summary, revenue by student, and recent completed lessons.
 * Supports search filtering and view mode toggling between summary and transactions.
 *
 * @param {Object} props
 * @param {Array} props.lessons - All lessons array
 * @param {Array} props.students - All students array
 */
    function BillingView({ lessons, students }) {
      const [searchQuery, setSearchQuery] = useState('');
      const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'transactions'

      const completedLessons = lessons.filter(l => l.status === 'completed');
      const scheduledLessons = lessons.filter(l => l.status === 'scheduled');

      const totalEarned = completedLessons.reduce((sum, l) => sum + (l.rate || 0), 0);
      const totalPending = scheduledLessons.reduce((sum, l) => sum + (l.rate || 0), 0);

      const studentRevenue = students.map(student => {
        const studentLessons = completedLessons.filter(l => l.studentId === student.id);
        const total = studentLessons.reduce((sum, l) => sum + (l.rate || 0), 0);
        return { student, total, count: studentLessons.length };
      }).filter(s => s.count > 0).sort((a, b) => b.total - a.total);

      // Filter student revenue by search
      const filteredRevenue = studentRevenue.filter(item => {
        if (!searchQuery) return true;
        return item.student.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      // Filter recent lessons by search
      const filteredRecentLessons = completedLessons
        .filter(lesson => {
          if (!searchQuery) return true;
          const student = students.find(s => s.id === lesson.studentId);
          return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      // Export function
      const handleExport = () => {
        let exportText = `Billing Report\n\n`;
        exportText += `Total Earned: $${totalEarned.toFixed(2)}\n`;
        exportText += `Scheduled Revenue: $${totalPending.toFixed(2)}\n`;
        exportText += `Total Potential: $${(totalEarned + totalPending).toFixed(2)}\n\n`;
        exportText += `Revenue by Student:\n`;
        studentRevenue.forEach(({ student, total, count }) => {
          exportText += `${student.name}: $${total.toFixed(2)} (${count} lessons)\n`;
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'billing-report.txt';
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <div className="animate-fade-in space-y-4 sm:space-y-6">
          {/* Billing Header - Row 1: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Billing</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full sm:w-80 transition-colors"
              />
              <svg className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Billing Header - Row 2: View Dropdown + Print/Export (Right) */}
          <div className="flex items-center justify-end">
            {/* Right: View Dropdown + Print/Export */}
            <div className="flex items-center gap-2">
              {/* View Dropdown */}
              <div className="relative">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="appearance-none px-3 sm:px-4 py-2 pr-8 sm:pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                >
                  <option value="summary">Summary</option>
                  <option value="transactions">Transactions</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Print"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Export"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Earned</span>
              </div>
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">{completedLessons.length} lessons completed</div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Scheduled Revenue</span>
              </div>
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">${totalPending.toFixed(2)}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">{scheduledLessons.length} upcoming lessons</div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-700 dark:text-teal-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Total Potential</span>
              </div>
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">${(totalEarned + totalPending).toFixed(2)}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">All lessons</div>
            </div>
          </div>

          {/* Revenue by Student */}
          <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
            <div className="px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Revenue by Student</h3>
            </div>

            {filteredRevenue.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <DollarSign className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <p className="text-stone-600 dark:text-stone-400">
                  {studentRevenue.length === 0 ? 'No completed lessons yet' : 'No students found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700">
                {filteredRevenue.map(({ student, total, count }) => (
                  <div key={student.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100 truncate">{student.name}</div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">{count} lessons completed</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base sm:text-lg font-bold text-teal-700 dark:text-teal-400">${total.toFixed(2)}</div>
                      <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">${(total / count).toFixed(2)}/avg</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Completed Lessons */}
          <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
            <div className="px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Recent Completed Lessons</h3>
            </div>

            {filteredRecentLessons.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <CheckCircle className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <p className="text-stone-600 dark:text-stone-400">
                  {completedLessons.length === 0 ? 'No completed lessons yet' : 'No lessons found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-700">
                {filteredRecentLessons.map(lesson => {
                  const student = students.find(s => s.id === lesson.studentId);
                  return (
                    <div key={lesson.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="font-medium text-stone-900 dark:text-stone-100 truncate">{student?.name}</div>
                        <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                          {new Date(lesson.date + 'T00:00:00').toLocaleDateString()} at {formatTime12Hour(lesson.time)} • {lesson.lessonType}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-green-700 dark:text-green-400">${lesson.rate}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">{lesson.duration} min</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

export default BillingView;
