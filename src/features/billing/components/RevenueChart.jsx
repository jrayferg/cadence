/**
 * RevenueChart.jsx
 * A CSS-only bar chart showing monthly revenue for the last 6 months.
 *
 * No chart library needed — each bar is a div with a percentage height.
 * The tallest month gets 100% height, others scale relative to it.
 *
 * When there are no payments yet, it falls back to showing lesson-based
 * revenue so the chart isn't empty on first use.
 */

import { formatCurrency } from '@/utils/formatCurrency';
import { getMonthlyRevenue } from '@/services/billingService';

function RevenueChart({ payments, lessons }) {
  // Get payment-based monthly data
  let monthlyData = getMonthlyRevenue(payments, 6);

  // If no payments exist, build chart from completed lessons instead
  const hasPayments = payments.length > 0;
  if (!hasPayments) {
    monthlyData = buildLessonMonthlyData(lessons, 6);
  }

  // Find the max value so we can scale bars as percentages
  const maxValue = Math.max(...monthlyData.map(m => m.total), 1);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl p-5 sm:p-6 border border-stone-200 dark:border-stone-700 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Monthly Revenue</h3>
        <span className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">
          {hasPayments ? 'From payments' : 'From lessons'}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 sm:gap-4 h-48">
        {monthlyData.map((month, i) => {
          const heightPercent = maxValue > 0 ? (month.total / maxValue) * 100 : 0;
          const isEmpty = month.total === 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
              {/* Amount label above bar */}
              <div className="text-xs font-medium text-stone-600 dark:text-stone-400 whitespace-nowrap">
                {isEmpty ? '' : formatCurrency(month.total)}
              </div>

              {/* Bar container (fills remaining height) */}
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isEmpty
                      ? 'bg-stone-100 dark:bg-stone-700 min-h-[4px]'
                      : 'bg-teal-500 dark:bg-teal-400'
                  }`}
                  style={{ height: isEmpty ? '4px' : `${Math.max(heightPercent, 5)}%` }}
                  title={`${month.label}: ${formatCurrency(month.total)}`}
                />
              </div>

              {/* Month label */}
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                {month.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fallback: build monthly totals from completed lesson rates.
 * Used when no payment records exist yet.
 */
function buildLessonMonthlyData(lessons, months) {
  const result = [];
  const now = new Date();
  const completed = lessons.filter(l => l.status === 'completed');

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const monthLessons = completed.filter(l => {
      const ld = new Date(l.date + 'T00:00:00');
      return ld.getFullYear() === year && ld.getMonth() === month;
    });
    const total = monthLessons.reduce((sum, l) => sum + (l.rate || 0), 0);

    result.push({ label, total, year, month });
  }

  return result;
}

export default RevenueChart;
