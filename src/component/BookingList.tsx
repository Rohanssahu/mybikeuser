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
  reviewId?: {_id:string; rating:number; createdAt?:string};
  create_date: string;
  dealer_id?: {
    _id?: string;
    shopName?: string;
    address?: string;
    fullAddress?: string;
    city?: string;
    state?: string;
    shopImages?: string[];
    averageRating?: number;
    ratingCount?: number;
    status?: {isVerified?: boolean};
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
              <Text style={styles.shopAddr} numberOfLines={1}>
                {address}
              </Text>
            </View>
            <View style={styles.partnerRow}>
              <TouchableOpacity
                style={styles.ratingLink}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(ScreenNameEnum.GARAGE_REVIEWS, {
                  dealerId: item.dealer_id?._id,
                  garageName: item.dealer_id?.shopName,
                })}>
                <MaterialCommunityIcons name="star" size={13} color="#FFD54A" />
                <Text style={styles.ratingText}>
                  {item.dealer_id?.ratingCount
                    ? `${Number(item.dealer_id.averageRating || 0).toFixed(1)} (${item.dealer_id.ratingCount})`
                    : 'New'}
                </Text>
              </TouchableOpacity>
              {item.dealer_id?.status?.isVerified !== false && (
                <View style={styles.verifiedChip}>
                  <MaterialCommunityIcons name="check-decagram" size={12} color="#38D996" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              {item.reviewId?.rating ? (
                <Text style={styles.yourRating}>Your rating <Text style={styles.yourStars}>{'★'.repeat(item.reviewId.rating)}</Text></Text>
              ) : null}
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
              <MaterialCommunityIcons name="bike-fast" size={16} color={color.textMuted} />
              <Text style={styles.pickupLabel}>Pickup</Text>
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
  rateButton:{height:36,borderRadius:10,backgroundColor:'#FFD54A',marginTop:8,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
  rateButtonText:{fontSize:12,fontWeight:'900',color:'#171717'},
  yourRating:{color:color.textMuted,fontSize:9.5,fontWeight:'700',marginLeft:'auto'},
  yourStars:{color:'#FFD54A'},
  card: {
    backgroundColor: color.cardSurfaceElevated,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    borderLeftWidth: 3,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconChip: {
    height: 34,
    width: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(254,212,40,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, marginLeft: 9 },
  shopName: { fontSize: 15, fontWeight: '800', color: color.textPrimary },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 },
  shopAddr: { fontSize: 11.5, lineHeight: 16, color: color.textMuted, flex: 1 },
  partnerRow: {flexDirection:'row', alignItems:'center', gap:8, marginTop:7, minHeight:18},
  ratingLink: {flexDirection:'row', alignItems:'center', gap:3},
  ratingText: {color:color.textPrimary, fontSize:10.5, fontWeight:'800'},
  verifiedChip: {flexDirection:'row', alignItems:'center', gap:3},
  verifiedText: {color:'#70E6B2', fontSize:9.5, fontWeight:'800'},
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(9,17,51,0.28)',
  },
  infoItem: {flex: 0.8},
  dateInfo: {flex: 1.6},
  infoDivider: {width: 1, height: 25, backgroundColor: color.borderSubtle, marginHorizontal: 10},
  infoLabel: {fontSize: 9, letterSpacing: 0.7, fontWeight: '700', color: color.textFaint},
  infoValue: {fontSize: 11.5, marginTop: 3, fontWeight: '700', color: color.textPrimary},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  pickupRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  pickupLabel: {fontSize: 11, color: color.textMuted, marginLeft: 6},
  pickupValue: {fontSize: 11.5, fontWeight: '800', color: color.textPrimary, marginLeft: 'auto', maxWidth: '45%'},
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
  },
  cancelBtn: {
    minWidth: 78,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnTxt: { fontSize: 12, fontWeight: '800', color: '#FB7185' },
  detailButton: {flex: 1, height: 38, borderRadius: 10, backgroundColor: color.buttonColor, flexDirection: 'row', alignItems: 'center', justifyContent:'center', gap:7},
  detailButtonText: {fontSize:12, fontWeight:'800', color:color.baground},
});
