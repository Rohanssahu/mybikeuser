import { InvoiceData } from './invoiceTypes';
import { formatCurrency, formatDateTime, formatGST } from './formatters';

const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

// Single HTML template consumed by BOTH the "Download PDF" flow
// (react-native-html-to-pdf) and the "Print Invoice" flow (react-native-print
// prints HTML directly via Android's native Print API / iOS AirPrint) — one
// source of truth, so the PDF and the printed page can never drift apart.
// A4-oriented, print-friendly CSS.
export function buildInvoiceHtml(invoice: InvoiceData): string {
  const servicesRows = invoice.services
    .map(
      (s) => `
      <tr>
        <td>${esc(s.name)}</td>
        <td class="center">${esc(s.quantity)}</td>
        <td class="right">${esc(formatCurrency(s.price))}</td>
        <td class="right">${esc(formatCurrency(s.total))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 12px; margin: 0; padding: 0; }
  .paper { width: 100%; }
  .header { text-align: center; margin-bottom: 12px; }
  .logo { max-height: 56px; margin-bottom: 6px; }
  .dealer-name { font-size: 20px; font-weight: 800; margin: 0; }
  .dealer-meta { font-size: 11px; color: #555; margin: 2px 0; }
  .divider { border-top: 1px dashed #ccc; margin: 14px 0; }
  .tax-title { text-align: center; font-size: 16px; font-weight: 800; letter-spacing: 2px; margin: 4px 0 12px; }
  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #666; margin-bottom: 6px; }
  .row { display: flex; justify-content: space-between; padding: 3px 0; }
  .row .label { color: #555; }
  .row .value { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; color: #777; border-bottom: 1px solid #ddd; padding: 6px 4px; }
  td { padding: 6px 4px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
  .total-label { font-size: 14px; font-weight: 800; }
  .total-value { font-size: 20px; font-weight: 900; }
  .paid-stamp { text-align: center; margin: 14px 0; }
  .paid-badge { display: inline-block; padding: 6px 20px; border: 2px solid #1e8e3e; color: #1e8e3e; font-weight: 900; letter-spacing: 3px; border-radius: 6px; }
  .paid-badge.cancelled { border-color: #c62828; color: #c62828; }
  .notes { font-size: 10.5px; color: #666; }
  .notes li { margin-bottom: 3px; }
  .thank-you { text-align: center; font-size: 13px; font-weight: 700; margin-top: 14px; }
</style>
</head>
<body>
  <div class="paper">
    <div class="header">
      ${invoice.dealer.logoUrl ? `<img class="logo" src="${esc(invoice.dealer.logoUrl)}" />` : ''}
      <p class="dealer-name">${esc(invoice.dealer.name || 'MR Bike Service Center')}</p>
      ${invoice.dealer.address ? `<p class="dealer-meta">${esc(invoice.dealer.address)}</p>` : ''}
      ${invoice.dealer.phone ? `<p class="dealer-meta">Ph: ${esc(invoice.dealer.phone)}</p>` : ''}
      ${invoice.dealer.gstNumber ? `<p class="dealer-meta">GSTIN: ${esc(invoice.dealer.gstNumber)}</p>` : ''}
    </div>

    <div class="divider"></div>
    <p class="tax-title">TAX INVOICE</p>
    <div class="row"><span class="label">Invoice No</span><span class="value">${esc(invoice.invoiceNumber)}</span></div>
    <div class="row"><span class="label">Booking ID</span><span class="value">${esc(invoice.bookingNumber || '—')}</span></div>
    <div class="row"><span class="label">Invoice Date</span><span class="value">${esc(formatDateTime(invoice.invoiceDate))}</span></div>
    <div class="row"><span class="label">Payment Method</span><span class="value">${esc(invoice.paymentMethod || '—')}</span></div>

    <div class="divider"></div>
    <p class="section-title">Customer Details</p>
    <div class="row"><span class="label">Name</span><span class="value">${esc(invoice.customer.name || '—')}</span></div>
    <div class="row"><span class="label">Mobile</span><span class="value">${esc(invoice.customer.mobile || '—')}</span></div>

    <div class="divider"></div>
    <p class="section-title">Bike Details</p>
    <div class="row"><span class="label">Company</span><span class="value">${esc(invoice.bike.company || '—')}</span></div>
    <div class="row"><span class="label">Model</span><span class="value">${esc(invoice.bike.model || '—')}</span></div>
    <div class="row"><span class="label">Registration No.</span><span class="value">${esc(invoice.bike.registrationNumber || '—')}</span></div>
    <div class="row"><span class="label">Engine CC</span><span class="value">${invoice.bike.engineCc ? esc(`${invoice.bike.engineCc} cc`) : '—'}</span></div>

    <div class="divider"></div>
    <p class="section-title">Service Details</p>
    <table>
      <thead>
        <tr><th>Service</th><th class="center">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr>
      </thead>
      <tbody>${servicesRows}</tbody>
    </table>

    <div class="divider"></div>
    <div class="row"><span class="label">Subtotal</span><span class="value">${esc(formatCurrency(invoice.subtotal))}</span></div>
    ${invoice.charges.pickupCharge > 0 ? `<div class="row"><span class="label">Pickup Charges</span><span class="value">${esc(formatCurrency(invoice.charges.pickupCharge))}</span></div>` : ''}
    ${invoice.charges.dropCharge > 0 ? `<div class="row"><span class="label">Drop Charges</span><span class="value">${esc(formatCurrency(invoice.charges.dropCharge))}</span></div>` : ''}

    <div class="divider"></div>
    <div class="row"><span class="label">GST (${esc(formatGST(invoice.tax.rate))})</span><span class="value">${esc(formatCurrency(invoice.tax.amount))}</span></div>

    <div class="divider"></div>
    <div class="total-row">
      <span class="total-label">Total Paid By Customer</span>
      <span class="total-value">${esc(formatCurrency(invoice.totalPaid))}</span>
    </div>

    <div class="divider"></div>
    <p class="section-title">Settlement Details</p>
    <div class="row"><span class="label">Platform Commission (${esc(formatGST(invoice.settlement.commissionRate))})</span><span class="value">${esc(formatCurrency(invoice.settlement.commissionAmount))}</span></div>
    <div class="row"><span class="label">Net Dealer Payout</span><span class="value">${esc(formatCurrency(invoice.settlement.dealerPayout))}</span></div>

    <div class="divider"></div>
    <div class="paid-stamp">
      <span class="paid-badge${invoice.paymentStatus === 'cancelled' ? ' cancelled' : ''}">${invoice.paymentStatus === 'cancelled' ? 'CANCELLED' : 'PAID'}</span>
    </div>

    <div class="divider"></div>
    <p class="section-title">Notes</p>
    <ul class="notes">
      <li>GST is collected as per applicable tax rules.</li>
      <li>Dealer payout is calculated after deducting platform commission.</li>
    </ul>

    <div class="divider"></div>
    <p class="thank-you">Thank you for choosing MR Bike.</p>
  </div>
</body>
</html>`;
}
