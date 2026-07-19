import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import { get_invoice } from '../../redux/Api/apiRequests';

const STATUS_LABEL: Record<string, string> = {
  generated: 'Generated',
  sent: 'Sent',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

const InvoiceScreen: React.FC<any> = ({ navigation }) => {
  const route = useRoute<any>();
  const { bookingId } = route.params || {};

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); setNotFound(true); return; }
    (async () => {
      setLoading(true);
      const res = await get_invoice(bookingId);
      if (res?.success && res.data) {
        setBill(res.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [bookingId]);

  const gstRate = bill?.tax_rate ?? 18;
  const gstAmount = bill?.tax_amount ?? 0;

  return (
    <View style={styles.root}>
      <CustomHeader title="Invoice" navigation={navigation} showHome />

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#FED428" size="large" />
        </View>
      ) : notFound || !bill ? (
        <View style={styles.centerWrap}>
          <Text style={styles.notFoundTxt}>Invoice is not available yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.billCard}>
            <Text style={styles.billTitle}>Invoice Summary</Text>
            {bill.bill_number && (
              <Text style={styles.billNumber}>#{bill.bill_number}</Text>
            )}

            {/* Services */}
            {bill.services?.map((service: any, i: number) => (
              <View key={i} style={styles.billRow}>
                <View style={styles.billItemLeft}>
                  <View style={styles.billDot} />
                  <Text style={styles.billItemName}>
                    {' '}{service.name}{service.quantity > 1 ? ` x${service.quantity}` : ''}
                  </Text>
                </View>
                <Text style={styles.billItemPrice}>
                  ₹{service.total ?? service.price}
                </Text>
              </View>
            ))}

            <View style={styles.billDivider} />

            <View style={styles.billRow}>
              <Text style={styles.summaryLbl}>Subtotal</Text>
              <Text style={styles.summaryVal}>₹{bill.subtotal}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.summaryLbl}>GST ({gstRate}%)</Text>
              <Text style={styles.summaryVal}>₹{gstAmount}</Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLbl}>Total Amount</Text>
              <Text style={styles.billTotalAmt}>₹{bill.total_amount}</Text>
            </View>

            <View style={styles.billDivider} />

            <View style={styles.statusGrid}>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLbl}>Payment Method</Text>
                <Text style={styles.statusGridVal}>
                  {bill.payment_details?.payment_method || '—'}
                </Text>
              </View>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLbl}>Payment Status</Text>
                <Text style={styles.statusGridVal}>
                  {STATUS_LABEL[bill.status] || bill.status || '—'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.baground },
  scroll: { padding: 14 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  notFoundTxt: { color: '#6B7DBE', fontSize: 14, textAlign: 'center' },

  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1952',
    textAlign: 'center',
  },
  billNumber: {
    fontSize: 12,
    color: '#6B7DBE',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
  },
  billItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  billDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7DBE' },
  billItemName: { fontSize: 13, color: '#2D3A6A', fontWeight: '500', flex: 1 },
  billItemPrice: { fontSize: 13, fontWeight: '700', color: '#2D3A6A' },

  billDivider: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E6F0',
    borderStyle: 'dashed',
    marginVertical: 10,
  },

  summaryLbl: { fontSize: 13, color: '#6B7DBE' },
  summaryVal: { fontSize: 13, color: '#2D3A6A', fontWeight: '600' },

  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  billTotalLbl: { fontSize: 15, fontWeight: '700', color: '#0D1952' },
  billTotalAmt: { fontSize: 22, fontWeight: '800', color: '#FED428' },

  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusGridItem: { flex: 1, alignItems: 'center', gap: 6 },
  statusGridLbl: {
    fontSize: 11,
    color: '#6B7DBE',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusGridVal: { fontSize: 13, fontWeight: '700', color: '#0D1952', textAlign: 'center' },
});
