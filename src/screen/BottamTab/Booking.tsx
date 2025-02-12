
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import VerticalshopList from '../../component/VerticalshopList';
import images from '../../component/Image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';

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
    const [searchQuery, setSearchQuery] = useState('');
    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: '600', fontSize: 18, color: "#fff", paddingHorizontal: 20, marginTop: 20 }}>Booking</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <View style={{marginHorizontal:15}}>

            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
           </View>
                <Text style={{ fontWeight: '600', fontSize: 18, color: "#fff", marginVertical: 15, paddingHorizontal: 20, marginTop: 20 }}>Today</Text>
                <BookingList data={shopList} navigation={navigation} />
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
    scrollContent: {
        marginTop: 30,
    },
});

// Sample shop list data
const shopList: ShopItem[] = [
    {

        bookingId: '536548755222',
        amount: " 105.44",
        date: '25-10-2025'
    },
    {

        bookingId: '536548755222',
        amount: " 105.44",
        date: '25-10-2025'
    },
    {

        bookingId: '536548755222',
        amount: " 105.44",
        date: '25-10-2025'
    },

];
