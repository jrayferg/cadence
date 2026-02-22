/**
 * CreateInvoiceModal.jsx
 * Modal form to create a new invoice.
 *
 * Features:
 *   - Student picker dropdown
 *   - Billing model selector (per-lesson / monthly / per-course)
 *   - Dynamic line items (add/remove rows)
 *   - Auto-populate from student's completed lessons
 *   - Discount + tax fields
 *   - Due date picker
 *   - Notes field
 */

import { useState } from 'react';
import { createInvoice, buildItemsFromLessons } from '@/services/billingService';
import { formatCurrency } from '@/utils/formatCurrency';
import { X, Plus } from '@/components/icons';

/** Empty line item template */
const BLANK_ITEM = { description: '', quantity: 1, rate: 0 };

function CreateInvoiceModal({
  students,
  lessons,
  invoices,
  setInvoices,
  billingSettings,
  setBillingSettings,
  onClose,
}) {
  const [studentId, setStudentId] = useState('');
  const [billingModel, setBillingModel] = useState(billingSettings.defaultBillingModel);
  const [items, setItems] = useState([{ ...BLANK_ITEM }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + billingSettings.defaultPaymentTermsDays);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Calculate totals live
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const total = subtotal - Number(discount) + Number(tax);

  /** Add a new blank line item */
  const addItem = () => setItems([...items, { ...BLANK_ITEM }]);

  /** Remove a line item by index */
  const removeItem = (index) => {
    if (items.length === 1) return; // Keep at least one row
    setItems(items.filter((_, i) => i !== index));
  };

  /** Update a field on a line item */
  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  /** Auto-populate line items from completed lessons */
  const autoPopulate = () => {
    if (!studentId) return;
    const lessonItems = buildItemsFromLessons(lessons, studentId);
    if (lessonItems.length > 0) {
      setItems(lessonItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })));
    }
  };

  /** Save the invoice */
  const handleSave = () => {
    if (!studentId) return;
    if (items.every(i => !i.description && !i.rate)) return;

    const result = createInvoice(invoices, billingSettings, {
      studentId,
      billingModel,
      items,
      discount: Number(discount),
      tax: Number(tax),
      dueDate,
      notes,
    });

    setInvoices(result.invoices);
    setBillingSettings(result.settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Create Invoice</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Row 1: Student + Billing Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Student *</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Billing Model</label>
              <select
                value={billingModel}
                onChange={(e) => setBillingModel(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="per-lesson">Per Lesson</option>
                <option value="monthly">Monthly Subscription</option>
                <option value="per-course">Per Course (Flat Fee)</option>
              </select>
            </div>
          </div>

          {/* Auto-populate button */}
          {studentId && (
            <button
              onClick={autoPopulate}
              className="text-sm text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition-colors"
            >
              Auto-fill from completed lessons
            </button>
          )}

          {/* Line Items */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Line Items</label>
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="col-span-5 px-2 py-1.5 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="col-span-2 px-2 py-1.5 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="col-span-2 px-2 py-1.5 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <div className="col-span-2 text-right text-sm font-medium text-stone-700 dark:text-stone-300">
                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0))}
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="col-span-1 p-1 text-stone-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium mt-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
            </div>
          </div>

          {/* Totals Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200 dark:border-stone-700">
            <div>
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Discount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Tax ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="text-xs text-stone-500 dark:text-stone-400">Subtotal: {formatCurrency(subtotal)}</div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-100">Total: {formatCurrency(total)}</div>
            </div>
          </div>

          {/* Due Date + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
            disabled={!studentId}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoiceModal;
