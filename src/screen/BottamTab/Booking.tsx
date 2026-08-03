import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Linking,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius, spacing, TAB_BAR_HEIGHT} from '../../constant';
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
  const [filterVisible, setFilterVisible] = useState(false);
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

  const confirmCancelBooking = (id: string) => {
    Alert.alert(
      'Cancel this booking?',
      'The service request will be cancelled and cannot be restored.',
      [
        {text: 'Keep booking', style: 'cancel'},
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => cancelBooking(id),
        },
      ],
    );
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

  const getFilterCount = (value: string) =>
    value === 'all'
      ? booking.length
      : booking.filter(item => getStatusGroup(item) === value).length;

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

      <View style={styles.listToolbar}>
        <View>
          <Text style={styles.resultCount}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.resultSubtitle}>
            {FILTER_CHIPS.find(chip => chip.value === selectedFilter)?.label || 'All'} bookings
          </Text>
        </View>
        <View style={styles.toolbarActions}>
          {selectedFilter !== 'all' && (
            <TouchableOpacity style={styles.clearFilter} onPress={() => setSelectedFilter('all')}>
              <MaterialCommunityIcons name="refresh" size={15} color={color.danger} />
              <Text style={styles.clearFilterText}>Reset</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)} activeOpacity={0.75}>
            <MaterialCommunityIcons name="tune-variant" size={17} color={color.buttonColor} />
            <Text style={styles.filterButtonText}>Filter</Text>
            {selectedFilter !== 'all' && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {filteredBookings.length > 0
        ? React.createElement(BookingList as any, {
            data: filteredBookings,
            loading,
            navigation,
            onCallPress: (no: string) => makeCall(no),
            onCancelPress: confirmCancelBooking,
            contentBottomPadding: bottomPad,
          })
        : (
        <View style={[styles.emptyState, {paddingBottom: bottomPad}]}>
          <Image source={icon.booking} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>
            {searchQuery || selectedFilter !== 'all' ? 'No matching bookings' : 'No bookings yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || selectedFilter !== 'all'
              ? 'Try changing your search or selected filter'
              : 'Book a bike service to see it here'}
          </Text>
          {!searchQuery && selectedFilter === 'all' && (
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterVisible(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Filter bookings</Text>
              <Text style={styles.sheetSubtitle}>Choose a booking status</Text>
            </View>
            <TouchableOpacity style={styles.sheetClose} onPress={() => setFilterVisible(false)}>
              <MaterialCommunityIcons name="close" size={20} color={color.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>BOOKING STATUS</Text>
          <View style={styles.statusOptions}>
            {FILTER_CHIPS.map(chip => {
              const isActive = selectedFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[styles.statusOption, isActive && styles.statusOptionActive]}
                  onPress={() => setSelectedFilter(chip.value)}>
                  <View style={[styles.statusIcon, isActive && styles.statusIconActive]}>
                    <MaterialCommunityIcons
                      name={chip.value === 'all' ? 'format-list-bulleted' : chip.value === 'cancelled' ? 'close-circle-outline' : chip.value === 'completed' ? 'check-circle-outline' : 'clock-outline'}
                      size={17}
                      color={isActive ? color.buttonColor : color.textMuted}
                    />
                  </View>
                  <Text style={[styles.statusOptionText, isActive && styles.statusOptionTextActive]}>{chip.label}</Text>
                  <View style={styles.statusCountChip}>
                    <Text style={styles.statusCountText}>{getFilterCount(chip.value)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.sheetClearButton} onPress={() => setSelectedFilter('all')}>
              <Text style={styles.sheetClearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetApplyButton} onPress={() => setFilterVisible(false)}>
              <Text style={styles.sheetApplyText}>Show {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 6,
  },
  resultCount: {fontSize: 14, fontWeight: '800', color: color.textPrimary},
  resultSubtitle: {fontSize: 10.5, fontWeight: '500', color: color.textMuted, marginTop: 2},
  toolbarActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  clearFilter: {flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 7},
  clearFilterText: {fontSize: 11, fontWeight: '700', color: color.danger},
  filterButton: {flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(254,212,40,0.45)', backgroundColor: 'rgba(254,212,40,0.09)', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 8},
  filterButtonText: {fontSize: 12, fontWeight: '700', color: color.buttonColor},
  filterCountBadge: {width: 17, height: 17, borderRadius: 9, backgroundColor: color.buttonColor, alignItems: 'center', justifyContent: 'center'},
  filterCountText: {fontSize: 9.5, fontWeight: '800', color: color.baground},
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
    color: color.textMuted,
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
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  filterSheet: {backgroundColor: color.cardSurface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl},
  sheetHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg},
  sheetTitle: {fontSize: 18, fontWeight: '800', color: color.textPrimary},
  sheetSubtitle: {fontSize: 11.5, color: color.textMuted, marginTop: 3},
  sheetClose: {width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center'},
  sectionLabel: {fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.textMuted, marginBottom: 8},
  statusOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  statusOption: {flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: '47%', flexGrow: 1, borderWidth: 1, borderColor: color.borderSubtle, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.md, padding: 10},
  statusOptionActive: {borderColor: 'rgba(254,212,40,0.55)', backgroundColor: 'rgba(254,212,40,0.1)'},
  statusIcon: {width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)'},
  statusIconActive: {backgroundColor: 'rgba(254,212,40,0.12)'},
  statusOptionText: {flex: 1, fontSize: 11.5, fontWeight: '700', color: color.textMuted},
  statusOptionTextActive: {color: color.textPrimary},
  statusCountChip: {minWidth: 22, height: 22, paddingHorizontal: 5, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center'},
  statusCountText: {fontSize: 10, fontWeight: '800', color: color.textPrimary},
  sheetActions: {flexDirection: 'row', gap: 10, marginTop: spacing.lg},
  sheetClearButton: {flex: 0.8, borderWidth: 1, borderColor: color.borderSubtle, borderRadius: radius.sm, alignItems: 'center', paddingVertical: 12},
  sheetClearText: {fontSize: 13, fontWeight: '700', color: color.textPrimary},
  sheetApplyButton: {flex: 1.5, backgroundColor: color.buttonColor, borderRadius: radius.sm, alignItems: 'center', paddingVertical: 12},
  sheetApplyText: {fontSize: 13, fontWeight: '800', color: color.baground},
});
