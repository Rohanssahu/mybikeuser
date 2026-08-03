
import React, { useEffect, useRef, useState } from 'react';
import { View, SectionList, StyleSheet, Text, RefreshControl, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import CustomHeader from '../../component/CustomHeaderProps';
import NotificationItem, { resolveNotificationTitle } from '../../component/NotificationItem';
import { get_Notification } from '../../redux/Api/apiRequests';
import ScreenNameEnum from '../../routes/screenName.enum';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, notificationColors, TAB_BAR_HEIGHT } from '../../constant';

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
  return m.format('h:mm a');
};

// Buckets notifications into "Today" / "Yesterday" / calendar-date sections,
// preserving the API's original (newest-first) ordering within and across groups.
const buildSections = (list: any[]) => {
  const todayKey = moment().format('YYYY-MM-DD');
  const yesterdayKey = moment().subtract(1, 'day').format('YYYY-MM-DD');
  const order: string[] = [];
  const groups: Record<string, any[]> = {};

  list.forEach(item => {
    const m = moment(item?.sentAt);
    const key = m.isValid() ? m.format('YYYY-MM-DD') : 'unknown';
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(item);
  });

  return order.map(key => {
    let title = key;
    if (key === todayKey) { title = 'Today'; }
    else if (key === yesterdayKey) { title = 'Yesterday'; }
    else if (key !== 'unknown') { title = moment(key, 'YYYY-MM-DD').format('D MMM YYYY'); }
    return { title, data: groups[key] };
  });
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
    const sections = buildSections(notifications);

    return (
        <View style={styles.container}>
            <CustomHeader
                navigation={navigation}
                title="Notifications"
                onSkipPress={() => {}}
                showSkip={false}
            />

            <View style={styles.body}>
                {showSkeleton ? (
                    <View style={styles.listWrap}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <NotificationSkeletonRow key={i} delay={i * 90} />
                        ))}
                    </View>
                ) : (
                    <SectionList
                        sections={sections}
                        style={styles.listWrap}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: bottomPad },
                            notifications.length === 0 && styles.listContentEmpty,
                        ]}
                        keyExtractor={(item, index) =>
                            item?.id ? item.id.toString() : (item?._id ? item._id.toString() : index.toString())
                        }
                        showsVerticalScrollIndicator={false}
                        stickySectionHeadersEnabled={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={color.buttonColor}
                                colors={[color.buttonColor]}
                            />
                        }
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionLabel}>{title}</Text>
                        )}
                        renderItem={({ item, index }) => {
                            const formattedTime = formatNotificationTime(item?.sentAt);
                            const type = item?.type || item?.notification_type || item?.data?.type;
                            const isBookingNotif = BOOKING_NOTIFICATION_TYPES.includes(type);
                            const image = item?.image || item?.data?.image;
                            return (
                                <NotificationItem
                                    name={resolveTitle(item, type)}
                                    message={item?.body}
                                    time={formattedTime}
                                    type={type}
                                    image={image}
                                    unread={isItemUnread(item)}
                                    index={index}
                                    onPress={isBookingNotif ? () => handleNotificationPress(item) : undefined}
                                />
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.empty}>
                                <View style={styles.emptyIconWrap}>
                                    <MaterialCommunityIcons name="bell-off-outline" size={44} color={notificationColors.groupLabel} />
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
    body: {
        flex: 1,
        backgroundColor: notificationColors.bodySurface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    listWrap: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingTop: 16,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.4,
        color: notificationColors.groupLabel,
        marginTop: 14,
        marginBottom: 8,
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
        backgroundColor: notificationColors.general.bg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: notificationColors.titleText,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: notificationColors.descText,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: notificationColors.cardSurface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: notificationColors.cardBorder,
        padding: 10,
        marginBottom: 8,
        shadowColor: '#1D4A8F',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    skeletonCircle: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#E3E6EE',
        marginRight: 10,
    },
    skeletonTextCol: {
        flex: 1,
    },
    skeletonLine: {
        height: 9,
        borderRadius: 5,
        backgroundColor: '#E3E6EE',
    },
});

export default Notification;
