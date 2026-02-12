import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { icon } from '../../component/Image';
import CustomHeader from '../../component/CustomHeaderProps';
import CustomButton from '../../component/CustomButton';
import PaymentOption from './PaymentOption';
import BookingComplete from './BookingComplete';
import { payment_Cash, updateBooking } from '../../redux/Api/apiRequests';
import { color } from '../../constant';
import { wp } from '../../component/utils/Constant';

const PaymentScreen = ({ navigation }: any) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('Online');
  const [loading, setLoading] = useState(false);
  const [CompleteModal, setCompleteModal] = useState(false);

  const route: any = useRoute();
  const { User, totalPrice, response } = route.params;
  const isLogOut: any = useSelector((state: any) => state.auth);

  // ✅ CASH PAYMENT
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

  // ✅ COMPLETE BOOKING
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

  // ✅ UPI PAYMENT (OPEN ONLY ON CLICK)
  const startUpiPayment = async () => {
    try {
      setLoading(true);

      const upiId = "merchant@upi"; // 🔥 Replace with your real UPI ID
      const name = "BikeDoctor";
      const note = "Bike Service Payment";
      const transactionRef = `BD${Date.now()}`;

      const upiUrl =
        `upi://pay?pa=${upiId}` +
        `&pn=${encodeURIComponent(name)}` +
        `&tn=${encodeURIComponent(note)}` +
        `&am=${totalPrice}` +
        `&cu=INR` +
        `&tr=${transactionRef}`;

      const supported = await Linking.canOpenURL("upi://pay");

      if (!supported) {
        Alert.alert(
          "No UPI App Found",
          "Please install Google Pay, PhonePe or any UPI app."
        );
        return;
      }

      await Linking.openURL(upiUrl);

    } catch (error) {
      console.log("UPI Error:", error);
      Alert.alert("Payment Error", "Unable to open UPI app.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Payment" />

      <View style={{ padding: 15 }}>
        <PaymentOption
          title="Online (UPI)"
          description="Pay securely using any UPI app installed on your phone."
          iconName={icon.online}
          isSelected={selectedMethod === 'Online'}
          onSelect={() => setSelectedMethod('Online')}
        />

        <PaymentOption
          title="Cash"
          description="Pay in cash directly to our partner when your service is completed."
          iconName={icon.cash}
          isSelected={selectedMethod === 'Cash'}
          onSelect={() => setSelectedMethod('Cash')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={async () => {
            if (selectedMethod === 'Online') {
              await startUpiPayment();   // 🔥 ONLY OPEN WHEN USER PRESSES
            } else {
              await Cashpay();
            }
          }}
          title={!loading ? 'Continue' : 'Processing...'}
        />
      </View>

      {CompleteModal && (
        <BookingComplete
          visible={CompleteModal}
          onClose={() => setCompleteModal(false)}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  buttonContainer: {
    paddingHorizontal: 15,
    position: 'absolute',
    bottom: 20,
    width: wp(100),
  },
});

export default PaymentScreen;
