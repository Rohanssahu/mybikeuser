import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';
import { icon } from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import { color } from '../constant';

interface BookingItem {
  _id: string;
  status: string;
  dealerResponseStatus?: string;
  pickupStatus?: string;
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

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:            { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',   label: 'Pending' },
  confirmed:          { color: '#10B981', bg: 'rgba(16,185,129,0.18)',   label: 'Confirmed' },
  completed:          { color: '#3B82F6', bg: 'rgba(59,130,246,0.18)',   label: 'Completed' },
  awaiting_payment:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',   label: 'Awaiting Payment' },
  payment_selected:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)',   label: 'Payment Selected' },
  ready_for_delivery: { color: '#10B981', bg: 'rgba(16,185,129,0.18)',   label: 'Out for Delivery' },
  delivered:          { color: '#10B981', bg: 'rgba(16,185,129,0.18)',   label: 'Delivered' },
  'cash received':    { color: '#10B981', bg: 'rgba(16,185,129,0.18)',   label: 'Cash Received' },
  user_cancelled:     { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',    label: 'Cancelled' },
  rejected:           { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',    label: 'Rejected' },
  expired:            { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',    label: 'Booking Expired' },
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
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en', { month: 'short' });
    const year = d.getFullYear();
    let h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${day} ${month} ${year}  ·  ${h}:${min} ${ampm}`;
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
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: item._id })
            }>
            {/* Top row: icon chip + name + address */}
            <View style={styles.topRow}>
              <View style={styles.iconChip}>
                <Icon source={icon.booking} size={16} tintColor={color.buttonColor} />
              </View>
              <View style={styles.topText}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {item?.dealer_id?.shopName || 'Service Center'}
                </Text>
                <View style={styles.addrRow}>
                  <Icon source={icon.pin} size={12} tintColor={color.buttonColor} />
                  <Text style={styles.shopAddr} numberOfLines={2}>
                    {' '}{address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Middle row: booking id · date  |  status badge */}
            <View style={styles.midRow}>
              <Text style={styles.midInfo} numberOfLines={1}>
                #{item._id.slice(-6).toUpperCase()}  ·  {formatDate(item.create_date)}
              </Text>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <Text style={[styles.badgeTxt, { color: s.color }]}>{s.label}</Text>
              </View>
            </View>

            {/* Bottom row: pickup status  |  view details */}
            <View style={styles.bottomRow}>
              <Text style={styles.pickupTxt} numberOfLines={1}>
                Pickup: {pickupText}
              </Text>
              <View style={styles.bottomRight}>
                {item.status === 'pending' && !isExpired && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      onCancelPress(item._id);
                      setCancelIndex(index);
                    }}>
                    {loading && cancelIndex === index ? (
                      <ActivityIndicator size={12} color="#EF4444" />
                    ) : (
                      <Text style={styles.cancelBtnTxt}>Cancel</Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.detailLink}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: item._id })
                  }>
                  <Text style={styles.detailLinkTxt}>View details</Text>
                  <Icon source={icon.rightarrow} size={13} tintColor={color.buttonColor} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
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
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.borderSubtle,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconChip: {
    height: 34,
    width: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, marginLeft: 10 },
  shopName: { fontSize: 14, fontWeight: '800', color: color.textPrimary },
  addrRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  shopAddr: { fontSize: 11.5, lineHeight: 16, color: color.textMuted, flex: 1 },
  midRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  midInfo: { fontSize: 11, fontWeight: '600', color: color.textMuted, flex: 1, marginRight: 8 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTxt: { fontSize: 10, fontWeight: '700' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pickupTxt: { fontSize: 11, fontWeight: '600', color: color.textMuted, flex: 1, marginRight: 8 },
  bottomRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  cancelBtnTxt: { fontSize: 11, fontWeight: '700', color: '#EF4444' },
  detailLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailLinkTxt: { fontSize: 12, fontWeight: '700', color: color.buttonColor },
});
