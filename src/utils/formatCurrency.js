/**
 * formatCurrency.js
 * Formats numbers as US dollar amounts.
 *
 * Usage:
 *   formatCurrency(1234.5)  → "$1,234.50"
 *   formatCurrency(0)       → "$0.00"
 *   formatCurrency(-50)     → "-$50.00"
 */

export function formatCurrency(amount) {
  // Handle null/undefined/NaN
  if (amount == null || isNaN(amount)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
