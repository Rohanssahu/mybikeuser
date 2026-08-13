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
  Alert,
  TextInput,
} from 'react-native';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {
  addPickupAddress,
  create_booking,
  get_pricing_quote,
  garage_details,
  get_dealer_services,
  get_profile,
} from '../../redux/Api/apiRequests';
import {useUserBookings} from '../../hooks/useUserBookings';
import {useRefreshOnResume} from '../../hooks/useRefreshOnResume';
import {
  ACTIVE_BOOKING_HINT,
  ACTIVE_BOOKING_MESSAGE,
  GARAGE_UNAVAILABLE_MESSAGE,
  getBookingStatusLabel,
} from '../../utils/bookingStatus';
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
import GarageRatingStrip from '../../component/reviews/GarageRatingStrip';

type Step = 0 | 1 | 2;

type TransportOption = 'SELF_VISIT' | 'PICKUP_ONLY' | 'DROP_ONLY' | 'PICKUP_AND_DROP';

const TRANSPORT_LABELS: Record<TransportOption, string> = {
  SELF_VISIT: 'Self Visit',
  PICKUP_ONLY: 'Pickup Only',
  DROP_ONLY: 'Drop Only',
  PICKUP_AND_DROP: 'Pickup&Drop',
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
  const isFocus = useIsFocused();
  const {findActiveForBike, refetch: refetchBookings} = useUserBookings(isFocus);
  const activeBooking = findActiveForBike(bike?._id);

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
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [serviceDetailItem, setServiceDetailItem] = useState<any>(null);

  // Live price preview from the backend — the only source of any money value
  // rendered on this screen. Never computed locally.
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // Promo code — kept independent from `quote` (which is never re-priced
  // with a discount folded in). Only `appliedPromo` carries a validated
  // discount, and only after the backend confirms it via /pricing/quote.
  // Never compute the discount amount on the client.
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    name: string;
    discountAmount: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [BookingDate, setBookingDate] = useState(new Date());
  const [BookingTime, setBookingTime] = useState(() => {
    const t = new Date();
    t.setHours(10, 0, 0, 0);
    return t;
  });
  const [BookingDateModal, setBookingDateModal] = useState(false);
  const [BookingTimeModal, setBookingTimeModal] = useState(false);

  useEffect(() => {
    calculateDistanceFromSelectedLocation();
    // Intentionally driven only by the garage and selected customer location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageData, locationCoords]);


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
    } else if (detailsRes?.message === GARAGE_UNAVAILABLE_MESSAGE) {
      // Dealer went offline/inactive/blocked since this id was fetched —
      // backend now rejects getShopDetails with 403 in that case. Don't
      // leave the user stuck on a blank/broken details page: tell them and
      // back out immediately, whether this is the first load or a
      // focus/resume refresh of a page they already had open.
      setGarageData(null);
      errorToast(detailsRes.message);
      navigation.goBack();
    } else if (!garageData) {
      // Some other failure (network/server) on the very first load — surface
      // it, but don't force navigation; a background refresh hiccup on an
      // already-loaded page shouldn't wipe out perfectly valid garage data.
      errorToast(detailsRes?.message || 'Unable to load garage details. Please try again.');
    }
  };

  // Refetch whenever this screen gains focus and whenever the app resumes
  // to the foreground while it's open — not just once on mount. A dealer can
  // go offline/inactive at any moment, and this is the only screen the User
  // App keeps a garage's detail page mounted long enough for that to matter.
  useRefreshOnResume(fetchGarageDetails);

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

  // A previously-applied promo is only valid for the total it was checked
  // against — if the service/transport/bike changes, that total changes, so
  // drop the stale discount and make the user re-apply (re-validated fresh
  // against the new amount).
  useEffect(() => {
    setAppliedPromo(null);
    setPromoError('');
  }, [garageData?._id, selectedSvc?.adminServiceId, transportOption, bikeCC]);

  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      return;
    }
    const dealerId = garageData?._id;
    const adminServiceId = selectedSvc?.adminServiceId;
    if (!dealerId || !adminServiceId || !transportOption || !bikeCC) {
      setPromoError('Please choose a service and transport option first.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await get_pricing_quote(
        dealerId,
        [adminServiceId],
        transportOption,
        bikeCC,
        promoCodeInput.trim(),
      );
      if (res?.success && res?.data?.promoCode) {
        setAppliedPromo({
          code: res.data.promoCode,
          name: res.data.promoName,
          discountAmount: res.data.promoDiscountAmount ?? 0,
        });
      } else {
        setAppliedPromo(null);
        setPromoError(res?.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setAppliedPromo(null);
      setPromoError('Something went wrong. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

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
    // Single Active Booking Per Bike — mirrors the server-side guard in
    // createBooking() (mrbike-backend/controller/booking.js). Checked here
    // too so the user gets an immediate, bike-specific message instead of
    // waiting on a round trip.
    if (activeBooking) {
      return Alert.alert('Booking Not Allowed', `${ACTIVE_BOOKING_MESSAGE}\n\n${ACTIVE_BOOKING_HINT}`);
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('user_id');

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
        appliedPromo?.code ?? null,
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
          amount: res?.data?.amountDue ?? res?.data?.customerTotal ?? quote?.customerTotal ?? 0,
        });
      } else if (res?.errorCode === 'PROFILE_INCOMPLETE') {
        goToCompleteProfile(res?.message || 'Please complete your profile before booking a service.');
      } else if (res?.message === ACTIVE_BOOKING_MESSAGE) {
        // Race condition: another booking for this bike went active between
        // our client-side check and this request. Refresh so the screen
        // flips to the "Service In Progress" view.
        refetchBookings();
        Alert.alert('Booking Not Allowed', `${ACTIVE_BOOKING_MESSAGE}\n\n${ACTIVE_BOOKING_HINT}`);
      } else if (res?.message === GARAGE_UNAVAILABLE_MESSAGE) {
        // Dealer went offline/inactive/blocked between opening this page and
        // hitting Confirm — the backend is the final authority here even if
        // this screen's own data looked fine. Don't leave the user on a
        // booking form for a garage that can no longer accept it.
        errorToast(res.message);
        navigation.goBack();
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
        <View style={styles.selectedSvcCard}>
          {/* Top row: image + name/price/bike */}

          <View style={styles.selectedSvcTop}>
            {selectedSvc.serviceImage ? (
              <Image
                source={{uri: selectedSvc.serviceImage}}
                style={styles.selectedSvcImg}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.selectedSvcImg, styles.selectedSvcImgEmpty]}>
                <Text style={styles.serviceFallbackIcon}>⚙</Text>
              </View>
            )}
            <View style={styles.selectedSvcBody}>
            <View style={styles.svcNameRow}>
              <Text style={styles.selectedSvcName} numberOfLines={2}>
                {getServiceName(selectedSvc)}
              </Text>
            </View>
              <Text style={styles.selectedSvcPrice}>₹{servicePrice}</Text>
              <Text style={styles.selectedSvcBikeLabel} numberOfLines={1}>
                {selectedSvc.bikeName} • {selectedSvc.cc}cc
              </Text>
            </View>
          </View>

          <View style={styles.svcActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setServiceDetailItem(selectedSvc);
                setServiceDetailVisible(true);
              }}
              style={styles.viewDetailBtn}>
              <Text style={styles.viewDetailBtnText}>View Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.removeBtn}
              onPress={() => setSelectedService('')}>
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
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
        <GarageRatingStrip averageRating={Number(garageData?.averageRating||0)} ratingCount={Number(garageData?.ratingCount||0)} verified={garageData?.isVerified !== false} onViewReviews={() => navigation.navigate(ScreenNameEnum.GARAGE_REVIEWS,{dealerId:garageData?._id,garageName:garageData?.shopName})}/>
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

      <Text style={styles.sectionTitle}>Promo Code</Text>
      <View style={styles.chargesCard}>
        {appliedPromo ? (
          <View style={styles.promoAppliedRow}>
            <View style={styles.flex1}>
              <Text style={styles.promoAppliedText}>
                ✓ Promo Applied — {appliedPromo.code}
              </Text>
              {!!appliedPromo.name && (
                <Text style={styles.chargeNote}>{appliedPromo.name}</Text>
              )}
            </View>
            <TouchableOpacity onPress={removePromoCode}>
              <Text style={styles.promoRemoveText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter Promo Code"
                placeholderTextColor={'#fff'}
                autoCapitalize="characters"
                value={promoCodeInput}
                onChangeText={text => {
                  setPromoCodeInput(text);
                  if (promoError) setPromoError('');
                }}
                editable={!promoLoading}
              />
              <TouchableOpacity
                style={[
                  styles.promoApplyBtn,
                  (!promoCodeInput.trim() || promoLoading) && styles.promoApplyBtnDisabled,
                ]}
                disabled={!promoCodeInput.trim() || promoLoading}
                onPress={applyPromoCode}>
                {promoLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.promoApplyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
            {!!promoError && <Text style={styles.promoErrorText}>{promoError}</Text>}
          </>
        )}
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
            {!!appliedPromo && (
              <>
                <View style={styles.chargeDivider} />
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeLabel}>Promo Discount ({appliedPromo.code})</Text>
                  <Text style={styles.promoDiscountValue}>-₹{appliedPromo.discountAmount}</Text>
                </View>
              </>
            )}
            <View style={styles.chargeDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Tax ({quote.taxRate}%)</Text>
              <Text style={styles.chargeValue}>₹{quote.taxAmount}</Text>
            </View>
            <View style={styles.chargeTotalDivider} />
            <View style={styles.chargeRow}>
              <Text style={styles.chargeTotalLabel}>Total Payable</Text>
              <Text style={styles.chargeTotalValue}>
                ₹{Math.round((quote.customerTotal - (appliedPromo?.discountAmount ?? 0)) * 100) / 100}
              </Text>
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

  // ─── Active booking (Single Active Booking Per Bike) ──────────

  const renderActiveBookingCard = () => (
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

      <View style={styles.activeBookingCard}>
        <Text style={styles.activeBookingTitle}>🟠 Service In Progress</Text>
        <View style={styles.reviewCard}>
          <ReviewRow
            label="Booking ID"
            value={activeBooking?.bookingId ?? String(activeBooking?._id ?? '')}
          />
          <ReviewRow
            label="Current Status"
            value={getBookingStatusLabel(activeBooking?.status)}
          />
          {!!activeBooking?.scheduleDate && (
            <ReviewRow label="Expected Delivery" value={String(activeBooking.scheduleDate)} />
          )}
        </View>
        <Text style={styles.activeBookingNote}>
          This bike already has an active service booking. You can create a
          new booking for it once the current one is completed, cancelled,
          or rejected.
        </Text>
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

  const renderActiveBookingBottomBar = () => (
    <View style={[styles.bottomBar, {paddingBottom: insets.bottom + 14}]}>
      <CustomButton
        title="View Booking"
        onPress={() =>
          activeBooking &&
          navigation.navigate(ScreenNameEnum.SERVICE_SUMMERY, {id: activeBooking._id})
        }
      />
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {loading && <Loading />}

      <View style={[styles.fixedHeader, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBtn}
          activeOpacity={0.8}>
          <Icon source={icon.back} size={28} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleHomePress}
          style={styles.headerBtn}
          activeOpacity={0.8}>
          <Icon source={icon.home1} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{paddingTop: insets.top + 58}}>
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
          <GarageRatingStrip averageRating={Number(garageData?.averageRating||0)} ratingCount={Number(garageData?.ratingCount||0)} verified={garageData?.isVerified !== false} onViewReviews={() => navigation.navigate(ScreenNameEnum.GARAGE_REVIEWS,{dealerId:garageData?._id,garageName:garageData?.shopName})}/>
        </View>
        {activeBooking ? (
          <View style={styles.body}>{renderActiveBookingCard()}</View>
        ) : (
          <>
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
          </>
        )}
      </ScrollView>

      {activeBooking ? renderActiveBookingBottomBar() : renderBottomBar()}

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
                  return (
                    <View
                      key={itemId}
                      style={[
                        styles.serviceSheetCard,
                        active && styles.serviceSheetCardActive,
                      ]}>
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

                      <View style={styles.sheetServiceFooter}>
                        <Text style={styles.sheetPrice}>
                          ₹{getServicePrice(svc)}
                        </Text>
                        <View style={styles.sheetActions}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              setServiceDetailItem(svc);
                              setServiceDetailVisible(true);
                            }}
                            style={styles.viewDetailBtnSmall}>
                            <Text style={styles.viewDetailBtnSmallText}>
                              View Detail
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                              setSelectedService(itemId);
                              setServiceModalVisible(false);
                            }}
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
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
      <Modal
        visible={serviceDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setServiceDetailVisible(false);
          setServiceDetailItem(null);
        }}>
        <Pressable
          style={styles.detailModalBackdrop}
          onPress={() => {
            setServiceDetailVisible(false);
            setServiceDetailItem(null);
          }}
        />
        <View style={styles.detailModalWrap}>
          <View style={styles.detailModalCard}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>Service Detail</Text>
              <TouchableOpacity
                onPress={() => {
                  setServiceDetailVisible(false);
                  setServiceDetailItem(null);
                }}
                style={styles.detailModalCloseBtn}>
                <Text style={styles.detailModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.detailModalName}>
              {getServiceName(serviceDetailItem)}
            </Text>
            <Text style={styles.detailModalPrice}>
              ₹{getServicePrice(serviceDetailItem)}
            </Text>
            <Text style={styles.detailModalDescLabel}>Description</Text>
            <Text style={styles.detailModalDesc}>
              {getServiceDescription(serviceDetailItem) || 'No description available.'}
            </Text>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: 12,
    marginBottom: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FFB8B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {fontSize: 14, color: '#D92D20', fontWeight: '700'},
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
  svcPrice: {fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 4},
  svcBikeLabel: {fontSize: 12, color: '#A0A3BD', marginTop: 2},

  // Description box
  descBox: {
    marginHorizontal: 12,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
  },
  descBoxTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C7CBDD',
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
  checkIcon: {fontSize: 13, color: '#F8D64E', marginTop: 1},
  descItemText: {fontSize: 13, color: '#fff', flex: 1},
  durationRow: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    marginTop: 8,
    paddingTop: 8,
  },
  durationText: {fontSize: 12, color: '#C7CBDD'},


  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#16204F',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 0,
  },
  selectedSvcImg: {width: 64, height: 64, borderRadius: 12},
  selectedSvcImgEmpty: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSvcBody: {flex: 1},
  selectedSvcName: {fontSize: 15, fontWeight: '800', color: '#fff'},
  selectedSvcPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8D64E',
    marginTop: 6,
  },
  selectedSvcBikeLabel: {fontSize: 12, color: '#A0A3BD', marginTop: 2},
  selectedSvcTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    width: '100%',
  },
  viewDetailBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.22)',
  },
  viewDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8D64E',
  },
  svcActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: '100%',
  },
  removeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,99,99,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,99,99,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {fontSize: 14, color: '#FFB4B4', fontWeight: '800'},
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

  // ── Promo Code ──
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 10,
    textTransform: 'uppercase',
  },
  promoApplyBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnDisabled: {
    opacity: 0.5,
  },
  promoApplyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  promoErrorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 8,
  },
  promoAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoAppliedText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
  },
  promoRemoveText: {
    fontSize: 13,
    color: '#A0A3BD',
    textDecorationLine: 'underline',
  },
  promoDiscountValue: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
  },

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

  // ── Active booking card (Single Active Booking Per Bike) ──
  activeBookingCard: {
    marginTop: 16,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    padding: 14,
  },
  activeBookingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 12,
  },
  activeBookingNote: {
    fontSize: 12,
    color: '#A0A3BD',
    lineHeight: 18,
    marginTop: 12,
  },

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
    height: '82%',
    minHeight: '80%',
    maxHeight: '90%',
    backgroundColor: '#16204F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#A0A3BD',
    fontSize: 15,
    marginTop: 3,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
  serviceSheetCard: {
    backgroundColor: '#2B315B',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  serviceSheetCardActive: {
    borderColor: 'rgba(254,212,40,0.5)',
    backgroundColor: '#32386A',
  },
  sheetServiceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sheetServiceImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  sheetServiceBody: {
    flex: 1,
  },
  sheetServiceName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  sheetServiceDesc: {
    color: '#C7CBDD',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  sheetServiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
    paddingTop: 10,
  },
  sheetPrice: {
    color: '#F8D64E',
    fontSize: 17,
    fontWeight: '800',
  },
  addBtn: {
    minWidth: 78,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: '#16A34A',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  addBtnTextActive: {
    color: '#fff',
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailBtnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.22)',
    marginRight: 8,
  },
  viewDetailBtnSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8D64E',
  },
  detailModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  detailModalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailModalCard: {
    backgroundColor: '#16204F',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    minHeight: '44%',
    maxHeight: '58%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  detailModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailModalCloseText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '500',
    color: '#fff',
  },
  detailModalName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  detailModalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8D64E',
    marginTop: 6,
  },
  detailModalDescLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#A0A3BD',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailModalDesc: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    flexShrink: 1,
  },
});
