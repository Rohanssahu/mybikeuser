import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import {icon} from './Image';
import {color} from '../constant';

interface HomeHeaderProps {
  navigation: any;
  location: string;
  hasNotifications?: boolean;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  User: any;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  location,
  hasNotifications = false,
  onLocationPress,
  onNotificationPress,
  onProfilePress,
  User,
}) => {
  const locationAnim = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;
  const prevLocation = useRef('');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Animate location text when it changes
  useEffect(() => {
    if (location && location !== prevLocation.current) {
      prevLocation.current = location;
      locationAnim.setValue(0);
      Animated.spring(locationAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [location]);

  const handleLocationPress = () => {
    Animated.sequence([
      Animated.timing(pillScale, {toValue: 0.93, duration: 80, useNativeDriver: true}),
      Animated.spring(pillScale, {toValue: 1, useNativeDriver: true, tension: 200, friction: 8}),
    ]).start();
    onLocationPress?.();
  };

  const firstName = User?.first_name || '';

  // Shorten address to locality (2 parts max)
  const displayLocation = location
    ? location.split(',').slice(0, 2).join(',').trim()
    : 'Set location';

  const locationTextOpacity = locationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const locationTextSlide = locationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Greeting */}
        <Text style={styles.greeting} numberOfLines={1}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
        </Text>

        {/* Location pill */}
        <Animated.View style={{transform: [{scale: pillScale}]}}>
          <TouchableOpacity
            onPress={handleLocationPress}
            style={styles.locationPill}
            activeOpacity={1}>
            <View style={styles.locationDot} />
            <Animated.Text
              style={[
                styles.locationText,
                {
                  opacity: locationTextOpacity,
                  transform: [{translateX: locationTextSlide}],
                },
              ]}
              numberOfLines={1}>
              {displayLocation}
            </Animated.Text>
            <Image source={icon.downwhite} style={styles.chevron} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.rightActions}>
        {/* Notification bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.bellBtn}
          activeOpacity={0.75}>
          <Image source={icon.notification} style={styles.bellIcon} />
          {hasNotifications && <View style={styles.badge} />}
        </TouchableOpacity>

   
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 16,
    backgroundColor: color.baground,
  },
  leftSection: {flex: 1, marginRight: 12},
  greeting: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 9,
    letterSpacing: 0.15,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.28)',
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.buttonColor,
    marginRight: 7,
  },
  locationText: {
    fontSize: 13,
    color: '#E8ECF4',
    fontWeight: '600',
    maxWidth: 185,
    flexShrink: 1,
  },
  chevron: {
    width: 10,
    height: 10,
    tintColor: 'rgba(255,255,255,0.5)',
    marginLeft: 6,
  },
  bellBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {width: 42, height: 42, tintColor: '#FED428'},
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    backgroundColor: '#EF4444',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: color.baground,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileIcon: {width: 22, height: 22, tintColor: '#FED428'},
});

export default HomeHeader;
