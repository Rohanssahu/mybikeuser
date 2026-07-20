import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const NOTIFICATION_META: Record<string, { icon: string; bg: string; tint: string }> = {
  accepted: { icon: 'calendar-check', bg: '#E8F5E9', tint: '#2E7D32' },
  confirmed: { icon: 'calendar-check-outline', bg: '#E3F2FD', tint: '#1565C0' },
  completed: { icon: 'wrench-outline', bg: '#E0F2F1', tint: '#00897B' },
  payment: { icon: 'wallet-outline', bg: '#FFF8E1', tint: '#C9971F' },
  otp: { icon: 'shield-key-outline', bg: '#F3E5F5', tint: '#6A1B9A' },
  delivered: { icon: 'moped', bg: '#E8EAF6', tint: '#3949AB' },
  general: { icon: 'bell-outline', bg: '#EEF0F5', tint: '#606880' },
};

export const resolveNotificationMeta = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('accept')) { return NOTIFICATION_META.accepted; }
  if (t.includes('confirm')) { return NOTIFICATION_META.confirmed; }
  if (t.includes('complete') || t.includes('service')) { return NOTIFICATION_META.completed; }
  if (t.includes('payment') || t.includes('paid')) { return NOTIFICATION_META.payment; }
  if (t.includes('otp')) { return NOTIFICATION_META.otp; }
  if (t.includes('deliver')) { return NOTIFICATION_META.delivered; }
  return NOTIFICATION_META.general;
};

const FALLBACK_TITLES: Record<string, string> = {
  accepted: 'Booking Accepted',
  confirmed: 'Booking Confirmed',
  completed: 'Service Completed',
  payment: 'Payment Update',
  otp: 'OTP Update',
  delivered: 'Bike Delivered',
  general: 'Notification',
};

// Used only when the backend omits a title — keeps the same keyword
// categorization as resolveNotificationMeta so icon and title always agree.
export const resolveNotificationTitle = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('accept')) { return FALLBACK_TITLES.accepted; }
  if (t.includes('confirm')) { return FALLBACK_TITLES.confirmed; }
  if (t.includes('complete') || t.includes('service')) { return FALLBACK_TITLES.completed; }
  if (t.includes('payment') || t.includes('paid')) { return FALLBACK_TITLES.payment; }
  if (t.includes('otp')) { return FALLBACK_TITLES.otp; }
  if (t.includes('deliver')) { return FALLBACK_TITLES.delivered; }
  return FALLBACK_TITLES.general;
};

interface NotificationItemProps {
  name: string;
  message: string;
  time: string;
  type?: string;
  unread?: boolean;
  onPress?: () => void;
  index?: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  name,
  message,
  time,
  type,
  unread,
  onPress,
  index = 0,
}) => {
  const meta = resolveNotificationMeta(type);
  const clickable = !!onPress;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}
      style={styles.shadowWrap}>
      <Pressable
        onPress={onPress}
        disabled={!clickable}
        android_ripple={clickable ? { color: 'rgba(8,16,65,0.08)' } : undefined}
        style={({ pressed }) => [
          styles.card,
          clickable && Platform.OS === 'ios' && pressed && styles.cardPressed,
        ]}>
        <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
          <MaterialCommunityIcons name={meta.icon} size={24} color={meta.tint} />
          {unread ? <View style={styles.unreadDot} /> : null}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.message} numberOfLines={3}>{message}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#12142B',
    marginBottom: 3,
  },
  message: {
    fontSize: 13.5,
    color: '#5B6178',
    lineHeight: 19,
  },
  time: {
    fontSize: 11.5,
    color: '#9AA0B4',
    fontWeight: '500',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default NotificationItem;
