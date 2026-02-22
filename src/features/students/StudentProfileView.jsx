import { formatTime12Hour } from '@/utils/formatTime';
import { formatCurrency } from '@/utils/formatCurrency';
import { getStudentBalance } from '@/services/billingService';
import BillingModelBadge from '@/features/billing/components/BillingModelBadge';
import {
  X, Calendar, CheckCircle, DollarSign, FileText,
  CreditCard, Mail, Plus, AlertTriangle, Clock,
} from '@/components/icons';

/**
 * StudentProfileView - Command center modal for viewing a student's full profile.
 * Shows all contact info, dashboard metrics, billing health, quick actions,
 * upcoming/recent lessons, invoices, and payments at a glance.
 */

// ── Helpers ──────────────────────────────────────────────────────────

const RELATIONSHIP_LABELS = {
  'parent': 'Parent',
  'grandparent': 'Grandparent',
  'sibling': 'Sibling',
  'aunt-uncle': 'Aunt / Uncle',
  'family-friend': 'Family Friend',
  'neighbor': 'Neighbor',
  'other': 'Other',
};

const INVOICE_STATUS_STYLES = {
  draft:   'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300',
  unpaid:  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid:    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  partial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  void:    'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400',
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Cash', check: 'Check', venmo: 'Venmo',
  zelle: 'Zelle', card: 'Card', other: 'Other',
};

