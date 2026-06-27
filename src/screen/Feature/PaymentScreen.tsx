import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import ScreenNameEnum from '../../routes/screenName.enum';

const PaymentScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const route: any = useRoute();
  const { User, totalPrice } = route.params;

  useFocusEffect(
    React.useCallback(() => {
      if (!paymentInitiated) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [paymentInitiated]),
  );

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
      setPaymentInitiated(true);
    } catch (error) {
      Alert.alert('Payment Error', 'Unable to open UPI app.');
    } finally {
      setLoading(false);
    }
  };

  if (paymentInitiated) {
    return (
      <View style={styles.root}>
        <CustomHeader navigation={navigation} title="Payment" />
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successSub}>Wait for dealer handover.</Text>
          <Text style={styles.successHint}>
            Your booking will be updated once the dealer confirms delivery.
          </Text>
          <TouchableOpacity
            style={styles.viewBookingBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.reset({
                index: 1,
                routes: [
                  {name: ScreenNameEnum.BOTTAM_TAB},
                  {name: ScreenNameEnum.SERVICE_SUMMERY, params: {id: User?._id}},
                ],
              })
            }>
            <Text style={styles.viewBookingTxt}>View Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CustomHeader navigation={navigation} title="Payment" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ─── Bill Summary ─────────────────────────────────────────────────── */}
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

        {/* ─── Payment Method ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.methodCard}>
          <View style={styles.methodIcon}>
            <Icon source={icon.online} size={22} tintColor="#081041" />
          </View>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>UPI / Online</Text>
            <Text style={styles.methodSubtitle}>
              Pay via Google Pay, PhonePe, Paytm or any UPI app
            </Text>
          </View>
          <View style={styles.radioSelected}>
            <View style={styles.radioDot} />
          </View>
        </View>

        <View style={styles.safeRow}>
          <Icon source={icon.check} size={14} tintColor="#10B981" />
          <Text style={styles.safeTxt}> 100% secure payments</Text>
        </View>

        <View style={styles.btnSpacer} />
      </ScrollView>

      {/* ─── Sticky Pay Button ────────────────────────────────────────────────── */}
      <View style={styles.payBar}>
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={startUpiPayment}>
          {loading ? (
            <ActivityIndicator color="#081041" />
          ) : (
            <Text style={styles.payBtnTxt}>🔒  Pay  ₹{totalPrice}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.baground },
  scroll: { padding: 16 },

  // ── Success state ────────────────────────────────────────────────────────────
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successEmoji: { fontSize: 38 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 16,
    color: '#FED428',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  successHint: {
    fontSize: 13,
    color: '#6B7DBE',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  viewBookingBtn: {
    backgroundColor: '#FED428',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  viewBookingTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#081041',
  },

  // ── Bill card ────────────────────────────────────────────────────────────────
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
  billDivider: { height: 1, backgroundColor: '#F0F2F8', marginVertical: 10 },
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7DBE',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111E5A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FED428',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED428',
  },
  methodText: { flex: 1, marginLeft: 12 },
  methodTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  methodSubtitle: { fontSize: 12, color: '#3D4F80', marginTop: 3, lineHeight: 17 },

  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FED428',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FED428',
  },

  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  safeTxt: { fontSize: 12, color: '#10B981', fontWeight: '500' },

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
