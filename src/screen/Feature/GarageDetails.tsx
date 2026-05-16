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
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import {useRoute} from '@react-navigation/native';
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
import {Dropdown} from 'react-native-element-dropdown';
import {color} from '../../constant';
import {icon, default as images} from '../../component/Image';
import {hp} from '../../component/utils/Constant';
import Icon from '../../component/Icon';

const GarageDetails: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute();
  const [garageData, setGarageData] = useState<any>(null);
  const {bike, id} = route.params as {bike: any; id: string};
  const [distance, setDistance] = useState<number | null>(null);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [PickupLocation, setPickupLocation] = useState<any>('');
  const [PickupLocationName, setPickupLocationName] = useState('');
  const [PickupLocationId, setPickupLocationId] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [choosePickupOption, setChoosePickupOption] = useState('');
  const [PickupDistance, setPickupDistance] = useState<number | null>(null);
  const [BookingDate, setBookingDate] = useState(new Date());
  const [BookingDateModal, setBookingDateModal] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { requestLocationPermission(); }, [garageData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchGarageDetails(); }, [id]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {return;}
    }
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (!garageData?.latitude || !garageData?.longitude) {return;}
    Geolocation.getCurrentPosition(
      position => {
        const userLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const d = haversine(userLoc, {
          latitude: garageData.latitude,
          longitude: garageData.longitude,
        });
        setDistance(d);
      },
      error => console.error('Location error:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const haversine = (start: any, end: any) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(end.latitude - start.latitude);
    const dLon = toRad(end.longitude - start.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(start.latitude)) *
        Math.cos(toRad(end.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchGarageDetails = async () => {
    const digitsOnly = bike?.bike_cc?.toString().replace(/\D/g, '') || '';
    const res = await garage_details(id, digitsOnly);
    if (res?.success) {
      setGarageData(res.data);
    } else {
      setGarageData(null);
    }
  };

  const addPickupDrop = async () => {
    if (PickupLocation?.latitude && PickupLocation?.longitude) {
      const d = haversine(PickupLocation, {
        latitude: garageData?.latitude,
        longitude: garageData?.longitude,
      });
      setPickupDistance(d);
    }
    const user_id = (await AsyncStorage.getItem('user_id')) ?? '';
    const res = await addPickupAddress(
      PickupLocation?.latitude,
      PickupLocation?.longitude,
      garageData?._id,
      user_id,
    );
    if (res?.data?._id) {
      setPickupLocationId(res.data._id);
    }
  };

  const formatDate = (date: Date) => {
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const createBooking = async () => {
    if (!selectedService) {return errorToast('Please choose a service');}
    if (!choosePickupOption) {return errorToast('Please choose pickup or visit option');}
    setLoading(true);
    const res = await create_booking(
      garageData?._id,
      selectedService,
      choosePickupOption === 'Visit' ? '' : PickupLocationId,
      bike?._id,
      BookingDate.toString(),
    );
    if (res?.success) {
      const svc = garageData?.services?.find(
        (s: any) => s._id === selectedService,
      );
      showBookingNotification(
        svc?.base_service_id?.name || 'Service',
        garageData?.shopName,
        formatDate(BookingDate),
      );
      navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE);
    }
    setLoading(false);
  };

  const selectedSvc = garageData?.services?.find(
    (s: any) => s._id === selectedService,
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {loading && <Loading />}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <Image
          source={images.grage}
          style={styles.garageImage}
          resizeMode="cover"
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Icon source={icon.back} size={30} />
        </TouchableOpacity>

        {/* Name + address overlay */}
        <View style={styles.heroInfo}>
          <Text style={styles.heroTitle}>{garageData?.shopName}</Text>
          <Text style={styles.heroAddress}>{garageData?.address}</Text>
          <View style={styles.infoRow}>
            <Icon source={icon.pin} size={14} />
            <Text style={styles.infoText}>
              {distance !== null ? `${distance.toFixed(1)} km` : '—'}
            </Text>
            <Icon source={icon.star} size={14} />
            <Text style={styles.infoText}>
              {garageData?.averageRating || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          {garageData?.shopDescription ? (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descText}>{garageData.shopDescription}</Text>
            </>
          ) : null}

          {/* Features row */}
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={28} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Go Digital</Text>
              <Text style={styles.featureDesc}>Convenient online payment options</Text>
            </View>
          </View>

          {/* Pickup & Drop */}
          <View style={styles.featureRow}>
            <Icon source={icon.pickups} size={28} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>
                Pickup & Drop
                {PickupDistance !== null
                  ? ` (${PickupDistance.toFixed(1)} km)`
                  : ''}
              </Text>
              {choosePickupOption === 'PickDrop' && PickupLocationName ? (
                <Text style={styles.featureDesc}>{PickupLocationName}</Text>
              ) : choosePickupOption === 'Visit' ? (
                <Text style={styles.featureDesc}>Self visit / drop by shop</Text>
              ) : (
                <Text style={styles.featureDesc}>
                  {garageData?.pickupAndDrop
                    ? 'We offer pickup & drop'
                    : 'Pickup & drop not available'}
                </Text>
              )}

              {/* Option buttons */}
              <View style={styles.pickupOptions}>
                <TouchableOpacity
                  onPress={() => {
                    setPickupLocationId('Visit');
                    setChoosePickupOption('Visit');
                  }}
                  style={[
                    styles.optionBtn,
                    choosePickupOption === 'Visit' && styles.optionBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.optionBtnText,
                      choosePickupOption === 'Visit' && styles.optionBtnTextActive,
                    ]}>
                    Visit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setPickupModalVisible(true);
                    setChoosePickupOption('PickDrop');
                  }}
                  style={[
                    styles.optionBtn,
                    choosePickupOption === 'PickDrop' && styles.optionBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.optionBtnText,
                      choosePickupOption === 'PickDrop' && styles.optionBtnTextActive,
                    ]}>
                    Pickup & Drop
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Booking Date */}
          <TouchableOpacity
            onPress={() => setBookingDateModal(true)}
            style={styles.featureRow}
            activeOpacity={0.7}>
            <Icon source={icon.calendar} size={26} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Booking Date</Text>
              <Text style={styles.featureDescDate}>
                {formatDate(BookingDate)}
              </Text>
              <Text style={styles.featureDesc}>Tap to change date</Text>
            </View>
            <Icon source={icon.rightarrow} size={20} />
          </TouchableOpacity>

          {/* Our Promise */}
          <View style={styles.featureRow}>
            <Icon source={icon.Expert} size={28} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Our Promise</Text>
              <Text style={styles.featureDesc}>
                {garageData?.ourPromise ||
                  'Fast, reliable and affordable bike service.'}
              </Text>
            </View>
          </View>

          {/* Service Selection */}
          <Text style={styles.sectionTitle}>Select Service</Text>

          {garageData?.services?.length > 0 ? (
            <>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={garageData.services.map((s: any) => ({
                  label: `${s.base_service_id?.name?.toUpperCase()} — ₹${
                    s?.bikes?.[0]?.price || 0
                  }`,
                  value: s._id,
                }))}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Choose a service"
                value={selectedService}
                onChange={item => setSelectedService(item.value)}
                itemTextStyle={styles.dropdownItemText}
              />

              {selectedSvc && (
                <View style={styles.serviceCard}>
                  <Text style={styles.svcName}>
                    {selectedSvc.base_service_id?.name?.toUpperCase()}
                  </Text>
                  <Text style={styles.svcPrice}>
                    ₹{selectedSvc?.bikes?.[0]?.price || 0}
                  </Text>
                  {selectedSvc.description ? (
                    <>
                      <Text style={styles.svcIncLabel}>What's included:</Text>
                      <Text style={styles.svcDesc}>{selectedSvc.description}</Text>
                    </>
                  ) : null}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noServiceBox}>
              <Text style={styles.noServiceText}>No services added yet</Text>
            </View>
          )}
        </View>

        {/* Book Now */}
        {garageData?.services?.length > 0 && (
          <View style={styles.bookBtnWrapper}>
            <CustomButton
              title="Book Now"
              disable={!selectedService}
              onPress={createBooking}
            />
          </View>
        )}

        {BookingDateModal && (
          <DateTimePicker
            value={BookingDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(_event, selectedDate) => {
              setBookingDateModal(Platform.OS === 'ios');
              if (selectedDate) {setBookingDate(selectedDate);}
            }}
          />
        )}
      </ScrollView>

      <MapPickerModal
        setModalVisible={() => {
          addPickupDrop();
          setPickupModalVisible(false);
        }}
        modalVisible={pickupModalVisible}
        sendLocation={setPickupLocation}
        setLocationName={setPickupLocationName}
      />
    </View>
  );
};

export default GarageDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  garageImage: {width: '100%', height: hp(30)},
  backBtn: {position: 'absolute', top: 40, left: 10},
  heroInfo: {position: 'absolute', top: hp(18), left: 10, right: 10},
  heroTitle: {fontSize: 22, fontWeight: '700', color: '#fff'},
  heroAddress: {fontSize: 12, color: '#ddd', marginTop: 4},
  infoRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  infoText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    marginRight: 12,
    fontWeight: '500',
  },
  body: {padding: 16},
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  descText: {fontSize: 14, color: '#A0A3BD', lineHeight: 20},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  featureInfo: {flex: 1, marginLeft: 12},
  featureTitle: {fontSize: 14, fontWeight: '600', color: '#fff'},
  featureDesc: {fontSize: 12, color: '#A1A1A1', marginTop: 3, lineHeight: 18},
  featureDescDate: {fontSize: 13, color: '#FED428', fontWeight: '600', marginTop: 3},
  pickupOptions: {flexDirection: 'row', marginTop: 10, gap: 10},
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  optionBtnText: {fontSize: 13, color: '#fff', fontWeight: '600'},
  optionBtnTextActive: {color: '#000'},
  dropdown: {
    height: 52,
    borderColor: color.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  placeholderStyle: {color: '#888', fontSize: 14},
  selectedTextStyle: {color: '#111', fontSize: 14, fontWeight: '500'},
  dropdownItemText: {color: '#111'},
  serviceCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  svcName: {fontSize: 15, fontWeight: '700', color: '#111'},
  svcPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 4,
  },
  svcIncLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  svcDesc: {fontSize: 13, color: '#555', lineHeight: 19},
  noServiceBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  noServiceText: {color: '#aaa', fontSize: 14},
  bookBtnWrapper: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
