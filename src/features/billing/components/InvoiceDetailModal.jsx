/**
 * InvoiceDetailModal.jsx
 * View a single invoice in read-only detail.
 *
 * Shows:
 *   - Invoice number, status badge, billing model
 *   - Student name, dates
 *   - Line items table
 *   - Subtotal, discount, tax, total, amount paid, balance
 *   - Payment history for this invoice
 *   - Action buttons: Print, Record Payment, Void
 */

import { formatCurrency } from '@/utils/formatCurrency';
import { voidInvoice } from '@/services/billingService';
import { X } from '@/components/icons';

const STATUS_STYLES = {
  paid:    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  unpaid:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  void:    'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400',
};

const BILLING_MODEL_LABELS = {
  'per-lesson': 'Per Lesson',
  'monthly': 'Monthly Subscription',
  'per-course': 'Per Course',
};

function InvoiceDetailModal({ invoice, student, payments, invoices, setInvoices, onClose, onPrint, onRecordPayment }) {
  if (!invoice) return null;

  // Payments made against this invoice
  const invoicePayments = payments.filter(p => p.invoiceId === invoice.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleVoid = () => {
    if (window.confirm('Void this invoice? This cannot be undone.')) {
      setInvoices(voidInvoice(invoices, invoice.id));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{invoice.invoiceNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${STATUS_STYLES[invoice.status]}`}>
                {invoice.status}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {BILLING_MODEL_LABELS[invoice.billingModel] || invoice.billingModel}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Student + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Student</div>
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{student?.name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Created</div>
              <div className="text-sm text-stone-700 dark:text-stone-300 mt-0.5">
                {new Date(invoice.createdDate + 'T00:00:00').toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">Due Date</div>
              <div className={`text-sm font-medium mt-0.5 ${
                invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-stone-700 dark:text-stone-300'
              }`}>
                {new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-700/50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400">Description</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400">Qty</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400">Rate</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-stone-900 dark:text-stone-100">{item.description}</td>
                    <td className="px-3 py-2 text-center text-stone-600 dark:text-stone-400">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-stone-600 dark:text-stone-400">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-2 text-right font-medium text-stone-900 dark:text-stone-100">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex justify-between w-48">
              <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
              <span className="text-stone-900 dark:text-stone-100">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between w-48">
                <span className="text-stone-500 dark:text-stone-400">Discount</span>
                <span className="text-green-700 dark:text-green-400">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between w-48">
                <span className="text-stone-500 dark:text-stone-400">Tax</span>
                <span className="text-stone-900 dark:text-stone-100">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between w-48 pt-1 border-t border-stone-200 dark:border-stone-700 font-bold">
              <span className="text-stone-900 dark:text-stone-100">Total</span>
              <span className="text-stone-900 dark:text-stone-100">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between w-48">
              <span className="text-stone-500 dark:text-stone-400">Paid</span>
              <span className="text-green-700 dark:text-green-400">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between w-48 text-base font-bold">
              <span className="text-stone-900 dark:text-stone-100">Balance</span>
              <span className={invoice.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>
                {formatCurrency(invoice.balance)}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {invoicePayments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Payment History</h4>
              <div className="space-y-2">
                {invoicePayments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-stone-700/50 rounded-lg text-sm">
                    <div>
                      <span className="text-stone-900 dark:text-stone-100 font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 ml-2">via {payment.method}</span>
                    </div>
                    <span className="text-stone-500 dark:text-stone-400">
                      {new Date(payment.date + 'T00:00:00').toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">Notes</h4>
              <p className="text-sm text-stone-600 dark:text-stone-400">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-700">
          <div className="flex gap-2">
            {invoice.status !== 'void' && invoice.status !== 'paid' && (
              <button
                onClick={handleVoid}
                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Void Invoice
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPrint && onPrint(invoice)}
              className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors"
            >
              Print
            </button>
            {invoice.status !== 'void' && invoice.status !== 'paid' && (
              <button
                onClick={() => onRecordPayment && onRecordPayment(invoice)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Record Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailModal;
