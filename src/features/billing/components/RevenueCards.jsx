/**
 * RevenueCards.jsx
 * Four summary cards at the top of the billing dashboard.
 *
 * Cards:
 *   1. Total Earned     — revenue from completed lessons
 *   2. Outstanding      — unpaid invoice balances
 *   3. Scheduled        — revenue from upcoming lessons
 *   4. Total Potential  — earned + scheduled combined
 *
 * Each card has an icon, label, dollar amount, and a sub-label.
 */

import { formatCurrency } from '@/utils/formatCurrency';
import { CheckCircle, Calendar, DollarSign } from '@/components/icons';

function RevenueCards({ lessonRevenue, invoiceRevenue }) {
  const cards = [
    {
      label: 'Total Earned',
      amount: lessonRevenue.totalEarned,
      sub: `${lessonRevenue.completedCount} lessons completed`,
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-700 dark:text-green-400',
    },
    {
      label: 'Outstanding',
      amount: invoiceRevenue.totalOutstanding,
      sub: `${invoiceRevenue.invoiceCount - invoiceRevenue.paidCount} unpaid invoices`,
      icon: DollarSign,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-700 dark:text-red-400',
    },
    {
      label: 'Scheduled',
      amount: lessonRevenue.totalScheduled,
      sub: `${lessonRevenue.scheduledCount} upcoming lessons`,
      icon: Calendar,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: 'Total Potential',
      amount: lessonRevenue.totalEarned + lessonRevenue.totalScheduled,
      sub: 'Earned + scheduled',
      icon: DollarSign,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-700 dark:text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">{card.label}</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(card.amount)}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

export default RevenueCards;
