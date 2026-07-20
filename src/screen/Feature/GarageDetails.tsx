import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import {useRoute} from '@react-navigation/native';
import {
  addPickupAddress,
  create_booking,
  get_pricing_quote,
  garage_details,
  get_dealer_services,
  get_profile,
  get_userbooking,
} from '../../redux/Api/apiRequests';
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
import {useLocation} from '../../component/LocationContext';
import {getCurrentLocation as getSavedOrCurrentLocation} from '../../component/helperFunction';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useBookingFlowNav} from '../../hooks/useBookingFlowNav';

type Step = 0 | 1 | 2;

type TransportOption = 'SELF_VISIT' | 'PICKUP_ONLY' | 'DROP_ONLY' | 'PICKUP_AND_DROP';

const TRANSPORT_LABELS: Record<TransportOption, string> = {
  SELF_VISIT: 'Self Visit',
  PICKUP_ONLY: 'Pickup Only',
  DROP_ONLY: 'Drop Only',
  PICKUP_AND_DROP: 'Pickup + Drop',
};

const needsAddress = (option: TransportOption | '') =>
  option === 'PICKUP_ONLY' || option === 'DROP_ONLY' || option === 'PICKUP_AND_DROP';

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
  const {
    bike = null,
    id = '',
    serviceId: incomingServiceId,
  } = (route.params ?? {}) as {
    bike: any;
    id: string;
    serviceId?: string;
  };
  const {locationCoords} = useLocation();
  const insets = useSafeAreaInsets();
  const {handleHomePress} = useBookingFlowNav(navigation);

  const [garageData, setGarageData] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const submittingRef = useRef(false);

  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [PickupLocation, setPickupLocation] = useState<any>('');
  const [PickupLocationName, setPickupLocationName] = useState('');
  const [PickupLocationId, setPickupLocationId] = useState('');
  const [PickupDistance, setPickupDistance] = useState<number | null>(null);
  const [transportOption, setTransportOption] = useState<TransportOption | ''>('');
  const [pendingTransportOption, setPendingTransportOption] = useState<TransportOption | ''>('');

  const [selectedService, setSelectedService] = useState('');
  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  // Live price preview from the backend — the only source of any money value
  // rendered on this screen. Never computed locally.
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

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
    calculateDistanceFromSelectedLocation();
  }, [garageData, locationCoords]);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchGarageDetails();
  }, [id]);

  const calculateDistanceFromSelectedLocation = async () => {
    if (!garageData?.latitude || !garageData?.longitude) {
      return;
    }

    try {
      let selectedCoords = locationCoords;

      if (!selectedCoords?.latitude || !selectedCoords?.longitude) {
        const saved = await AsyncStorage.getItem('LocationsLat');
        if (saved) {
          const parsed = JSON.parse(saved);
          selectedCoords = {
            latitude: parsed.latitude ?? parsed.lat,
            longitude: parsed.longitude ?? parsed.lng,
          };
        }
      }

      if (!selectedCoords?.latitude || !selectedCoords?.longitude) {
        selectedCoords = await getSavedOrCurrentLocation();
      }

      if (selectedCoords?.latitude && selectedCoords?.longitude) {
        setDistance(
          haversine(selectedCoords, {
            latitude: Number(garageData.latitude),
            longitude: Number(garageData.longitude),
          }),
        );
      }
    } catch (error) {
      console.error('Selected location distance error:', error);
    }
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
    if (!id) {
      errorToast('Garage details not found');
      navigation.goBack();
      return;
    }

    const digitsOnly = bike?.bike_cc?.toString().replace(/\D/g, '') || '';
    const variantId = bike?.variant_id ?? bike?.variantId ?? '';
    const [detailsRes, servicesRes] = await Promise.all([
      garage_details(id, digitsOnly),
      get_dealer_services(id, variantId, digitsOnly),
    ]);

    if (detailsRes?.success) {
      const services = dedupeServices(
        Array.isArray(servicesRes?.data) ? servicesRes.data : [],
      );
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

  const addPickupDrop = async (location = PickupLocation) => {
    if (location?.latitude && location?.longitude) {
      setPickupDistance(
        haversine(location, {
          latitude: garageData?.latitude,
          longitude: garageData?.longitude,
        }),
      );
    }
    const user_id = (await AsyncStorage.getItem('user_id')) ?? '';
    const res = await addPickupAddress(
      location?.latitude,
      location?.longitude,
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

  // Catalog price shown while picking a service — comes straight from the
  // backend's service listing. The actual payable amount (Step 3) always
  // comes from the /pricing/quote response below, never from this value.
  const servicePrice: number =
    selectedSvc?.price ?? selectedSvc?.bikes?.[0]?.price ?? 0;

  // Which transport options this dealer actually supports.
  const transportChoices = useMemo(() => {
    const choices: TransportOption[] = ['SELF_VISIT'];
    if (garageData?.providesPickup) choices.push('PICKUP_ONLY');
    if (garageData?.providesDrop) choices.push('DROP_ONLY');
    if (garageData?.providesPickup && garageData?.providesDrop) {
      choices.push('PICKUP_AND_DROP');
    }
    return choices;
  }, [garageData?.providesPickup, garageData?.providesDrop]);

  const bikeCC = bike?.bike_cc?.toString().replace(/\D/g, '') || '';

  // Whenever the service, transport option, bike or dealer changes, re-price
  // the booking from the backend. This is the ONLY place a payable amount is
  // produced on this screen.
  useEffect(() => {
    const dealerId = garageData?._id;
    const adminServiceId = selectedSvc?.adminServiceId;

    if (!dealerId || !adminServiceId || !transportOption || !bikeCC) {
      setQuote(null);
      setQuoteError('');
      return undefined;
    }

    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError('');

    get_pricing_quote(dealerId, [adminServiceId], transportOption, bikeCC).then(res => {
      if (cancelled) return;
      if (res?.success) {
        setQuote(res.data);
      } else {
        setQuote(null);
        setQuoteError(res?.message || 'Unable to calculate price. Please try again.');
      }
      setQuoteLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [garageData?._id, selectedSvc?.adminServiceId, transportOption, bikeCC]);

  const getServiceName = (svc: any) =>
    (svc?.serviceName ?? svc?.base_service_id?.name ?? '').toUpperCase();

  const getServicePrice = (svc: any): number =>
    svc?.price ?? svc?.bikes?.[0]?.price ?? 0;

  const getServiceDescription = (svc: any) =>
    svc?.description ?? svc?.base_service_id?.description ?? '';

  const getServiceIncludes = (svc: any): string[] =>
    svc?.includes ?? svc?.whatsIncluded ?? svc?.base_service_id?.includes ?? [];

  const goToCompleteProfile = (message: string) => {
    errorToast(message);
    navigation.navigate(ScreenNameEnum.BOTTAM_TAB, {
      screen: ScreenNameEnum.PROFILE_SCREEN,
    });
  };

  const createBooking = async () => {
    // Guard against double-taps firing a second Create Booking request
    // while the first one is still in flight.
    if (submittingRef.current || loading) {
      return;
    }
    if (!selectedService) {
      return errorToast('Please choose a service');
    }
    if (!transportOption) {
      return errorToast('Please choose how you will bring your bike');
    }
    if (!bike?._id) {
      return errorToast('Bike information is missing. Please select a bike.');
    }
    if (needsAddress(transportOption) && !PickupLocationId) {
      return errorToast('Pickup/drop location not saved. Please re-select the address.');
    }
    if (quoteLoading || !quote) {
      return errorToast('Please wait for the price to be calculated before confirming.');
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('user_id');

      // Prevent creating a second pending booking if one is already awaiting
      // dealer confirmation (e.g. user backed out of the Waiting screen).
      const existingBookings = await get_userbooking(userId ?? '');
      const hasPendingBooking = (existingBookings?.data ?? []).some(
        (b: any) =>
          b?.status === 'pending' &&
          b?.dealerResponseStatus !== 'expired' &&
          b?.dealerResponseStatus !== 'rejected',
      );
      if (hasPendingBooking) {
        return errorToast(
          'You already have a pending booking. Please wait for it to be resolved before booking again.',
        );
      }

      const profileRes = await get_profile(userId ?? '');
      if (profileRes?.success) {
        const profile = profileRes?.data;
        const isProfileComplete =
          !!profile?.first_name?.toString().trim() &&
          !!profile?.phone?.toString().trim();
        if (!isProfileComplete) {
          return goToCompleteProfile('Please complete your profile before booking a service.');
        }
      }
      // If the profile fetch itself failed (e.g. network issue), fall through —
      // the backend re-validates profile completeness before creating the booking.

      const res = await create_booking(
        garageData?._id,
        [selectedService],
        transportOption,
        needsAddress(transportOption) ? PickupLocationId : null,
        bike._id,
        BookingDate.toISOString(),
      );
      if (res?.success) {
        showBookingNotification(
          getServiceName(selectedSvc),
          garageData?.shopName,
          formatDate(BookingDate),
        );
        // replace (not navigate) so Booking Summary can never be reached via Back
        navigation.replace(ScreenNameEnum.DEALER_WAITING, {
          bookingId: res?.data?._id ?? res?.data?.bookingId ?? '',
          garageName: garageData?.shopName ?? '',
          serviceName: getServiceName(selectedSvc),
          date: `${formatDate(BookingDate)}, ${formatTime(BookingTime)}`,
          amount: res?.data?.customerTotal ?? quote?.customerTotal ?? 0,
        });
      } else if (res?.errorCode === 'PROFILE_INCOMPLETE') {
        goToCompleteProfile(res?.message || 'Please complete your profile before booking a service.');
      } else {
        errorToast(res?.message || 'Booking failed. Please try again.');
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const stepTitles: string[] = ['Choose Service', 'Schedule', 'Bill Details'];

  // ─── Step Indicator ───────────────────────────────────────────
  const parseDescription = (desc: string) => {
    const lines = desc
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    const includes: string[] = [];
    let duration = '';

    for (const line of lines) {
      if (
        line.startsWith('Service Includes:') ||
        line.startsWith('Estimated Duration:')
      )
        continue;
      if (
        line.includes('Estimated Duration:') ||
        line.includes('Minutes') ||
        line.includes('minutes')
      ) {
        duration = line.replace('Estimated Duration:', '').trim();
      } else {
        includes.push(line);
      }
    }
    return {includes, duration};
  };

  // In your component:
  const {includes, duration} = parseDescription(
    getServiceDescription(selectedSvc) || '',
  );

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {([0, 1, 2] as const).map(i => (
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
          {i < 2 && (
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



    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Garage Details</Text>
      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <Icon source={icon.Expert} size={28} />
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Our Promise</Text>
            <Text style={styles.featureDesc}>
              {garageData?.ourPromise ||
                'Fast, reliable and affordable bike service.'}
            </Text>
          </View>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailMetaRow}>
          <View style={styles.detailMetaItem}>
            <Text style={styles.detailMetaLabel}>Distance</Text>
            <Text style={styles.detailMetaValue}>
              {distance !== null ? `${distance.toFixed(1)} km` : 'Nearby'}
            </Text>
          </View>
          <View style={styles.detailMetaItem}>
            <Text style={styles.detailMetaLabel}>Rating</Text>
            <Text style={styles.detailMetaValue}>
              {garageData?.averageRating || 'New'}
            </Text>
          </View>
          <View style={styles.detailMetaItemLast}>
            <Text style={styles.detailMetaLabel}>Payment</Text>
            <Text style={styles.detailMetaValue}>Online</Text>
          </View>
        </View>
      </View>

      {garageData?.shopDescription ? (
        <>
          <Text style={styles.sectionTitleSpaced}>About</Text>
          <Text style={styles.descText}>{garageData.shopDescription}</Text>
        </>
      ) : null}

      <Text style={styles.sectionTitleSpaced}>Service</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setServiceModalVisible(true)}
        style={styles.addServiceCard}>
        <View style={styles.addServiceIcon}>
          <Text style={styles.addServiceIconText}>+</Text>
        </View>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>
            {selectedSvc ? 'Change selected service' : 'Choose a service'}
          </Text>
          <Text style={styles.featureDesc}>
            {selectedSvc
              ? 'Only one service can be added at a time'
              : 'Open list and add one service for this booking'}
          </Text>
        </View>
        <Icon source={icon.rightarrow} size={20} />
      </TouchableOpacity>

      {selectedSvc ? (
        <View style={styles.svcCard}>
          {/* Top row: image + name/price/bike */}
    
          <View style={styles.svcCardTop}>
            {selectedSvc.serviceImage ? (
              <Image
                source={{uri: selectedSvc.serviceImage}}
                style={styles.svcThumb}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.svcThumb, styles.svcThumbEmpty]}>
                <Text style={styles.svcFallbackIcon}>⚙</Text>
              </View>
            )}
            <View style={styles.svcMeta}>
              <View style={styles.svcNameRow}>
                <Text style={styles.svcName} numberOfLines={2}>
                  {getServiceName(selectedSvc)}
                </Text>
                {selectedSvc.type === 'base' && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>Base</Text>
                  </View>
                )}
              </View>
              <Text style={styles.svcPrice}>₹{servicePrice}</Text>
              <Text style={styles.svcBikeLabel} numberOfLines={1}>
                {selectedSvc.bikeName} • {selectedSvc.cc}cc
              </Text>
            </View>
          </View>

          {/* Description: checklist + duration */}
          {includes.length > 0 && (
            <View style={styles.descBox}>
              <Text style={styles.descBoxTitle}>What's included</Text>
              {includes.map((item, i) => (
                <View key={i} style={styles.descItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.descItemText}>{item}</Text>
                </View>
              ))}
              {!!duration && (
                <View style={styles.durationRow}>
                  <Text style={styles.durationText}>⏱ {duration}</Text>
                </View>
              )}
            </View>
          )}

          {/* Remove */}
             <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setSelectedService('')}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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

      {/* <Text style={styles.sectionTitle}>Date & Time</Text>
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
      </TouchableOpacity> */}

      {/* <TouchableOpacity
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
      </TouchableOpacity> */}

      <Text style={styles.sectionTitle}>Transport Option</Text>
      <View style={styles.featureRow}>
        <Icon source={icon.pickups} size={28} />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>How will you bring your bike?</Text>
          {needsAddress(transportOption) && PickupLocationName ? (
            <Text style={styles.featureDesc}>{PickupLocationName}</Text>
          ) : transportOption === 'SELF_VISIT' ? (
            <Text style={styles.featureDesc}>Self visit / drop by shop</Text>
          ) : (
            <Text style={styles.featureDesc}>Choose an option below</Text>
          )}
          <View style={styles.pickupOptions}>
            {transportChoices.map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (option === 'SELF_VISIT') {
                    setPickupLocationId('');
                    setPickupLocationName('');
                    setTransportOption('SELF_VISIT');
                  } else {
                    setPendingTransportOption(option);
                    setPickupModalVisible(true);
                  }
                }}
                style={[
                  styles.optionBtn,
                  transportOption === option && styles.optionBtnActive,
                ]}>
                <Text
                  style={[
                    styles.optionBtnText,
                    transportOption === option && styles.optionBtnTextActive,
                  ]}>
                  {option === 'SELF_VISIT'
                    ? TRANSPORT_LABELS[option]
                    : `${TRANSPORT_LABELS[option]}${
                        transportOption === option && PickupDistance !== null
                          ? ` (${PickupDistance.toFixed(1)} km)`
                          : ''
                      }`}
                </Text>
              </TouchableOpacity>
            ))}
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
          label="Transport"
          value={
            transportOption
              ? `${TRANSPORT_LABELS[transportOption]}${
                  needsAddress(transportOption) && PickupLocationName
                    ? ` — ${PickupLocationName}`
                    : ''
                }`
              : ''
          }
        />
      </View>

      <Text style={styles.sectionTitle}>Payment Breakdown</Text>
      <View style={styles.chargesCard}>
        {quoteLoading ? (
          <ActivityIndicator color={color.buttonColor} style={styles.quoteSpinner} />
        ) : quote ? (
          <>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Service Amount</Text>
              <Text style={styles.chargeValue}>₹{quote.serviceAmount}</Text>
            </View>
            {quote.pickupCharges > 0 && (
              <>
                <View style={styles.chargeDivider} />
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeLabel}>Pickup Charges</Text>
                  <Text style={styles.chargeValue}>₹{quote.pickupCharges}</Text>
                </View>
              </>
            )}
            {quote.dropCharges > 0 && (
              <>
                <View style={styles.chargeDivider} />
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeLabel}>Drop Charges</Text>
                  <Text style={styles.chargeValue}>₹{quote.dropCharges}</Text>
                </View>
              </>
            )}
            <View style={styles.chargeDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Subtotal</Text>
              <Text style={styles.chargeValue}>₹{quote.subtotal}</Text>
            </View>
            <View style={styles.chargeDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Tax ({quote.taxRate}%)</Text>
              <Text style={styles.chargeValue}>₹{quote.taxAmount}</Text>
            </View>
            <View style={styles.chargeTotalDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeTotalLabel}>Customer Total</Text>
              <Text style={styles.chargeTotalValue}>₹{quote.customerTotal}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.chargeNote}>
            {quoteError || 'Price will appear once a service and transport option are selected.'}
          </Text>
        )}
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
    const bottomBarStyle = [
      styles.bottomBar,
      {paddingBottom: insets.bottom + 14},
    ];
    if (step === 0) {
      return (
        <View style={bottomBarStyle}>
          <CustomButton
            title="Next"
            disable={!selectedService}
            onPress={() => setStep(1)}
          />
        </View>
      );
    }
    if (step === 1) {
      return (
        <View style={bottomBarStyle}>
          <CustomButton
            title="Continue"
            disable={!transportOption || (needsAddress(transportOption) && !PickupLocationId)}
            onPress={() => setStep(2)}
          />
        </View>
      );
    }
    return (
      <View style={bottomBarStyle}>
        <CustomButton
          title="Confirm Booking"
          disable={loading || quoteLoading || !quote}
          onPress={createBooking}
        />
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

      <TouchableOpacity
        onPress={handleHomePress}
        style={styles.homeBtn}
        activeOpacity={0.8}>
        <Icon source={icon.home1} size={24} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
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
        <View>
          {/* Step indicator */}
          <View style={styles.stepWrapper}>
            <Text style={styles.stepLabel}>{stepTitles[step]}</Text>
            {renderStepIndicator()}
          </View>
        </View>
        {/* Step content */}
        <View style={styles.body}>
          {step === 0 && renderStep0()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
        </View>
      </ScrollView>

      {renderBottomBar()}

      <View style={{flex: 1}}>
        <Modal
          visible={serviceModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setServiceModalVisible(false)}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setServiceModalVisible(false)}
          />
          <View style={styles.serviceSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Add Service</Text>
                <Text style={styles.sheetSubtitle}>
                  Choose one service for this booking
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sheetClose}
                onPress={() => setServiceModalVisible(false)}>
                <Text style={styles.sheetCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(garageData?.services?.length ?? 0) === 0 ? (
                <View style={styles.noServiceBox}>
                  <Text style={styles.noServiceText}>
                    No services are available for your selected bike.
                  </Text>
                </View>
              ) : (
                garageData.services.map((svc: any) => {
                  const itemId = svc.serviceId ?? svc._id;
                  const active = selectedService === itemId;
                  const includes = getServiceIncludes(svc);
                  return (
                    <TouchableOpacity
                      key={itemId}
                      activeOpacity={0.9}
                      style={[
                        styles.serviceSheetCard,
                        active && styles.serviceSheetCardActive,
                      ]}
                      onPress={() => {
                        setSelectedService(itemId);
                        setServiceModalVisible(false);
                      }}>
                      <View style={styles.sheetServiceTop}>
                        {svc.serviceImage ? (
                          <Image
                            source={{uri: svc.serviceImage}}
                            style={styles.sheetServiceImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.sheetServiceImg,
                              styles.serviceCardImgEmpty,
                            ]}>
                            <Text style={styles.serviceFallbackIcon}>⚙</Text>
                          </View>
                        )}
                        <View style={styles.sheetServiceBody}>
                          <Text
                            style={styles.sheetServiceName}
                            numberOfLines={2}>
                            {getServiceName(svc)}
                          </Text>
                          {!!getServiceDescription(svc) && (
                            <Text
                              style={styles.sheetServiceDesc}
                              numberOfLines={2}>
                              {getServiceDescription(svc)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {includes.length > 0 && (
                        <View style={styles.serviceBullets}>
                          {includes
                            .slice(0, 7)
                            .map((item: string, idx: number) => (
                              <View
                                key={`${item}-${idx}`}
                                style={styles.bulletRow}>
                                <View style={styles.bulletDot} />
                                <Text
                                  style={styles.bulletText}
                                  numberOfLines={1}>
                                  {item}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}

                      <View style={styles.sheetServiceFooter}>
                        <Text style={styles.sheetPrice}>
                          ₹{getServicePrice(svc)}
                        </Text>
                        <View
                          style={[
                            styles.addBtn,
                            active && styles.addBtnActive,
                          ]}>
                          <Text
                            style={[
                              styles.addBtnText,
                              active && styles.addBtnTextActive,
                            ]}>
                            {active ? 'Added' : 'Add'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
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
<View style={{flex: 1}}>


      <MapPickerModal
        setModalVisible={(_visible, location) => {
          if (location && pendingTransportOption) {
            setPickupLocation(location);
            addPickupDrop(location);
            setTransportOption(pendingTransportOption);
          }
          setPendingTransportOption('');
          setPickupModalVisible(false);
        }}
        modalVisible={pickupModalVisible}
        sendLocation={setPickupLocation}
        setLocationName={setPickupLocationName}
      />
      </View>
    </View>
  );
};

export default GarageDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},

  // Styles
  svcCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    marginBottom: 12,
  },
  removeBtn: {

    margin: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'red',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  removeBtnText: {fontSize: 16, color: '#fff', fontWeight: '600'},
  svcCardTop: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  svcThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  svcThumbEmpty: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcFallbackIcon: {fontSize: 28},
  svcMeta: {flex: 1},
  svcNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  svcName: {fontSize: 15, fontWeight: '600', flex: 1, color: '#111'},
  typeBadge: {
    backgroundColor: '#EAF3DE',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {fontSize: 11, color: '#3B6D11'},
  svcPrice: {fontSize: 20, fontWeight: '600', color: '#111', marginTop: 4},
  svcBikeLabel: {fontSize: 12, color: '#888', marginTop: 2},

  // Description box
  descBox: {
    marginHorizontal: 12,
    marginBottom: 0,
    backgroundColor: '#F8F8F6',
    borderRadius: 8,
    padding: 10,
  },
  descBoxTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkIcon: {fontSize: 13, color: '#1D9E75', marginTop: 1},
  descItemText: {fontSize: 13, color: '#333', flex: 1},
  durationRow: {
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
    paddingTop: 8,
  },
  durationText: {fontSize: 12, color: '#888'},


  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
    left: 10,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
    right: 10,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
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
  stepLabel: {fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 16},

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

  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetaItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    paddingRight: 10,
    marginRight: 10,
  },
  detailMetaItemLast: {
    flex: 1,
  },
  detailMetaLabel: {
    fontSize: 11,
    color: '#A0A3BD',
    marginBottom: 4,
  },
  detailMetaValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },

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

  addServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,212,40,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.26)',
    padding: 14,
  },
  addServiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addServiceIconText: {
    color: '#111827',
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '700',
  },
  selectedSvcCardPage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginTop: 12,
    gap: 12,
  },

  serviceFallbackIcon: {
    color: color.buttonColor,
    fontSize: 22,
    fontWeight: '800',
  },

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
  quoteSpinner: {
    paddingVertical: 20,
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
    paddingTop: 14,
    backgroundColor: color.baground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  serviceSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    backgroundColor: '#F2F5F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9D0D3',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#18212A',
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#6B7280',
    fontSize: 15,
    marginTop: 3,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0E6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: {
    color: '#1F2937',
    fontSize: 24,
    lineHeight: 28,
  },
  serviceSheetCard: {
    backgroundColor: '#DDE6E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CFD9DC',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  serviceSheetCardActive: {
    borderColor: '#F05245',
    backgroundColor: '#EAF0F1',
  },
  sheetServiceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sheetServiceImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 12,
  },
  sheetServiceBody: {
    flex: 1,
  },
  sheetServiceName: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '800',
  },
  sheetServiceDesc: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  serviceBullets: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.72)',
    marginTop: 12,
    paddingTop: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F05245',
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    color: '#374151',
    fontSize: 12,
  },
  sheetServiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.72)',
    marginTop: 10,
    paddingTop: 10,
  },
  sheetPrice: {
    color: '#F05245',
    fontSize: 16,
    fontWeight: '800',
  },
  addBtn: {
    minWidth: 72,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F05245',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: color.buttonColor,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  addBtnTextActive: {
    color: '#111827',
  },
});
