import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { notificationColors } from '../constant';

const NOTIFICATION_META: Record<string, { icon: string; bg: string; tint: string }> = {
  wash: { icon: 'moped', ...notificationColors.wash },
  delivery: { icon: 'truck-delivery-outline', ...notificationColors.delivery },
  booking: { icon: 'car-outline', ...notificationColors.booking },
  payment: { icon: 'wallet-outline', ...notificationColors.payment },
  otp: { icon: 'shield-key-outline', ...notificationColors.otp },
  general: { icon: 'bell-outline', ...notificationColors.general },
};

export const resolveNotificationMeta = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('deliver')) { return NOTIFICATION_META.delivery; }
  if (t.includes('wash') || t.includes('complete') || t.includes('service')) { return NOTIFICATION_META.wash; }
  if (t.includes('book') || t.includes('accept') || t.includes('confirm')) { return NOTIFICATION_META.booking; }
  if (t.includes('payment') || t.includes('paid')) { return NOTIFICATION_META.payment; }
  if (t.includes('otp')) { return NOTIFICATION_META.otp; }
  return NOTIFICATION_META.general;
};

const FALLBACK_TITLES: Record<string, string> = {
  wash: 'Wash Complete',
  delivery: 'Bike Delivered',
  booking: 'Booking Confirmed',
  payment: 'Payment Update',
  otp: 'OTP Update',
  general: 'Notification',
};

// Used only when the backend omits a title — keeps the same keyword
// categorization as resolveNotificationMeta so icon and title always agree.
export const resolveNotificationTitle = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('deliver')) { return FALLBACK_TITLES.delivery; }
  if (t.includes('wash') || t.includes('complete') || t.includes('service')) { return FALLBACK_TITLES.wash; }
  if (t.includes('book') || t.includes('accept') || t.includes('confirm')) { return FALLBACK_TITLES.booking; }
  if (t.includes('payment') || t.includes('paid')) { return FALLBACK_TITLES.payment; }
  if (t.includes('otp')) { return FALLBACK_TITLES.otp; }
  return FALLBACK_TITLES.general;
};

interface NotificationItemProps {
  name: string;
  message: string;
  time: string;
  type?: string;
  image?: string;
  unread?: boolean;
  onPress?: () => void;
  index?: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  name,
  message,
  time,
  type,
  image,
  unread,
  onPress,
  index = 0,
}) => {
  const meta = resolveNotificationMeta(type);
  const clickable = !!onPress;
  const [imgError, setImgError] = useState(false);
  const showImage = !!image && !imgError;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}
      style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={!clickable}
        android_ripple={clickable ? { color: 'rgba(8,16,65,0.06)' } : undefined}
        style={({ pressed }) => [
          styles.card,
          clickable && pressed && styles.cardPressed,
        ]}>
        {unread ? <View style={styles.unreadDot} /> : null}

        <View style={[styles.iconBox, !showImage && { backgroundColor: meta.bg }]}>
          {showImage ? (
            <Image
              source={{ uri: image }}
              style={styles.thumbImage}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <MaterialCommunityIcons name={meta.icon} size={22} color={meta.tint} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.message} numberOfLines={2} ellipsizeMode="tail">{message}</Text>
        </View>

        <Text style={styles.time}>{time}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: notificationColors.cardBorder,
    backgroundColor: notificationColors.cardSurface,
    padding: 12,
    shadowColor: '#1D4A8F',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  thumbImage: {
    width: 42,
    height: 42,
  },
  unreadDot: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: notificationColors.unreadDot,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: notificationColors.titleText,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    color: notificationColors.descText,
  },
  time: {
    fontSize: 10.5,
    fontWeight: '600',
    color: notificationColors.descText,
  },
});

export default NotificationItem;
