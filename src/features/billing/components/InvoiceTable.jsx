/**
 * InvoiceTable.jsx
 * A sortable, filterable table of all invoices.
 *
 * Columns: Invoice #, Student, Date, Due Date, Total, Status, Actions
 * Status badges are color-coded:
 *   - Green  = Paid
 *   - Blue   = Unpaid
 *   - Amber  = Partial
 *   - Red    = Overdue
 *   - Gray   = Void
 */

import { formatCurrency } from '@/utils/formatCurrency';

/** Color mapping for invoice statuses */
const STATUS_STYLES = {
  draft:   'bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-200',
  paid:    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  unpaid:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  void:    'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400',
};

function InvoiceTable({ invoices, students, onViewInvoice }) {
  if (invoices.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <svg className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-stone-600 dark:text-stone-400 font-medium">No invoices yet</p>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">Create your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700">
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Invoice</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Student</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden md:table-cell">Due</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total</th>
            <th className="text-center px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
          {invoices.map(invoice => {
            const student = students.find(s => s.id === invoice.studentId);
            return (
              <tr
                key={invoice.id}
                onClick={() => onViewInvoice && onViewInvoice(invoice)}
                className="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer"
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                    {invoice.invoiceNumber}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="text-sm text-stone-900 dark:text-stone-100 truncate max-w-[150px]">
                    {student?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {new Date(invoice.createdDate + 'T00:00:00').toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {formatCurrency(invoice.total)}
                  </div>
                  {invoice.balance > 0 && invoice.balance < invoice.total && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {formatCurrency(invoice.balance)} due
                    </div>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_STYLES[invoice.status] || STATUS_STYLES.unpaid}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceTable;
