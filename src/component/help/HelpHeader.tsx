import React, {memo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {icon} from '../Image';
import SupportIllustration from './SupportIllustration';

interface HelpHeaderProps {
  firstName?: string;
  hasUnreadNotifications?: boolean;
  onBellPress: () => void;
}

const HelpHeader: React.FC<HelpHeaderProps> = ({
  firstName,
  hasUnreadNotifications,
  onBellPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>
            Hi, {firstName || 'there'} 👋
          </Text>
          <Text style={styles.title}>Help & Support</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={onBellPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Image
            source={icon.notificationbell}
            style={styles.bellIcon}
            resizeMode="contain"
          />
          {hasUnreadNotifications && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <SupportIllustration size={52} />
        <Text style={styles.subtitle}>
          Need help with your bike service?{'\n'}We're here for you.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.78)'},
  title: {fontSize: 23, fontWeight: '800', color: '#fff', marginTop: 2},
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {width: 18, height: 18, tintColor: '#fff'},
  dot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FED428',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  subtitle: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.72)',
  },
});

export default memo(HelpHeader);
