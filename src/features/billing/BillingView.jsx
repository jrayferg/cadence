/**
 * BillingView.jsx
 * The main billing page — now a tab-based container.
 *
 * Four tabs:
 *   1. Dashboard — revenue cards, chart, overdue alerts
 *   2. Invoices  — create, view, print, filter invoices
 *   3. Payments  — record payments, view history, student balances
 *   4. Reports   — 5 report types with export
 *
 * This component manages the billing-specific state (invoices, payments,
 * billing settings) and passes it down to whichever tab is active.
 */

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { checkOverdueInvoices, DEFAULT_BILLING_SETTINGS } from '@/services/billingService';
import { DollarSign } from '@/components/icons';

// Tab components (will be built in Phases 2–5)
import DashboardTab from './tabs/DashboardTab';
import InvoicesTab from './tabs/InvoicesTab';
import PaymentsTab from './tabs/PaymentsTab';
import ReportsTab from './tabs/ReportsTab';

/** The 4 billing tabs */
const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'reports', label: 'Reports' },
];

function BillingView({ lessons, students, setStudents, user }) {
  // Which tab is active
  const [activeTab, setActiveTab] = useState('dashboard');

  // Billing-specific data stored in localStorage
  const [invoices, setInvoices] = useLocalStorage('cadence_invoices', []);
  const [payments, setPayments] = useLocalStorage('cadence_payments', []);
  const [billingSettings, setBillingSettings] = useLocalStorage(
    'cadence_billing_settings',
    DEFAULT_BILLING_SETTINGS
  );

  // On load, check for overdue invoices and update their status
  useEffect(() => {
    const updated = checkOverdueInvoices(invoices);
    if (updated !== invoices) {
      setInvoices(updated);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Props shared by all tabs
  const sharedProps = {
    lessons,
    students,
    setStudents,
    user,
    invoices,
    setInvoices,
    payments,
    setPayments,
    billingSettings,
    setBillingSettings,
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Billing</h2>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-stone-200 dark:border-stone-700">
        <nav className="flex gap-0 -mb-px overflow-x-auto" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === 'dashboard' && <DashboardTab {...sharedProps} />}
        {activeTab === 'invoices' && <InvoicesTab {...sharedProps} />}
        {activeTab === 'payments' && <PaymentsTab {...sharedProps} />}
        {activeTab === 'reports' && <ReportsTab {...sharedProps} />}
      </div>
    </div>
  );
}

export default BillingView;
