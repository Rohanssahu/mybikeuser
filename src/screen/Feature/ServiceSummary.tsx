import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import { useIsFocused, useRoute } from '@react-navigation/native';
import {
  bookingdetails,
  garage_details,
} from '../../redux/Api/apiRequests';
import { image_url } from '../../redux/Api';
import { getAddressFromLatLng } from '../../component/helperFunction';
import OtpBox from './OtpBox';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  pending:            { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',   label: 'Pending Confirmation' },
  confirmed:          { color: '#10B981', bg: 'rgba(16,185,129,0.15)',   label: 'Confirmed' },
  completed:          { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',   label: 'Service Completed' },
  awaiting_payment:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',   label: 'Awaiting Payment' },
  payment_selected:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)',   label: 'Payment Selected' },
  ready_for_delivery: { color: '#10B981', bg: 'rgba(16,185,129,0.15)',   label: 'Out for Delivery' },
  delivered:          { color: '#10B981', bg: 'rgba(16,185,129,0.15)',   label: 'Bike Delivered' },
  'cash received':    { color: '#10B981', bg: 'rgba(16,185,129,0.15)',   label: 'Cash Received' },
  user_cancelled:     { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',    label: 'Cancelled by You' },
  rejected:           { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',    label: 'Rejected by Service Center' },
  expired:            { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',    label: 'Booking Expired' },
};

const BILL_STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Pending' },
  paid:    { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Paid' },
};

// ─── Timeline ─────────────────────────────────────────────────────────────────
const STEPS = ['Pending', 'Confirmed', 'In Service', 'Completed', 'Delivery', 'Done'];
const STEP_IDX: Record<string, number> = {
  pending:            0,
  confirmed:          1,
  completed:          3,
  awaiting_payment:   3,
  payment_selected:   3,
  'cash received':    5,
  ready_for_delivery: 4,
  delivered:          5,
};

const ServiceSummary: React.FC<any> = ({ navigation }) => {
  const route = useRoute<any>();
  const { id } = route.params;
  const isFocus = useIsFocused();

  const [booking, setBooking] = useState<any>(null);
  const [GarageDetails, setGarageDetails] = useState<any>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('Fetching address…');

  // ── Polling booking details every 10 s ──────────────────────────────────────
  useEffect(() => {
    if (!id) { return undefined; }
    const fetchBooking = async () => {
      const res = await bookingdetails(id);
      if (res?.success) { setBooking(res.data); }
    };
    fetchBooking();
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // ── Side-data when booking / focus changes ───────────────────────────────────
  useEffect(() => {
    if (!booking) { return; }

    const fetchDealerDetails = async () => {
      try {
        const cc = booking?.services?.[0]?.bikes?.[0]?.cc;
        const dealerId = booking?.services?.[0]?.dealer_id;
        if (!dealerId) { return; }
        const res = await garage_details(dealerId, cc);
        if (res?.success) { setGarageDetails(res.data); }
      } catch (err) {
        console.log('garage_details err', err);
      }
    };

    fetchDealerDetails();
  }, [booking, isFocus]);

  useEffect(() => {
    const lat = booking?.pickupAndDropId?.user_lat;
    const lng = booking?.pickupAndDropId?.user_lng;
    if (lat && lng) {
      getAddressFromLatLng(lat, lng).then(addr =>
        setPickupAddress(addr || `${lat}, ${lng}`),
      );
    }
  }, [booking?.pickupAndDropId]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const serviceMatch = GarageDetails?.services?.find(
    (s: any) => s._id === booking?.services?.[0]?._id,
  );
  const serviceName = serviceMatch?.base_service_id?.name;
  const servicePrice = serviceMatch?.bikes?.[0]?.price ?? 0;

  const calculateTotal = () => {
    if (booking?.grandTotal != null) { return booking.grandTotal; }
    if (booking?.totalBill != null)  { return booking.totalBill; }
    return (
      booking?.services?.reduce(
        (sum: number, s: any) => sum + (s?.bikes?.[0]?.price || 0),
        0,
      ) || 0
    ) + (booking?.tax || 0);
  };

  const formatDT = (iso: string) => {
    if (!iso) { return '—'; }
    const d = new Date(iso);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    let h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()},  ${h}:${min} ${ampm}`;
  };

  const openMaps = () => {
    const lat = booking?.dealer_id?.latitude;
    const lng = booking?.dealer_id?.longitude;
    const name = booking?.dealer_id?.shopName || 'Service Center';
    if (!lat || !lng) { return; }
    const url = Platform.select({
      ios: `maps:0,0?q=${name}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${name}`,
    });
    Linking.openURL(url!).catch(console.error);
  };

  const makeCall = (no: string) => Linking.openURL(`tel:${no}`);

  // ── Layout helpers ────────────────────────────────────────────────────────────
  const rawStatus = booking?.status ?? 'pending';
  const dealerResponseStatus = booking?.dealerResponseStatus;
  const status =
    rawStatus === 'expired' || dealerResponseStatus === 'expired' ? 'expired' : rawStatus;
  const billStatus = booking?.billStatus ?? 'pending';
  const statusCfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const billStatusCfg = BILL_STATUS_CFG[billStatus] ?? BILL_STATUS_CFG.pending;

  const rawStep = STEP_IDX[status] ?? 0;
  const currentStep =
    status === 'cash received' || status === 'delivered' ||
    (rawStep >= 3 && billStatus === 'paid')
      ? 5
      : rawStep;

  const isCancelledOrRejected =
    status === 'user_cancelled' || status === 'rejected' || status === 'expired';
  const showInvoice = status === 'cash received' || billStatus === 'paid' || status === 'delivered';

  const shopLat = parseFloat(booking?.dealer_id?.latitude);
  const shopLng = parseFloat(booking?.dealer_id?.longitude);
  const hasCoords = !isNaN(shopLat) && !isNaN(shopLng) && shopLat !== 0 && shopLng !== 0;

  const showCashConfirmed = status === 'payment_selected' && booking?.paymentMethod === 'CASH';
  const showDelivered = status === 'delivered';
  const showDeliveryOtp = status === 'ready_for_delivery';

  const total = calculateTotal();

  return (
    <View style={styles.root}>
      <CustomHeader title="Booking Details" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Pickup / Delivery OTP Banner (confirmed status) ───────────────── */}
        {status === 'confirmed' && (
          <View style={styles.otpWrap}>
            <OtpBox
              otp={
                booking?.pickupStatus === 'arrived'
                  ? booking?.pickupOtp
                  : booking?.deliveryOtp
              }
              label={
                booking?.pickupStatus === 'arrived' ? 'Pickup OTP' : 'Delivery OTP'
              }
            />
          </View>
        )}

        {/* ── Delivery OTP Banner (ready_for_delivery) ─────────────────────── */}
        {showDeliveryOtp && (
          <View style={styles.otpWrap}>
            <OtpBox
              otp={booking?.deliveryOtp}
              label="Delivery OTP"
              hint="Share this OTP with dealer"
            />
          </View>
        )}

        {/* ── Delivered success banner ─────────────────────────────────────── */}
        {showDelivered && (
          <View style={styles.deliveredCard}>
            <Text style={styles.deliveredEmoji}>🎉</Text>
            <Text style={styles.deliveredTitle}>Bike Delivered Successfully</Text>
            <Text style={styles.deliveredSub}>Thank you for choosing MR BIKE!</Text>
          </View>
        )}

        {/* ── Cash confirmed banner ─────────────────────────────────────────── */}
        {showCashConfirmed && !showDeliveryOtp && !showDelivered && (
          <View style={styles.cashCard}>
            <Text style={styles.cashIcon}>💵</Text>
            <View style={styles.cashTextWrap}>
              <Text style={styles.cashTitle}>Cash payment selected.</Text>
              <Text style={styles.cashSub}>Pay dealer during pickup.</Text>
            </View>
          </View>
        )}

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
          <Text style={[styles.statusBannerTxt, { color: statusCfg.color }]}>
            {'  '}{statusCfg.label}
          </Text>
        </View>

        {/* Timeline */}
        {!isCancelledOrRejected && (
          <View style={styles.timelineCard}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      i <= currentStep
                        ? styles.stepCircleOn
                        : styles.stepCircleOff,
                    ]}>
                    {i < currentStep ? (
                      <Text style={styles.stepCheck}>✓</Text>
                    ) : i === currentStep ? (
                      <View style={styles.stepDotActive} />
                    ) : (
                      <View style={styles.stepDotInactive} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLbl,
                      i <= currentStep ? styles.stepLblOn : styles.stepLblOff,
                    ]}>
                    {step}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      i < currentStep ? styles.stepLineOn : styles.stepLineOff,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ─── Shop + Map Card ─────────────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Shop header row */}
          <View style={styles.shopRow}>
            <Image
              source={{
                uri: booking?.dealer_id?.shopImages?.[0]
                  ? image_url + booking.dealer_id.shopImages[0]
                  : 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png',
              }}
              style={styles.shopAvatar}
            />
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{booking?.dealer_id?.shopName}</Text>
              <Text style={styles.shopAddr} numberOfLines={2}>
                {booking?.dealer_id?.address}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callCircle}
              onPress={() => makeCall(booking?.dealer_id?.phone)}>
              <Icon source={icon.phone} size={22} tintColor="#FED428" />
            </TouchableOpacity>
          </View>

          {/* Map */}
          {hasCoords ? (
            <View style={styles.mapWrap}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: shopLat,
                  longitude: shopLng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}>
                <Marker
                  coordinate={{ latitude: shopLat, longitude: shopLng }}
                  title={booking?.dealer_id?.shopName}
                />
              </MapView>
              <TouchableOpacity style={styles.directionsBtn} onPress={openMaps}>
                <Icon source={icon.googlemaps} size={15} />
                <Text style={styles.directionsTxt}> Get Directions</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.noMapBtn} onPress={openMaps}>
              <Icon source={icon.pin} size={18} tintColor="#FED428" />
              <Text style={styles.noMapTxt}> Open in Maps</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Booking Info Card ───────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Info</Text>

          {[
            { label: 'Date', value: formatDT(booking?.pickupDate) },
            {
              label: 'Bike',
              value: [
                booking?.userBike_id?.name,
                booking?.userBike_id?.model,
                booking?.userBike_id?.bike_cc
                  ? `(${booking.userBike_id.bike_cc})`
                  : '',
              ]
                .filter(Boolean)
                .join(' '),
            },
            { label: 'Reg. No.', value: booking?.userBike_id?.plate_number },
            {
              label: 'Last Service',
              value: booking?.lastServiceKm ? `${booking.lastServiceKm} km` : '—',
            },
            {
              label: 'Pickup',
              value:
                ['completed', 'awaiting_payment', 'payment_selected',
                 'ready_for_delivery', 'delivered', 'cash received'].includes(status)
                  ? 'Delivered'
                  : booking?.pickupStatus || '—',
            },
          ].map(({ label, value }) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLbl}>{label}</Text>
              <Text style={styles.infoVal}>{value || '—'}</Text>
            </View>
          ))}

          {booking?.pickupAndDropId != null && (
            <View style={[styles.infoRow, styles.infoRowTop]}>
              <Text style={styles.infoLbl}>Pickup Address</Text>
              <Text style={[styles.infoVal, styles.infoValFlex]}>
                {pickupAddress}
              </Text>
            </View>
          )}
        </View>

        {/* ─── Bill Summary Card ───────────────────────────────────────────────── */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>

          {/* Main service */}
          {serviceName ? (
            <View style={styles.billRow}>
              <View style={styles.billItemLeft}>
                <View style={styles.billDotGreen} />
                <Text style={styles.billItemName}> {serviceName}</Text>
              </View>
              <Text style={styles.billItemPrice}>₹{servicePrice}</Text>
            </View>
          ) : null}

          {/* Additional services — rendered directly from booking response */}
          {(() => {
          //  console.log('BOOKING_ADDITIONAL_SERVICES', JSON.stringify(booking?.additionalServices, null, 2));
            return null;
          })()}
          {booking?.additionalServices?.map((service: any, i: number) => {
            const svcName =
              service?.base_additional_service_id?.name ||
              service?.name ||
              service?.additional_service_name ||
              'Additional Service';
            return (
              <View key={service._id || i} style={styles.billRow}>
                <View style={styles.billItemLeft}>
                  <View style={styles.billDotBlue} />
                  <Text style={styles.billItemName}>
                    {' '}{svcName.charAt(0).toUpperCase() + svcName.slice(1)}
                  </Text>
                </View>
                <Text style={styles.billItemPrice}>
                  ₹{service?.bikes?.[0]?.price || 0}
                </Text>
              </View>
            );
          })}

          {/* Pickup Charges */}
          {booking?.pickupAndDropId && (
            <View style={styles.billRow}>
              <View style={styles.billItemLeft}>
                <View style={styles.billDotBlue} />
                <Text style={styles.billItemName}> Pickup Charges</Text>
              </View>
              <Text style={styles.billItemPrice}>₹{booking?.dealer_id?.pickupCharges || 0}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <View style={styles.billItemLeft}>
              <View style={styles.billDotBlue} />
              <Text style={styles.billItemName}> Tax / Fees</Text>
            </View>
            <Text style={styles.billItemPrice}>₹{booking?.dealer_id?.tax || 0}</Text>
          </View>

          <View style={styles.billDivider} />

          {/* Status grid */}
          <View style={styles.statusGrid}>
            <View style={styles.statusGridItem}>
              <Text style={styles.statusGridLbl}>Booking Status</Text>
              <View style={[styles.statusGridBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusGridVal, { color: statusCfg.color }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>
            <View style={styles.statusGridItem}>
              <Text style={styles.statusGridLbl}>Payment Status</Text>
              <View style={[styles.statusGridBadge, { backgroundColor: billStatusCfg.bg }]}>
                <Text style={[styles.statusGridVal, { color: billStatusCfg.color }]}>
                  {billStatusCfg.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.billDivider} />

          {/* Total */}
          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLbl}>Total Amount</Text>
            <Text style={styles.billTotalAmt}>₹{total}</Text>
          </View>

          {/* View Invoice */}
          {showInvoice && (
            <TouchableOpacity
              style={styles.invoiceBtn}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(ScreenNameEnum.InvoiceScreen, { bookingId: booking._id })
              }>
              <Text style={styles.invoiceBtnTxt}>View Invoice</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Additional Notes ────────────────────────────────────────────────── */}
        {booking?.additionalNotes?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Notes</Text>
            {booking.additionalNotes.map((note: string, i: number) => (
              <View key={i} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteTxt}> {note}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for choosing{' '}
          <Text style={styles.footerHL}>MR BIKE!</Text>
          {'\n'}Ride Safe! 🏍️
        </Text>
      </ScrollView>
    </View>
  );
};

export default ServiceSummary;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.baground },
  scroll: { paddingBottom: 20 },

  // OTP
  otpWrap: { marginHorizontal: 14, marginTop: 10 },

  // Delivered card
  deliveredCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  deliveredEmoji: { fontSize: 36, marginBottom: 8 },
  deliveredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
    textAlign: 'center',
  },
  deliveredSub: {
    fontSize: 13,
    color: '#6B7DBE',
    textAlign: 'center',
  },

  // Cash confirmed card
  cashCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#0D1952',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.25)',
  },
  cashIcon: { fontSize: 26, marginRight: 12 },
  cashTextWrap: { flex: 1 },
  cashTitle: { fontSize: 14, fontWeight: '700', color: '#FED428' },
  cashSub: { fontSize: 12, color: '#6B7DBE', marginTop: 2 },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusBannerTxt: { fontSize: 14, fontWeight: '600' },

  // Timeline
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1952',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  stepItem: { alignItems: 'center', flex: 0 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleOn: { backgroundColor: '#FED428' },
  stepCircleOff: { backgroundColor: '#1C2B66', borderWidth: 1, borderColor: '#2E3F80' },
  stepDotActive: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#081041' },
  stepDotInactive: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E3F80' },
  stepLbl: { fontSize: 9, marginTop: 4, textAlign: 'center', width: 46 },
  stepLblOn: { color: '#FED428', fontWeight: '700' },
  stepLblOff: { color: '#3D4F80' },
  stepLine: { flex: 1, height: 2, marginBottom: 14 },
  stepLineOn: { backgroundColor: '#FED428' },
  stepLineOff: { backgroundColor: '#1C2B66' },

  // Generic card
  card: {
    backgroundColor: '#0D1952',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.06)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },

  // Payment method selection
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2566',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodRowSelected: {
    borderColor: '#FED428',
    backgroundColor: '#111E5A',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3D4F80',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterActive: { borderColor: '#FED428' },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FED428',
  },
  methodLabelWrap: { flex: 1 },
  methodLabelTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  methodLabelSub: { fontSize: 11, color: '#6B7DBE', marginTop: 2 },
  methodEmoji: { fontSize: 20 },
  continueBtn: {
    backgroundColor: '#FED428',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnTxt: { fontSize: 15, fontWeight: '800', color: '#081041' },

  // Shop
  shopRow: { flexDirection: 'row', alignItems: 'center' },
  shopAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1A2566' },
  shopInfo: { flex: 1, marginLeft: 12 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  shopAddr: { fontSize: 12, color: '#6B7DBE', marginTop: 3, lineHeight: 17 },
  callCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Map
  mapWrap: { marginTop: 14, borderRadius: 12, overflow: 'hidden', height: 170 },
  map: { width: '100%', height: '100%' },
  directionsBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,16,65,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.4)',
  },
  directionsTxt: { fontSize: 12, color: '#fff', fontWeight: '600' },
  noMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.3)',
  },
  noMapTxt: { fontSize: 14, color: '#FED428', fontWeight: '600' },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLbl: { fontSize: 13, color: '#6B7DBE', fontWeight: '500' },
  infoVal: { fontSize: 13, color: '#C8D0E7', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  infoRowTop: { alignItems: 'flex-start' },
  infoValFlex: { flex: 1, textAlign: 'right' },

  // Bill card
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 14,
    marginTop: 12,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1952',
    marginBottom: 12,
    textAlign: 'center',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
  },
  billItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  billItemName: { fontSize: 13, color: '#2D3A6A', fontWeight: '500', flex: 1 },
  billItemPrice: { fontSize: 13, fontWeight: '700', color: '#2D3A6A' },
  billDivider: {
    borderTopWidth: 1.5,
    borderTopColor: '#E2E6F0',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  billTotalLbl: { fontSize: 15, fontWeight: '700', color: '#0D1952' },
  billTotalAmt: { fontSize: 22, fontWeight: '800', color: '#FED428' },

  // Status grid
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10,
  },
  statusGridItem: { flex: 1, alignItems: 'center', gap: 6 },
  statusGridLbl: { fontSize: 11, color: '#6B7DBE', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusGridBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, width: '100%', alignItems: 'center' },
  statusGridVal: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Invoice
  invoiceBtn: {
    marginTop: 14,
    backgroundColor: '#0D1952',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.3)',
  },
  invoiceBtnTxt: { fontSize: 13, fontWeight: '700', color: '#FED428' },
  invoiceCard: {
    marginTop: 12,
    backgroundColor: '#F8F9FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E6F0',
  },
  invoiceTitle: { fontSize: 13, fontWeight: '700', color: '#0D1952', marginBottom: 8 },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
  },
  invoiceLbl: { fontSize: 12, color: '#6B7DBE' },
  invoiceVal: { fontSize: 12, color: '#2D3A6A', fontWeight: '600' },

  // Notes
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  noteTxt: { fontSize: 13, color: '#A0AFCE', flex: 1, lineHeight: 18 },

  // Footer
  footer: {
    textAlign: 'center',
    color: '#3D4F80',
    fontSize: 13,
    marginTop: 24,
    lineHeight: 20,
  },
  footerHL: { color: '#FED428', fontWeight: '700' },

  // Sticky Pay (backward compat)
  payBar: {
    backgroundColor: '#0D1952',
    borderTopWidth: 1,
    borderTopColor: 'rgba(254,212,40,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  payBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payBarLbl: { fontSize: 12, color: '#6B7DBE' },
  payBarAmt: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FED428',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  payBtnTxt: { fontSize: 15, fontWeight: '800', color: '#081041' },
  payBarSpacer: { height: 90 },

  // Status dot
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // Timeline check text
  stepCheck: { fontSize: 10, fontWeight: '800', color: '#081041' },

  // Bill row dots
  billDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  billDotBlue: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6B7DBE' },

  // Note bullet
  noteBullet: { fontSize: 16, color: '#FED428', lineHeight: 20 },
});
