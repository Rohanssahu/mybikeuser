import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';
import { wp } from './utils/Constant';
import ScreenNameEnum from '../routes/screenName.enum';
import { image_url } from '../redux/Api';

// Define the data type for each booking item
interface BookingItem {
  _id: string;
  bookingId: string;
  status: string;
  create_date: string;

}

// Define props for the component
interface BookingListProps {
  data: BookingItem[];
  onCallPress: any;
  onViewBillPress: () => void;
}

const BookingList: React.FC<BookingListProps> = ({ data ,navigation,onCallPress}) => {
  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);

    // Extract date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Extract time components
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Format final string
    return `${day}-${month}-${year} ${hours}:${minutes} ${amPm}`;
};
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Image
source={{uri:image_url+item?.dealer_id?.shopImages[0]}}

style={{height:40,width:40,borderRadius:20,borderWidth:1,backgroundColor:'#ccc',marginVertical:10}}
            />
            <View style={{marginLeft:10}}>

            <Text style={styles.label}>{item?.dealer_id?.shopName}</Text>
            <Text style={[styles.label,{fontSize:12,fontWeight:'400'}]}>{item?.dealer_id?.address}</Text>
          </View>
            </View>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.label}>Status:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{item.bookingId}</Text>
            <Text style={styles.value}>{item.status}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
          </View>
          <Text style={styles.value}>{formatDateTime(item.create_date)}</Text>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.callButton} onPress={()=>{onCallPress(item?.dealer_id?.phone)}}>
              <Icon source={icon.phone} size={40}  />
            </TouchableOpacity>
            <TouchableOpacity
             onPress={()=>{
              navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY)
            }}
            style={styles.billButton} >
              <Text style={styles.billText}>Bike Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#2C2F5B', // Dark blue background
    borderRadius:20,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    color: '#A0A3BD', // Light gray text
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
   
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  callButton: {
   
    padding: 10,
    borderRadius: 30,
    position:'absolute',right:0,bottom:65
  },
  billButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
 marginTop:30,
    borderRadius: 8,
    width:wp(80),
    alignItems:'center',
    justifyContent:'center'
  },
  billText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default BookingList;
