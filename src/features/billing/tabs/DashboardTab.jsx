/**
 * DashboardTab.jsx
 * The billing dashboard — the first thing you see on the Billing page.
 *
 * Sections (top to bottom):
 *   1. Overdue alert banner (only shows if invoices are past due)
 *   2. Four revenue summary cards
 *   3. Monthly revenue bar chart
 *   4. Revenue by student table
 *   5. Recent completed lessons
 */

import { getLessonRevenue, getInvoiceRevenue, getOverdueInvoices } from '@/services/billingService';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatTime12Hour } from '@/utils/formatTime';
import { DollarSign, CheckCircle } from '@/components/icons';

import RevenueCards from '../components/RevenueCards';
import RevenueChart from '../components/RevenueChart';
import OverdueAlert from '../components/OverdueAlert';

function DashboardTab({ lessons, students, invoices, payments }) {
  // Calculate revenue data
  const lessonRevenue = getLessonRevenue(lessons);
  const invoiceRevenue = getInvoiceRevenue(invoices);
  const overdueInvoices = getOverdueInvoices(invoices);

  // Revenue by student (from completed lessons)
  const studentRevenue = students
    .map(student => {
      const studentLessons = lessons.filter(
        l => l.studentId === student.id && l.status === 'completed'
      );
      const total = studentLessons.reduce((sum, l) => sum + (l.rate || 0), 0);
      return { student, total, count: studentLessons.length };
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.total - a.total);

  // Recent completed lessons (last 10)
  const recentLessons = lessons
    .filter(l => l.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Overdue alert — only shows if there are overdue invoices */}
      <OverdueAlert overdueInvoices={overdueInvoices} />

      {/* Revenue summary cards */}
      <RevenueCards lessonRevenue={lessonRevenue} invoiceRevenue={invoiceRevenue} />

      {/* Monthly bar chart */}
      <RevenueChart payments={payments} lessons={lessons} />

      {/* Revenue by Student */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
        <div className="px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Revenue by Student</h3>
        </div>

        {studentRevenue.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <DollarSign className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">No completed lessons yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {studentRevenue.slice(0, 10).map(({ student, total, count }) => (
              <div
                key={student.id}
                className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                    {student.name}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {count} {count === 1 ? 'lesson' : 'lessons'} completed
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-lg font-bold text-teal-700 dark:text-teal-400">
                    {formatCurrency(total)}
                  </div>
                  <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    {formatCurrency(total / count)}/avg
                  </div>
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

        {recentLessons.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <CheckCircle className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">No completed lessons yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {recentLessons.map(lesson => {
              const student = students.find(s => s.id === lesson.studentId);
              return (
                <div
                  key={lesson.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                      {student?.name || 'Unknown Student'}
                    </div>
                    <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                      {new Date(lesson.date + 'T00:00:00').toLocaleDateString()} at{' '}
                      {formatTime12Hour(lesson.time)} · {lesson.lessonType}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(lesson.rate)}
                    </div>
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

export default DashboardTab;
