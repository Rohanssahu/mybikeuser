import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import { hp } from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import { useRoute } from '@react-navigation/native';
import { bookingdetails } from '../../redux/Api/apiRequests';
import { image_url } from '../../redux/Api';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';
import Geolocation from '@react-native-community/geolocation';
import { getAddressFromLatLng } from '../../component/helperFunction';
// Define types for service items
interface ServiceItem {
    name: string;
    price: string;
}

// Define props for the ServiceSummary component
interface ServiceSummaryProps {
    bikeModel: string;
    registrationNumber: string;
    serviceDate: string;
    services: ServiceItem[];
    totalAmount: string;
}

const ServiceSummary: React.FC<ServiceSummaryProps> = ({
    navigation
}) => {

    const route = useRoute()
    const { id } = route.params
    const [booking, setBooking] = useState('')
    useEffect(() => {
        get_booking_details()
    }, [id])

    const get_booking_details = async () => {

        const res = await bookingdetails(id)
        if (res?.success) {
            setBooking(res?.data)
        }
        else {
            setBooking('')
        }


    }
    const makeCall = (no) => {
        Linking.openURL(`tel:${no}`); // Replace with the actual phone number
    };

    const openGoogleMaps = (shopLatitude, shopLongitude, shopName) => {
        const url = Platform.select({
            ios: `maps:0,0?q=${shopName}@${shopLatitude},${shopLongitude}`, // iOS specific
            android: `geo:${shopLatitude},${shopLongitude}?q=${shopName}` // Android specific
        });

        Linking.openURL(url).catch((err) => console.error('Error opening maps: ', err));
    };

    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);

        // Define month names
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // Extract date components
        const day = date.getDate();
        const month = monthNames[date.getMonth()]; // Get month name
        const year = date.getFullYear();

        // Extract time components
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const amPm = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        hours = hours % 12 || 12;

        // Format final string
        return `${day} ${month} ${year} ${hours}:${minutes} ${amPm}`;
    };
    return (
        <View style={styles.container}>
            <CustomHeader title='Booking Details' navigation={navigation} />
            <ScrollView>
                <View style={styles.card}>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={{ uri: image_url + booking?.dealer_id?.shopImages[0] }} style={{ height: 50, width: 50, borderRadius: 25 }}
                        />
                        <View style={{ width: '60%', marginLeft: 10 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#FFFFFF',
                            }}>{booking?.dealer_id?.shopName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon source={icon.pin} size={15} />

                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: '#FFFFFF',
                                }}>{booking?.dealer_id?.address}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton} onPress={() => { openGoogleMaps(booking?.dealer_id?.latitude, booking?.dealer_id?.longitude, booking?.dealer_id?.shopName) }}>
                            <Icon source={icon.googlemaps} size={35} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => { makeCall(booking?.dealer_id?.phone) }}>
                            <Icon source={icon.phone} size={40} />
                        </TouchableOpacity>
                    </View>
                    {/* Bike Details */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Bike Details</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Booking Date</Text>
                        <Text style={styles.value}>{formatDateTime(booking?.pickupDate)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Bike Model & Variant</Text>
                        <View style={{ width: '35%' }}>
                            <Text style={styles.value}>{booking?.userBike_id?.name}-{booking?.userBike_id?.model} & {booking?.userBike_id?.bike_cc}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Registration Number</Text>
                        <Text style={styles.value}>{booking?.userBike_id?.plate_number}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Last Service Km</Text>
                        <Text style={styles.value}>{booking?.lastServiceKm} km</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Service Confirmation</Text>
                        <Text style={[styles.totalPrice, { color: booking?.status === 'pending' ? '#d1a908' : booking?.status === 'user_cancelled' ? 'red' : booking?.status === 'rejected' ? 'red' : 'green' }]}>{booking.status === 'user_cancelled' ? 'Cancelled By User' : booking.status}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Pickup Status</Text>
                        <Text style={[styles.totalPrice, { color: '#d1a908' }]}>{booking?.pickupStatus}</Text>
                    </View>
                    {booking?.pickupAndDropId != null &&

                        <View style={styles.row}>
                            <Text style={styles.label}>Pickup Address</Text>
                            <View style={{ width: '60%' }}>
                                <Text style={[styles.value, { fontSize: 12, color: '#fff' }]}>{getAddressFromLatLng(booking?.pickupAndDropId?.user_lat, booking?.pickupAndDropId?.user_lng)}</Text>
                            </View>
                        </View>

                    }


                    {/* Service Summary */}
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Service Summary</Text>

                        {booking?.services?.map((service, index) => (
                            <View key={index} style={styles.serviceRow}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <Text style={styles.servicePrice}>₹{service.estimated_cost}</Text>
                            </View>
                        ))}

                        {/* Total */}

                        <View style={styles.serviceRow}>
                            <Text style={styles.serviceName}>Tax/Fees</Text>
                            <Text style={styles.totalPrice}>₹{booking?.tax}</Text>
                        </View>

                        <View style={styles.divider} />
                        <View style={styles.serviceRow}>
                            <View>

                                <Text style={styles.totalText}>Bill </Text>
                                <Text style={[{ color: '#d1a908', fontSize: 12 }]}>{booking?.billStatus}</Text>
                            </View>

                            <Text style={[styles.totalPrice, { color: '#d1a908' }]}>₹{booking?.totalBill}</Text>
                        </View>
                    </View>
                    {booking?.additionalNotes?.length > 0 &&
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryTitle}>Additional Notes</Text>
                            {booking?.additionalNotes?.map((note, index) => (
                                <View key={index} style={styles.serviceRow}>
                                    <Text style={styles.servicePrice}>{index + 1}. {note}</Text>
                                </View>
                            ))}
                        </View>}

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        Thank you for servicing with <Text style={styles.highlight}>MR BIKE!</Text>{'\n'}Ride Safe!
                    </Text>
                </View>

                {booking?.status === 'rejected' &&

                    <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', borderWidth: 1, borderColor: color.baground }}>
                        <Text style={{ fontSize: 18, color: 'red', fontWeight: '800' }}>Your Booking Rejected By Service Center</Text>
                    </View>

                }
                {booking?.billGenerated && <View style={{
                    marginTop: 30,
                    width: '100%', paddingHorizontal: 30
                }}>
                    <CustomButton
                        title='Download Invoice'

                        onPress={() => {
                            navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
                        }}
                    />
                </View>}
            </ScrollView>
        </View>
    );
};

export default ServiceSummary;

// Styles
const styles = StyleSheet.create({
    callButton: {



    },
    container: {
        flex: 1, backgroundColor: color.baground,

    },
    card: {
        backgroundColor: '#282F5A',
        padding: 20,
        borderRadius: 20,
        width: '90%',
        marginTop: hp(10),
        alignSelf: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600'
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9DB2BF',
    },
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        marginVertical: 15
    },
    serviceName: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500'
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        borderWidth: 1,
        borderColor: '#A0A3BD',
        marginVertical: 8,
        borderStyle: 'dashed'
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    footerText: {
        fontSize: 14,
        color: '#A0A3BD',
        textAlign: 'center',
        marginTop: 15,
    },
    highlight: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
});

const serviceData = {
    bikeModel: 'Yamaha R15 V3',
    registrationNumber: 'MP09CF1234',
    lastservicekm: '10000',
    serviceDate: 'January 31, 2025',
    services: [
        { name: 'General Service', price: 'Rs. 2,00' },
        { name: 'Tax', price: 'Rs. 250' },
    ],
    Additional: [
        {
            note: 'Remaing Your cluct plat change after 500 km '
        }

    ],
    totalAmount: 'Rs. 4,050',
};