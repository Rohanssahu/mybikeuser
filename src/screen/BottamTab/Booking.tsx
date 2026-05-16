import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Linking,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {color} from '../../constant';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';
import {
  cancel_booking,
  get_userbooking,
} from '../../redux/Api/apiRequests';
import {useIsFocused} from '@react-navigation/native';
import {successToast} from '../../configs/customToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  showLocalNotificationcancel,
} from '../../component/Notification';
import {icon} from '../../component/Image';

interface ShopItem {
  _id: string;
  dealer_id?: {shopName?: string};
  status?: string;
}

const Booking: React.FC<{navigation: any}> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [booking, setBooking] = useState<ShopItem[]>([]);
  const isFocus = useIsFocused();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFocus) {fetchBookings();}
  }, [isFocus]);

  const fetchBookings = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {return;}
      const response = await get_userbooking(user_id);
      setBooking(response?.data?.length > 0 ? response.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBooking([]);
    }
  };

  const makeCall = (no: string) => Linking.openURL(`tel:${no}`);

  const cancelBooking = async (id: string) => {
    setLoading(true);
    const res = await cancel_booking(id, 'user_cancelled');
    if (res?.success) {
      fetchBookings();
      successToast('Booking cancelled successfully.');
      showLocalNotificationcancel(
        'Booking Cancelled',
        'Your booking has been cancelled successfully.',
      );
    }
    setLoading(false);
  };

  const filteredBookings = booking.filter(
    item =>
      item?.dealer_id?.shopName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) || !item?.dealer_id,
  );

  const pendingCount = booking.filter(b => b.status === 'pending').length;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} active</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
      </View>

      {filteredBookings.length > 0
        ? React.createElement(BookingList as any, {
            data: filteredBookings,
            loading,
            navigation,
            onCallPress: (no: string) => makeCall(no),
            onCancelPress: (id: string) => cancelBooking(id),
          })
        : (
        <View style={styles.emptyState}>
          <Image source={icon.booking} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matching bookings' : 'No bookings yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try a different search term'
              : 'Book a bike service to see it here'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default Booking;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 12,
  },
  headerLeft: {flex: 1},
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  pendingBadge: {
    backgroundColor: 'rgba(254,212,40,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.35)',
  },
  pendingBadgeText: {
    fontSize: 12,
    color: color.buttonColor,
    fontWeight: '700',
  },
  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    tintColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#606880',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bookNowBtn: {
    marginTop: 24,
    backgroundColor: color.buttonColor,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 28,
  },
  bookNowText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
