/**
 * ReportsTab.jsx
 * Five report types, each in its own collapsible section:
 *
 *   1. Monthly Revenue Trend  — bar chart with date range
 *   2. Overdue Payments       — table of past-due invoices
 *   3. Upcoming Payments      — invoices due in next 30 days
 *   4. Income Report          — totals by student and by billing model
 *   5. Pricing Report         — rate averages, distribution, revenue per lesson type
 *
 * Each report has a "Print" and "Export" button.
 */

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { getMonthlyRevenue, getOverdueInvoices } from '@/services/billingService';
import { ChevronDown } from '@/components/icons';

function ReportsTab({ invoices, payments, lessons, students, billingSettings }) {
  // Which report section is expanded
  const [expanded, setExpanded] = useState('revenue-trend');

  const toggleSection = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="space-y-3">
      <RevenueTrendReport expanded={expanded === 'revenue-trend'} onToggle={() => toggleSection('revenue-trend')} payments={payments} lessons={lessons} />
      <OverdueReport expanded={expanded === 'overdue'} onToggle={() => toggleSection('overdue')} invoices={invoices} students={students} />
      <UpcomingReport expanded={expanded === 'upcoming'} onToggle={() => toggleSection('upcoming')} invoices={invoices} students={students} />
      <IncomeReport expanded={expanded === 'income'} onToggle={() => toggleSection('income')} invoices={invoices} payments={payments} students={students} lessons={lessons} />
      <PricingReport expanded={expanded === 'pricing'} onToggle={() => toggleSection('pricing')} lessons={lessons} students={students} />
    </div>
  );
}

// ── Shared Section Wrapper ──────────────────────────────────────────

