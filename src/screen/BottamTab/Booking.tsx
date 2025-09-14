import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
  Linking,
} from 'react-native';
import CustomHeader from '../../component/CustomHeaderProps';
import {color} from '../../constant';
import VerticalshopList from '../../component/VerticalshopList';
import images from '../../component/Image';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';
import {
  cancel_booking,
  get_profile,
  get_userbooking,
} from '../../redux/Api/apiRequests';
import {useIsFocused} from '@react-navigation/native';
import {successToast} from '../../configs/customToast';

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

const Booking: React.FC<Props> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [booking, setBooking] = useState<ShopItem[]>([]);
  const isFocus = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [User, setUser] = useState('');
  useEffect(() => {
    getUser();
  }, [isFocus]);

  const getUser = async () => {
    const res = await get_profile();
    if (res.success) {
      setUser(res.data);
      booking_list(res.data);
    } else {
      setUser('');
    }
  };

  const booking_list = async (User) => {
    try {
      const response = await get_userbooking(User?._id);

      if (response?.data?.length > 0) {
        setBooking(response.data);
      } else {
        setBooking([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBooking([]);
    }
  };
  const makeCall = no => {
    Linking.openURL(`tel:${no}`); // Replace with the actual phone number
  };

  const cancelbooking = async id => {
    setLoading(true);
    const res = await cancel_booking(id, 'user_cancelled');

    if (res.success) {
      booking_list();
      successToast('Booking Cancel Successfully');
    }
    setLoading(false);
  };
  const filteredBookings = booking?.filter(
    item =>
      item?.dealer_id?.shopName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) || !item?.dealer_id,
  );

 

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} />
      <Text style={styles.headerText}>Booking</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
        </View>
        <Text style={styles.subHeaderText}>Today</Text>
        {filteredBookings?.length > 0 ? (
          <BookingList
            data={filteredBookings}
            loading={loading}
            navigation={navigation}
            onCallPress={no => {
              makeCall(no);
            }}
            onCancelPress={id => {
              cancelbooking(id);
            }}
          />
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
    color: '#fff',
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
    color: '#fff',
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
