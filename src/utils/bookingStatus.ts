// Single source of truth for booking lifecycle finality in the User App.
// Mirrors mrbike-backend/utils/bookingStatus.js — a booking is ACTIVE until
// it reaches one of FINAL_BOOKING_STATUSES. Every screen that needs to know
// whether a bike already has an ongoing service must go through
// isBookingActive() / findActiveBookingForBike() rather than re-listing
// status strings.
export const FINAL_BOOKING_STATUSES = [
  'completed',
  'delivered',
  'cancelled',
  'user_cancelled',
  'rejected',
  'expired',
];

export const ACTIVE_BOOKING_MESSAGE =
  'This bike already has an active service booking.';
export const ACTIVE_BOOKING_HINT =
  'Please wait until the current service is completed before creating another booking.';

// Mirrors mrbike-backend/helper/dealerStatus.js isDealerBookable() — the
// exact message getShopDetails/createBooking return once a dealer goes
// offline, inactive, unapproved, or blocked. Used to recognize that specific
// rejection (vs. a generic failure) so the screen can show a clear message
// and back out instead of leaving the user stuck on a dead garage page.
export const GARAGE_UNAVAILABLE_MESSAGE = 'This garage is currently unavailable.';

export interface BookingLike {
  _id?: string;
  bookingId?: string;
  status?: string;
  userBike_id?: string | {_id?: string};
  scheduleDate?: string | null;
  [key: string]: any;
}

export const isBookingActive = (booking?: BookingLike | string | null): boolean => {
  if (!booking) {
    return false;
  }
  const status = typeof booking === 'string' ? booking : booking.status;
  if (!status) {
    return false;
  }
  return !FINAL_BOOKING_STATUSES.includes(status);
};

const getBikeIdFromBooking = (booking: BookingLike): string | undefined => {
  const bike = booking?.userBike_id;
  if (!bike) {
    return undefined;
  }
  return typeof bike === 'string' ? bike : bike._id;
};

// Returns the single active booking for a given bike, if any. A bike can
// have at most one — this is the invariant the backend enforces.
export const findActiveBookingForBike = (
  bookings: BookingLike[] = [],
  bikeId?: string,
): BookingLike | undefined => {
  if (!bikeId) {
    return undefined;
  }
  return bookings.find(
    b => isBookingActive(b) && getBikeIdFromBooking(b) === bikeId,
  );
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  awaiting_payment: 'Awaiting Payment',
  payment_selected: 'Payment Selected',
  ready_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  'cash received': 'Cash Received',
  user_cancelled: 'Cancelled',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const getBookingStatusLabel = (status?: string): string => {
  if (!status) {
    return '—';
  }
  return STATUS_LABELS[status] ?? status;
};
