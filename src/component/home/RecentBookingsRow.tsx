import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {getBookingStatusLabel, isBookingActive} from '../../utils/bookingStatus';

const INVOICE_ELIGIBLE_STATUSES = ['completed', 'delivered', 'cash received', 'Payment'];

export interface RecentBookingLike {
  _id: string;
  bookingId?: string;
  status?: string;
  billStatus?: string;
  create_date?: string;
  createdAt?: string;
  serviceSummary?: {serviceName: string; price?: number}[];
  dealer_id?: {shopName?: string} | string;
}

const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
};

const BookingCard: React.FC<{
  item: RecentBookingLike;
  onTrack: () => void;
  onRepeat: () => void;
  onInvoice: () => void;
}> = ({item, onTrack, onRepeat, onInvoice}) => {
  const dealerName = typeof item.dealer_id === 'object' ? item.dealer_id?.shopName : undefined;
  const serviceLabel = item.serviceSummary?.map(s => s.serviceName).filter(Boolean).join(', ') || 'Service booking';
  const active = isBookingActive(item);
  const showInvoice = !active && INVOICE_ELIGIBLE_STATUSES.includes(item.status || '');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.statusDot, active ? styles.statusDotActive : styles.statusDotDone]} />
        <Text style={styles.statusLabel}>{getBookingStatusLabel(item.status)}</Text>
        <Text style={styles.date}>{formatDate(item.create_date || item.createdAt)}</Text>
      </View>

      {dealerName && <Text style={styles.dealer} numberOfLines={1}>{dealerName}</Text>}
      <Text style={styles.service} numberOfLines={1}>{serviceLabel}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onTrack} activeOpacity={0.8}>
          <MaterialCommunityIcons name="map-marker-path" size={14} color={color.buttonColor} />
          <Text style={styles.actionText}>Track</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onRepeat} activeOpacity={0.8}>
          <MaterialCommunityIcons name="repeat" size={14} color={color.buttonColor} />
          <Text style={styles.actionText}>Repeat</Text>
        </TouchableOpacity>
        {showInvoice && (
          <TouchableOpacity style={styles.actionBtn} onPress={onInvoice} activeOpacity={0.8}>
            <MaterialCommunityIcons name="file-download-outline" size={14} color={color.buttonColor} />
            <Text style={styles.actionText}>Invoice</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const RecentBookingsRow: React.FC<{
  bookings: RecentBookingLike[];
  onTrack: (booking: RecentBookingLike) => void;
  onRepeat: (booking: RecentBookingLike) => void;
  onInvoice: (booking: RecentBookingLike) => void;
}> = ({bookings, onTrack, onRepeat, onInvoice}) => {
  if (bookings.length === 0) return null;

  return (
    <FlatList
      data={bookings}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.list}
      renderItem={({item}) => (
        <BookingCard
          item={item}
          onTrack={() => onTrack(item)}
          onRepeat={() => onRepeat(item)}
          onInvoice={() => onInvoice(item)}
        />
      )}
    />
  );
};

const LIST_PADDING_HORIZONTAL = 14;
const CARD_MARGIN_HORIZONTAL = 6;
const CARD_WIDTH = Dimensions.get('window').width - LIST_PADDING_HORIZONTAL * 2 - CARD_MARGIN_HORIZONTAL * 2;

const styles = StyleSheet.create({
  list: {paddingHorizontal: 14, paddingVertical: 6},
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    marginHorizontal: 6,
    padding: 12,
  },
  topRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusDotActive: {backgroundColor: color.buttonColor},
  statusDotDone: {backgroundColor: color.success},
  statusLabel: {fontSize: 10.5, fontWeight: '700', color: '#D7DBEE', flex: 1},
  date: {fontSize: 10.5, color: color.textFaint, fontWeight: '600'},
  dealer: {fontSize: 13, fontWeight: '700', color: '#fff'},
  service: {fontSize: 11.5, color: color.textMuted, marginTop: 3},
  actionsRow: {flexDirection: 'row', gap: 8, marginTop: 12},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(254,212,40,0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {fontSize: 10.5, fontWeight: '700', color: color.buttonColor},
});

export default RecentBookingsRow;
