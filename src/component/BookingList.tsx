import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from './Icon';
import { icon } from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import { image_url } from '../redux/Api';

interface BookingItem {
  _id: string;
  status: string;
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
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:         { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',  label: 'Pending' },
  confirmed:       { color: '#10B981', bg: 'rgba(16,185,129,0.18)',  label: 'Confirmed' },
  completed:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.18)',  label: 'Completed' },
  'cash received': { color: '#10B981', bg: 'rgba(16,185,129,0.18)',  label: 'Cash Received' },
  user_cancelled:  { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',   label: 'Cancelled' },
  rejected:        { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',   label: 'Rejected' },
};

const FALLBACK_IMG =
  'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';

const BookingList: React.FC<BookingListProps> = ({
  data,
  navigation,
  onCancelPress,
  loading,
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
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const s = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
        const imgSrc = item?.dealer_id?.shopImages?.[0]
          ? { uri: image_url + item.dealer_id.shopImages[0] }
          : { uri: FALLBACK_IMG };

        return (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: item._id })
            }>
            {/* Shop header */}
            <View style={styles.shopRow}>
              <Image source={imgSrc} style={styles.shopImg} />
              <View style={styles.shopText}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {item?.dealer_id?.shopName || 'Service Center'}
                </Text>
                <View style={styles.addrRow}>
                  <Icon source={icon.pin} size={12} tintColor="#6B7DBE" />
                  <Text style={styles.shopAddr} numberOfLines={1}>
                    {'  '}{item?.dealer_id?.fullAddress || item?.dealer_id?.address || [item?.dealer_id?.city, item?.dealer_id?.state].filter(Boolean).join(', ') || '—'}
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: s.color }]} />
                <Text style={[styles.badgeTxt, { color: s.color }]}>{s.label}</Text>
              </View>
            </View>

            <View style={styles.sep} />

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon source={icon.booking} size={14} tintColor="#6B7DBE" />
                <Text style={styles.metaLbl}> ID</Text>
                <Text style={styles.metaVal}>  #{item._id.slice(-6).toUpperCase()}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon source={icon.pickups} size={14} tintColor="#6B7DBE" />
                <Text style={styles.metaLbl}> Pickup</Text>
                <Text style={styles.metaVal}>
                  {'  '}
                  {item.status === 'completed'
                    ? 'Delivered'
                    : item?.pickupStatus || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Icon source={icon.calendar} size={13} tintColor="#3D4F80" />
              <Text style={styles.dateTxt}> {formatDate(item.create_date)}</Text>
            </View>

            {/* Actions */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.detailBtn}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: item._id })
                }>
                <Text style={styles.detailBtnTxt}>View Details</Text>
                <Icon source={icon.rightarrow} size={16} tintColor="#081041" />
              </TouchableOpacity>

              {item.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    onCancelPress(item._id);
                    setCancelIndex(index);
                  }}>
                  {loading && cancelIndex === index ? (
                    <ActivityIndicator size={16} color="#fff" />
                  ) : (
                    <Text style={styles.cancelBtnTxt}>Cancel</Text>
                  )}
                </TouchableOpacity>
              )}
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
    backgroundColor: '#0D1952',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  shopRow: { flexDirection: 'row', alignItems: 'center' },
  shopImg: {
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: '#1A2566',
  },
  shopText: { flex: 1, marginLeft: 10 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  addrRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  shopAddr: { fontSize: 12, color: '#6B7DBE', flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaLbl: { fontSize: 12, color: '#6B7DBE' },
  metaVal: { fontSize: 12, color: '#A0AFCE', fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dateTxt: { fontSize: 12, color: '#3D4F80' },
  btnRow: { flexDirection: 'row', gap: 8 },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED428',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  detailBtnTxt: { fontSize: 13, fontWeight: '700', color: '#081041' },
  cancelBtn: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
