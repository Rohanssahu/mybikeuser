import React, {useEffect, useMemo, useState} from 'react';
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
import Icon from '../../component/Icon';
import GarageImage from './GarageBanner';

const PICKUP_RATE_PER_KM = 15;
const GST_RATE = 0.18;

type Step = 0 | 1 | 2 | 3;

const ReviewRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.reviewRow}>
    <Text style={styles.reviewLabel}>{label}</Text>
    <Text style={styles.reviewValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const GarageDetails: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute();
  const {bike, id, serviceId: incomingServiceId} = route.params as {
    bike: any;
    id: string;
    serviceId?: string;
  };

  const [garageData, setGarageData] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(0);

  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [PickupLocation, setPickupLocation] = useState<any>('');
  const [PickupLocationName, setPickupLocationName] = useState('');
  const [PickupLocationId, setPickupLocationId] = useState('');
  const [PickupDistance, setPickupDistance] = useState<number | null>(null);
  const [choosePickupOption, setChoosePickupOption] = useState('');

  const [selectedService, setSelectedService] = useState('');

  const [BookingDate, setBookingDate] = useState(new Date());
  const [BookingTime, setBookingTime] = useState(() => {
    const t = new Date();
    t.setHours(10, 0, 0, 0);
    return t;
  });
  const [BookingDateModal, setBookingDateModal] = useState(false);
  const [BookingTimeModal, setBookingTimeModal] = useState(false);

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
      if (incomingServiceId) {
        const match = services.find(
          (s: any) => (s.serviceId ?? s._id) === incomingServiceId,
        );
        if (match) {
          setSelectedService(match.serviceId ?? match._id);
        }
      }
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
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 || 12;
    return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const selectedSvc = useMemo(
    () =>
      garageData?.services?.find(
        (s: any) => (s.serviceId ?? s._id) === selectedService,
      ),
    [garageData, selectedService],
  );

  const servicePrice: number =
    selectedSvc?.price ?? selectedSvc?.bikes?.[0]?.price ?? 0;
  const pickupCharge: number =
    choosePickupOption === 'PickDrop'
      ? garageData?.pickupCharge ??
        Math.round((PickupDistance ?? 0) * PICKUP_RATE_PER_KM)
      : 0;
  const gstAmount: number = Math.round(servicePrice * GST_RATE);
  const totalPayable: number = servicePrice + pickupCharge + gstAmount;

  const getServiceName = (svc: any) =>
    (svc?.serviceName ?? svc?.base_service_id?.name ?? '').toUpperCase();

  const getServicePrice = (svc: any): number =>
    svc?.price ?? svc?.bikes?.[0]?.price ?? 0;

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
      showBookingNotification(
        getServiceName(selectedSvc),
        garageData?.shopName,
        formatDate(BookingDate),
      );
      navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE, {
        bookingId: res?.data?._id ?? res?.data?.bookingId ?? '',
        garageName: garageData?.shopName ?? '',
        serviceName: getServiceName(selectedSvc),
        date: `${formatDate(BookingDate)}, ${formatTime(BookingTime)}`,
        amount: totalPayable,
      });
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const stepTitles: string[] = [
    'Select Service',
    'Booking Details',
    'Booking Summary',
    'Review & Confirm',
  ];

  // ─── Step Indicator ───────────────────────────────────────────

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {([0, 1, 2, 3] as const).map(i => (
        <React.Fragment key={i}>
          <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
            <Text
              style={[
                styles.stepDotText,
                i <= step && styles.stepDotTextActive,
              ]}>
              {i + 1}
            </Text>
          </View>
          {i < 3 && (
            <View
              style={[styles.stepLine, i < step && styles.stepLineActive]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // ─── Step 0: Service Selection ────────────────────────────────

  const renderStep0 = () => (
    <View>
      <Text style={styles.sectionTitle}>Available Services</Text>

      {(garageData?.services?.length ?? 0) === 0 ? (
        <View style={styles.noServiceBox}>
          <Text style={styles.noServiceText}>No services available</Text>
        </View>
      ) : (
        garageData.services.map((svc: any) => {
          const itemId = svc.serviceId ?? svc._id;
          const active = selectedService === itemId;
          const description =
            svc.description ?? svc.base_service_id?.description ?? '';
          const includes: string[] =
            svc.includes ??
            svc.whatsIncluded ??
            svc.base_service_id?.includes ??
            [];

          return (
            <TouchableOpacity
              key={itemId}
              activeOpacity={0.85}
              style={[styles.serviceCard, active && styles.serviceCardActive]}
              onPress={() => setSelectedService(itemId)}>
              {active && (
                <View style={styles.serviceCardBadge}>
                  <Text style={styles.serviceCardBadgeText}>✓</Text>
                </View>
              )}
              <View style={styles.serviceCardContent}>
                {svc.serviceImage ? (
                  <Image
                    source={{uri: svc.serviceImage}}
                    style={styles.serviceCardImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.serviceCardImg,
                      styles.serviceCardImgEmpty,
                    ]}>
                    <Text style={styles.serviceCardEmoji}>🔧</Text>
                  </View>
                )}
                <View style={styles.serviceCardBody}>
                  <View style={styles.serviceCardTopRow}>
                    <Text
                      style={styles.serviceCardName}
                      numberOfLines={2}>
                      {getServiceName(svc)}
                    </Text>
                    <Text style={styles.serviceCardPrice}>
                      ₹{getServicePrice(svc)}
                    </Text>
                  </View>
                  {!!description && (
                    <Text
                      style={styles.serviceCardDesc}
                      numberOfLines={2}>
                      {description}
                    </Text>
                  )}
                  {includes.length > 0 && (
                    <View style={styles.includesRow}>
                      {includes.slice(0, 4).map((item: string, idx: number) => (
                        <View key={idx} style={styles.includeTag}>
                          <Text style={styles.includeTagText}>✓ {item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {garageData?.shopDescription ? (
        <>
          <Text style={styles.sectionTitleSpaced}>About</Text>
          <Text style={styles.descText}>{garageData.shopDescription}</Text>
        </>
      ) : null}

      <View style={styles.featureRow}>
        <Icon source={icon.Mobile} size={28} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>Go Digital</Text>
          <Text style={styles.featureDesc}>
            Convenient online payment options
          </Text>
        </View>
      </View>

      <View style={styles.featureRowLast}>
        <Icon source={icon.Expert} size={28} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>Our Promise</Text>
          <Text style={styles.featureDesc}>
            {garageData?.ourPromise ||
              'Fast, reliable and affordable bike service.'}
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Step 2 (renders at step=2): Booking Summary ─────────────

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Selected Service</Text>
      <View style={styles.selectedSvcCard}>
        {selectedSvc?.serviceImage ? (
          <Image
            source={{uri: selectedSvc.serviceImage}}
            style={styles.selectedSvcImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.selectedSvcImg, styles.selectedSvcImgEmpty]}>
            <Text style={styles.emojiLg}>🔧</Text>
          </View>
        )}
        <View style={styles.selectedSvcBody}>
          <Text style={styles.selectedSvcName} numberOfLines={2}>
            {getServiceName(selectedSvc)}
          </Text>
          <Text style={styles.selectedSvcPrice}>₹{servicePrice}</Text>
        </View>
        <TouchableOpacity style={styles.changeBtn} onPress={() => setStep(0)}>
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Charges Breakdown</Text>
      <View style={styles.chargesCard}>
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Service Charge</Text>
          <Text style={styles.chargeValue}>₹{servicePrice}</Text>
        </View>
        <View style={styles.chargeDivider} />
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Pickup & Drop</Text>
          <Text style={styles.chargeValue}>
            {choosePickupOption === 'PickDrop'
              ? `₹${garageData?.pickupCharge ?? pickupCharge}`
              : 'Not applicable'}
          </Text>
        </View>
        <View style={styles.chargeDivider} />
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Tax / GST (18%)</Text>
          <Text style={styles.chargeValue}>₹{gstAmount}</Text>
        </View>
        <View style={styles.chargeTotalDivider} />
        <View style={styles.chargeRow}>
          <Text style={styles.chargeTotalLabel}>Total Payable</Text>
          <Text style={styles.chargeTotalValue}>₹{totalPayable}</Text>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerIcon}>🛡️</Text>
        <View style={styles.flex1}>
          <Text style={styles.disclaimerTitle}>No Hidden Charges</Text>
          <Text style={styles.disclaimerText}>
            The displayed price covers only the selected service package. Any
            additional repairs or maintenance identified during inspection will
            only be performed after your approval and may incur extra charges.
            The service center must inform you before proceeding.
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Step 1 (renders at step=1): Booking Details ─────────────

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Your Vehicle</Text>
      <View style={styles.featureRow}>
        <Icon source={icon.bikep} size={28} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>
            {bike?.name ?? bike?.model ?? 'Your Bike'}
          </Text>
          {!!bike?.plate_number && (
            <Text style={styles.featureDesc}>{bike.plate_number}</Text>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Date & Time</Text>
      <TouchableOpacity
        onPress={() => setBookingDateModal(true)}
        style={styles.featureRow}
        activeOpacity={0.7}>
        <Icon source={icon.calendar} size={26} tintColor={color.buttonColor} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>Booking Date</Text>
          <Text style={styles.featureDescDate}>{formatDate(BookingDate)}</Text>
          <Text style={styles.featureDesc}>Tap to change</Text>
        </View>
        <Icon source={icon.rightarrow} size={20} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setBookingTimeModal(true)}
        style={styles.featureRowMt}
        activeOpacity={0.7}>
        <Icon source={icon.calendar} size={26} tintColor={color.buttonColor} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>Preferred Time</Text>
          <Text style={styles.featureDescDate}>{formatTime(BookingTime)}</Text>
          <Text style={styles.featureDesc}>Tap to change</Text>
        </View>
        <Icon source={icon.rightarrow} size={20} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Pickup & Drop</Text>
      <View style={styles.featureRow}>
        <Icon source={icon.pickups} size={28} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>How will you bring your bike?</Text>
          {choosePickupOption === 'PickDrop' && PickupLocationName ? (
            <Text style={styles.featureDesc}>{PickupLocationName}</Text>
          ) : choosePickupOption === 'Visit' ? (
            <Text style={styles.featureDesc}>Self visit / drop by shop</Text>
          ) : (
            <Text style={styles.featureDesc}>
              {garageData?.pickupAndDrop
                ? 'Pickup & Drop available'
                : 'Choose an option below'}
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
                  choosePickupOption === 'PickDrop' &&
                    styles.optionBtnTextActive,
                ]}>
                {`Pickup & Drop${
                  PickupDistance !== null
                    ? ` (${PickupDistance.toFixed(1)} km)`
                    : ''
                }`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // ─── Step 3: Review & Confirm ─────────────────────────────────

  const renderStep3 = () => (
    <View style={styles.stepContentLast}>
      <Text style={styles.sectionTitle}>Booking Summary</Text>
      <View style={styles.reviewCard}>
        <ReviewRow label="Garage" value={garageData?.shopName ?? ''} />
        <ReviewRow label="Service" value={getServiceName(selectedSvc)} />
        <ReviewRow
          label="Vehicle"
          value={bike?.name ?? bike?.model ?? 'Your Bike'}
        />
        <ReviewRow
          label="Date & Time"
          value={`${formatDate(BookingDate)}, ${formatTime(BookingTime)}`}
        />
        <ReviewRow
          label="Pickup"
          value={
            choosePickupOption === 'Visit'
              ? 'Self Visit'
              : PickupLocationName || 'Pickup & Drop'
          }
        />
      </View>

      <Text style={styles.sectionTitle}>Payment Breakdown</Text>
      <View style={styles.chargesCard}>
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Service Charge</Text>
          <Text style={styles.chargeValue}>₹{servicePrice}</Text>
        </View>
        {choosePickupOption === 'PickDrop' && (
          <>
            <View style={styles.chargeDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Pickup & Drop</Text>
              <Text style={styles.chargeValue}>₹{pickupCharge}</Text>
            </View>
          </>
        )}
        <View style={styles.chargeDivider} />
        <View style={styles.chargeRow}>
          <Text style={styles.chargeLabel}>Tax / GST (18%)</Text>
          <Text style={styles.chargeValue}>₹{gstAmount}</Text>
        </View>
        <View style={styles.chargeTotalDivider} />
        <View style={styles.chargeRow}>
          <Text style={styles.chargeTotalLabel}>Total Payable</Text>
          <Text style={styles.chargeTotalValue}>₹{totalPayable}</Text>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerIcon}>🛡️</Text>
        <View style={styles.flex1}>
          <Text style={styles.disclaimerTitle}>No Hidden Charges</Text>
          <Text style={styles.disclaimerText}>
            No hidden charges. Any additional repairs or maintenance identified
            during inspection will only be performed after customer approval.
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Bottom Bar ───────────────────────────────────────────────

  const renderBottomBar = () => {
    if (step === 0) {
      return (
        <View style={styles.bottomBar}>
          <CustomButton
            title="Continue to Booking Details"
            disable={!selectedService}
            onPress={() => setStep(1)}
          />
        </View>
      );
    }
    if (step === 1) {
      return (
        <View style={styles.bottomBar}>
          <CustomButton
            title="View Charges"
            disable={!choosePickupOption}
            onPress={() => setStep(2)}
          />
        </View>
      );
    }
    if (step === 2) {
      return (
        <View style={styles.bottomBar}>
          <CustomButton
            title="Review & Confirm"
            onPress={() => setStep(3)}
          />
        </View>
      );
    }
    return (
      <View style={styles.bottomBar}>
        <CustomButton title="Confirm Booking" onPress={createBooking} />
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {loading && <Loading />}

      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        activeOpacity={0.8}>
        <Icon source={icon.back} size={30} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <GarageImage shopImages={garageData?.shopImages} />

        {/* Garage info below hero */}
        <View style={styles.garageInfoBar}>
          <Text style={styles.heroTitle} numberOfLines={1}>
            {garageData?.shopName}
          </Text>
          <Text style={styles.heroAddress} numberOfLines={2}>
            {garageData?.address}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Icon source={icon.pin} size={12} />
              <Text style={styles.infoChipText}>
                {distance !== null ? `${distance.toFixed(1)} km` : '—'}
              </Text>
            </View>
            <View style={styles.infoChip}>
              <Icon source={icon.star} size={12} />
              <Text style={styles.infoChipText}>
                {garageData?.averageRating || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Step indicator */}
        <View style={styles.stepWrapper}>
          {renderStepIndicator()}
          <Text style={styles.stepLabel}>{stepTitles[step]}</Text>
        </View>

        {/* Step content */}
        <View style={styles.body}>
          {step === 0 && renderStep0()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep1()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>

      {renderBottomBar()}

      {BookingDateModal && (
        <DateTimePicker
          value={BookingDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_event, d) => {
            setBookingDateModal(Platform.OS === 'ios');
            if (d) {
              setBookingDate(d);
            }
          }}
        />
      )}

      {BookingTimeModal && (
        <DateTimePicker
          value={BookingTime}
          mode="time"
          display="default"
          onChange={(_event, t) => {
            setBookingTimeModal(Platform.OS === 'ios');
            if (t) {
              setBookingTime(t);
            }
          }}
        />
      )}

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
    zIndex: 10,
  },

  // ── Garage info ──
  garageInfoBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  heroTitle: {fontSize: 20, fontWeight: '700', color: '#fff'},
  heroAddress: {fontSize: 12, color: '#A0A3BD', marginTop: 3},
  infoRow: {flexDirection: 'row', marginTop: 10, gap: 8},
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  infoChipText: {fontSize: 12, color: '#fff', fontWeight: '600'},

  // ── Step indicator ──
  stepWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stepRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {backgroundColor: color.buttonColor},
  stepDotText: {fontSize: 12, fontWeight: '700', color: '#555'},
  stepDotTextActive: {color: '#000'},
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  stepLineActive: {backgroundColor: color.buttonColor},
  stepLabel: {fontSize: 15, fontWeight: '700', color: '#fff'},

  // ── Body ──
  body: {paddingHorizontal: 16, paddingTop: 4},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitleSpaced: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
    marginBottom: 10,
  },
  stepContent: {paddingBottom: 100},
  stepContentLast: {paddingBottom: 120},
  featureRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  featureRowMt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  emojiLg: {fontSize: 22},
  chargeValueMuted: {fontSize: 12, color: '#888', fontWeight: '600'},
  flex1: {flex: 1},
  descText: {fontSize: 13, color: '#A0A3BD', lineHeight: 20},

  // ── Service cards ──
  serviceCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
    overflow: 'hidden',
  },
  serviceCardActive: {
    borderColor: color.buttonColor,
    backgroundColor: 'rgba(254,212,40,0.06)',
  },
  serviceCardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  serviceCardBadgeText: {fontSize: 13, fontWeight: '800', color: '#000'},
  serviceCardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
  },
  serviceCardImg: {width: 72, height: 72, borderRadius: 10},
  serviceCardImgEmpty: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardEmoji: {fontSize: 28},
  serviceCardBody: {flex: 1, marginLeft: 12},
  serviceCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 30,
  },
  serviceCardName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 18,
  },
  serviceCardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: color.buttonColor,
    marginLeft: 8,
  },
  serviceCardDesc: {
    fontSize: 12,
    color: '#A0A3BD',
    marginTop: 5,
    lineHeight: 17,
  },
  includesRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6},
  includeTag: {
    backgroundColor: 'rgba(254,212,40,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.22)',
  },
  includeTagText: {fontSize: 10, color: color.buttonColor, fontWeight: '600'},

  // ── Garage feature rows ──
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  featureInfo: {flex: 1, marginLeft: 12},
  featureTitle: {fontSize: 14, fontWeight: '600', color: '#fff'},
  featureDesc: {fontSize: 12, color: '#A1A1A1', marginTop: 3, lineHeight: 18},
  featureDescDate: {
    fontSize: 13,
    color: color.buttonColor,
    fontWeight: '600',
    marginTop: 3,
  },

  // ── Selected service card (Step 1) ──
  selectedSvcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,212,40,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(254,212,40,0.28)',
    padding: 12,
    gap: 12,
  },
  selectedSvcImg: {width: 60, height: 60, borderRadius: 10},
  selectedSvcImgEmpty: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSvcBody: {flex: 1},
  selectedSvcName: {fontSize: 13, fontWeight: '700', color: '#fff'},
  selectedSvcPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: color.buttonColor,
    marginTop: 4,
  },
  changeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: color.buttonColor,
  },
  changeBtnText: {fontSize: 12, color: color.buttonColor, fontWeight: '700'},

  // ── Charges breakdown ──
  chargesCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  chargeLabel: {fontSize: 14, color: '#A0A3BD'},
  chargeValue: {fontSize: 14, color: '#fff', fontWeight: '600'},
  chargeDivider: {height: 1, backgroundColor: 'rgba(255,255,255,0.06)'},
  chargeTotalDivider: {
    height: 2,
    backgroundColor: color.buttonColor,
    opacity: 0.45,
    marginVertical: 4,
  },
  chargeTotalLabel: {fontSize: 16, color: '#fff', fontWeight: '800'},
  chargeTotalValue: {
    fontSize: 18,
    color: color.buttonColor,
    fontWeight: '900',
  },
  chargeNote: {fontSize: 11, color: '#666', marginTop: 8, marginHorizontal: 2},

  // ── Disclaimer ──
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(254,212,40,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.18)',
    padding: 14,
    marginTop: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {fontSize: 18},
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: color.buttonColor,
    marginBottom: 4,
  },
  disclaimerText: {fontSize: 12, color: '#A0A3BD', lineHeight: 18},

  // ── Review card (Step 3) ──
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  reviewLabel: {fontSize: 13, color: '#A0A3BD', flex: 1},
  reviewValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },

  // ── Pickup options ──
  pickupOptions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  optionBtnText: {fontSize: 13, color: '#fff', fontWeight: '600'},
  optionBtnTextActive: {color: '#000'},

  // ── No services ──
  noServiceBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  noServiceText: {color: '#aaa', fontSize: 14},

  // ── Bottom bar ──
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: color.baground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
});
