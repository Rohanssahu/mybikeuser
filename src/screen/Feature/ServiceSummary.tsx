import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import { hp } from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';

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
    return (
        <View style={styles.container}>
            <CustomHeader  title='View Biils' navigation={navigation}  />
            <View style={styles.card}>
                {/* Bike Details */}
                <Text style={styles.sectionTitle}>Bike Details</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Bike Model & Variant</Text>
                    <Text style={styles.value}>{serviceData?.bikeModel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Registration Number</Text>
                    <Text style={styles.value}>{serviceData?.registrationNumber}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Service Date</Text>
                    <Text style={styles.value}>{serviceData?.serviceDate}</Text>
                </View>

                {/* Service Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Service Summary</Text>

                    {serviceData?.services?.map((service, index) => (
                        <View key={index} style={styles.serviceRow}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.servicePrice}>{service.price}</Text>
                        </View>
                    ))}

                    {/* Total */}
                    <View style={styles.divider} />
                    <View style={styles.serviceRow}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalPrice}>{serviceData?.totalAmount}</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Thank you for servicing with <Text style={styles.highlight}>DR BIKE!</Text>{'\n'}Ride Safe!
                </Text>
            </View>
            <View style={{
                    position: 'absolute',
                    bottom: 30, width: '100%', paddingHorizontal: 30
                }}>
                    <CustomButton
                        title='Download Invoice'

                        onPress={() => {
                            navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
                        }}
                    />
                </View>
        </View>
    );
};

export default ServiceSummary;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: color.baground,
        
    },
    card: {
        backgroundColor: '#282F5A',
        padding: 20,
        borderRadius: 20,
        width:'90%',
        marginTop:hp(10),
        alignSelf:'center'
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
        fontWeight:'600'
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
        marginVertical:15
    },
    serviceName: {
        fontSize: 14,
        color: '#000',
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
        borderStyle:'dashed'
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
    registrationNumber: 'ABC-1234',
    serviceDate: 'January 31, 2025',
    services: [
        { name: 'Engine Oil', price: 'Rs. 1,000' },
        { name: 'Air Filter', price: 'Rs. 500' },
        { name: 'General Service', price: 'Rs. 2,000' },
        { name: 'Cleaning', price: 'Rs. 300' },
        { name: 'Tax', price: 'Rs. 250' },
    ],
    totalAmount: 'Rs. 4,050',
};