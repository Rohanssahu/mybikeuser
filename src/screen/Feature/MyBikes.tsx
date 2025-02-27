
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import images, { icon } from '../../component/Image';
import VerticalList from '../../component/VerticalList';
import CustomHeader from '../../component/CustomHeaderProps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { color } from '../../constant';
import { get_mybikes, remove_bike } from '../../redux/Api/apiRequests';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { hp } from '../../component/utils/Constant';
import ScreenNameEnum from '../../routes/screenName.enum';
import CustomButton from '../../component/CustomButton';
import Loading from '../../configs/Loader';

// Define the navigation type
type RootStackParamList = {
  AllServices: undefined;
  // Add other screens if needed
};
const SCREEN_WIDTH = Dimensions.get('window').width;

// Define props for the component
type Props = NativeStackScreenProps<RootStackParamList, 'AllServices'>;

const MyBikes: React.FC<Props> = ({ navigation }) => {
  const route = useRoute()

  const {profile } =route.params
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [Bikes, setBikes] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isFocus = useIsFocused()
  useEffect(() => {
    booking_list()
  }, [isFocus])
  const booking_list = async () => {
    setLoading(true);
    try {
      const bikes = await get_mybikes()
      setBikes(bikes?.data)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const removeBike = async (id) => {
    setLoading(true);
    const res = await remove_bike(id)
    console.log('===========remove_bike=========================', id);
    if (res?.success) {
      booking_list()
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      <CustomHeader navigation={navigation} title="My Bikes" onSkipPress={() => { }} showSkip={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginTop: 20 }}>
        {Bikes?.length > 0 ?

          <FlatList
            data={Bikes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View

                style={styles.card}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.plate_number?.toUpperCase()}</Text>
                  <Text style={styles.title}>Name: {item.name}</Text>
                  <Text style={styles.description}>Modal: {item.model}</Text>
                  <Text style={styles.description}>CC: {item.bike_cc}</Text>
{!profile &&
                  <TouchableOpacity 
                  onPress={()=>{
                    navigation.navigate(ScreenNameEnum.NEARBY_SHOPS,{item:item})
                  }}
                  style={{
                    marginTop: 10,
                    backgroundColor: color.buttonColor,
                    height: 35, borderRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40%',

                  }}>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#fff' }}>Continue</Text>
                  </TouchableOpacity>}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Confirm Removal',
                      'Are you sure you want to remove this bike from the list?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => removeBike(item._id) }
                      ]
                    );
                  }}
                >
                  <Image source={icon.delete} style={styles.image} resizeMode="contain" />
                </TouchableOpacity>

              </View>
            )}
          /> :
          <View style={{
            justifyContent: 'center',
            alignItems: 'center'

          }}>
            <Text style={{ fontWeight: '400', color: '#fff' }}>No Booking Found</Text>
          </View>}

        <CustomButton title='Add Bike' buttonStyle={{ marginHorizontal: 20 }} onPress={() => {
          navigation.navigate(ScreenNameEnum.BIKE_DETAILS)
        }} />
      </ScrollView>
    </View>
  );
};



// Sample shop list data

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#2C2F5B', // Dark blue background
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: SCREEN_WIDTH * 0.9, // 90% of screen width
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text color
  },
  description: {
    fontSize: 14,
    color: '#fff', // Light gray text
    marginTop: 5,
  },
  image: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
});

export default MyBikes;
