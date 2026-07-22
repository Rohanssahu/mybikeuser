import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Print from 'react-native-print';
import Share from 'react-native-share';
import { InvoiceData } from '../../utils/invoice/invoiceTypes';
import { buildInvoiceHtml } from '../../utils/invoice/buildInvoiceHtml';
import { errorToast } from '../../configs/customToast';

interface Props {
  invoice: InvoiceData;
}

// Both actions render from the exact same HTML (buildInvoiceHtml) — Download
// PDF and Print Invoice can never visually disagree with each other or with
// the on-screen preview.
const InvoiceActions: React.FC<Props> = ({ invoice }) => {
  const [busy, setBusy] = useState<'pdf' | 'print' | null>(null);

  const handleDownloadPdf = async () => {
    if (busy) return;
    setBusy('pdf');
    try {
      const html = buildInvoiceHtml(invoice);
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_'),
        base64: false,
      });
      if (file?.filePath) {
        await Share.open({
          url: `file://${file.filePath}`,
          type: 'application/pdf',
          failOnCancel: false,
        });
      }
    } catch (err: any) {
      console.error('Invoice PDF error:', err?.message || err);
      errorToast('Could not generate the invoice PDF.');
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = async () => {
    if (busy) return;
    setBusy('print');
    try {
      const html = buildInvoiceHtml(invoice);
      // react-native-print routes this through Android's native Print API
      // and iOS AirPrint automatically.
      await Print.print({ html });
    } catch (err: any) {
      console.error('Invoice print error:', err?.message || err);
      errorToast('Could not open the print dialog.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, styles.btnOutline]}
        onPress={handleDownloadPdf}
        disabled={busy !== null}
      >
        {busy === 'pdf' ? (
          <ActivityIndicator color="#0D1952" />
        ) : (
          <Text style={styles.btnOutlineText}>Download PDF</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnFilled]}
        onPress={handlePrint}
        disabled={busy !== null}
      >
        {busy === 'print' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnFilledText}>Print Invoice</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default InvoiceActions;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: { borderWidth: 1.5, borderColor: '#0D1952', backgroundColor: '#fff' },
  btnOutlineText: { color: '#0D1952', fontWeight: '700', fontSize: 13 },
  btnFilled: { backgroundColor: '#0D1952' },
  btnFilledText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
