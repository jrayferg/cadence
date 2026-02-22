/**
 * InvoicesTab.jsx
 * The Invoices tab — generate, create, view, filter, and print invoices.
 *
 * Layout:
 *   - Top bar: status filter pills + "Generate Invoices" + "Manual Invoice" buttons
 *   - Batch action bar (Finalize All Drafts when viewing drafts)
 *   - Invoice table (sortable, clickable rows)
 *   - Modals: GenerateInvoicesModal, CreateInvoiceModal, InvoiceDetailModal
 *   - Print: opens InvoicePreview in a new window
 */

import { useState, useMemo } from 'react';
import { Plus, FileText } from '@/components/icons';
import { finalizeAllDrafts } from '@/services/billingService';

import InvoiceTable from '../components/InvoiceTable';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import GenerateInvoicesModal from '../components/GenerateInvoicesModal';
import { printInvoice } from '../components/InvoicePreview';

/** Filter pills for invoice status */
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'paid', label: 'Paid' },
  { id: 'void', label: 'Void' },
];

function InvoicesTab({
  invoices,
  setInvoices,
  students,
  lessons,
  payments,
  user,
  billingSettings,
  setBillingSettings,
  setPayments,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filter invoices by status
  const filteredInvoices = useMemo(() => {
    const sorted = [...invoices].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );
    if (statusFilter === 'all') return sorted;
    return sorted.filter(inv => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  // Count by status (for filter pill badges)
  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, unpaid: 0, partial: 0, overdue: 0, paid: 0, void: 0 };
    invoices.forEach(inv => { c[inv.status] = (c[inv.status] || 0) + 1; });
    return c;
  }, [invoices]);

  const handleViewInvoice = (invoice) => setSelectedInvoice(invoice);

  const handlePrint = (invoice) => {
    const student = students.find(s => s.id === invoice.studentId);
    printInvoice(invoice, student, user);
  };

  const handleFinalizeAll = () => {
    const draftCount = counts.draft;
    if (draftCount === 0) return;
    if (window.confirm(`Finalize all ${draftCount} draft invoice${draftCount !== 1 ? 's' : ''}? They will become active and payable.`)) {
      setInvoices(finalizeAllDrafts(invoices));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Filters + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === filter.id
                  ? 'bg-teal-700 text-white dark:bg-teal-600'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              {filter.label}
              {counts[filter.id] > 0 && (
                <span className={`ml-1.5 ${statusFilter === filter.id ? 'text-teal-200' : 'text-stone-400 dark:text-stone-500'}`}>
                  {counts[filter.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate Invoices
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-medium rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manual Invoice
          </button>
        </div>
      </div>

      {/* Batch action bar for drafts */}
      {statusFilter === 'draft' && counts.draft > 0 && (
        <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-700/50 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-700">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-900 dark:text-stone-100">{counts.draft}</span> draft invoice{counts.draft !== 1 ? 's' : ''} ready to finalize
          </p>
          <button
            onClick={handleFinalizeAll}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Finalize All
          </button>
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
        <InvoiceTable
          invoices={filteredInvoices}
          students={students}
          onViewInvoice={handleViewInvoice}
        />
      </div>

      {/* Generate Invoices Modal */}
      {showGenerateModal && (
        <GenerateInvoicesModal
          students={students}
          lessons={lessons}
          invoices={invoices}
          setInvoices={setInvoices}
          billingSettings={billingSettings}
          setBillingSettings={setBillingSettings}
          user={user}
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {/* Manual Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          students={students}
          lessons={lessons}
          invoices={invoices}
          setInvoices={setInvoices}
          billingSettings={billingSettings}
          setBillingSettings={setBillingSettings}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={invoices.find(i => i.id === selectedInvoice.id) || selectedInvoice}
          student={students.find(s => s.id === selectedInvoice.studentId)}
          payments={payments}
          invoices={invoices}
          setInvoices={setInvoices}
          onClose={() => setSelectedInvoice(null)}
          onPrint={handlePrint}
          onRecordPayment={(inv) => {
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}

export default InvoicesTab;
