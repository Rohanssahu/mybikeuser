
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../component/CustomHeaderProps';
import Loading from '../../configs/Loader';
import NotificationItem from '../../component/NotificationItem';
import { get_Notification } from '../../redux/Api/apiRequests';
import ScreenNameEnum from '../../routes/screenName.enum';

const BOOKING_NOTIFICATION_TYPES = [
  'service_completed',
  'payment_received',
  'otp_ready',
  'bike_delivered',
];

const Notification = ({ navigation }: any) => {
    const isLogOut: any = useSelector((state: any) => state.auth);
    const [notifications, setnotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <View style={styles.container}>
            {isLoading ? <Loading /> : null}

            <CustomHeader
                navigation={navigation}
                title="Notification"
                onSkipPress={() => {}}
                showSkip={false}
            />

            <View style={styles.listWrap}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) =>
                        item?.id ? item.id.toString() : index.toString()
                    }
                    renderItem={({ item }) => {
                        const formattedTime = new Date(item?.sentAt).toLocaleString();
                        const type = item?.type || item?.notification_type || item?.data?.type;
                        const isBookingNotif = BOOKING_NOTIFICATION_TYPES.includes(type);
                        return (
                            <NotificationItem
                                name={item.name}
                                message={item?.body}
                                time={formattedTime}
                                image={item.image}
                                onPress={isBookingNotif ? () => handleNotificationPress(item) : undefined}
                            />
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.empty}>
                            <Text style={styles.emptyTxt}>No Notifications Found</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listWrap: {
        padding: 15,
        flex: 1,
    },
    empty: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyTxt: {
        textAlign: 'center',
        fontSize: 16,
    },
});

export default Notification;
