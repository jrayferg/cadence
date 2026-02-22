/**
 * RecordPaymentModal.jsx
 * Modal to record a manual payment against an invoice.
 *
 * Features:
 *   - Invoice selector (shows unpaid/partial/overdue invoices)
 *   - OR pass in a specific invoice to pre-select
 *   - Amount field (defaults to remaining balance)
 *   - Payment method picker (cash, check, venmo, zelle, card, other)
 *   - Date picker (defaults to today)
 *   - Notes field
 */

import { useState } from 'react';
import { recordPayment } from '@/services/billingService';
import { formatCurrency } from '@/utils/formatCurrency';
import { X } from '@/components/icons';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'other', label: 'Other' },
];

function RecordPaymentModal({
  invoices,
  setInvoices,
  payments,
  setPayments,
  students,
  preSelectedInvoiceId,
  onClose,
}) {
  // Only show invoices that can receive payments
  const payableInvoices = invoices.filter(
    inv => inv.status === 'unpaid' || inv.status === 'partial' || inv.status === 'overdue'
  );

  const [invoiceId, setInvoiceId] = useState(preSelectedInvoiceId || '');
  const selectedInvoice = invoices.find(inv => inv.id === invoiceId);

  const [amount, setAmount] = useState(selectedInvoice ? selectedInvoice.balance : '');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // When invoice changes, update the amount to the remaining balance
  const handleInvoiceChange = (newInvoiceId) => {
    setInvoiceId(newInvoiceId);
    const inv = invoices.find(i => i.id === newInvoiceId);
    if (inv) setAmount(inv.balance);
  };

  const handleSave = () => {
    if (!invoiceId || !amount || Number(amount) <= 0) return;

    const result = recordPayment(invoices, payments, {
      invoiceId,
      studentId: selectedInvoice?.studentId,
      amount: Number(amount),
      method,
      date,
      notes,
    });

    setInvoices(result.invoices);
    setPayments(result.payments);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-md my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Record Payment</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Invoice Selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Invoice *</label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select invoice...</option>
              {payableInvoices.map(inv => {
                const student = students.find(s => s.id === inv.studentId);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {student?.name} ({formatCurrency(inv.balance)} due)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Invoice Summary (when selected) */}
          {selectedInvoice && (
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Total</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-stone-500 dark:text-stone-400">Already Paid</span>
                <span className="text-green-700 dark:text-green-400">{formatCurrency(selectedInvoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between mt-1 font-semibold">
                <span className="text-stone-700 dark:text-stone-300">Balance Due</span>
                <span className="text-red-600 dark:text-red-400">{formatCurrency(selectedInvoice.balance)}</span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Payment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!invoiceId || !amount || Number(amount) <= 0}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
