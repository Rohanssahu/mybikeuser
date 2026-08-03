import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from './Icon';
import { icon } from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import { color } from '../constant';
interface BookingItem {
  _id: string;
  status: string;
  dealerResponseStatus?: string;
  pickupStatus?: string;
  reviewStatus?: 'ineligible' | 'pending' | 'submitted';
  create_date: string;
  dealer_id?: {
    shopName?: string;
    address?: string;
    fullAddress?: string;
    city?: string;
    state?: string;
    shopImages?: string[];
  };
}

interface BookingListProps {
  data: BookingItem[];
  loading: boolean;
  navigation: any;
  onCancelPress: (id: string) => void;
  onCallPress?: (no: string) => void;
  contentBottomPadding?: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:            { color: '#FBBF24', bg: 'rgba(251,191,36,0.14)', icon: 'clock-outline', label: 'Pending' },
  confirmed:          { color: '#34D399', bg: 'rgba(52,211,153,0.14)', icon: 'check-circle-outline', label: 'Confirmed' },
  in_service:         { color: '#60A5FA', bg: 'rgba(96,165,250,0.14)', icon: 'tools', label: 'In service' },
  completed:          { color: '#34D399', bg: 'rgba(52,211,153,0.14)', icon: 'check-all', label: 'Completed' },
  service_completed:  { color: '#34D399', bg: 'rgba(52,211,153,0.14)', icon: 'check-all', label: 'Service complete' },
  awaiting_payment:   { color: '#FBBF24', bg: 'rgba(251,191,36,0.14)', icon: 'credit-card-clock-outline', label: 'Payment due' },
  payment_selected:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.14)', icon: 'credit-card-check-outline', label: 'Payment selected' },
  ready_for_delivery: { color: '#38BDF8', bg: 'rgba(56,189,248,0.14)', icon: 'truck-delivery-outline', label: 'Out for delivery' },
  delivered:          { color: '#34D399', bg: 'rgba(52,211,153,0.14)', icon: 'check-all', label: 'Delivered' },
  'cash received':    { color: '#34D399', bg: 'rgba(52,211,153,0.14)', icon: 'cash-check', label: 'Cash received' },
  cancelled:          { color: '#FB7185', bg: 'rgba(251,113,133,0.14)', icon: 'close-circle-outline', label: 'Cancelled' },
  user_cancelled:     { color: '#FB7185', bg: 'rgba(251,113,133,0.14)', icon: 'close-circle-outline', label: 'Cancelled' },
  dealer_cancelled:   { color: '#FB7185', bg: 'rgba(251,113,133,0.14)', icon: 'close-circle-outline', label: 'Cancelled' },
  rejected:           { color: '#FB7185', bg: 'rgba(251,113,133,0.14)', icon: 'close-circle-outline', label: 'Rejected' },
  expired:            { color: '#FB7185', bg: 'rgba(251,113,133,0.14)', icon: 'timer-off-outline', label: 'Expired' },
};

