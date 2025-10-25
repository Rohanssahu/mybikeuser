import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../component/CustomHeaderProps';
import {color} from '../../constant';
import images, {icon} from '../../component/Image';
import {hp} from '../../component/utils/Constant';
import Icon from '../../component/Icon';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import {useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {
  addPickupAddress,
  create_booking,
  garage_details,
} from '../../redux/Api/apiRequests';
import Geolocation from '@react-native-community/geolocation';
import MapPickerModal from './MapPicker';
import Loading from '../../configs/Loader';
import {errorToast} from '../../configs/customToast';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showBookingNotification} from '../../component/Notification';
import { Dropdown } from 'react-native-element-dropdown';

interface ServiceItem {
  title: string;
  description: string;
}

const GarageDetails: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute();
  const [GarageDetails, setGarageDetails] = useState([]);
  const {bike, id} = route.params;
  const [distance, setDistance] = useState(null);
  const [pickupModalVisible, setpickupModalVisible] = useState(false);
  // Example shop location (latitude & longitude)
  const shopLocation = {
    latitude: GarageDetails?.latitude,
    longitude: GarageDetails?.longitude,
  }; // New York
  const [PickupLocation, setPickupLocation] = useState('');
  const [PickupLocationName, setPickupLocationName] = useState('');
  const [PickupLocationId, setPickupLocationId] = useState('');
  const [selectedService, setselectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [choosePickup, setchoosePickup] = useState(true);
  const [choosePickupOption, setchoosePickupOption] = useState('');
  const [PickupDistance, setPickupDistance] = useState(null);
  const [BookingDate, setBookingDate] = useState(new Date());
  const [BookingDateModal, setBookingDateModal] = useState(false);
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    requestLocationPermission();
  }, [GarageDetails]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return;
      }
    }
    getCurrentLocation();
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setBookingDate(selectedDate);
    setBookingDateModal(Platform.OS === 'ios'); // Keep open on iOS
  };
  const getCurrentLocation = () => {
    if (!GarageDetails?.latitude || !GarageDetails?.longitude) return;

    Geolocation.getCurrentPosition(
      position => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const calculatedDistance = haversineFormula(userLocation, shopLocation);
        setDistance(calculatedDistance);
      },
      error => console.error('Error getting location:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Haversine formula for distance calculation
  const haversineFormula = (start, end) => {
    const toRadians = degree => (degree * Math.PI) / 180;

    const R = 6371; // Radius of Earth in km
    const dLat = toRadians(end.latitude - start.latitude);
    const dLon = toRadians(end.longitude - start.longitude);

    const lat1 = toRadians(start.latitude);
    const lat2 = toRadians(end.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  useEffect(() => {
    get_dealer_details();
  }, [id]);

  const get_dealer_details = async () => {
    const digitsOnly = bike?.bike_cc.replace(/\D/g, '');

    const res = await garage_details(id, digitsOnly);

    if (res?.success) {
      setGarageDetails(res?.data);
    } else {
      setGarageDetails([]);
    }
  };

  const addPickupDrop = async () => {
    const user = {
      latitude: PickupLocation?.latitude,
      longitude: PickupLocation?.longitude,
    };

    if ((PickupLocation?.latitude, PickupLocation?.longitude)) {
      const ls = haversineFormula(user, shopLocation);
      console.log('ls', ls);

      setPickupDistance(ls ? ls : '');
    }

    const user_id = await AsyncStorage.getItem('user_id');

    const res = await addPickupAddress(
      PickupLocation?.latitude,
      PickupLocation?.longitude,
      GarageDetails?._id,
      user_id,
    );

    if (res?.data?._id) {
      setPickupLocationId(res?.data?._id);
    }
  };

  const createBooking = async () => {
    if (!selectedService) return errorToast('Please Choose Service');

    if (!choosePickupOption)
      return errorToast('Please Choose Picup_up & Drop Option');
    setLoading(true);
    const res = await create_booking(
      GarageDetails?._id,
      selectedService,
      choosePickupOption === 'Self' ? '' : PickupLocationId,
      bike?._id,
      BookingDate?.toString(),
    );

    if (res?.success) {
      showBookingNotification(
        GarageDetails?.services?.find(s => s._id === selectedService)?.name ||
          'Service',
        GarageDetails?.shopName,
        formatDateTime(BookingDate),
      );
      navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE);
    }
    setLoading(false);
  };
  const formatDateTime = isoDate => {
    const date = new Date(isoDate);

    // Define month names
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
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
    return `${day} ${month} ${year}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {loading && <Loading />}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Garage Image */}
        <Image
          source={images.grage}
          style={styles.garageImage}
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{position: 'absolute', top: 40, left: 10}}>
          <Icon source={icon.back} size={30} />
        </TouchableOpacity>
        <View style={{position: 'absolute', top: hp(18), left: 10}}>
          <Text style={styles.title}>{GarageDetails?.shopName}</Text>
          <Text style={styles.subtitle}>{GarageDetails?.address}</Text>

          {/* Distance & Rating */}
          <View style={styles.infoRow}>
            <Icon source={icon.pin} size={16} />
            <Text style={styles.infoText}>{distance?.toFixed(2)} km</Text>
            <Icon source={icon.star} size={16} />
            <Text style={styles.infoText}>{GarageDetails?.averageRating}</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {GarageDetails?.shopDescription}
          </Text>

          {/* Features */}
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={30} />
            <View>
              <Text style={styles.featureText}>Go Digital</Text>
              <Text style={styles.featureText2}>
                Convenient Online Payment Options.
              </Text>
            </View>
          </View>
          <View style={[styles.featureRow, {justifyContent: 'space-between'}]}>
            <Icon source={icon.pickups} size={30} />
            <View style={{width: '88%'}}>
              <Text style={styles.featureText}>
                Pick-Up & Drop ({Number(PickupDistance)?.toFixed(2)}km)
              </Text>
              {PickupLocationName == '' && choosePickupOption === '' && (
                <Text style={styles.featureText2}>
                  {GarageDetails?.pickupAndDrop
                    ? 'We Offer Pickup & Drop Services'
                    : 'Pickup & drop Services Not Available'}
                </Text>
              )}

              {choosePickupOption === 'PickDrop' && (
                <Text style={styles.featureText2}>{PickupLocationName}</Text>
              )}
              {choosePickupOption === 'Self' && (
                <Text style={styles.featureText2}>
                  "Self Pickup" or "Drop by Shop"
                </Text>
              )}

              {choosePickup && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                    paddingHorizontal: 15,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setPickupLocationId('Self');
                      setchoosePickupOption('Self');
                    }}
                    style={{
                      width: '35%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        choosePickupOption === 'Self'
                          ? color.buttonColor
                          : '#ccc',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                    <Text
                      style={[
                        styles.featureText,
                        {marginLeft: 0, fontSize: 14, color: '#000'},
                      ]}>
                      Self
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setpickupModalVisible(true);
                      setchoosePickupOption('PickDrop');
                    }}
                    style={{
                      marginLeft: 5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35%',
                      backgroundColor:
                        choosePickupOption === 'PickDrop'
                          ? color.buttonColor
                          : '#ccc',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                    <Text
                      style={[
                        styles.featureText,
                        {
                          marginLeft: 0,
                          fontSize: 14,
                          color: '#000',
                          fontWeight: '600',
                        },
                      ]}>
                      PickDrop
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                setchoosePickup(choosePickup => !choosePickup);
              }}
              disabled
              style={{}}>
              {choosePickup ? (
                <Image source={icon.check} style={{height: 22, width: 22}} />
              ) : (
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: 'green',
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
          {/* <View style={[styles.featureRow, { justifyContent: 'space-between' }]}>
            <Icon source={icon.calendar} size={25} style={{tintColor:color.buttonColor,marginLeft:4}} />
            <View style={{ width: '88%' }}>
              <Text style={styles.featureText}>Pick-Up Booking Date</Text>
              <Text style={[styles.featureText,{color:color.buttonColor}]}>{formatDateTime(BookingDate)}</Text>
       
              <Text style={styles.featureText2}>Choose Booking Date</Text>

              

            </View>
            <TouchableOpacity
              onPress={() => {
                setBookingDateModal(true)
              }}
              style={{}}>
              {BookingDate ? <Image source={icon.check}
                style={{ height: 22, width: 22 }} />
                : <View style={{ borderWidth: 2, borderColor: 'green', height: 20, width: 20, borderRadius: 10 }} />
              }
            </TouchableOpacity>

          </View> */}
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={30} />
            <View>
              <Text style={styles.featureText}>Our Promise</Text>
              <Text style={styles.featureText2}>
                {GarageDetails?.ourPromise ||
                  'We promise fast, reliable, and affordable bike service for every customer.'}
              </Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Icon source={icon.Expert} size={30} />
            <View>
              <Text style={styles.featureText}>Expert Advice</Text>
              <Text style={styles.featureText2}>
                Skilled mechanics for your every need.
              </Text>
            </View>
          </View>

          {/* Services */}

{/* Services */}
<Text style={styles.sectionTitle}>Select Service</Text>

{GarageDetails?.services?.length > 0 ? (
  <>
    <Dropdown
      style={styles.dropdown}
      containerStyle={styles.dropdownContainer}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      data={
        GarageDetails?.services?.map(service => ({
          label: `${service.name?.toUpperCase()} ₹${service?.bikes?.[0]?.price || 0}`,
          value: service._id,
        })) || []
      }
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder="Choose a service"
      value={selectedService}
      onChange={item => setselectedService(item.value)}
      itemTextStyle={{ color: '#000' }}
    />

    {GarageDetails?.services?.find(s => s._id === selectedService) && (
      <View style={styles.serviceCard}>
        {(() => {
          const selected = GarageDetails?.services?.find(
            s => s._id === selectedService
          );
          return (
            <>
            <View style={{marginTop:20}}>

         
              <Text style={styles.serviceTitle}>{selected.name?.toUpperCase()}</Text>
              <Text style={styles.servicePrice}>Price :  ₹{selected?.bikes?.[0]?.price}</Text>
              
              </View>
              <Text style={styles.serviceDescription}>
               Description:
              </Text>
              <Text style={styles.serviceDescription}>
                {selected.description || 'No description available'}
              </Text>
              <View style={styles.checkContainer}>
                <Image source={icon.check} style={{ height: 30, width: 30 }} />
              </View>
            </>
          );
        })()}
      </View>
    )}
  </>
) : (
  <View style={styles.noServiceContainer}>
    <Text style={styles.noServiceText}>No Service Added</Text>
  </View>
)}


        </View>
        {GarageDetails?.services?.length > 0 && (
          <View
            style={{
              marginVertical: 30,
              paddingHorizontal:10,
              marginBottom: 60,
            }}>
            <CustomButton
              title="Book Now"
              disable={selectedService == ''}
              onPress={() => {
                createBooking();
              }}
            />
          </View>
        )}
        {BookingDateModal && (
          <DateTimePicker
            value={BookingDate}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
      </ScrollView>
      <MapPickerModal
        setModalVisible={() => {
          addPickupDrop();
          setpickupModalVisible(false);
        }}
        modalVisible={pickupModalVisible}
        driver={true}
        sendLocation={setPickupLocation}
        setLocationName={setPickupLocationName}
      />
    </View>
  );
};

export default GarageDetails;

const styles = StyleSheet.create({
  dropdown: {
    height: 55,
    borderColor: color.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  placeholderStyle: {
    color: '#888',
    fontSize: 14,
  },

  selectedTextStyle: {
    color: '#111',
    fontSize: 15,
    fontWeight: '500',
  },

  serviceCard: {
    marginTop: 15,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  servicePrice: {
    fontSize: 18,
    color: '#32CD32',
    marginTop: 5,
    fontWeight: '600',
  },

  serviceDescription: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    lineHeight: 18,
  },

  checkContainer: {
    marginTop: 10,
    position:'absolute',top:0,right:5
  },

  noServiceContainer: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    marginTop: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noServiceText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },

  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  garageImage: {
    width: '100%',
    height: hp(30),
  },
  contentContainer: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 10,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
    fontWeight: '600',
  },
  featureText2: {
    fontSize: 12,
    color: '#A1A1A1',
    marginLeft: 10,
  },
  serviceContainer: {
    marginTop: 20,

    borderRadius: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceText: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 5,
  },
});
