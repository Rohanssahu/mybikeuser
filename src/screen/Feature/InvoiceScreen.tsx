import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import CustomHeader from '../../component/CustomHeaderProps';
import {color} from '../../constant';
import {get_invoice} from '../../redux/Api/apiRequests';
import InvoiceDocument from '../../component/invoice/InvoiceDocument';
import InvoiceActions from '../../component/invoice/InvoiceActions';
import ThermalReceiptPreview from '../../component/invoice/ThermalReceiptPreview';
import {buildThermalReceipt} from '../../utils/invoice/buildThermalReceipt';
import {InvoiceData} from '../../utils/invoice/invoiceTypes';
import {SafeAreaView} from 'react-native-safe-area-context';

const InvoiceScreen: React.FC<any> = ({navigation}) => {
  const route = useRoute<any>();
  const {bookingId} = route.params || {};

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showThermal, setShowThermal] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    (async () => {
      setLoading(true);
      const res = await get_invoice(bookingId);
      if (res?.success && res.data) {
        setInvoice(res.data as InvoiceData);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [bookingId]);

  return (
    <View style={styles.root}>
      <CustomHeader title="Invoice" navigation={navigation} showHome />

      <SafeAreaView style={{flex: 1}}>
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color="#FED428" size="large" />
          </View>
        ) : notFound || !invoice ? (
          <View style={styles.centerWrap}>
            <Text style={styles.notFoundTxt}>
              Invoice is not available yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}>
            <InvoiceDocument invoice={invoice} />

            <View style={styles.actionsWrap}>
              <InvoiceActions invoice={invoice} />
            </View>

            <TouchableOpacity
              style={styles.thermalToggle}
              onPress={() => setShowThermal(v => !v)}>
              <Text style={styles.thermalToggleText}>
                {showThermal ? 'Hide' : 'Show'} 80mm Thermal Receipt
              </Text>
            </TouchableOpacity>

            {showThermal && (
              <View style={styles.thermalWrap}>
                <ThermalReceiptPreview
                  receiptText={buildThermalReceipt(invoice)}
                />
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: color.baground},
  scroll: {padding: 14, paddingBottom: 32},
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notFoundTxt: {color: '#6B7DBE', fontSize: 14, textAlign: 'center'},
  actionsWrap: {marginTop: 14},
  thermalToggle: {marginTop: 18, alignItems: 'center', paddingVertical: 8},
  thermalToggleText: {color: '#FED428', fontWeight: '700', fontSize: 12.5},
  thermalWrap: {marginTop: 6},
});
