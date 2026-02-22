/**
 * PaymentsTab.jsx
 * The Payments tab — record payments, view history, track student balances.
 *
 * Layout:
 *   - Top bar: summary cards + "Record Payment" button
 *   - Student balances section (who owes money)
 *   - Payment history table (all payments)
 */

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Plus } from '@/components/icons';

import RecordPaymentModal from '../components/RecordPaymentModal';
import PaymentTable from '../components/PaymentTable';
import StudentBalanceList from '../components/StudentBalanceList';

function PaymentsTab({
  invoices,
  setInvoices,
  payments,
  setPayments,
  students,
}) {
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Summary calculations
  const summary = useMemo(() => {
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = invoices
      .filter(inv => inv.status !== 'void' && inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.balance, 0);
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

    return { totalReceived, totalOutstanding, overdueCount, paymentCount: payments.length };
  }, [payments, invoices]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Summary + Record Payment Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Mini summary cards */}
        <div className="flex flex-wrap gap-4">
          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Total Received</div>
            <div className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.totalReceived)}</div>
          </div>
          <div className="border-l border-stone-200 dark:border-stone-700 pl-4">
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Outstanding</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalOutstanding)}</div>
          </div>
          {summary.overdueCount > 0 && (
            <div className="border-l border-stone-200 dark:border-stone-700 pl-4">
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Overdue</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{summary.overdueCount}</div>
            </div>
          )}
        </div>

        {/* Record Payment button */}
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Student Balances */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
        <div className="px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Student Balances</h3>
        </div>
        <StudentBalanceList invoices={invoices} students={students} />
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
        <div className="px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Payment History</h3>
          {payments.length > 0 && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {summary.paymentCount} {summary.paymentCount === 1 ? 'payment' : 'payments'} recorded
            </p>
          )}
        </div>
        <PaymentTable payments={payments} students={students} invoices={invoices} />
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal
          invoices={invoices}
          setInvoices={setInvoices}
          payments={payments}
          setPayments={setPayments}
          students={students}
          onClose={() => setShowRecordModal(false)}
        />
      )}
    </div>
  );
}

export default PaymentsTab;
