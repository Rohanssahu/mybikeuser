
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import NotificationItem from '../../component/NotificationItem';
import { get_Notification } from '../../Api/apiRequests';
import { useSelector } from 'react-redux';
import Loading from '../../configs/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../component/CustomHeaderProps';


const Notification = ({navigation}) => {
    const isLogOut: any = useSelector((state: any) => state.auth);
    const [notifications, setnotifications] = useState();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        get_Notificationlist()
    }, [])
    const get_Notificationlist = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            const dealerId = isLogOut?.userData?.dealer_id;
            const res = await get_Notification(dealerId, setIsLoading);
            if (res) {
                setnotifications(res?.data?.data);
            } else {
                console.error('Failed to fetch notifications:', res?.message);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };


    return (
        <View style={styles.container}>
            {isLoading ? <Loading /> : null}

      <CustomHeader navigation={navigation} title="Notification" onSkipPress={() => { }} showSkip={false} />
     
            <View style={{ padding: 15, }}>
                
                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                    renderItem={({ item }) => {
                        const formattedTime = new Date(item?.sentAt).toLocaleString(); // Convert ISO string to readable format
                        return (
                            <NotificationItem
                                name={item.name}
                                message={item?.body}
                                time={formattedTime}
                                image={item.image}
                            />
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1,
                                marginTop: 20,
                            }}
                        >
                            <Text style={{ textAlign: "center", fontSize: 16 }}>
                                No Notifications Found
                            </Text>
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
});

export default Notification;
