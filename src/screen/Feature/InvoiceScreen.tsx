import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import { hp } from '../../component/utils/Constant';
import { useRoute } from '@react-navigation/native';
import { get_bill_by_booking } from '../../redux/Api/apiRequests';

const InvoiceScreen: React.FC = ({ navigation }) => {
  const route = useRoute();
  const { id } = route.params;
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_invoice();
  }, [id]);

  const get_invoice = async () => {
    setLoading(true);
    const res = await get_bill_by_booking(id);
    if (res?.success) {
      setBill(res?.data);
    } else {
      setBill(null);
    }
    setLoading(false);
  };

  const formatDate = isoDate => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Invoice" navigation={navigation} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: hp(30) }} color={color.buttonColor} />
      ) : !bill ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Invoice not available</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={[styles.card, { marginTop: 10 }]}>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Number</Text>
              <Text style={styles.value}>{bill?.bill_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Date</Text>
              <Text style={styles.value}>{formatDate(bill?.bill_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Bike</Text>
              <Text style={styles.value}>
                {bill?.bike_details?.model} - {bill?.bike_details?.registration}
              </Text>
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Services</Text>
              {bill?.services?.map((service: any, index: number) => (
                <View key={index} style={styles.serviceRow}>
                  <Text style={styles.serviceName}>
                    {service?.name} {service?.quantity > 1 ? `x${service?.quantity}` : ''}
                  </Text>
                  <Text style={styles.servicePrice}>₹{service?.total}</Text>
                </View>
              ))}

              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>Subtotal</Text>
                <Text style={styles.servicePrice}>₹{bill?.subtotal}</Text>
              </View>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>Tax ({bill?.tax_rate}%)</Text>
                <Text style={styles.servicePrice}>₹{bill?.tax_amount}</Text>
              </View>

              <View style={styles.divider} />
              <View style={styles.serviceRow}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalPrice}>₹{bill?.total_amount}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Payment Method</Text>
              <Text style={styles.value}>{bill?.payment_details?.payment_method || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Status</Text>
              <Text style={[styles.value, { color: bill?.status === 'paid' ? 'green' : '#d1a908' }]}>
                {bill?.status}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#282F5A',
    padding: 20,
    borderRadius: 20,
    width: '90%',
    marginTop: hp(10),
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9DB2BF',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  serviceName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#A0A3BD',
    marginVertical: 8,
    borderStyle: 'dashed',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