const BookingList: React.FC<BookingListProps> = ({
  data,
  navigation,
  onCancelPress,
  loading,
  contentBottomPadding,
}) => {
  const [cancelIndex, setCancelIndex] = useState<number | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) { return 'Date unavailable'; }
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en', { month: 'short' });
    const year = d.getFullYear();
    let h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${day} ${month} ${year}, ${h}:${min} ${ampm}`;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id}
      contentContainerStyle={[
        styles.list,
        contentBottomPadding != null && {paddingBottom: contentBottomPadding},
      ]}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const isExpired =
          item.status === 'expired' || item.dealerResponseStatus === 'expired';
        const effectiveStatus = isExpired ? 'expired' : item.status;
        const s = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.pending;
        const address =
          item?.dealer_id?.fullAddress ||
          item?.dealer_id?.address ||
          [item?.dealer_id?.city, item?.dealer_id?.state].filter(Boolean).join(', ') ||
          '—';
        const pickupText = [
          'completed',
          'awaiting_payment',
          'payment_selected',
          'ready_for_delivery',
          'delivered',
        ].includes(item.status)
          ? 'Delivered'
          : item?.pickupStatus || '—';

        return (
          <View
            style={[styles.card, {borderLeftColor: s.color}]}>
            <View style={styles.topRow}>
              <View style={styles.iconChip}>
                <Icon source={icon.booking} size={18} tintColor={color.buttonColor} />
              </View>
              <View style={styles.topText}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {item?.dealer_id?.shopName || 'Service Center'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <MaterialCommunityIcons name={s.icon} size={13} color={s.color} />
                <Text style={[styles.badgeTxt, { color: s.color }]}>{s.label}</Text>
              </View>
            </View>

            <View style={styles.addrRow}>
              <Icon source={icon.pin} size={13} tintColor={color.buttonColor} />
              <Text style={styles.shopAddr} numberOfLines={2}>
                {address}
              </Text>
            </View>

            <View style={styles.infoPanel}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>BOOKING ID</Text>
                <Text style={styles.infoValue}>#{item._id.slice(-6).toUpperCase()}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={[styles.infoItem, styles.dateInfo]}>
                <Text style={styles.infoLabel}>BOOKED ON</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{formatDate(item.create_date)}</Text>
              </View>
            </View>

            <View style={styles.pickupRow}>
              <View style={styles.pickupIcon}>
                <MaterialCommunityIcons name="bike-fast" size={15} color={color.textPrimary} />
              </View>
              <Text style={styles.pickupLabel}>Pickup status</Text>
              <Text style={styles.pickupValue} numberOfLines={1}>{pickupText}</Text>
            </View>

            <View style={styles.bottomRow}>
              {item.status === 'pending' && !isExpired && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  disabled={loading}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCancelIndex(index);
                    onCancelPress(item._id);
                  }}>
                  {loading && cancelIndex === index ? (
                    <ActivityIndicator size={15} color="#FB7185" />
                  ) : <Text style={styles.cancelBtnTxt}>Cancel</Text>}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.detailButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, {id: item._id})}>
                <Text style={styles.detailButtonText}>View booking</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={color.baground} />
              </TouchableOpacity>
            </View>
            {item.status === 'delivered' && item.reviewStatus === 'pending' && (
              <TouchableOpacity style={styles.rateButton} onPress={() => navigation.navigate(ScreenNameEnum.RATING_SCREEN, {bookingId: item._id})}>
                <MaterialCommunityIcons name="star-outline" size={17} color="#171717" />
                <Text style={styles.rateButtonText}>Rate your experience</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    />
  );
};

export default BookingList;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    paddingTop: 4,
  },
  rateButton:{height:40,borderRadius:11,backgroundColor:'#FFD54A',marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
  rateButtonText:{fontSize:12,fontWeight:'900',color:'#171717'},
  card: {
    backgroundColor: color.cardSurfaceElevated,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    borderLeftWidth: 3,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconChip: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254,212,40,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, marginLeft: 10 },
  shopName: { fontSize: 16, fontWeight: '800', color: color.textPrimary },
  addrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 12 },
  shopAddr: { fontSize: 12.5, lineHeight: 18, color: color.textMuted, flex: 1 },
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(9,17,51,0.28)',
  },
  infoItem: {flex: 0.8},
  dateInfo: {flex: 1.6},
  infoDivider: {width: 1, height: 30, backgroundColor: color.borderSubtle, marginHorizontal: 12},
  infoLabel: {fontSize: 9, letterSpacing: 0.7, fontWeight: '700', color: color.textFaint},
  infoValue: {fontSize: 11.5, marginTop: 3, fontWeight: '700', color: color.textPrimary},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  pickupRow: {flexDirection: 'row', alignItems: 'center', marginTop: 12},
  pickupIcon: {width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center'},
  pickupLabel: {fontSize: 11.5, color: color.textMuted, marginLeft: 8},
  pickupValue: {fontSize: 11.5, fontWeight: '800', color: color.textPrimary, marginLeft: 'auto', maxWidth: '45%'},
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    minWidth: 78,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnTxt: { fontSize: 12, fontWeight: '800', color: '#FB7185' },
  detailButton: {flex: 1, height: 44, borderRadius: 12, backgroundColor: color.buttonColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  detailButtonText: {fontSize: 13, fontWeight: '800', color: color.baground},
});
