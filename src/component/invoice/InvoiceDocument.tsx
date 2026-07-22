import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { InvoiceData } from '../../utils/invoice/invoiceTypes';
import { formatCurrency, formatDateTime, formatGST } from '../../utils/invoice/formatters';

const Divider = () => <View style={styles.divider} />;

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
  </View>
);

// The in-app "paper" preview — white, rounded, section dividers, matching
// the same field order as buildInvoiceHtml.ts (PDF/print) so nothing looks
// different between the in-app preview and the exported document.
const InvoiceDocument: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const { dealer, customer, bike, services, charges, tax, discount, settlement } = invoice;
  const isCancelled = invoice.paymentStatus === 'cancelled';

  return (
    <View style={styles.paper}>
      <View style={styles.header}>
        {dealer.logoUrl ? <Image source={{ uri: dealer.logoUrl }} style={styles.logo} resizeMode="contain" /> : null}
        <Text style={styles.dealerName}>{dealer.name || 'MR Bike Service Center'}</Text>
        {dealer.address ? <Text style={styles.dealerMeta}>{dealer.address}</Text> : null}
        {dealer.phone ? <Text style={styles.dealerMeta}>Ph: {dealer.phone}</Text> : null}
        {dealer.gstNumber ? <Text style={styles.dealerMeta}>GSTIN: {dealer.gstNumber}</Text> : null}
      </View>

      <Divider />
      <Text style={styles.taxTitle}>TAX INVOICE</Text>
      <Row label="Invoice No" value={invoice.invoiceNumber} bold />
      <Row label="Booking ID" value={invoice.bookingNumber || '—'} />
      <Row label="Invoice Date" value={formatDateTime(invoice.invoiceDate)} />
      <Row label="Payment Method" value={invoice.paymentMethod || '—'} />

      <Divider />
      <SectionTitle>Customer Details</SectionTitle>
      <Row label="Name" value={customer.name || '—'} />
      <Row label="Mobile" value={customer.mobile || '—'} />

      <Divider />
      <SectionTitle>Bike Details</SectionTitle>
      <Row label="Company" value={bike.company || '—'} />
      <Row label="Model" value={bike.model || '—'} />
      <Row label="Registration No." value={bike.registrationNumber || '—'} />
      <Row label="Engine CC" value={bike.engineCc ? `${bike.engineCc} cc` : '—'} />

      <Divider />
      <SectionTitle>Service Details</SectionTitle>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.colName]}>Service</Text>
        <Text style={[styles.th, styles.colQty]}>Qty</Text>
        <Text style={[styles.th, styles.colRate]}>Rate</Text>
        <Text style={[styles.th, styles.colAmt]}>Amount</Text>
      </View>
      {services.map((s, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={[styles.td, styles.colName]}>{s.name}</Text>
          <Text style={[styles.td, styles.colQty]}>{s.quantity}</Text>
          <Text style={[styles.td, styles.colRate]}>{formatCurrency(s.price)}</Text>
          <Text style={[styles.td, styles.colAmt]}>{formatCurrency(s.total)}</Text>
        </View>
      ))}

      <Divider />
      <Row label="Subtotal" value={formatCurrency(invoice.subtotal)} />
      {charges.pickupCharge > 0 && <Row label="Pickup Charges" value={formatCurrency(charges.pickupCharge)} />}
      {charges.dropCharge > 0 && <Row label="Drop Charges" value={formatCurrency(charges.dropCharge)} />}

      {discount && (
        <>
          <Divider />
          <Row label={`Promo Discount (${discount.code})`} value={`-${formatCurrency(discount.amount)}`} />
        </>
      )}

      <Divider />
      <Row label={`GST (${formatGST(tax.rate)})`} value={formatCurrency(tax.amount)} />

      <Divider />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Paid By Customer</Text>
        <Text style={styles.totalValue}>{formatCurrency(invoice.totalPaid)}</Text>
      </View>

      <Divider />
      <SectionTitle>Settlement Details</SectionTitle>
      <Row label={`Platform Commission (${formatGST(settlement.commissionRate)})`} value={formatCurrency(settlement.commissionAmount)} />
      <Row label="Net Dealer Payout" value={formatCurrency(settlement.dealerPayout)} bold />

      <Divider />
      <View style={styles.stampWrap}>
        <View style={[styles.stamp, isCancelled && styles.stampCancelled]}>
          <Text style={[styles.stampText, isCancelled && styles.stampTextCancelled]}>
            {isCancelled ? 'CANCELLED' : 'PAID'}
          </Text>
        </View>
      </View>

      <Divider />
      <SectionTitle>Notes</SectionTitle>
      <Text style={styles.noteText}>• GST is collected as per applicable tax rules.</Text>
      <Text style={styles.noteText}>• Dealer payout is calculated after deducting platform commission.</Text>

      <Divider />
      <Text style={styles.thankYou}>Thank you for choosing MR Bike.</Text>
    </View>
  );
};

export default InvoiceDocument;

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { alignItems: 'center', marginBottom: 4 },
  logo: { width: 64, height: 64, marginBottom: 6 },
  dealerName: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  dealerMeta: { fontSize: 11.5, color: '#666', marginTop: 2, textAlign: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: '#e5e5e5', borderStyle: 'dashed', marginVertical: 12 },
  taxTitle: { textAlign: 'center', fontSize: 15, fontWeight: '800', letterSpacing: 2, color: '#1a1a1a', marginBottom: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#8a8a8a',
    marginBottom: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { fontSize: 12.5, color: '#555', flexShrink: 1, paddingRight: 8 },
  rowValue: { fontSize: 12.5, color: '#1a1a1a', fontWeight: '600' },
  bold: { fontWeight: '800', color: '#000' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 6, marginBottom: 2 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f2f2f2', paddingVertical: 6 },
  th: { fontSize: 10, fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  td: { fontSize: 12, color: '#1a1a1a' },
  colName: { flex: 2 },
  colQty: { flex: 0.6, textAlign: 'center' },
  colRate: { flex: 1, textAlign: 'right' },
  colAmt: { flex: 1, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#0D1952' },
  stampWrap: { alignItems: 'center' },
  stamp: { borderWidth: 2, borderColor: '#1e8e3e', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 24 },
  stampCancelled: { borderColor: '#c62828' },
  stampText: { fontSize: 14, fontWeight: '900', letterSpacing: 3, color: '#1e8e3e' },
  stampTextCancelled: { color: '#c62828' },
  noteText: { fontSize: 11, color: '#777', marginBottom: 3 },
  thankYou: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
});
