import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';

import CustomHeader from '../../component/CustomHeaderProps';
import BookingComplete from './BookingComplete';
import { payment_Cash, updateBooking } from '../../redux/Api/apiRequests';
import { color } from '../../constant';

interface PaymentMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const METHODS: PaymentMethod[] = [
  {
    id: 'Online',
    title: 'UPI / Online',
    subtitle: 'Pay via Google Pay, PhonePe, Paytm or any UPI app',
    icon: 'account-balance',
  },
  {
    id: 'Cash',
    title: 'Cash on Delivery',
    subtitle: 'Pay in cash when your bike is returned',
    icon: 'payments',
  },
];

const PaymentScreen = ({ navigation }: any) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('Online');
  const [loading, setLoading] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);

  const route: any = useRoute();
  const { User, totalPrice, response } = route.params;
  const isLogOut: any = useSelector((state: any) => state.auth);

  const Cashpay = async () => {
    const state = await payment_Cash(
      isLogOut.token,
      totalPrice,
      setLoading,
      User,
      navigation,
    );
    if (state.success) {
      await CompleteApi();
    }
  };

  const CompleteApi = async () => {
    try {
      const res = await updateBooking(
        response?.save,
        response?.totalEstimatedCost,
        response?.useData,
        response?.token,
        response?.lastServiceKm,
        response?.selectedServiceIds,
        setLoading,
        navigation,
      );
      if (res?.success) {
        setCompleteModal(true);
      }
    } catch (err) {
      console.log('updateBooking error:', err);
    }
  };

  const startUpiPayment = async () => {
    try {
      setLoading(true);
      const upiId = 'merchant@upi';
      const name = 'MR BIKE';
      const note = 'Bike Service Payment';
      const transactionRef = `MRB${Date.now()}`;
      const upiUrl =
        `upi://pay?pa=${upiId}` +
        `&pn=${encodeURIComponent(name)}` +
        `&tn=${encodeURIComponent(note)}` +
        `&am=${totalPrice}` +
        `&cu=INR` +
        `&tr=${transactionRef}`;

      const supported = await Linking.canOpenURL('upi://pay');
      if (!supported) {
        Alert.alert(
          'No UPI App Found',
          'Please install Google Pay, PhonePe or any UPI app.',
        );
        return;
      }
      await Linking.openURL(upiUrl);
    } catch (error) {
      Alert.alert('Payment Error', 'Unable to open UPI app.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (selectedMethod === 'Online') {
      await startUpiPayment();
    } else {
      await Cashpay();
    }
  };

  return (
    <View style={styles.root}>
      <CustomHeader navigation={navigation} title="Payment" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ─── Bill Summary ──────────────────────────────────────────────────── */}
        <View style={styles.billCard}>
          <Text style={styles.billCardTitle}>Order Summary</Text>

          <View style={styles.billShopRow}>
            <Text style={styles.shopEmoji}>🏪</Text>
            <Text style={styles.billShopName}>
              {'  '}{User?.dealer_id?.shopName || 'Service Center'}
            </Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billAmtRow}>
            <Text style={styles.billAmtLbl}>Service Charges</Text>
            <Text style={styles.billAmtVal}>₹{totalPrice}</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLbl}>Total Payable</Text>
            <Text style={styles.billTotalAmt}>₹{totalPrice}</Text>
          </View>
        </View>

        {/* ─── Payment Methods ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {METHODS.map(method => {
          const selected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selected && styles.methodCardSelected]}
              activeOpacity={0.85}
              onPress={() => setSelectedMethod(method.id)}>

              {/* Icon circle */}
              <View
                style={[
                  styles.methodIcon,
                  selected ? styles.methodIconSelected : styles.methodIconDefault,
                ]}>
                <Icon
                  source={method.id === 'Online' ? icon.online : icon.cash}
                  size={22}
                  tintColor={selected ? '#081041' : '#6B7DBE'}
                />
              </View>

              {/* Text */}
              <View style={styles.methodText}>
                <Text
                  style={[
                    styles.methodTitle,
                    selected && styles.methodTitleSelected,
                  ]}>
                  {method.title}
                </Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>

              {/* Radio */}
              <View
                style={[
                  styles.radio,
                  selected ? styles.radioSelected : styles.radioDefault,
                ]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Safety note */}
        <View style={styles.safeRow}>
          <Icon source={icon.check} size={14} tintColor="#10B981" />
          <Text style={styles.safeTxt}> 100% secure payments</Text>
        </View>

        {/* Spacer for button */}
        <View style={styles.btnSpacer} />
      </ScrollView>

      {/* ─── Sticky Pay Button ────────────────────────────────────────────────── */}
      <View style={styles.payBar}>
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={handlePay}>
          <Text style={styles.payBtnTxt}>
            {loading ? 'Processing…' : `🔒  Pay  ₹${totalPrice}`}
          </Text>
        </TouchableOpacity>
      </View>

      {completeModal && (
        <BookingComplete navigation={navigation} route={{} as any} />
      )}
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.baground },
  scroll: { padding: 16 },

  // Bill card
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  billCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1952',
    marginBottom: 12,
  },
  billShopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  shopEmoji: { fontSize: 16 },
  billShopName: { fontSize: 14, color: '#2D3A6A', fontWeight: '600' },
  billDivider: {
    height: 1,
    backgroundColor: '#F0F2F8',
    marginVertical: 10,
  },
  billAmtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  billAmtLbl: { fontSize: 13, color: '#6B7DBE' },
  billAmtVal: { fontSize: 13, color: '#2D3A6A', fontWeight: '600' },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLbl: { fontSize: 15, fontWeight: '700', color: '#0D1952' },
  billTotalAmt: { fontSize: 22, fontWeight: '800', color: '#FED428' },

  // Section title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7DBE',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Method cards
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1952',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(254,212,40,0.06)',
  },
  methodCardSelected: {
    borderColor: '#FED428',
    backgroundColor: '#111E5A',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconDefault: { backgroundColor: '#1A2566' },
  methodIconSelected: { backgroundColor: '#FED428' },
  methodText: { flex: 1, marginLeft: 12 },
  methodTitle: { fontSize: 15, fontWeight: '700', color: '#A0AFCE' },
  methodTitleSelected: { color: '#fff' },
  methodSubtitle: { fontSize: 12, color: '#3D4F80', marginTop: 3, lineHeight: 17 },

  // Radio
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioDefault: { borderWidth: 2, borderColor: '#2E3F80' },
  radioSelected: { borderWidth: 2, borderColor: '#FED428' },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FED428',
  },

  // Safety
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  safeTxt: { fontSize: 12, color: '#10B981', fontWeight: '500' },

  // Spacer + sticky bar
  btnSpacer: { height: 80 },
  payBar: {
    backgroundColor: '#0D1952',
    borderTopWidth: 1,
    borderTopColor: 'rgba(254,212,40,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 22,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED428',
    paddingVertical: 16,
    borderRadius: 14,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnTxt: { fontSize: 16, fontWeight: '800', color: '#081041' },
});