/** Format a YYYY-MM-DD date string for display */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Format a YYYY-MM-DD date as "Wed, Jan 15" */
function formatLessonDate(dateStr) {
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

/** Get initials from a name (first letter of first + last name) */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────

function StudentProfileView({
  student, lessons, invoices, payments,
  onClose, onEdit, lessonTypes,
  onScheduleLesson, onCreateInvoice, onRecordPayment,
}) {
  // ── Lesson metrics ───────────────────────────────────────────────
  const studentLessons = lessons.filter(l => l.studentId === student.id);

  const upcomingLessons = studentLessons
    .filter(l => l.status === 'scheduled')
    .filter(l => new Date(l.date + 'T' + l.time) >= new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

  const completedCount = studentLessons.filter(l => l.status === 'completed').length;

  const totalRevenue = studentLessons
    .filter(l => l.status === 'completed')
    .reduce((sum, l) => sum + (l.rate || 0), 0);

  const recentHistory = studentLessons
    .filter(l => l.status === 'completed' || l.status === 'cancelled')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // ── Invoice / payment metrics ────────────────────────────────────
  const studentBalance = getStudentBalance(invoices || [], student.id);

  const studentInvoices = (invoices || [])
    .filter(inv => String(inv.studentId) === String(student.id) && inv.status !== 'void')
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  const openInvoiceCount = studentInvoices
    .filter(inv => ['unpaid', 'partial', 'overdue'].includes(inv.status)).length;

  const overdueInvoices = studentInvoices.filter(inv => inv.status === 'overdue');
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const studentPayments = (payments || [])
    .filter(p => String(p.studentId) === String(student.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Contact email for mailto link
  const contactEmail = student.isMinor ? student.parentEmail : student.email;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ FIXED HEADER ═══ */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Avatar */}
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-stone-200 dark:border-stone-600 flex-shrink-0"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0 border-2 border-teal-200 dark:border-teal-700">
                <span className="text-lg sm:text-xl font-bold text-teal-700 dark:text-teal-400">
                  {getInitials(student.name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">{student.name}</h3>
                <BillingModelBadge model={student.billingModel || 'per-lesson'} />
              </div>
              {student.isMinor && student.parentName && (
                <p className="text-sm text-stone-500 dark:text-stone-400 truncate">Parent: {student.parentName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(student)}
              className="px-3 py-1.5 text-sm bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              Edit Profile
            </button>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>
          </div>
        </div>

        {/* ═══ SCROLLABLE CONTENT ═══ */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

          {/* ─── STAT CARDS (5 across) ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {/* Upcoming */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-800">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">{upcomingLessons.length}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Upcoming</div>
            </div>
            {/* Completed */}
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{completedCount}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Completed</div>
            </div>
            {/* Revenue */}
            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-center border border-teal-200 dark:border-teal-800">
              <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
              <div className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-400">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Revenue</div>
            </div>
            {/* Balance */}
            <div className={`p-3 rounded-lg text-center border ${
              studentBalance > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              {studentBalance > 0
                ? <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              }
              <div className={`text-xl sm:text-2xl font-bold ${
                studentBalance > 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-green-700 dark:text-green-400'
              }`}>
                {studentBalance > 0 ? formatCurrency(studentBalance) : 'Paid Up'}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Balance</div>
            </div>
            {/* Open Invoices */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center border border-amber-200 dark:border-amber-800 col-span-2 sm:col-span-1">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400">{openInvoiceCount}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Open Invoices</div>
            </div>
          </div>

          {/* ─── OVERDUE ALERT (conditional) ─── */}
          {overdueInvoices.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                {formatCurrency(overdueTotal)} overdue across {overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* ─── QUICK ACTIONS ─── */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onScheduleLesson?.(student)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Lesson
            </button>
            <button
              onClick={() => onCreateInvoice?.(student)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-500 dark:hover:bg-purple-400 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Create Invoice
            </button>
            <button
              onClick={() => onRecordPayment?.(student)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-500 dark:hover:bg-green-400 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </a>
            )}
          </div>

          {/* ─── TWO-COLUMN LAYOUT ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* ═══ LEFT COLUMN ═══ */}
            <div className="space-y-4">

              {/* Contact Information */}
              <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 text-sm">Contact Information</h4>
                <div className="space-y-3 text-sm">
                  {/* Student's own info */}
                  <div className="space-y-1.5">
                    {!student.isMinor && student.email && (
                      <div className="flex">
                        <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Email</span>
                        <span className="text-stone-900 dark:text-stone-100">{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex">
                        <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Phone</span>
                        <span className="text-stone-900 dark:text-stone-100">{student.phone}</span>
                      </div>
                    )}
                    {student.dateOfBirth && (
                      <div className="flex">
                        <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">DOB</span>
                        <span className="text-stone-900 dark:text-stone-100">{formatDate(student.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Parent (minors) */}
                  {student.isMinor && student.parentName && (
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">Primary Parent/Guardian</p>
                      <div className="space-y-1.5">
                        <div className="flex">
                          <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Name</span>
                          <span className="text-stone-900 dark:text-stone-100">{student.parentName}</span>
                        </div>
                        {student.parentEmail && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Email</span>
                            <span className="text-stone-900 dark:text-stone-100">{student.parentEmail}</span>
                          </div>
                        )}
                        {student.parentPhone && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Phone</span>
                            <span className="text-stone-900 dark:text-stone-100">{student.parentPhone}</span>
                          </div>
                        )}
                        {student.parentDateOfBirth && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">DOB</span>
                            <span className="text-stone-900 dark:text-stone-100">{formatDate(student.parentDateOfBirth)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Secondary Parent (minors, conditional) */}
                  {student.isMinor && student.hasSecondaryParent && student.secondaryParentName && (
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">Secondary Parent/Guardian</p>
                      <div className="space-y-1.5">
                        <div className="flex">
                          <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Name</span>
                          <span className="text-stone-900 dark:text-stone-100">{student.secondaryParentName}</span>
                        </div>
                        {student.secondaryParentEmail && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Email</span>
                            <span className="text-stone-900 dark:text-stone-100">{student.secondaryParentEmail}</span>
                          </div>
                        )}
                        {student.secondaryParentPhone && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Phone</span>
                            <span className="text-stone-900 dark:text-stone-100">{student.secondaryParentPhone}</span>
                          </div>
                        )}
                        {student.secondaryParentDateOfBirth && (
                          <div className="flex">
                            <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">DOB</span>
                            <span className="text-stone-900 dark:text-stone-100">{formatDate(student.secondaryParentDateOfBirth)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {(() => {
                const addr = student.isMinor
                  ? { line1: student.parentAddressLine1, line2: student.parentAddressLine2, city: student.parentCity, state: student.parentState, zip: student.parentZipCode }
                  : { line1: student.addressLine1, line2: student.addressLine2, city: student.city, state: student.state, zip: student.zipCode };
                if (!addr.line1) return null;
                return (
                  <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 text-sm">Address</h4>
                    <div className="text-sm text-stone-900 dark:text-stone-100 space-y-0.5">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{[addr.city, addr.state].filter(Boolean).join(', ')} {addr.zip}</p>
                    </div>
                    {/* Secondary parent address (if different) */}
                    {student.isMinor && student.hasSecondaryParent && !student.secondaryParentSameAddress && student.secondaryParentAddressLine1 && (
                      <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700">
                        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Secondary Parent Address</p>
                        <div className="text-sm text-stone-900 dark:text-stone-100 space-y-0.5">
                          <p>{student.secondaryParentAddressLine1}</p>
                          {student.secondaryParentAddressLine2 && <p>{student.secondaryParentAddressLine2}</p>}
                          <p>{[student.secondaryParentCity, student.secondaryParentState].filter(Boolean).join(', ')} {student.secondaryParentZipCode}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Emergency Contact */}
              {student.emergencyContactName && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 text-sm">Emergency Contact</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex">
                      <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Name</span>
                      <span className="text-stone-900 dark:text-stone-100">{student.emergencyContactName}</span>
                    </div>
                    {student.emergencyContactRelationship && (
                      <div className="flex">
                        <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Relation</span>
                        <span className="text-stone-900 dark:text-stone-100">
                          {RELATIONSHIP_LABELS[student.emergencyContactRelationship] || student.emergencyContactRelationship}
                        </span>
                      </div>
                    )}
                    {student.emergencyContactPhone && (
                      <div className="flex">
                        <span className="w-20 text-stone-500 dark:text-stone-400 flex-shrink-0">Phone</span>
                        <span className="text-stone-900 dark:text-stone-100">{student.emergencyContactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson Preferences & Billing */}
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 text-sm">Lesson Preferences & Billing</h4>
                <div className="space-y-1.5 text-sm">
                  {student.defaultLessonType && (
                    <div className="flex">
                      <span className="w-24 text-stone-500 dark:text-stone-400 flex-shrink-0">Lesson Type</span>
                      <span className="text-stone-900 dark:text-stone-100">{student.defaultLessonType}</span>
                    </div>
                  )}
                  {student.customRate && (
                    <div className="flex">
                      <span className="w-24 text-stone-500 dark:text-stone-400 flex-shrink-0">Custom Rate</span>
                      <span className="text-stone-900 dark:text-stone-100">${student.customRate}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="w-24 text-stone-500 dark:text-stone-400 flex-shrink-0">Billing</span>
                    <BillingModelBadge model={student.billingModel || 'per-lesson'} />
                  </div>
                  {student.billingModel === 'monthly' && student.monthlyRate && (
                    <div className="flex">
                      <span className="w-24 text-stone-500 dark:text-stone-400 flex-shrink-0">Monthly Rate</span>
                      <span className="text-stone-900 dark:text-stone-100">${student.monthlyRate}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN ═══ */}
            <div className="space-y-4">

              {/* Upcoming Lessons */}
              <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 text-sm">Upcoming Lessons</h4>
                {upcomingLessons.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">No upcoming lessons</p>
                    <button
                      onClick={() => onScheduleLesson?.(student)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Schedule a Lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {upcomingLessons.slice(0, 5).map(lesson => (
                      <div
                        key={lesson.id}
                        className="flex justify-between items-center p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
                      >
                        <div className="text-sm min-w-0">
                          <div className="font-medium text-stone-900 dark:text-stone-100">
                            {formatLessonDate(lesson.date)}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                            {formatTime12Hour(lesson.time)} · {lesson.lessonType}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-teal-700 dark:text-teal-400 flex-shrink-0 ml-2">
                          ${lesson.rate}
                        </div>
                      </div>
                    ))}
                    {upcomingLessons.length > 5 && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 text-center pt-1">
                        +{upcomingLessons.length - 5} more upcoming
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Lesson History */}
              {recentHistory.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 text-sm">Recent History</h4>
                  <div className="space-y-1.5">
                    {recentHistory.map(lesson => (
                      <div
                        key={lesson.id}
                        className="flex justify-between items-center p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
                      >
                        <div className="text-sm min-w-0 flex items-center gap-2">
                          <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded ${
                            lesson.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {lesson.status === 'completed' ? 'Done' : 'Cancelled'}
                          </span>
                          <span className="text-stone-900 dark:text-stone-100 truncate">
                            {formatLessonDate(lesson.date)}
                          </span>
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400 flex-shrink-0 ml-2">
                          {lesson.lessonType}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Summary */}
              <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 text-sm">Invoices</h4>
                {studentInvoices.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">No invoices yet</p>
                    <button
                      onClick={() => onCreateInvoice?.(student)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-500 dark:hover:bg-purple-400 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Create Invoice
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {studentInvoices.slice(0, 5).map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
                      >
                        <div className="text-sm min-w-0 flex items-center gap-2">
                          <span className="font-medium text-stone-900 dark:text-stone-100">{inv.invoiceNumber}</span>
                          <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full ${INVOICE_STATUS_STYLES[inv.status] || ''}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-right flex-shrink-0 ml-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100">{formatCurrency(inv.total)}</span>
                          {inv.balance > 0 && inv.status !== 'paid' && (
                            <span className="text-xs text-red-600 dark:text-red-400 ml-1">
                              ({formatCurrency(inv.balance)} due)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {studentInvoices.length > 5 && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 text-center pt-1">
                        +{studentInvoices.length - 5} more invoices
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              {studentPayments.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 text-sm">Recent Payments</h4>
                  <div className="space-y-1.5">
                    {studentPayments.map(pmt => {
                      const linkedInvoice = (invoices || []).find(inv => inv.id === pmt.invoiceId);
                      return (
                        <div
                          key={pmt.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
                        >
                          <div className="text-sm min-w-0 flex items-center gap-2">
                            <span className="text-stone-900 dark:text-stone-100">{formatDate(pmt.date)}</span>
                            <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                              {PAYMENT_METHOD_LABELS[pmt.method] || pmt.method}
                            </span>
                          </div>
                          <div className="text-sm flex-shrink-0 ml-2 text-right">
                            <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(pmt.amount)}</span>
                            {linkedInvoice && (
                              <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">
                                {linkedInvoice.invoiceNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileView;
