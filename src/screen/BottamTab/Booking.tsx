import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, StatusBar, Linking } from 'react-native';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import VerticalshopList from '../../component/VerticalshopList';
import images from '../../component/Image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';
import { get_userbooking } from '../../redux/Api/apiRequests';
import { useIsFocused } from '@react-navigation/native';

// Define navigation type
type RootStackParamList = {
    NearByShops: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'NearByShops'>;

// Define Shop Item type
interface ShopItem {
    bookingId: string;
    amount: string;
    date: string;
}

const Booking: React.FC<Props> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [booking, setBooking] = useState<ShopItem[]>([]);
    const isFocus = useIsFocused();

    useEffect(() => {
        booking_list();
    }, [isFocus]);

    const booking_list = async () => {
        try {
            const response = await get_userbooking();
            if (response?.data) {
                setBooking(response.data);
            } else {
                setBooking([]);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setBooking([]);
        }
    };

    const makeCall = (no) => {
        Linking.openURL(`tel:${no}`); // Replace with the actual phone number
      };

    return (
        <View style={styles.container}>
               <StatusBar  backgroundColor={color.baground} />
            <Text style={styles.headerText}>Booking</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.searchContainer}>
                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                </View>
                <Text style={styles.subHeaderText}>Today</Text>
                {booking.length > 0 ? (
                    <BookingList data={booking} navigation={navigation}  onCallPress={(no)=>{makeCall(no)}}/>
                ) : (
                    <View style={styles.noBookingContainer}>
                        <Text style={styles.noBookingText}>No Booking Found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Booking;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    headerText: {
        fontWeight: '600',
        fontSize: 18,
        color: "#fff",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    scrollContent: {
        marginTop: 30,
    },
    searchContainer: {
        marginHorizontal: 15,
    },
    subHeaderText: {
        fontWeight: '600',
        fontSize: 18,
        color: "#fff",
        marginVertical: 15,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    noBookingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noBookingText: {
        fontWeight: '400',
        color: '#fff',
    },
});


