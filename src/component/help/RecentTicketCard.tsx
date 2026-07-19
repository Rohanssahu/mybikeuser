import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HelpIcon from './icons';

export interface RecentTicketCardProps {
  ticketNo: number;
  subject: string;
  status: 'Open' | 'Closed';
  updatedAt: string;
  // NOTE: the ticket API (get_tikit) does not return an unread-message
  // count today. This prop is kept so the badge can light up the moment
  // that field is added, without another pass on this component.
  unreadCount?: number;
  onPress: () => void;
}

const RecentTicketCard: React.FC<RecentTicketCardProps> = ({
  ticketNo,
  subject,
  status,
  updatedAt,
  unreadCount,
  onPress,
}) => {
  const isOpen = status === 'Open';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Ticket T-${ticketNo}, ${subject}, ${status}`}>
      <View style={styles.iconWrap}>
        <HelpIcon name="ticket" size={18} color="#081041" />
        {!!unreadCount && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.ticketId}>T-{ticketNo}</Text>
          <View
            style={[
              styles.badge,
              isOpen ? styles.badgeOpen : styles.badgeClosed,
            ]}>
            <Text
              style={[
                styles.badgeText,
                {color: isOpen ? '#10B981' : '#6B7DBE'},
              ]}>
              {status}
            </Text>
          </View>
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {subject}
        </Text>
        <Text style={styles.meta}>Updated {updatedAt}</Text>
      </View>

      <HelpIcon name="chevronDown" size={13} color="#6B7DBE" strokeWidth={2.2} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1952',
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254,212,40,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#D0473F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D1952',
  },
  unreadText: {fontSize: 9, fontWeight: '800', color: '#fff'},
  body: {flex: 1, marginRight: 8},
  topRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 8},
  ticketId: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9EA2C0',
    letterSpacing: 0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeOpen: {backgroundColor: 'rgba(16,185,129,0.12)'},
  badgeClosed: {backgroundColor: 'rgba(107,125,190,0.12)'},
  badgeText: {fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase'},
  subject: {fontSize: 13, fontWeight: '700', color: '#fff'},
  meta: {fontSize: 11, color: '#6B7DBE', marginTop: 2},
});

export default memo(RecentTicketCard);
