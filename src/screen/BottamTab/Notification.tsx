
import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import CustomHeader from '../../component/CustomHeaderProps';
import NotificationItem, { resolveNotificationTitle } from '../../component/NotificationItem';
import { get_Notification } from '../../redux/Api/apiRequests';
import ScreenNameEnum from '../../routes/screenName.enum';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, TAB_BAR_HEIGHT } from '../../constant';

const BOOKING_NOTIFICATION_TYPES = [
  'service_completed',
  'payment_received',
  'otp_ready',
  'bike_delivered',
];

const formatNotificationTime = (value: any) => {
  if (!value) { return ''; }
  const m = moment(value);
  if (!m.isValid()) { return ''; }
  const now = moment();
  if (m.isSame(now, 'day')) { return `Today, ${m.format('h:mm A')}`; }
  if (m.isSame(moment(now).subtract(1, 'day'), 'day')) { return `Yesterday, ${m.format('h:mm A')}`; }
  return m.format('D MMM YYYY, h:mm A');
};

// No persistent read/unread field exists on the API payload yet. Only honor
// an explicit backend flag — do not fall back to any local/session tracking.
const isItemUnread = (item: any) => {
  const explicit = item?.isRead ?? item?.is_read ?? item?.read ?? item?.seen;
  if (explicit === undefined || explicit === null) { return false; }
  return !(explicit === true || explicit === 1);
};

const resolveTitle = (item: any, type: string) =>
  item?.title || item?.name || item?.notification_title || item?.data?.title || resolveNotificationTitle(type);

const NotificationSkeletonRow: React.FC<{ delay: number }> = ({ delay }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, delay, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer, delay]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonCircle, { opacity }]} />
      <View style={styles.skeletonTextCol}>
        <Animated.View style={[styles.skeletonLine, { width: '55%', opacity }]} />
        <Animated.View style={[styles.skeletonLine, { width: '90%', opacity, marginTop: 8 }]} />
        <Animated.View style={[styles.skeletonLine, { width: '70%', opacity, marginTop: 8 }]} />
      </View>
    </View>
  );
};

const Notification = ({ navigation }: any) => {
    const isLogOut: any = useSelector((state: any) => state.auth);
    const [notifications, setnotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const bottomPad = insets.bottom + TAB_BAR_HEIGHT + 16;

    useEffect(() => {
        get_Notificationlist();
    }, []);

    const get_Notificationlist = async () => {
        try {
            const userId =
                isLogOut?.userData?.data?.user_id ||
                isLogOut?.userData?.user_id ||
                (await AsyncStorage.getItem('user_id'));

            if (!userId) { return; }

            const res = await get_Notification(userId, setIsLoading);
            if (res?.success) {
                const list =
                    (Array.isArray(res?.data?.data) && res.data.data) ||
                    (Array.isArray(res?.data?.notifications) && res.data.notifications) ||
                    (Array.isArray(res?.data) && res.data) ||
                    [];
                setnotifications(list);
            }
        } catch (error) {
            console.error('[Notification] Error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await get_Notificationlist();
        setRefreshing(false);
    };

    const handleNotificationPress = (item: any) => {
        const type = item?.type || item?.notification_type || item?.data?.type;
        const bookingId =
            item?.bookingId ||
            item?.booking_id ||
            item?.data?.bookingId ||
            item?.data?.booking_id;

        if (bookingId && BOOKING_NOTIFICATION_TYPES.includes(type)) {
            navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, { id: bookingId });
        }
    };

    const showSkeleton = isLoading && notifications.length === 0 && !refreshing;

    return (
        <View style={styles.container}>
            <CustomHeader
                navigation={navigation}
                title="Notification"
                onSkipPress={() => {}}
                showSkip={false}
            />

            <View style={styles.listWrap}>
                {showSkeleton ? (
                    <View>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <NotificationSkeletonRow key={i} delay={i * 90} />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: bottomPad },
                            notifications.length === 0 && styles.listContentEmpty,
                        ]}
                        keyExtractor={(item, index) =>
                            item?.id ? item.id.toString() : (item?._id ? item._id.toString() : index.toString())
                        }
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={color.buttonColor}
                                colors={[color.buttonColor]}
                            />
                        }
                        renderItem={({ item, index }) => {
                            const formattedTime = formatNotificationTime(item?.sentAt);
                            const type = item?.type || item?.notification_type || item?.data?.type;
                            const isBookingNotif = BOOKING_NOTIFICATION_TYPES.includes(type);
                            return (
                                <NotificationItem
                                    name={resolveTitle(item, type)}
                                    message={item?.body}
                                    time={formattedTime}
                                    type={type}
                                    unread={isItemUnread(item)}
                                    index={index}
                                    onPress={isBookingNotif ? () => handleNotificationPress(item) : undefined}
                                />
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.empty}>
                                <View style={styles.emptyIconWrap}>
                                    <MaterialCommunityIcons name="bell-off-outline" size={44} color="rgba(255,255,255,0.5)" />
                                </View>
                                <Text style={styles.emptyTitle}>No notifications yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    We'll notify you when something important happens.
                                </Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    listWrap: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingTop: 8,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8891B0',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
    },
    skeletonCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3E6EE',
        marginRight: 12,
    },
    skeletonTextCol: {
        flex: 1,
    },
    skeletonLine: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E3E6EE',
    },
});

export default Notification;
