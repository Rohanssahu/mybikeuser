import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Modal,
  StatusBar,
  TouchableOpacity,
  TextInput,
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
  get_dealer_services,
} from '../../redux/Api/apiRequests';
import Geolocation from '@react-native-community/geolocation';
import MapPickerModal from './MapPicker';
import Loading from '../../configs/Loader';
import {errorToast} from '../../configs/customToast';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showBookingNotification} from '../../component/Notification';
import {color} from '../../constant';
import {icon} from '../../component/Image';
import {hp} from '../../component/utils/Constant';
import Icon from '../../component/Icon';
import GarageImage from './GarageBanner';

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

  // service picker modal
  const [serviceModal, setServiceModal] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    requestLocationPermission();
  }, [garageData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchGarageDetails();
  }, [id]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (!garageData?.latitude || !garageData?.longitude) {
      return;
    }
    Geolocation.getCurrentPosition(
      position => {
        setDistance(
          haversine(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            {latitude: garageData.latitude, longitude: garageData.longitude},
          ),
        );
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

  const dedupeServices = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter(s => {
      const k = s.serviceId ?? s._id;
      if (seen.has(k)) {
        return false;
      }
      seen.add(k);
      return true;
    });
  };

  const fetchGarageDetails = async () => {
    const digitsOnly = bike?.bike_cc?.toString().replace(/\D/g, '') || '';
    const [detailsRes, servicesRes] = await Promise.all([
      garage_details(id, digitsOnly),
      get_dealer_services(id),
    ]);

    if (detailsRes?.success) {
      let services: any[] = [];
      if (Array.isArray(servicesRes?.data) && servicesRes.data.length > 0) {
        const variantId = bike?.variant_id ?? bike?.variantId ?? null;
        const byVariant = variantId
          ? servicesRes.data.filter(
              (s: any) =>
                s.variantId === variantId || s.variant_id === variantId,
            )
          : [];
        services = dedupeServices(
          byVariant.length > 0 ? byVariant : servicesRes.data,
        );
      } else {
        services = detailsRes.data.services || [];
      }
      setGarageData({...detailsRes.data, services});
    } else {
      setGarageData(null);
    }
  };

  const addPickupDrop = async () => {
    if (PickupLocation?.latitude && PickupLocation?.longitude) {
      setPickupDistance(
        haversine(PickupLocation, {
          latitude: garageData?.latitude,
          longitude: garageData?.longitude,
        }),
      );
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
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const createBooking = async () => {
    if (!selectedService) {
      return errorToast('Please choose a service');
    }
    if (!choosePickupOption) {
      return errorToast('Please choose pickup or visit option');
    }
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
        (s: any) => (s.serviceId ?? s._id) === selectedService,
      );
      showBookingNotification(
        svc?.serviceName ?? svc?.base_service_id?.name ?? 'Service',
        garageData?.shopName,
        formatDate(BookingDate),
      );
      navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE);
    }
    setLoading(false);
  };

  const selectedSvc = garageData?.services?.find(
    (s: any) => (s.serviceId ?? s._id) === selectedService,
  );

  const filteredServices: any[] = useMemo(() => {
    const all: any[] = garageData?.services ?? [];
    const q = serviceSearch.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter((s: any) =>
      (s.serviceName ?? s.base_service_id?.name ?? '')
        .toLowerCase()
        .includes(q),
    );
  }, [garageData?.services, serviceSearch]);

  const openServiceModal = useCallback(() => {
    setServiceSearch('');
    setServiceModal(true);
  }, []);

  const renderServiceItem = useCallback(
    ({item}: {item: any}) => {
      const itemId = item.serviceId ?? item._id;
      const name = (
        item.serviceName ??
        item.base_service_id?.name ??
        ''
      ).toUpperCase();
      const price = item.price ?? item?.bikes?.[0]?.price ?? 0;
      const active = selectedService === itemId;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.gridCard, active && styles.gridCardActive]}
          onPress={() => {
            setSelectedService(itemId);
            setServiceModal(false);
          }}>
          {/* image */}
          {item.serviceImage ? (
            <Image
              source={{uri: item.serviceImage}}
              style={styles.gridCardImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gridCardImgEmpty}>
              <Text style={styles.gridCardEmoji}>🔧</Text>
            </View>
          )}

          {/* name + price */}
          <View style={styles.gridCardBody}>
            <Text style={styles.gridCardName} numberOfLines={2}>
              {name}
            </Text>
            <Text style={styles.gridCardPrice}>₹{price}</Text>
          </View>

          {/* selected checkmark badge */}
          {active && (
            <View style={styles.gridCardCheck}>
              <Text style={styles.gridCardCheckText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedService],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {loading && <Loading />}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <GarageImage shopImages={garageData?.shopImages} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Icon source={icon.back} size={30} />
        </TouchableOpacity>
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
          {/* About */}
          {garageData?.shopDescription ? (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descText}>{garageData.shopDescription}</Text>
            </>
          ) : null}

          {/* Go Digital */}
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={28} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Go Digital</Text>
              <Text style={styles.featureDesc}>
                Convenient online payment options
              </Text>
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
                <Text style={styles.featureDesc}>
                  Self visit / drop by shop
                </Text>
              ) : (
                <Text style={styles.featureDesc}>
                  {garageData?.pickupAndDrop
                    ? 'We offer pickup & drop'
                    : 'Pickup & drop not available'}
                </Text>
              )}
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
                      choosePickupOption === 'Visit' &&
                        styles.optionBtnTextActive,
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
                      choosePickupOption === 'PickDrop' &&
                        styles.optionBtnTextActive,
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
            <Icon source={icon.calendar} size={26} tintColor="#FED428" />
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

          {/* ── Select Service ── */}
          <Text style={styles.sectionTitle}>Select Service</Text>

          {(garageData?.services?.length ?? 0) > 0 ? (
            <TouchableOpacity
              style={[
                styles.servicePicker,
                !!selectedSvc && styles.servicePickerSelected,
              ]}
              activeOpacity={0.8}
              onPress={openServiceModal}>
              <View style={styles.servicePickerLeft}>
                {selectedSvc?.serviceImage ? (
                  <Image
                    source={{uri: selectedSvc.serviceImage}}
                    style={styles.servicePickerThumb}
                  />
                ) : (
                  <View style={styles.servicePickerIcon}>
                    <Text style={styles.servicePickerEmoji}>🔧</Text>
                  </View>
                )}
                <View style={styles.servicePickerMid}>
                  {selectedSvc ? (
                    <>
                      <Text style={styles.servicePickerName} numberOfLines={1}>
                        {(
                          selectedSvc.serviceName ??
                          selectedSvc.base_service_id?.name ??
                          ''
                        ).toUpperCase()}
                      </Text>
                      <Text style={styles.servicePickerPrice}>
                        ₹
                        {selectedSvc.price ??
                          selectedSvc?.bikes?.[0]?.price ??
                          0}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.servicePickerPlaceholder}>
                      Tap to choose from {garageData?.services.length} services
                    </Text>
                  )}
                </View>
              </View>
              <Icon source={icon.rightarrow} size={18} />
            </TouchableOpacity>
          ) : (
            <View style={styles.noServiceBox}>
              <Text style={styles.noServiceText}>No services added yet</Text>
            </View>
          )}
        </View>

        {/* Book Now */}
        {(garageData?.services?.length ?? 0) > 0 && (
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
              if (selectedDate) {
                setBookingDate(selectedDate);
              }
            }}
          />
        )}
      </ScrollView>

      {/* ── Service Picker — bottom-sheet Modal ── */}
      <Modal
        visible={serviceModal}
        transparent={true}
        animationType="slide"
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => setServiceModal(false)}>
        {/* full-screen container with dark bg */}
        <View style={styles.modalRoot}>
          {/* backdrop: tap to close */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setServiceModal(false)}
          />

          {/* sheet sits at bottom */}
          <View style={styles.sheet}>
            {/* drag handle */}
            <View style={styles.sheetHandle} />

            {/* header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a Service</Text>
              <TouchableOpacity
                onPress={() => setServiceModal(false)}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIconText}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search services..."
                placeholderTextColor="#777"
                value={serviceSearch}
                onChangeText={setServiceSearch}
                returnKeyType="search"
                autoCorrect={false}
              />
              {serviceSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setServiceSearch('')}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.resultCount}>
              {serviceSearch.trim()
                ? `${filteredServices.length} result${
                    filteredServices.length !== 1 ? 's' : ''
                  } for "${serviceSearch.trim()}"`
                : `${filteredServices.length} service${
                    filteredServices.length !== 1 ? 's' : ''
                  } available`}
            </Text>

            {/* 2-column grid */}
            <FlatList
              data={filteredServices}
              keyExtractor={item => item.serviceId ?? item._id}
              renderItem={renderServiceItem}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>
                    No services match "{serviceSearch}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => setServiceSearch('')}
                    style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              }
              contentContainerStyle={styles.flatListPad}
            />
          </View>
        </View>
      </Modal>

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
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
    left: 10,
  },
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
  featureDescDate: {
    fontSize: 13,
    color: '#FED428',
    fontWeight: '600',
    marginTop: 3,
  },

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

  /* ── service picker ── */
  servicePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: color.borderColor,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
  },
  servicePickerSelected: {
    borderColor: color.buttonColor,
    backgroundColor: '#fffdf0',
  },
  servicePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  servicePickerThumb: {width: 38, height: 38, borderRadius: 8},
  servicePickerIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicePickerEmoji: {fontSize: 18},
  servicePickerMid: {flex: 1},
  servicePickerName: {fontSize: 13, fontWeight: '700', color: '#111'},
  servicePickerPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2,
  },
  servicePickerPlaceholder: {fontSize: 14, color: '#888'},

  noServiceBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  noServiceText: {color: '#aaa', fontSize: 14},
  bookBtnWrapper: {marginHorizontal: 16, marginVertical: 24},

  /* ── bottom-sheet modal ── */
  overlay: {flex: 1, justifyContent: 'flex-end'},
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 24,
    
    borderTopRightRadius: 24,

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    height: '88%',
    paddingBottom: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sheetTitle: {fontSize: 17, fontWeight: '800', color: '#fff'},
  sheetClose: {fontSize: 16, color: '#888', paddingLeft: 12},

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginHorizontal: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
    marginBottom: 6,
  },
  searchIconText: {fontSize: 14},
  searchInput: {flex: 1, fontSize: 14, color: '#fff'},
  searchClear: {fontSize: 13, color: '#888'},
  resultCount: {
    fontSize: 11,
    color: '#666',
    marginHorizontal: 18,
    marginBottom: 8,
  },

  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalRowActive: {backgroundColor: 'rgba(254,212,40,0.07)'},
  modalImg: {width: 56, height: 56, borderRadius: 10},
  modalImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImgEmoji: {fontSize: 22},
  modalBody: {flex: 1},
  modalName: {fontSize: 13, fontWeight: '700', color: '#fff', lineHeight: 18},
  modalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: color.buttonColor,
    marginTop: 4,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {borderColor: color.buttonColor},
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: color.buttonColor,
  },

  emptyBox: {paddingVertical: 40, alignItems: 'center', gap: 10},
  emptyEmoji: {fontSize: 32},
  emptyText: {fontSize: 14, color: '#888'},
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(254,212,40,0.15)',
    borderWidth: 1,
    borderColor: color.buttonColor,
    marginTop: 4,
  },
  clearBtnText: {fontSize: 13, color: color.buttonColor, fontWeight: '700'},
  flatListPad: {paddingBottom: 32, paddingHorizontal: 10},

  /* modal root + backdrop */
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  /* 2-col grid */
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  /* grid card */
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  gridCardActive: {
    borderColor: color.buttonColor,
    backgroundColor: 'rgba(254,212,40,0.08)',
  },
  gridCardImg: {width: '100%', height: 100},
  gridCardImgEmpty: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardEmoji: {fontSize: 30},
  gridCardBody: {padding: 8},
  gridCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 15,
  },
  gridCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: color.buttonColor,
    marginTop: 4,
  },
  gridCardCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardCheckText: {fontSize: 12, fontWeight: '800', color: '#000'},
});
