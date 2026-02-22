/**
 * OverdueAlert.jsx
 * A red/amber banner that appears when there are overdue invoices.
 *
 * Shows:
 *   - How many invoices are overdue
 *   - Total overdue amount
 *   - A button to jump to the Invoices tab (filtered to overdue)
 *
 * Hidden when there are no overdue invoices.
 */

import { formatCurrency } from '@/utils/formatCurrency';

function OverdueAlert({ overdueInvoices, onViewOverdue }) {
  if (!overdueInvoices || overdueInvoices.length === 0) return null;

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const count = overdueInvoices.length;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-300">
            {count} Overdue {count === 1 ? 'Invoice' : 'Invoices'}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
            {formatCurrency(totalOverdue)} total outstanding past due date
          </p>
        </div>
      </div>
      {onViewOverdue && (
        <button
          onClick={onViewOverdue}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors self-start sm:self-center"
        >
          View Overdue
        </button>
      )}
    </div>
  );
}

export default OverdueAlert;
