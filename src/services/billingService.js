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
 *   status: 'draft' | 'unpaid' | 'paid' | 'partial' | 'overdue' | 'void',
 *   createdDate, dueDate,
 *   items: [{ description, quantity, rate, amount }],
 *   subtotal, discount, tax, total,
 *   amountPaid, balance,
 *   billingModel: 'per-lesson' | 'monthly',
 *   billingPeriodStart, billingPeriodEnd,
 *   notes,
 *   stripeInvoiceId, stripePaymentLink
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
 *   defaultPaymentTermsDays, acceptedMethods[],
 *   stripeEnabled, stripeAccountId
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
  // Stripe (future)
  stripeEnabled: false,
  stripeAccountId: '',
};


// ── Data Migration ───────────────────────────────────────────────────

/**
 * Migrate student billing data: convert 'per-course' to 'per-lesson'.
 * Call once on app load. Returns students array unchanged if no migration needed.
 */
export function migrateStudentBillingModels(students) {
  let changed = false;
  const migrated = students.map(s => {
    if (s.billingModel === 'per-course') {
      changed = true;
      return { ...s, billingModel: 'per-lesson' };
    }
    return s;
  });
  return changed ? migrated : students;
}


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
    status: data.status || 'unpaid',
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
    billingPeriodStart: data.billingPeriodStart || '',
    billingPeriodEnd: data.billingPeriodEnd || '',
    notes: data.notes || '',
    // Stripe (future)
    stripeInvoiceId: '',
    stripePaymentLink: '',
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

/**
 * Finalize a single draft invoice (draft → unpaid).
 */
export function finalizeInvoice(invoices, invoiceId) {
  return invoices.map(inv =>
    inv.id === invoiceId && inv.status === 'draft'
      ? { ...inv, status: 'unpaid' }
      : inv
  );
}

/**
 * Finalize all draft invoices (draft → unpaid).
 */
