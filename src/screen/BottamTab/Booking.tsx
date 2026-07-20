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
  ScrollView,
} from 'react-native';
import {color, TAB_BAR_HEIGHT} from '../../constant';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';
import {
  cancel_booking,
  get_userbooking,
} from '../../redux/Api/apiRequests';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {successToast} from '../../configs/customToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  showLocalNotificationcancel,
} from '../../component/Notification';
import {icon} from '../../component/Image';

const FILTER_CHIPS = [
  {label: 'All', value: 'all'},
  {label: 'Pending', value: 'pending'},
  {label: 'Confirmed', value: 'confirmed'},
  {label: 'In Service', value: 'in_service'},
  {label: 'Completed', value: 'completed'},
  {label: 'Cancelled', value: 'cancelled'},
];

// Backend lifecycle lives on `status` (verified against BookingList's
// STATUS_CONFIG and ServiceSummary's STATUS_CFG, which map these same raw
// values). `dealerResponseStatus` only overrides to "expired".
const STATUS_GROUPS: Record<string, string[]> = {
  pending: ['pending', 'waiting', 'requested'],
  confirmed: ['confirmed', 'accepted'],
  in_service: ['in_service'],
  completed: [
    'completed',
    'delivered',
    'service_completed',
    'ready_for_delivery',
    'awaiting_payment',
    'payment_selected',
    'cash received',
  ],
  cancelled: [
    'cancelled',
    'user_cancelled',
    'dealer_cancelled',
    'rejected',
    'expired',
  ],
};

const getStatusGroup = (item: ShopItem): string => {
  const isExpired =
    item?.status === 'expired' || item?.dealerResponseStatus === 'expired';
  const raw = isExpired ? 'expired' : (item?.status || '').toLowerCase().trim();
  const group =
    Object.keys(STATUS_GROUPS).find(key => STATUS_GROUPS[key].includes(raw)) ||
    raw;
  // TEMP DEBUG: verify actual backend field values before removing.
  console.log('[Booking] item:', item);
  console.log('[Booking] status field used for filtering ->', {
    id: item?._id,
    status: item?.status,
    dealerResponseStatus: item?.dealerResponseStatus,
    resolvedGroup: group,
  });
  return group;
};

interface ShopItem {
  _id: string;
  dealer_id?: {
    shopName?: string;
    address?: string;
    fullAddress?: string;
    city?: string;
    state?: string;
    shopImages?: string[];
  };
  status?: string;
  dealerResponseStatus?: string;
  pickupStatus?: string;
  create_date?: string;
}

const Booking: React.FC<{navigation: any}> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [booking, setBooking] = useState<ShopItem[]>([]);
  const isFocus = useIsFocused();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + TAB_BAR_HEIGHT;

  useEffect(() => {
    if (isFocus) {fetchBookings();}
  }, [isFocus]);

  const fetchBookings = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {return;}
      const response = await get_userbooking(user_id);
      // TEMP DEBUG: verify raw booking payload shape from backend.
      console.log('[Booking] get_userbooking response.data:', response?.data);
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

  const filteredBookings = booking.filter(item => {
    const matchesSearch =
      item?.dealer_id?.shopName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) || !item?.dealer_id;
    const matchesFilter =
      selectedFilter === 'all' || getStatusGroup(item) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = booking.filter(
    b => b.status === 'pending' && b.dealerResponseStatus !== 'expired',
  ).length;

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

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterWrapper}
        contentContainerStyle={styles.filterContent}>
        {FILTER_CHIPS.map(chip => {
          const isActive = selectedFilter === chip.value;
          return (
            <TouchableOpacity
              key={chip.value}
              activeOpacity={0.8}
              onPress={() => setSelectedFilter(chip.value)}
              style={[styles.chip, isActive && styles.chipActive]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredBookings.length > 0
        ? React.createElement(BookingList as any, {
            data: filteredBookings,
            loading,
            navigation,
            onCallPress: (no: string) => makeCall(no),
            onCancelPress: (id: string) => cancelBooking(id),
            contentBottomPadding: bottomPad,
          })
        : (
        <View style={[styles.emptyState, {paddingBottom: bottomPad}]}>
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
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
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
  filterWrapper: {
    flexGrow: 0,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7DBE',
  },
  chipTextActive: {
    color: color.baground,
    fontWeight: '700',
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
