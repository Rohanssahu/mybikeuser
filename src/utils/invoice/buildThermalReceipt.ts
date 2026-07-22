import { InvoiceData } from './invoiceTypes';
import { formatCurrency, formatDateTime, formatGST } from './formatters';

// Plain-text 80mm receipt layout (42-char width — the common column count
// for 80mm paper at a standard ESC/POS font size). No Bluetooth SDK is
// wired up (confirmed decision) — this text is meant to be shared to a
// printer app / copied manually until a printer SDK is chosen.
const WIDTH = 42;

const center = (s: string): string => {
  const text = s.length > WIDTH ? s.slice(0, WIDTH) : s;
  const pad = Math.max(WIDTH - text.length, 0);
  const left = Math.floor(pad / 2);
  return ' '.repeat(left) + text;
};

const line = (ch = '-'): string => ch.repeat(WIDTH);

const kv = (label: string, value: string): string => {
  const l = label.length > WIDTH ? label.slice(0, WIDTH) : label;
  const space = WIDTH - l.length - value.length;
  if (space < 1) {
    // Doesn't fit on one line — wrap value to the next line, right-aligned.
    return `${l}\n${' '.repeat(Math.max(WIDTH - value.length, 0))}${value}`;
  }
  return `${l}${' '.repeat(space)}${value}`;
};

export function buildThermalReceipt(invoice: InvoiceData): string {
  const rows: string[] = [];

  rows.push(center(invoice.dealer.name || 'MR BIKE'));
  if (invoice.dealer.address) rows.push(center(invoice.dealer.address));
  if (invoice.dealer.phone) rows.push(center(`Ph: ${invoice.dealer.phone}`));
  if (invoice.dealer.gstNumber) rows.push(center(`GSTIN: ${invoice.dealer.gstNumber}`));

  rows.push(line('='));
  rows.push(center('TAX INVOICE'));
  rows.push(line());
  rows.push(kv('Invoice No:', invoice.invoiceNumber));
  rows.push(kv('Booking No:', invoice.bookingNumber || '-'));
  rows.push(kv('Date:', formatDateTime(invoice.invoiceDate)));

  rows.push(line());
  rows.push(`Customer: ${invoice.customer.name || '-'}`);
  rows.push(`Mobile:   ${invoice.customer.mobile || '-'}`);

  rows.push(line());
  rows.push(`Bike: ${[invoice.bike.company, invoice.bike.model].filter(Boolean).join(' ') || '-'}`);
  rows.push(`Reg No: ${invoice.bike.registrationNumber || '-'}`);
  if (invoice.bike.engineCc) rows.push(`Engine: ${invoice.bike.engineCc} cc`);

  rows.push(line());
  rows.push('SERVICES');
  invoice.services.forEach((s) => {
    rows.push(kv(s.quantity > 1 ? `${s.name} x${s.quantity}` : s.name, formatCurrency(s.total)));
  });

  rows.push(line());
  rows.push(kv('Subtotal', formatCurrency(invoice.subtotal)));
  if (invoice.charges.pickupCharge > 0) rows.push(kv('Pickup Charges', formatCurrency(invoice.charges.pickupCharge)));
  if (invoice.charges.dropCharge > 0) rows.push(kv('Drop Charges', formatCurrency(invoice.charges.dropCharge)));
  rows.push(kv(`GST (${formatGST(invoice.tax.rate)})`, formatCurrency(invoice.tax.amount)));

  rows.push(line('='));
  rows.push(kv('TOTAL PAID', formatCurrency(invoice.totalPaid)));
  rows.push(line('='));

  rows.push(kv('Commission', formatCurrency(invoice.settlement.commissionAmount)));
  rows.push(kv('Dealer Payout', formatCurrency(invoice.settlement.dealerPayout)));

  rows.push(line());
  rows.push(kv('Payment Method', invoice.paymentMethod || '-'));
  rows.push(kv('Status', (invoice.paymentStatus || '-').toUpperCase()));

  rows.push(line());
  rows.push(center('Thank you for choosing MR Bike!'));

  return rows.join('\n');
}