export function finalizeAllDrafts(invoices) {
  return invoices.map(inv =>
    inv.status === 'draft' ? { ...inv, status: 'unpaid' } : inv
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
    .filter(inv => inv.studentId === studentId && inv.status !== 'void' && inv.status !== 'paid' && inv.status !== 'draft')
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
        inv => inv.studentId === student.id && inv.status !== 'void' && inv.status !== 'paid' && inv.status !== 'draft'
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
  const active = invoices.filter(inv => inv.status !== 'void' && inv.status !== 'draft');

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
 *
 * @param {Array} lessons - All lessons
 * @param {number|string} studentId - Student ID
 * @param {string} [startDate] - Optional start date filter (YYYY-MM-DD)
 * @param {string} [endDate] - Optional end date filter (YYYY-MM-DD)
 */
export function buildItemsFromLessons(lessons, studentId, startDate, endDate) {
  let studentLessons = lessons.filter(
    l => String(l.studentId) === String(studentId) && l.status !== 'cancelled'
  );

  if (startDate) {
    studentLessons = studentLessons.filter(l => l.date >= startDate);
  }
  if (endDate) {
    studentLessons = studentLessons.filter(l => l.date <= endDate);
  }

  return studentLessons.map(lesson => ({
    description: `${lesson.lessonType} lesson — ${new Date(lesson.date + 'T00:00:00').toLocaleDateString()}`,
    quantity: 1,
    rate: lesson.rate || 0,
    amount: lesson.rate || 0,
  }));
}


// ── Calendar-Connected Invoice Generation ────────────────────────────

/**
 * Get lessons for a specific student within a date range.
 * Includes both scheduled and completed lessons (billing counts scheduled too).
 * Excludes cancelled lessons.
 *
 * @param {Array} lessons - All lessons
 * @param {number|string} studentId - Student ID
 * @param {string} startDate - Start of billing period (YYYY-MM-DD, inclusive)
 * @param {string} endDate - End of billing period (YYYY-MM-DD, inclusive)
 * @returns {Array} Filtered lessons
 */
export function getLessonsInPeriod(lessons, studentId, startDate, endDate) {
  return lessons.filter(l =>
    String(l.studentId) === String(studentId) &&
    l.date >= startDate &&
    l.date <= endDate &&
    l.status !== 'cancelled'
  );
}

/**
 * Build a draft invoice preview for a single student based on their billing model.
 * Does NOT persist anything — returns a preview object for review.
 *
 * @param {Object} student - Student object with billingModel, monthlyRate, customRate
 * @param {Array} periodLessons - Lessons in the billing period for this student
 * @param {string} periodLabel - Human-readable label like "February 2026"
 * @returns {Object} { studentId, studentName, billingModel, items, subtotal, lessonCount }
 */
export function buildInvoicePreview(student, periodLessons, periodLabel) {
  const billingModel = student.billingModel || 'per-lesson';

  if (billingModel === 'monthly') {
    const monthlyRate = Number(student.monthlyRate) || 0;
    return {
      studentId: student.id,
      studentName: student.name,
      billingModel: 'monthly',
      items: [{
        description: `Monthly tuition — ${periodLabel}`,
        quantity: 1,
        rate: monthlyRate,
        amount: monthlyRate,
      }],
      subtotal: monthlyRate,
      lessonCount: periodLessons.length,
    };
  }

  // Per-lesson: group by lesson type for cleaner line items
  const byType = {};
  periodLessons.forEach(lesson => {
    const type = lesson.lessonType || 'Lesson';
    if (!byType[type]) {
      byType[type] = { count: 0, rate: 0, lessons: [] };
    }
    byType[type].count += 1;
    // Use lesson rate first, then student custom rate
    byType[type].rate = lesson.rate || Number(student.customRate) || 0;
    byType[type].lessons.push(lesson);
  });

  const items = Object.entries(byType).map(([type, data]) => ({
    description: `${periodLabel} — ${type} (${data.count} lesson${data.count !== 1 ? 's' : ''})`,
    quantity: data.count,
    rate: data.rate,
    amount: data.count * data.rate,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    studentId: student.id,
    studentName: student.name,
    billingModel: 'per-lesson',
    items,
    subtotal,
    lessonCount: periodLessons.length,
  };
}

/**
 * Generate previews for all students who have lessons in the billing period.
 * Skips students who already have an invoice for this period.
 *
 * @param {Array} students - All students
 * @param {Array} lessons - All lessons
 * @param {Array} invoices - Existing invoices (to check for duplicates)
 * @param {string} startDate - Period start (YYYY-MM-DD)
 * @param {string} endDate - Period end (YYYY-MM-DD)
 * @param {string} periodLabel - e.g. "February 2026"
 * @returns {{ previews: Array, skipped: Array }}
 */
export function generateInvoicePreviews(students, lessons, invoices, startDate, endDate, periodLabel) {
  const previews = [];
  const skipped = [];

  students.forEach(student => {
    // Check if an invoice already exists for this student in this period
    const hasExisting = invoices.some(inv =>
      String(inv.studentId) === String(student.id) &&
      inv.status !== 'void' &&
      inv.billingPeriodStart === startDate &&
      inv.billingPeriodEnd === endDate
    );

    if (hasExisting) {
      skipped.push({
        studentId: student.id,
        studentName: student.name,
        reason: 'Invoice already exists for this period',
      });
      return;
    }

    const periodLessons = getLessonsInPeriod(lessons, student.id, startDate, endDate);
    const billingModel = student.billingModel || 'per-lesson';

    // For per-lesson: skip if no lessons in period
    if (billingModel === 'per-lesson' && periodLessons.length === 0) {
      return; // Not an error, just nothing to invoice
    }

    // For monthly: generate even if no lessons (they pay the flat rate)
    // But skip if monthly rate is not set
    if (billingModel === 'monthly' && !Number(student.monthlyRate)) {
      return; // No monthly rate configured
    }

    const preview = buildInvoicePreview(student, periodLessons, periodLabel);
    if (preview.subtotal > 0) {
      previews.push(preview);
    }
  });

  return { previews, skipped };
}

/**
 * Create multiple invoices at once from approved previews.
 * All created as 'draft' status for review before finalizing.
 *
 * @param {Array} invoices - Current invoices
 * @param {Object} settings - Billing settings
 * @param {Array} previews - Array of approved preview objects
 * @param {string} startDate - Period start (stored for dedup)
 * @param {string} endDate - Period end (stored for dedup)
 * @param {number} [paymentTermsDays] - Days until due (defaults to settings value)
 * @returns {{ invoices: Array, settings: Object, newInvoices: Array }}
 */
export function createBatchInvoices(invoices, settings, previews, startDate, endDate, paymentTermsDays) {
  let currentNumber = settings.nextInvoiceNumber;
  const today = todayStr();
  const termsDays = paymentTermsDays || settings.defaultPaymentTermsDays;
  const dueDate = addDays(today, termsDays);

  const newInvoices = previews.map(preview => {
    const invoiceNumber = `${settings.invoicePrefix}-${currentNumber}`;
    currentNumber++;

    const items = preview.items.map(item => ({
      ...item,
      amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
    }));
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: generateId(),
      invoiceNumber,
      studentId: preview.studentId,
      status: 'draft',
      createdDate: today,
      dueDate,
      items,
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      amountPaid: 0,
      balance: subtotal,
      billingModel: preview.billingModel,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      notes: '',
      // Stripe (future)
      stripeInvoiceId: '',
      stripePaymentLink: '',
    };
  });

  return {
    invoices: [...invoices, ...newInvoices],
    settings: { ...settings, nextInvoiceNumber: currentNumber },
    newInvoices,
  };
}
