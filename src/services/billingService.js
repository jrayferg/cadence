/**
 * billingService.js
 * All billing business logic lives here — invoices, payments, balances.
 *
 * Every function is "pure-ish": takes data in, returns new data out.
 * Components call the setter (like setInvoices) with the result.
 *
 * Data shapes:
 *
 * Invoice: {
 *   id, invoiceNumber, studentId,
 *   status: 'unpaid' | 'paid' | 'partial' | 'overdue' | 'void',
 *   createdDate, dueDate,
 *   items: [{ description, quantity, rate, amount }],
 *   subtotal, discount, tax, total,
 *   amountPaid, balance,
 *   billingModel: 'per-lesson' | 'monthly' | 'per-course',
 *   notes
 * }
 *
 * Payment: {
 *   id, invoiceId, studentId,
 *   amount, method: 'cash' | 'check' | 'venmo' | 'zelle' | 'card' | 'other',
 *   date, notes
 * }
 *
 * BillingSettings: {
 *   defaultBillingModel, invoicePrefix, nextInvoiceNumber,
 *   defaultPaymentTermsDays, acceptedMethods[]
 * }
 */

// ── Helpers ──────────────────────────────────────────────────────────

/** Generate a unique ID (same pattern used elsewhere in the app) */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/** Get today's date as YYYY-MM-DD string */
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/** Add days to a date string, return YYYY-MM-DD */
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}


// ── Default Billing Settings ─────────────────────────────────────────

export const DEFAULT_BILLING_SETTINGS = {
  defaultBillingModel: 'per-lesson',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1001,
  defaultPaymentTermsDays: 30,
  acceptedMethods: ['cash', 'check', 'venmo', 'zelle', 'card'],
};


// ── Invoice CRUD ─────────────────────────────────────────────────────

/**
 * Create a new invoice.
 * @param {Array} invoices - Current invoices array
 * @param {Object} settings - Billing settings (for invoice number)
 * @param {Object} data - The invoice data (studentId, items, etc.)
 * @returns {{ invoices: Array, settings: Object, newInvoice: Object }}
 */
