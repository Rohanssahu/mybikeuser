import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {WebView} from 'react-native-webview';

import {icon} from '../../component/Image';
import CustomHeader from '../../component/CustomHeaderProps';
import CustomButton from '../../component/CustomButton';
import PaymentOption from './PaymentOption';
import BookingComplete from './BookingComplete';
import {payment_Cash, updateBooking} from '../../redux/Api/apiRequests';
import {color} from '../../constant';
import {wp} from '../../component/utils/Constant';
import {base_url} from '../../redux/Api';

const PaymentScreen = ({navigation}: any) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('Online');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [CompleteModal, setCompleteModal] = useState(false);

  const route: any = useRoute();
  const {User, totalPrice, response} = route.params;
  const isLogOut: any = useSelector((state: any) => state.auth);

  // 🟢 Cash Payment (COD)
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

  // 🟢 Complete booking after payment
  const CompleteApi = async () => {
    try {
      const res = awai123456
      teBooking(
        response?.save,
        response?.totalEstimatedCost,
        response?.useData,
        response?.token,
        response?.lastServiceKm,
        response?.selectedServiceIds,
        setLoading,
        navigation,
      );
      if (res.success) {
        setCompleteModal(true);
        setCheckoutUrl(null);
      }
    } catch (err) {
      console.log('updateBooking error:', err);
    }
  };

  // 🟢 Start WebView Checkout
  const startWebviewPayment = async () => {
    try {

     
      
      setLoading(true);
      const res = await fetch(`${base_url}/bikedoctor/payment/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${isLogOut.token}`,
        },
        body: JSON.stringify({
          orderAmount: totalPrice,
          orderCurrency:"INR",
          user_id:User?.user_id?._id,
          dealer_id:User?.dealer_id?._id,
          booking_id: response?._id,
          customer_email: User?.user_id.email,
          customer_phone: User?.user_id.phone?.toString(),
          customer_name: `${User?.user_id.first_name || ''} ${User?.user_id.last_name || ''}`,
        }),
      });

      const data = await res.json();
      console.log('✅ Create Order Response:', data);

      if (data?.success && data?.data?.payment_link) {
        setCheckoutUrl(data.data.payment_link);
      } else {
        Alert.alert('Payment Error', data?.message || 'Failed to create order.');
      }
    } catch (err) {
      console.log('Payment Error:', err);
      Alert.alert('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle WebView navigation
  const handleNavigationChange = async (navState: any) => {
    const url = navState.url;
    // ✅ Detect success or failure redirect URLs
    if (url.includes('payment/success')) {
      console.log('Payment Success URL detected');
      await CompleteApi();
    } else if (url.includes('payment/failure')) {
      console.log('Payment Failed URL detected');
      Alert.alert('Payment Failed', 'Please try again.');
      setCheckoutUrl(null);
    }
  };

  // 🟢 Handle back press inside WebView
  React.useEffect(() => {
    const backAction = () => {
      if (checkoutUrl) {
        setCheckoutUrl(null);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [checkoutUrl]);

  // 🟢 Render WebView if checkout started
  if (checkoutUrl) {
    return (
      <View style={{flex: 1}}>
        <CustomHeader navigation={navigation} title="Checkout" />
        <WebView
          source={{uri: checkoutUrl}}
          onNavigationStateChange={handleNavigationChange}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color={color.primary}
              style={{marginTop: 20}}
            />
          
          )}
          originWhitelist={['*']}
          
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  // 🟢 Default Payment Screen UI
  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Payment" />
      <View style={{padding: 15}}>
        <PaymentOption
          title="Online"
          description="Pay securely using UPI, card, or net banking."
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
              await startWebviewPayment();
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
