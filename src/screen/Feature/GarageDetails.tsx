import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, StatusBar, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import images, { icon } from '../../component/Image';
import { hp } from '../../component/utils/Constant';
import Icon from '../../component/Icon';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addPickupAddress, create_booking, garage_details } from '../../redux/Api/apiRequests';
import Geolocation from '@react-native-community/geolocation';
import MapPickerModal from './MapPicker';
import Loading from '../../configs/Loader';
import { errorToast } from '../../configs/customToast';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ServiceItem {
  title: string;
  description: string;
}


const GarageDetails: React.FC<{ navigation: any }> = ({ navigation }) => {
  const route = useRoute()
  const [GarageDetails, setGarageDetails] = useState([])
  const { bike, id } = route.params
  const [distance, setDistance] = useState(null);
  const [pickupModalVisible, setpickupModalVisible] = useState(false)
  // Example shop location (latitude & longitude)
  const shopLocation = { latitude: GarageDetails?.latitude, longitude: GarageDetails?.longitude }; // New York
  const [PickupLocation, setPickupLocation] = useState('')
  const [PickupLocationName, setPickupLocationName] = useState('')
  const [PickupLocationId, setPickupLocationId] = useState('')
  const [selectedService, setselectedService] = useState('')
  const [loading, setLoading] = useState(false)
  const [choosePickup, setchoosePickup] = useState(false)
  const [choosePickupOption, setchoosePickupOption] = useState('')
  const [PickupDistance, setPickupDistance] = useState(null)
  const [BookingDate, setBookingDate] = useState(new Date())
  const [BookingDateModal, setBookingDateModal] = useState(false)
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    requestLocationPermission();
  }, [GarageDetails]);


  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied");
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

    if (!GarageDetails?.latitude || !GarageDetails?.longitude) return

    Geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const calculatedDistance = haversineFormula(userLocation, shopLocation);
        setDistance(calculatedDistance);
      },
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };



  // Haversine formula for distance calculation
  const haversineFormula = (start, end) => {

    const toRadians = (degree) => (degree * Math.PI) / 180;

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
    get_dealer_details()
  }, [id])

  const get_dealer_details = async () => {

    const res = await garage_details(id)

    if (res?.success) {
      setGarageDetails(res?.data)
    }
    else {
      setGarageDetails([])
    }


  }


  const addPickupDrop = async () => {
    const user = { latitude: PickupLocation?.latitude, longitude: PickupLocation?.longitude }

    if (PickupLocation?.latitude, PickupLocation?.longitude) {
      const ls = haversineFormula(user, shopLocation)

      setPickupDistance(ls ? ls : '')
    }

    const res = await addPickupAddress(PickupLocation?.latitude, PickupLocation?.longitude, GarageDetails?._id)


    if (res?.data?._id) {
      setPickupLocationId(res?.data?._id)
    }
  }
  const createBooking = async () => {

    if (!selectedService) return errorToast('Please Choose Service')

    if (!choosePickupOption) return errorToast('Please Choose Picup_up & Drop Option')
    setLoading(true)
    const res = await create_booking(GarageDetails?._id, selectedService, choosePickupOption === 'Self' ? '' : PickupLocationId,bike?._id,BookingDate?.toString())


    if (res?.success) {

      navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE)
    }
    setLoading(false)
  }
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
    return `${day} ${month} ${year}`;
  };

  console.log('====================================');
  console.log(GarageDetails?.shopImages);
  console.log('====================================');
  return (
    <View style={styles.container}>
      {/* Header */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {loading && <Loading />}


      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Garage Image */}
        <Image source={images.grage} style={styles.garageImage} resizeMode="cover" />

        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
          style={{ position: 'absolute', top: 40, left: 10 }}>
          <Icon source={icon.back} size={30} />
        </TouchableOpacity>
        <View style={{ position: 'absolute', top: hp(18), left: 10 }}>
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
              <Text style={styles.featureText2}>Convenient Online Payment Options.</Text>
            </View>
          </View>
          <View style={[styles.featureRow, { justifyContent: 'space-between' }]}>
            <Icon source={icon.pickups} size={30} />
            <View style={{ width: '88%' }}>
              <Text style={styles.featureText}>Pick-Up & Drop ({PickupDistance?.toFixed(2)}km)</Text>
              {PickupLocationName == '' && choosePickupOption === '' && <Text style={styles.featureText2}>{GarageDetails?.pickupAndDrop ? 'We Offer Pickup & Drop Services' : 'Pickup & drop Services Not Available'}</Text>}
           

                  {choosePickupOption === 'PickDrop' &&<Text style={styles.featureText2}>{PickupLocationName}</Text> }
                  {choosePickupOption === 'Self' &&<Text style={styles.featureText2}>"Self Pickup" or "Drop by Shop"</Text>}

           

              

              {choosePickup && <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 15 }}>

                <TouchableOpacity

                  onPress={() => {
                    setPickupLocationId('Self')
                    setchoosePickupOption('Self')
                  }}

                  style={{
                    width: '25%', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: choosePickupOption === 'Self' ? color.buttonColor : '#ccc', padding: 5, borderRadius: 5
                  }}>
                  <Text style={[styles.featureText, { marginLeft: 0, fontSize: 14 }]}>Self</Text>
                </TouchableOpacity>
                <TouchableOpacity

                  onPress={() => {
                    setpickupModalVisible(true)
                    setchoosePickupOption('PickDrop')
                  }}

                  style={{
                    marginLeft: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '25%',
                    backgroundColor: choosePickupOption === 'PickDrop' ? color.buttonColor : '#ccc', padding: 5, borderRadius: 5
                  }}>
                  <Text style={[styles.featureText, { marginLeft: 0, fontSize: 14 }]}>PickDrop</Text>
                </TouchableOpacity>
              </View>
              }
            </View>
            <TouchableOpacity
              onPress={() => {
                setchoosePickup(choosePickup => !choosePickup)
              }}
              style={{}}>
              {choosePickup ? <Image source={icon.check}
                style={{ height: 22, width: 22 }} />
                : <View style={{ borderWidth: 2, borderColor: 'green', height: 20, width: 20, borderRadius: 10 }} />
              }
            </TouchableOpacity>

          </View>
          <View style={[styles.featureRow, { justifyContent: 'space-between' }]}>
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

          </View>
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={30} />
            <View>
              <Text style={styles.featureText}>Our Promise</Text>
              <Text style={styles.featureText2}>{GarageDetails?.ourPromise}</Text>

            </View>
          </View>
          <View style={styles.featureRow}>
            <Icon source={icon.Expert} size={30} />
            <View>
              <Text style={styles.featureText}>Expert Advice</Text>
              <Text style={styles.featureText2}>Skilled mechanics for your every need.</Text>

            </View>
          </View>

          {/* Services */}
          {GarageDetails?.services?.map((service, index) => (
            <TouchableOpacity
              onPress={() => {
                setselectedService(service?._id)
              }}
              key={index} style={styles.serviceContainer}>
              <View style={{
                backgroundColor: color.borderColor,
                padding: 10, marginLeft: -50,
                paddingLeft: 50,
                borderRadius: 30,
                flexDirection: 'row',
                alignItems: 'center'
              }}>

                <Text style={[styles.serviceTitle, { color: '#000', width: '92%' }]}>{service.name?.toUpperCase()}  ₹{service?.estimated_cost}</Text>

                <View style={{}}>
                  {selectedService == service?._id ? <Image source={icon.check}
                    style={{ height: 22, width: 22 }} />
                    : <View style={{ borderWidth: 2, borderColor: 'green', height: 20, width: 20, borderRadius: 10 }} />
                  }
                </View>
              </View>
              <Text style={styles.serviceText}>{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginVertical: 15, paddingHorizontal: 20, marginBottom: 60 }}>
          <CustomButton
            title='Continue'

            onPress={() => {

              createBooking()
            }}
          />
        </View>
        {BookingDateModal && (
        <DateTimePicker
          value={BookingDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
      </ScrollView>
      <MapPickerModal setModalVisible={() => {
        addPickupDrop()
        setpickupModalVisible(false)
      }}
        modalVisible={pickupModalVisible}

        driver={true}
        sendLocation={setPickupLocation}
        setLocationName={setPickupLocationName} />
    </View>
  );
};

export default GarageDetails;

const styles = StyleSheet.create({
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
    fontWeight: '600'
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
