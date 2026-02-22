/**
 * StudentBalanceList.jsx
 * Shows which students owe money, sorted by amount (highest first).
 *
 * Each row shows:
 *   - Student name
 *   - Number of overdue invoices (if any, in red)
 *   - Total outstanding balance
 */

import { formatCurrency } from '@/utils/formatCurrency';
import { getOutstandingBalances } from '@/services/billingService';

function StudentBalanceList({ invoices, students }) {
  const balances = getOutstandingBalances(invoices, students);

  if (balances.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 text-green-300 dark:text-green-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-stone-600 dark:text-stone-400 font-medium">All caught up!</p>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">No outstanding balances.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100 dark:divide-stone-700">
      {balances.map(({ student, balance, overdueCount }) => (
        <div
          key={student.id}
          className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
        >
          <div className="min-w-0 flex-1 mr-3">
            <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
              {student.name}
            </div>
            {overdueCount > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {overdueCount} overdue {overdueCount === 1 ? 'invoice' : 'invoices'}
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-base font-bold text-red-600 dark:text-red-400">
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentBalanceList;
