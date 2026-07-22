import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get_userbooking} from '../redux/Api/apiRequests';
import {BookingLike, findActiveBookingForBike} from '../utils/bookingStatus';

const POLL_INTERVAL_MS = 15000;

/**
 * Fetches the signed-in user's bookings and keeps them fresh via polling
 * while `enabled` is true (pass the screen's focus state), so "active
 * booking" badges/cards update automatically on status changes without a
 * manual refresh, app restart, or re-login.
 */
export function useUserBookings(enabled: boolean) {
  const [bookings, setBookings] = useState<BookingLike[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      setBookings([]);
      return;
    }
    const res = await get_userbooking(userId);
    setBookings(res?.data ?? []);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
    const interval = setInterval(fetchBookings, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, fetchBookings]);

  const findActiveForBike = useCallback(
    (bikeId?: string) => findActiveBookingForBike(bookings, bikeId),
    [bookings],
  );

  return {bookings, loading, refetch: fetchBookings, findActiveForBike};
}