function ReportSection({ title, subtitle, expanded, onToggle, onPrint, onExport, children }) {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="border-t border-stone-200 dark:border-stone-700">
          <div className="px-4 sm:px-6 py-4">
            {children}
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 px-4 sm:px-6 py-3 border-t border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
            {onPrint && (
              <button onClick={onPrint} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 transition-colors">
                Print
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 transition-colors">
                Export
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ── 1. Monthly Revenue Trend ────────────────────────────────────────

function RevenueTrendReport({ expanded, onToggle, payments, lessons }) {
  const monthlyData = useMemo(() => {
    if (payments.length > 0) return getMonthlyRevenue(payments, 12);
    // Fall back to lesson data
    return buildLessonMonthlyData(lessons, 12);
  }, [payments, lessons]);

  const maxVal = Math.max(...monthlyData.map(m => m.total), 1);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.total, 0);

  const handleExport = () => {
    let text = 'Monthly Revenue Report\n\n';
    monthlyData.forEach(m => { text += `${m.label}: ${formatCurrency(m.total)}\n`; });
    text += `\nTotal: ${formatCurrency(totalRevenue)}`;
    downloadText(text, 'monthly-revenue.txt');
  };

  return (
    <ReportSection
      title="Monthly Revenue Trend"
      subtitle={`Last 12 months — ${formatCurrency(totalRevenue)} total`}
      expanded={expanded}
      onToggle={onToggle}
      onPrint={() => window.print()}
      onExport={handleExport}
    >
      {/* Bar chart */}
      <div className="flex items-end gap-1 sm:gap-2 h-40 mb-3">
        {monthlyData.map((month, i) => {
          const pct = maxVal > 0 ? (month.total / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                {month.total > 0 ? formatCurrency(month.total) : ''}
              </div>
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all ${month.total > 0 ? 'bg-teal-500 dark:bg-teal-400' : 'bg-stone-100 dark:bg-stone-700 min-h-[2px]'}`}
                  style={{ height: month.total > 0 ? `${Math.max(pct, 4)}%` : '2px' }}
                />
              </div>
              <div className="text-[10px] text-stone-400 whitespace-nowrap">{month.label}</div>
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}


// ── 2. Overdue Payments Report ──────────────────────────────────────

function OverdueReport({ expanded, onToggle, invoices, students }) {
  const overdueInvoices = useMemo(() => getOverdueInvoices(invoices), [invoices]);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleExport = () => {
    let text = 'Overdue Payments Report\n\n';
    if (overdueInvoices.length === 0) { text += 'No overdue invoices.\n'; }
    overdueInvoices.forEach(inv => {
      const s = students.find(st => st.id === inv.studentId);
      text += `${inv.invoiceNumber} | ${s?.name || 'Unknown'} | ${formatCurrency(inv.balance)} | ${inv.daysOverdue} days overdue\n`;
    });
    text += `\nTotal Overdue: ${formatCurrency(totalOverdue)}`;
    downloadText(text, 'overdue-report.txt');
  };

  return (
    <ReportSection
      title="Overdue Payments"
      subtitle={overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue — ${formatCurrency(totalOverdue)}` : 'No overdue invoices'}
      expanded={expanded}
      onToggle={onToggle}
      onPrint={() => window.print()}
      onExport={handleExport}
    >
      {overdueInvoices.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">No overdue invoices. You're all caught up!</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700">
              <th className="text-left py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Invoice</th>
              <th className="text-left py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Student</th>
              <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Balance</th>
              <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Days Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
            {overdueInvoices.map(inv => {
              const s = students.find(st => st.id === inv.studentId);
              return (
                <tr key={inv.id}>
                  <td className="py-2 text-stone-900 dark:text-stone-100">{inv.invoiceNumber}</td>
                  <td className="py-2 text-stone-700 dark:text-stone-300">{s?.name || 'Unknown'}</td>
                  <td className="py-2 text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(inv.balance)}</td>
                  <td className="py-2 text-right text-red-600 dark:text-red-400">{inv.daysOverdue} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </ReportSection>
  );
}


// ── 3. Upcoming Payments Report ─────────────────────────────────────

function UpcomingReport({ expanded, onToggle, invoices, students }) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date(now);
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const todayStr = now.toISOString().split('T')[0];
    const futureStr = thirtyDays.toISOString().split('T')[0];

    return invoices
      .filter(inv =>
        (inv.status === 'unpaid' || inv.status === 'partial') &&
        inv.dueDate >= todayStr && inv.dueDate <= futureStr
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [invoices]);

  const totalUpcoming = upcoming.reduce((sum, inv) => sum + inv.balance, 0);

  const handleExport = () => {
    let text = 'Upcoming Payments Report (Next 30 Days)\n\n';
    if (upcoming.length === 0) { text += 'No upcoming payments.\n'; }
    upcoming.forEach(inv => {
      const s = students.find(st => st.id === inv.studentId);
      text += `${inv.invoiceNumber} | ${s?.name || 'Unknown'} | ${formatCurrency(inv.balance)} | Due ${inv.dueDate}\n`;
    });
    text += `\nTotal Upcoming: ${formatCurrency(totalUpcoming)}`;
    downloadText(text, 'upcoming-payments.txt');
  };

  return (
    <ReportSection
      title="Upcoming Payments"
      subtitle={`Next 30 days — ${upcoming.length} invoices, ${formatCurrency(totalUpcoming)}`}
      expanded={expanded}
      onToggle={onToggle}
      onPrint={() => window.print()}
      onExport={handleExport}
    >
      {upcoming.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">No payments due in the next 30 days.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700">
              <th className="text-left py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Invoice</th>
              <th className="text-left py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Student</th>
              <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Balance</th>
              <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
            {upcoming.map(inv => {
              const s = students.find(st => st.id === inv.studentId);
              return (
                <tr key={inv.id}>
                  <td className="py-2 text-stone-900 dark:text-stone-100">{inv.invoiceNumber}</td>
                  <td className="py-2 text-stone-700 dark:text-stone-300">{s?.name || 'Unknown'}</td>
                  <td className="py-2 text-right font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(inv.balance)}</td>
                  <td className="py-2 text-right text-stone-500 dark:text-stone-400">
                    {new Date(inv.dueDate + 'T00:00:00').toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </ReportSection>
  );
}


// ── 4. Income Report ────────────────────────────────────────────────

function IncomeReport({ expanded, onToggle, invoices, payments, students, lessons }) {
  const data = useMemo(() => {
    // Income by student (from payments)
    const byStudent = {};
    payments.forEach(p => {
      if (!byStudent[p.studentId]) byStudent[p.studentId] = 0;
      byStudent[p.studentId] += p.amount;
    });

    const studentIncome = Object.entries(byStudent)
      .map(([studentId, total]) => {
        const student = students.find(s => s.id === studentId);
        return { studentName: student?.name || 'Unknown', total };
      })
      .sort((a, b) => b.total - a.total);

    // Income by billing model (from invoices)
    const byModel = {};
    invoices.filter(inv => inv.status !== 'void').forEach(inv => {
      const model = inv.billingModel || 'per-lesson';
      if (!byModel[model]) byModel[model] = { invoiced: 0, paid: 0 };
      byModel[model].invoiced += inv.total;
      byModel[model].paid += inv.amountPaid;
    });

    // Total from lessons (regardless of invoicing)
    const lessonTotal = lessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + (l.rate || 0), 0);
    const paymentTotal = payments.reduce((sum, p) => sum + p.amount, 0);

    return { studentIncome, byModel, lessonTotal, paymentTotal };
  }, [invoices, payments, students, lessons]);

  const handleExport = () => {
    let text = 'Income Report\n\n';
    text += `Total from Lessons: ${formatCurrency(data.lessonTotal)}\n`;
    text += `Total from Payments: ${formatCurrency(data.paymentTotal)}\n\n`;
    text += 'By Student:\n';
    data.studentIncome.forEach(s => { text += `  ${s.studentName}: ${formatCurrency(s.total)}\n`; });
    downloadText(text, 'income-report.txt');
  };

  const MODEL_LABELS = { 'per-lesson': 'Per Lesson', 'monthly': 'Monthly', 'per-course': 'Per Course' };

  return (
    <ReportSection
      title="Income Report"
      subtitle={`${formatCurrency(data.paymentTotal)} received from payments`}
      expanded={expanded}
      onToggle={onToggle}
      onPrint={() => window.print()}
      onExport={handleExport}
    >
      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
            <div className="text-xs text-stone-500 dark:text-stone-400 uppercase">Lesson Revenue</div>
            <div className="text-lg font-bold text-stone-900 dark:text-stone-100">{formatCurrency(data.lessonTotal)}</div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
            <div className="text-xs text-stone-500 dark:text-stone-400 uppercase">Payment Revenue</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(data.paymentTotal)}</div>
          </div>
        </div>

        {/* By Student */}
        {data.studentIncome.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">By Student</h4>
            <div className="space-y-1">
              {data.studentIncome.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-stone-700 dark:text-stone-300">{item.studentName}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Billing Model */}
        {Object.keys(data.byModel).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">By Billing Model</h4>
            <div className="space-y-1">
              {Object.entries(data.byModel).map(([model, vals]) => (
                <div key={model} className="flex justify-between text-sm py-1">
                  <span className="text-stone-700 dark:text-stone-300">{MODEL_LABELS[model] || model}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {formatCurrency(vals.paid)} / {formatCurrency(vals.invoiced)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ReportSection>
  );
}


// ── 5. Pricing Report ───────────────────────────────────────────────

function PricingReport({ expanded, onToggle, lessons, students }) {
  const data = useMemo(() => {
    const completed = lessons.filter(l => l.status === 'completed' && l.rate > 0);
    if (completed.length === 0) return null;

    const rates = completed.map(l => l.rate);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Revenue by lesson type
    const byType = {};
    completed.forEach(l => {
      const type = l.lessonType || 'Unknown';
      if (!byType[type]) byType[type] = { count: 0, revenue: 0 };
      byType[type].count++;
      byType[type].revenue += l.rate;
    });

    const typeData = Object.entries(byType)
      .map(([type, vals]) => ({
        type,
        count: vals.count,
        revenue: vals.revenue,
        avgRate: vals.revenue / vals.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return { avgRate, minRate, maxRate, totalLessons: completed.length, typeData };
  }, [lessons]);

  const handleExport = () => {
    if (!data) return;
    let text = 'Pricing Report\n\n';
    text += `Average Rate: ${formatCurrency(data.avgRate)}\n`;
    text += `Rate Range: ${formatCurrency(data.minRate)} — ${formatCurrency(data.maxRate)}\n`;
    text += `Total Lessons: ${data.totalLessons}\n\n`;
    text += 'By Lesson Type:\n';
    data.typeData.forEach(t => {
      text += `  ${t.type}: ${t.count} lessons, ${formatCurrency(t.revenue)} total, ${formatCurrency(t.avgRate)}/avg\n`;
    });
    downloadText(text, 'pricing-report.txt');
  };

  return (
    <ReportSection
      title="Pricing Report"
      subtitle={data ? `Avg rate: ${formatCurrency(data.avgRate)} across ${data.totalLessons} lessons` : 'No completed lessons yet'}
      expanded={expanded}
      onToggle={onToggle}
      onPrint={() => window.print()}
      onExport={handleExport}
    >
      {!data ? (
        <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">No completed lessons with rates to analyze.</p>
      ) : (
        <div className="space-y-5">
          {/* Rate summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-stone-500 dark:text-stone-400 uppercase">Min Rate</div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-100">{formatCurrency(data.minRate)}</div>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 text-center">
              <div className="text-xs text-teal-600 dark:text-teal-400 uppercase">Avg Rate</div>
              <div className="text-lg font-bold text-teal-700 dark:text-teal-400">{formatCurrency(data.avgRate)}</div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-stone-500 dark:text-stone-400 uppercase">Max Rate</div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-100">{formatCurrency(data.maxRate)}</div>
            </div>
          </div>

          {/* By lesson type */}
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Revenue by Lesson Type</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700">
                  <th className="text-left py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Type</th>
                  <th className="text-center py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Lessons</th>
                  <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Avg Rate</th>
                  <th className="text-right py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                {data.typeData.map(t => (
                  <tr key={t.type}>
                    <td className="py-2 text-stone-900 dark:text-stone-100">{t.type}</td>
                    <td className="py-2 text-center text-stone-600 dark:text-stone-400">{t.count}</td>
                    <td className="py-2 text-right text-stone-600 dark:text-stone-400">{formatCurrency(t.avgRate)}</td>
                    <td className="py-2 text-right font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportSection>
  );
}


// ── Helpers ─────────────────────────────────────────────────────────

/** Build monthly data from lesson rates (fallback when no payments) */
function buildLessonMonthlyData(lessons, months) {
  const result = [];
  const now = new Date();
  const completed = lessons.filter(l => l.status === 'completed');
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const monthLessons = completed.filter(l => {
      const ld = new Date(l.date + 'T00:00:00');
      return ld.getFullYear() === year && ld.getMonth() === month;
    });
    result.push({ label, total: monthLessons.reduce((sum, l) => sum + (l.rate || 0), 0) });
  }
  return result;
}

/** Download a text string as a file */
function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default ReportsTab;
