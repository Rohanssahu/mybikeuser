import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';
import { wp } from './utils/Constant';
import ScreenNameEnum from '../routes/screenName.enum';
import { image_url } from '../redux/Api';
import { cancel_booking } from '../redux/Api/apiRequests';
import { successToast } from '../configs/customToast';


// Define the data type for each booking item
interface BookingItem {
  _id: string;
  bookingId: string;
  status: string;
  create_date: string;

}

// Define props for the component
interface BookingListProps {
  data: BookingItem[];
  loading:boolean,
  onCallPress: any;
  cancelbooking: any;
  onViewBillPress: () => void;
}

const BookingList: React.FC<BookingListProps> = ({ data, navigation, onCancelPress,onCallPress ,loading}) => {

  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);

    // Extract date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Extract time components
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Format final string
    return `${day}-${month}-${year} ${hours}:${minutes} ${amPm}`;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
             // source={{ uri: image_url + item?.dealer_id?.shopImages[0] }}
              source={{uri:'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'}}
  
              style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 1, backgroundColor: '#ccc', marginVertical: 10 }}
            />


          <View style={{ marginLeft: 10 }}>

              <Text style={styles.label}>{item?.dealer_id?.shopName}</Text>
              <Text style={[styles.label, { fontSize: 12, fontWeight: '400' }]}>{item?.dealer_id?.address}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.label}>Status:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{item.bookingId}</Text>
            <Text style={styles.value}>{item.status === 'user_cancelled'?'Cancelled By User':item.status}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
          </View>
          <Text style={styles.value}>{formatDateTime(item.create_date)}</Text>

          <View style={styles.footer}>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: item?._id })
              }}
              style={styles.billButton} >
              <Text style={styles.billText}>Booking Details</Text>
            </TouchableOpacity>
            {item.status === 'pending' &&
              <TouchableOpacity
                onPress={() => {
                  onCancelPress(item?._id)
                }}
                style={[styles.billButton, { marginTop: 5, backgroundColor: 'red' }]} >
                {loading ?<ActivityIndicator  size={20} color={'#fff'} />: <Text style={[styles.billText, { color: '#fff' }]}>Cancel Booking</Text>}
              </TouchableOpacity>}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B', // Dark navy background
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // For Android shadow
  },

  // Header section with shop image + name
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  shopInfo: {
    marginLeft: 12,
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700', // Highlight shop name in gold
  },
  shopAddress: {
    fontSize: 12,
    color: '#A0A3BD',
    marginTop: 2,
  },

  // Booking details rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ADE80', // Green for active
  },
  cancelledStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171', // Red for cancelled
  },

  // Footer buttons
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  billButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  billText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E2E',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});


export default BookingList;