export function createInvoice(invoices, settings, data) {
  const invoiceNumber = `${settings.invoicePrefix}-${settings.nextInvoiceNumber}`;

  // Calculate line item amounts and totals
  const items = (data.items || []).map(item => ({
    description: item.description || '',
    quantity: Number(item.quantity) || 1,
    rate: Number(item.rate) || 0,
    amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = Number(data.discount) || 0;
  const tax = Number(data.tax) || 0;
  const total = subtotal - discount + tax;

  const newInvoice = {
    id: generateId(),
    invoiceNumber,
    studentId: data.studentId,
    status: 'unpaid',
    createdDate: data.createdDate || todayStr(),
    dueDate: data.dueDate || addDays(todayStr(), settings.defaultPaymentTermsDays),
    items,
    subtotal,
    discount,
    tax,
    total,
    amountPaid: 0,
    balance: total,
    billingModel: data.billingModel || settings.defaultBillingModel,
    notes: data.notes || '',
  };

  return {
    invoices: [...invoices, newInvoice],
    settings: { ...settings, nextInvoiceNumber: settings.nextInvoiceNumber + 1 },
    newInvoice,
  };
}

/**
 * Update an existing invoice (e.g., change items, notes, due date).
 * Does NOT recalculate payment status — use after editing fields only.
 */
export function updateInvoice(invoices, invoiceId, changes) {
  return invoices.map(inv =>
    inv.id === invoiceId ? { ...inv, ...changes } : inv
  );
}

/**
 * Void (cancel) an invoice. Sets status to 'void' and balance to 0.
 */
export function voidInvoice(invoices, invoiceId) {
  return invoices.map(inv =>
    inv.id === invoiceId
      ? { ...inv, status: 'void', balance: 0 }
      : inv
  );
}


// ── Payment Recording ────────────────────────────────────────────────

/**
 * Record a payment against an invoice.
 * Updates both the payments array AND the invoice's amountPaid/balance/status.
 *
 * @returns {{ invoices: Array, payments: Array, newPayment: Object }}
 */
export function recordPayment(invoices, payments, data) {
  const newPayment = {
    id: generateId(),
    invoiceId: data.invoiceId,
    studentId: data.studentId,
    amount: Number(data.amount) || 0,
    method: data.method || 'cash',
    date: data.date || todayStr(),
    notes: data.notes || '',
  };

  // Update the invoice totals
  const updatedInvoices = invoices.map(inv => {
    if (inv.id !== data.invoiceId) return inv;

    const newAmountPaid = inv.amountPaid + newPayment.amount;
    const newBalance = inv.total - newAmountPaid;

    let newStatus = inv.status;
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }

    return {
      ...inv,
      amountPaid: newAmountPaid,
      balance: Math.max(0, newBalance),
      status: newStatus,
    };
  });

  return {
    invoices: updatedInvoices,
    payments: [...payments, newPayment],
    newPayment,
  };
}


// ── Balance & Revenue Calculations ───────────────────────────────────

/**
 * Get the outstanding balance for a single student (sum of unpaid invoice balances).
 */
export function getStudentBalance(invoices, studentId) {
  return invoices
    .filter(inv => inv.studentId === studentId && inv.status !== 'void' && inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.balance, 0);
}

/**
 * Get all students with outstanding balances, sorted highest first.
 * Returns [{ student, balance, overdueCount }]
 */
export function getOutstandingBalances(invoices, students) {
  const today = todayStr();

  return students
    .map(student => {
      const studentInvoices = invoices.filter(
        inv => inv.studentId === student.id && inv.status !== 'void' && inv.status !== 'paid'
      );
      const balance = studentInvoices.reduce((sum, inv) => sum + inv.balance, 0);
      const overdueCount = studentInvoices.filter(inv => inv.dueDate < today && inv.status !== 'paid').length;
      return { student, balance, overdueCount };
    })
    .filter(item => item.balance > 0)
    .sort((a, b) => b.balance - a.balance);
}

/**
 * Calculate total revenue from completed lessons (the existing way).
 * This keeps the old billing cards working with lesson data.
 */
export function getLessonRevenue(lessons) {
  const completed = lessons.filter(l => l.status === 'completed');
  const scheduled = lessons.filter(l => l.status === 'scheduled');

  return {
    totalEarned: completed.reduce((sum, l) => sum + (l.rate || 0), 0),
    totalScheduled: scheduled.reduce((sum, l) => sum + (l.rate || 0), 0),
    completedCount: completed.length,
    scheduledCount: scheduled.length,
  };
}

/**
 * Calculate invoice-based revenue totals.
 */
export function getInvoiceRevenue(invoices) {
  const active = invoices.filter(inv => inv.status !== 'void');

  return {
    totalInvoiced: active.reduce((sum, inv) => sum + inv.total, 0),
    totalPaid: active.reduce((sum, inv) => sum + inv.amountPaid, 0),
    totalOutstanding: active.reduce((sum, inv) => sum + inv.balance, 0),
    invoiceCount: active.length,
    paidCount: active.filter(inv => inv.status === 'paid').length,
    overdueCount: active.filter(inv => inv.status === 'overdue').length,
  };
}

/**
 * Get monthly revenue data for the last N months (for the bar chart).
 * Uses payment dates so it shows when money actually came in.
 */
export function getMonthlyRevenue(payments, months = 6) {
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    // Sum payments in this month
    const monthPayments = payments.filter(p => {
      const pd = new Date(p.date + 'T00:00:00');
      return pd.getFullYear() === year && pd.getMonth() === month;
    });
    const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    result.push({ label, total, year, month });
  }

  return result;
}


// ── Overdue Detection ────────────────────────────────────────────────

/**
 * Check all invoices and mark any past-due ones as 'overdue'.
 * Call this when the billing page loads.
 * Returns the updated invoices array (or the same array if nothing changed).
 */
export function checkOverdueInvoices(invoices) {
  const today = todayStr();
  let changed = false;

  const updated = invoices.map(inv => {
    if (
      (inv.status === 'unpaid' || inv.status === 'partial') &&
      inv.dueDate < today
    ) {
      changed = true;
      return { ...inv, status: 'overdue' };
    }
    return inv;
  });

  return changed ? updated : invoices;
}

/**
 * Get overdue invoices with how many days overdue.
 */
export function getOverdueInvoices(invoices) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return invoices
    .filter(inv => inv.status === 'overdue')
    .map(inv => {
      const due = new Date(inv.dueDate + 'T00:00:00');
      const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
      return { ...inv, daysOverdue };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}


// ── Auto-generate Invoice from Lessons ───────────────────────────────

/**
 * Build invoice line items from a set of lessons.
 * Useful for "Invoice this student for their lessons this month."
 */
export function buildItemsFromLessons(lessons, studentId) {
  const studentLessons = lessons.filter(
    l => l.studentId === studentId && l.status === 'completed'
  );

  return studentLessons.map(lesson => ({
    description: `${lesson.lessonType} lesson — ${new Date(lesson.date + 'T00:00:00').toLocaleDateString()}`,
    quantity: 1,
    rate: lesson.rate || 0,
    amount: lesson.rate || 0,
  }));
}
