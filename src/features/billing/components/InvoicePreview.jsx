/**
 * InvoicePreview.jsx
 * A print-formatted invoice layout.
 *
 * Opens in a new window using window.print() so the user can
 * either print it or "Save as PDF" — zero dependency approach.
 *
 * This is a utility function, not a visual component.
 * Call: printInvoice(invoice, student, user)
 */

import { formatCurrency } from '@/utils/formatCurrency';

/**
 * Open a print-ready invoice in a new window.
 * The user can then Print or Save as PDF from the browser.
 */
export function printInvoice(invoice, student, user) {
  const printWindow = window.open('', '_blank', 'width=800,height=1000');
  if (!printWindow) {
    alert('Please allow pop-ups to print invoices.');
    return;
  }

  const html = buildInvoiceHTML(invoice, student, user);
  printWindow.document.write(html);
  printWindow.document.close();

  // Give it a moment to render, then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

/**
 * Build the full HTML document for the invoice.
 * Entirely self-contained — no external CSS needed.
 */
function buildInvoiceHTML(invoice, student, user) {
  const itemRows = invoice.items.map(item => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e7e5e4;">${item.description}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e7e5e4; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e7e5e4; text-align: right;">${formatCurrency(item.rate)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e7e5e4; text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1c1917;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
    <div>
      <h1 style="font-size: 28px; font-weight: 700; color: #0f766e; margin-bottom: 4px;">
        ${user?.businessName || user?.name || 'Music Studio'}
      </h1>
      <p style="color: #78716c; font-size: 14px;">Music Lesson Studio</p>
    </div>
    <div style="text-align: right;">
      <h2 style="font-size: 24px; font-weight: 700; color: #1c1917;">INVOICE</h2>
      <p style="color: #78716c; font-size: 14px; margin-top: 4px;">${invoice.invoiceNumber}</p>
    </div>
  </div>

  <!-- Bill To + Invoice Details -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
    <div>
      <p style="font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Bill To</p>
      <p style="font-size: 16px; font-weight: 600;">${student?.name || 'Student'}</p>
      ${student?.email ? `<p style="color: #78716c; font-size: 14px;">${student.email}</p>` : ''}
      ${student?.phone ? `<p style="color: #78716c; font-size: 14px;">${student.phone}</p>` : ''}
    </div>
    <div style="text-align: right;">
      <div style="margin-bottom: 8px;">
        <span style="font-size: 12px; color: #78716c;">Date: </span>
        <span style="font-size: 14px; font-weight: 500;">${new Date(invoice.createdDate + 'T00:00:00').toLocaleDateString()}</span>
      </div>
      <div style="margin-bottom: 8px;">
        <span style="font-size: 12px; color: #78716c;">Due: </span>
        <span style="font-size: 14px; font-weight: 500;">${new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString()}</span>
      </div>
      <div>
        <span style="display: inline-block; padding: 3px 10px; background: ${getStatusBg(invoice.status)}; color: ${getStatusColor(invoice.status)}; font-size: 12px; font-weight: 600; border-radius: 12px; text-transform: capitalize;">
          ${invoice.status}
        </span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f5f5f4;">
        <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">Description</th>
        <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">Qty</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">Rate</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 240px;">
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #78716c;">Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${invoice.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #78716c;">Discount</span>
        <span style="color: #15803d;">-${formatCurrency(invoice.discount)}</span>
      </div>` : ''}
      ${invoice.tax > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #78716c;">Tax</span>
        <span>${formatCurrency(invoice.tax)}</span>
      </div>` : ''}
      <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 4px; border-top: 2px solid #1c1917; font-size: 18px; font-weight: 700;">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
      ${invoice.amountPaid > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #78716c;">Amount Paid</span>
        <span style="color: #15803d;">${formatCurrency(invoice.amountPaid)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 16px; font-weight: 700;">
        <span>Balance Due</span>
        <span style="color: ${invoice.balance > 0 ? '#dc2626' : '#15803d'};">${formatCurrency(invoice.balance)}</span>
      </div>` : ''}
    </div>
  </div>

  ${invoice.notes ? `
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e7e5e4;">
    <p style="font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase; margin-bottom: 4px;">Notes</p>
    <p style="font-size: 14px; color: #57534e;">${invoice.notes}</p>
  </div>` : ''}

  <!-- Footer -->
  <div style="margin-top: 48px; text-align: center; color: #a8a29e; font-size: 12px;">
    <p>Thank you for your business!</p>
    <p style="margin-top: 4px;">Generated by Cadence — Music Lesson Management</p>
  </div>
</body>
</html>`;
}

function getStatusBg(status) {
  const map = { draft: '#e7e5e4', paid: '#dcfce7', unpaid: '#dbeafe', partial: '#fef3c7', overdue: '#fee2e2', void: '#f5f5f4' };
  return map[status] || '#f5f5f4';
}

function getStatusColor(status) {
  const map = { draft: '#44403c', paid: '#166534', unpaid: '#1e40af', partial: '#92400e', overdue: '#991b1b', void: '#78716c' };
  return map[status] || '#78716c';
}
