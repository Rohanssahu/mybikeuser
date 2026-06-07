import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {color} from '../../constant';
import ScreenNameEnum from '../../routes/screenName.enum';
import {hp, wp} from '../../component/utils/Constant';

interface BookingParams {
  bookingId?: string;
  garageName?: string;
  serviceName?: string;
  date?: string;
  amount?: number;
}

// ── Detail row ──────────────────────────────────────────────
const DetailRow = ({
  icon,
  label,
  value,
  highlight,
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  isLast?: boolean;
}) => (
  <View
    style={[
      styles.detailRow,
      isLast && styles.detailRowLast,
    ]}>
    <View style={styles.detailLeft}>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text
      style={[
        styles.detailValue,
        highlight && styles.detailValueHighlight,
      ]}
      numberOfLines={1}>
      {value}
    </Text>
  </View>
);

// ── Screen ───────────────────────────────────────────────────
const BookingComplete: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute();
  const params = (route.params ?? {}) as BookingParams;
  const hasDetails = !!params.garageName;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#141414" barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* ── Success icon ── */}
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <View style={styles.iconCircle}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>
          </View>

          {/* ── Divider accent ── */}
          <View style={styles.accentLine} />

          {/* ── Title ── */}
          <Text style={styles.title}>Booking confirmed!</Text>
          <Text style={styles.subtitle}>
            Your bike service has been successfully booked.{'\n'}We'll see you soon.
          </Text>

          {/* ── Details card ── */}
          {hasDetails && (
            <View style={styles.detailsCard}>
              {!!params.bookingId && (
                <DetailRow
                  icon="receipt"
                  label="Booking ID"
                  value={`#${params.bookingId}`}
                  highlight
                />
              )}
              {!!params.garageName && (
                <DetailRow
                  icon="building"
                  label="Garage"
                  value={params.garageName}
                />
              )}
              {!!params.serviceName && (
                <DetailRow
                  icon="tool"
                  label="Service"
                  value={params.serviceName}
                />
              )}
              {!!params.date && (
                <DetailRow
                  icon="calendar"
                  label="Date & time"
                  value={params.date}
                />
              )}
              {params.amount != null && (
                <DetailRow
                  icon="currency-rupee"
                  label="Amount paid"
                  value={`₹${params.amount}`}
                  highlight
                  isLast
                />
              )}
            </View>
          )}

          {/* ── Reminder banner ── */}
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderIcon}>🔔</Text>
            <Text style={styles.reminderText}>
              You'll receive a reminder 1 hour before your appointment.
            </Text>
          </View>

          {/* ── CTA ── */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
            }>
            <Text style={styles.ctaText}>Back to home</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default BookingComplete;

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#081041',},
  safeArea: {flex: 1},
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: hp(6),
    paddingBottom: 40,
    flexGrow: 1,
  },

  // Success icon
  iconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1a2e1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#22c55e18',
    borderWidth: 2,
    borderColor: '#22c55e44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 30,
    color: '#22c55e',
    fontWeight: '700',
  },

  // Accent
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginTop: 18,
    marginBottom: 20,
  },

  // Text
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: hp(3),
  },

  // Details card
  detailsCard: {
    width: '100%',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  detailRowLast: {
    borderBottomWidth: 0,
    backgroundColor: '#1f1f1f',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#555',
  },
  detailValue: {
    fontSize: 13,
    color: '#ddd',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailValueHighlight: {
    color: 'green',
    fontWeight: '600',
    fontSize: 14,
  },

  // Reminder banner
  reminderBanner: {
    width: '100%',
    backgroundColor: '#FF572214',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF572225',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  reminderIcon: {
    fontSize: 18,
  },
  reminderText: {
    flex: 1,
    fontSize: 12,
    color: '#FF5722',
    lineHeight: 18,
  },

  // CTA
  ctaButton: {
    width: '100%',
    backgroundColor: '#FED428',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FED428',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});