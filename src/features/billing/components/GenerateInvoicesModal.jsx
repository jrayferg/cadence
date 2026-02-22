/**
 * GenerateInvoicesModal.jsx
 * Multi-step modal for generating invoices from calendar data.
 *
 * Step 1: Select billing period (month picker or custom range)
 * Step 2: Preview generated invoices (table with checkboxes)
 * Step 3: Confirmation (success message with count)
 *
 * This is the core feature connecting calendar → billing.
 */

import { useState, useMemo } from 'react';
import { X, FileText } from '@/components/icons';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  generateInvoicePreviews,
  createBatchInvoices,
} from '@/services/billingService';
import BillingModelBadge from './BillingModelBadge';

/** Build the last N months as selectable options */
function buildMonthOptions(count = 7) {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

/** Compute start/end dates and label from period selection */
function computePeriodDates(periodType, selectedMonth, customStart, customEnd) {
  if (periodType === 'month') {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const periodLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { startDate, endDate, periodLabel };
  }
  return {
    startDate: customStart,
    endDate: customEnd,
    periodLabel: `${new Date(customStart + 'T00:00:00').toLocaleDateString()} – ${new Date(customEnd + 'T00:00:00').toLocaleDateString()}`,
  };
}

function GenerateInvoicesModal({
  students,
  lessons,
  invoices,
  setInvoices,
  billingSettings,
  setBillingSettings,
  user,
  onClose,
}) {
  // Step state
  const [step, setStep] = useState(1);

  // Period selection (Step 1)
  const [periodType, setPeriodType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Preview data (Step 2)
  const [previews, setPreviews] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSkipped, setShowSkipped] = useState(false);

  // Result (Step 3)
  const [createdCount, setCreatedCount] = useState(0);

  const monthOptions = useMemo(() => buildMonthOptions(7), []);

  // ── Step 1: Generate Preview ──────────────────────────────────────

  const handleGeneratePreview = () => {
    const { startDate, endDate, periodLabel } = computePeriodDates(
      periodType, selectedMonth, customStart, customEnd
    );

    if (!startDate || !endDate) return;

    const result = generateInvoicePreviews(
      students, lessons, invoices, startDate, endDate, periodLabel
    );

    setPreviews(result.previews);
    setSkipped(result.skipped);
    setSelectedIds(new Set(result.previews.map(p => p.studentId)));
    setStep(2);
  };

  // ── Step 2: Toggle selection ──────────────────────────────────────

  const toggleStudent = (studentId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === previews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(previews.map(p => p.studentId)));
    }
  };

  // Summary calculations for step 2
  const selectedPreviews = previews.filter(p => selectedIds.has(p.studentId));
  const totalLessons = selectedPreviews.reduce((sum, p) => sum + p.lessonCount, 0);
  const totalAmount = selectedPreviews.reduce((sum, p) => sum + p.subtotal, 0);

  // ── Step 2: Create Invoices ───────────────────────────────────────

  const handleCreateInvoices = () => {
    const { startDate, endDate } = computePeriodDates(
      periodType, selectedMonth, customStart, customEnd
    );

    const approved = previews.filter(p => selectedIds.has(p.studentId));
    if (approved.length === 0) return;

    const result = createBatchInvoices(
      invoices, billingSettings, approved, startDate, endDate
    );

    setInvoices(result.invoices);
    setBillingSettings(result.settings);
    setCreatedCount(result.newInvoices.length);
    setStep(3);
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Generate Invoices</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {step === 1 && 'Select billing period'}
                {step === 2 && 'Review & confirm'}
                {step === 3 && 'Done!'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-teal-700 text-white' :
                  step > s ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400' :
                  'bg-stone-200 dark:bg-stone-600 text-stone-500 dark:text-stone-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${step > s ? 'bg-teal-700' : 'bg-stone-200 dark:bg-stone-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

          {/* ── STEP 1: Select Period ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Period type toggle */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Billing Period
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPeriodType('month')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      periodType === 'month'
                        ? 'bg-teal-700 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                    }`}
                  >
                    By Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodType('custom')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      periodType === 'custom'
                        ? 'bg-teal-700 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
              </div>

              {/* Month selector */}
              {periodType === 'month' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {monthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom date range */}
              {periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* Info text */}
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3">
                <p className="text-sm text-teal-800 dark:text-teal-300">
                  The system will count lessons from the calendar for each student and generate draft invoices based on their billing model (per-lesson rate or flat monthly fee).
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Preview & Select ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Preview info bar */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Found <span className="font-semibold text-stone-900 dark:text-stone-100">{previews.length}</span> student{previews.length !== 1 ? 's' : ''} to invoice
                </p>
                {previews.length > 0 && (
                  <button
                    onClick={toggleAll}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium"
                  >
                    {selectedIds.size === previews.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Preview table */}
              {previews.length > 0 ? (
                <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-700/50">
                        <th className="w-10 px-3 py-2"></th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Student</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Model</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Lessons</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                      {previews.map(preview => (
                        <tr
                          key={preview.studentId}
                          className={`transition-colors cursor-pointer ${
                            selectedIds.has(preview.studentId)
                              ? 'bg-teal-50/50 dark:bg-teal-900/10'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-700/30'
                          }`}
                          onClick={() => toggleStudent(preview.studentId)}
                        >
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(preview.studentId)}
                              onChange={() => toggleStudent(preview.studentId)}
                              className="w-4 h-4 accent-teal-700 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-stone-900 dark:text-stone-100">
                              {preview.studentName}
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {preview.items.map(i => i.description).join(', ')}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <BillingModelBadge model={preview.billingModel} />
                          </td>
                          <td className="px-3 py-3 text-center text-stone-600 dark:text-stone-400">
                            {preview.lessonCount}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-stone-900 dark:text-stone-100">
                            {formatCurrency(preview.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone-500 dark:text-stone-400 font-medium">No invoices to generate</p>
                  <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                    No students have lessons in this period, or all have already been invoiced.
                  </p>
                </div>
              )}

              {/* Skipped students */}
              {skipped.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSkipped(!showSkipped)}
                    className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 font-medium"
                  >
                    {showSkipped ? '▾' : '▸'} {skipped.length} student{skipped.length !== 1 ? 's' : ''} skipped
                  </button>
                  {showSkipped && (
                    <div className="mt-2 space-y-1">
                      {skipped.map(s => (
                        <div key={s.studentId} className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-stone-700/50 rounded text-xs">
                          <span className="text-stone-700 dark:text-stone-300">{s.studentName}</span>
                          <span className="text-stone-500 dark:text-stone-400">{s.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Summary footer */}
              {selectedPreviews.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedPreviews.length}</span> invoice{selectedPreviews.length !== 1 ? 's' : ''}
                    {' · '}
                    <span>{totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                {createdCount} Invoice{createdCount !== 1 ? 's' : ''} Created
              </h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                All invoices were created as <span className="font-medium text-stone-700 dark:text-stone-300">drafts</span>.
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Review them in the Invoices tab, then finalize when ready.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-700">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              {step === 3 ? 'Close' : 'Cancel'}
            </button>

            {step === 1 && (
              <button
                onClick={handleGeneratePreview}
                disabled={periodType === 'custom' && (!customStart || !customEnd)}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Preview Invoices
              </button>
            )}

            {step === 2 && previews.length > 0 && (
              <button
                onClick={handleCreateInvoices}
                disabled={selectedIds.size === 0}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create {selectedIds.size} Draft{selectedIds.size !== 1 ? 's' : ''}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Invoices
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateInvoicesModal;
