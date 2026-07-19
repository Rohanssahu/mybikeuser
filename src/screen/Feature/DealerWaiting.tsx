import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {color} from '../../constant';
import {hp, wp} from '../../component/utils/Constant';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import {cancel_booking, get_bookingTimerStatus} from '../../redux/Api/apiRequests';
import {resetToHome} from '../../hooks/useBookingFlowNav';
import {errorToast, successToast} from '../../configs/customToast';

type DealerStatus = 'awaiting' | 'accepted' | 'rejected' | 'expired';

interface WaitingParams {
  bookingId: string;
  garageName: string;
  serviceName: string;
  date?: string;
  amount?: number;
}

const POLL_MS = 5000;

const DealerWaiting: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute<any>();
  const {bookingId, garageName, serviceName, date, amount} =
    route.params as WaitingParams;

  const [dealerStatus, setDealerStatus] = useState<DealerStatus>('awaiting');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);
  const dealerStatusRef = useRef<DealerStatus>('awaiting');
  const allowLeaveRef = useRef(false);
  const cancellingRef = useRef(false);

  useEffect(() => {
    dealerStatusRef.current = dealerStatus;
  }, [dealerStatus]);

  const clearAll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const resetTick = (seconds: number) => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
    }
    setSecondsLeft(seconds);
    tickRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const poll = async () => {
    const res = await get_bookingTimerStatus(bookingId);
    if (!mounted.current || !res?.success) {
      return;
    }

    const s: DealerStatus = res.data?.dealerResponseStatus ?? 'awaiting';

    if (s === 'awaiting') {
      const secs: number | undefined = res.data?.secondsRemaining;
      if (typeof secs === 'number' && secs > 0) {
        resetTick(secs);
      }
      return;
    }

    // Terminal state — stop all intervals
    clearAll();
    setDealerStatus(s);

    if (s === 'accepted') {
      allowLeaveRef.current = true;
      navigation.replace(ScreenNameEnum.PaymentScreen, {
        bookingId,
        garageName,
        serviceName,
        date,
        amount,
        totalPrice: amount,
      });
    }
  };

  useEffect(() => {
    mounted.current = true;
    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => {
      mounted.current = false;
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelBooking = async () => {
    if (cancellingRef.current) {
      return;
    }
    cancellingRef.current = true;
    clearAll();

    const res = await cancel_booking(bookingId, 'user_cancelled');
    if (res?.success) {
      successToast('Booking cancelled successfully.');
    } else {
      errorToast(
        res?.message ||
          'Could not cancel the booking right now. You can cancel it later from My Bookings.',
      );
    }

    cancellingRef.current = false;
    allowLeaveRef.current = true;
    resetToHome(navigation);
  };

  // Shared handler for the header Back button, Android hardware back, the
  // swipe-back gesture (all funnel through the `beforeRemove` listener below)
  // and the header Home button — so there is exactly one confirmation path
  // and never a route back to Booking Summary.
  const confirmLeave = useCallback(() => {
    if (dealerStatusRef.current !== 'awaiting' || cancellingRef.current) {
      allowLeaveRef.current = true;
      resetToHome(navigation);
      return;
    }
    Alert.alert(
      'Cancel Booking?',
      'Going back will cancel your pending booking request with the dealer. Do you want to cancel this booking?',
      [
        {text: 'Stay', style: 'cancel'},
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: handleCancelBooking,
        },
      ],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (allowLeaveRef.current || dealerStatusRef.current !== 'awaiting') {
        return;
      }
      e.preventDefault();
      confirmLeave();
    });
    return unsubscribe;
  }, [navigation, confirmLeave]);

  const goChooseAnother = () => {
    allowLeaveRef.current = true;
    navigation.pop(2);
  };

  const fmt = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${secs}`;
  };

  /* ─── Rejected / Expired ─────────────────────────────────────────── */
  if (dealerStatus === 'rejected' || dealerStatus === 'expired') {
    const isRejected = dealerStatus === 'rejected';
    return (
      <View style={styles.root}>
        <StatusBar backgroundColor={color.baground} barStyle="light-content" />
        <SafeAreaView style={styles.safe}>
          <CustomHeader navigation={navigation} title="Booking Status" showHome />
          <View style={styles.center}>
            <View
              style={[
                styles.outcomeIcon,
                {backgroundColor: isRejected ? '#2D1414' : '#1F1B0A'},
              ]}>
              <Text
                style={[
                  styles.outcomeGlyph,
                  {color: isRejected ? '#EF4444' : '#F59E0B'},
                ]}>
                {isRejected ? '✕' : '⏱'}
              </Text>
            </View>

            <Text style={styles.outcomeTitle}>
              {isRejected ? 'Booking Rejected' : 'No Response'}
            </Text>

            <Text style={styles.outcomeMsg}>
              {isRejected
                ? 'Dealer rejected your booking.'
                : 'Dealer did not respond within 60 seconds.'}
            </Text>

            <TouchableOpacity
              style={styles.btn}
              activeOpacity={0.85}
              onPress={goChooseAnother}>
              <Text style={styles.btnText}>Choose Another Dealer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ─── Awaiting ───────────────────────────────────────────────────── */
  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <CustomHeader
          navigation={navigation}
          title="Waiting for Confirmation"
          showHome
          onBackPress={confirmLeave}
          onHomePress={confirmLeave}
        />
      <SafeAreaView style={styles.safe}>
     
        <View style={styles.center}>
          {/* Hourglass */}
          <View style={styles.hourglassWrap}>
            <Text style={styles.hourglassEmoji}>⏳</Text>
          </View>

          <Text style={styles.heading}>
            {'Waiting for Dealer\nConfirmation'}
          </Text>

          {/* Booking summary card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Dealer</Text>
              <Text style={styles.cardValue} numberOfLines={1}>
                {garageName}
              </Text>
            </View>
            <View style={[styles.cardRow, styles.cardRowLast]}>
              <Text style={styles.cardLabel}>Service</Text>
              <Text style={styles.cardValue} numberOfLines={1}>
                {serviceName}
              </Text>
            </View>
          </View>

          {/* Countdown ring */}
          <View style={styles.timerRing}>
            <Text style={styles.timerNum}>
              {secondsLeft !== null ? fmt(secondsLeft) : '--'}
            </Text>
            <Text style={styles.timerSub}>seconds remaining</Text>
          </View>

          <Text style={styles.hint}>Reviewing your booking request…</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default DealerWaiting;

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: color.baground},
  safe: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },

  /* Awaiting */
  hourglassWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#0F1D5A',
    borderWidth: 2,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  hourglassEmoji: {fontSize: 36},
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: hp(3),
  },

  card: {
    width: '100%',
    backgroundColor: '#1c1c1c',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    marginBottom: hp(3),
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  cardRowLast: {borderBottomWidth: 0},
  cardLabel: {fontSize: 12, color: '#555'},
  cardValue: {
    fontSize: 13,
    color: '#ddd',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  timerRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 3,
    borderColor: color.buttonColor,
    backgroundColor: '#0F1D5A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },
  timerNum: {
    fontSize: 40,
    fontWeight: '800',
    color: color.buttonColor,
    letterSpacing: -1,
  },
  timerSub: {fontSize: 11, color: '#888', marginTop: 2},
  hint: {fontSize: 13, color: '#555', textAlign: 'center'},

  /* Rejected / Expired */
  outcomeIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  outcomeGlyph: {fontSize: 36, fontWeight: '700'},
  outcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  outcomeMsg: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: hp(4),
    paddingHorizontal: wp(4),
  },
  btn: {
    width: '100%',
    backgroundColor: color.buttonColor,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: color.buttonColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  btnText: {fontSize: 15, fontWeight: '600', color: '#111827'},
});
