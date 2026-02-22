/**
 * PaymentTable.jsx
 * Table showing payment history — all recorded payments.
 *
 * Columns: Date, Student, Invoice, Amount, Method
 * Sorted by most recent first.
 */

import { formatCurrency } from '@/utils/formatCurrency';

const METHOD_LABELS = {
  cash: 'Cash',
  check: 'Check',
  venmo: 'Venmo',
  zelle: 'Zelle',
  card: 'Card',
  other: 'Other',
};

function PaymentTable({ payments, students, invoices }) {
  if (payments.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center">
        <svg className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="1.5" />
          <line x1="1" y1="10" x2="23" y2="10" strokeWidth="1.5" />
        </svg>
        <p className="text-stone-600 dark:text-stone-400 font-medium">No payments recorded</p>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">Payments will appear here once recorded against invoices.</p>
      </div>
    );
  }

  // Sort by date, most recent first
  const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700">
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Date</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Student</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:table-cell">Invoice</th>
            <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Amount</th>
            <th className="text-center px-4 sm:px-6 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:table-cell">Method</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
          {sorted.map(payment => {
            const student = students.find(s => s.id === payment.studentId);
            const invoice = invoices.find(i => i.id === payment.invoiceId);
            return (
              <tr key={payment.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="text-sm text-stone-900 dark:text-stone-100">
                    {new Date(payment.date + 'T00:00:00').toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate max-w-[150px]">
                    {student?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {invoice?.invoiceNumber || '—'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                  <span className="inline-block px-2.5 py-1 text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-full">
                    {METHOD_LABELS[payment.method] || payment.method}
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

export default PaymentTable;
