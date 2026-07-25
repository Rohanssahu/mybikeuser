import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {color, spacing} from '../../constant';
import {useLocation} from '../../component/LocationContext';
import {getCurrentLocation} from '../../component/helperFunction';
import ServiceGateLayout from './ServiceGateLayout';

interface PausedScreenProps {
  areaName: string;
  reason?: string | null;
}

// Temporary-interruption framing (distinct tone from ComingSoonScreen's
// "not here yet") — service in this area was live and is paused, expected
// back, not a permanent unavailability.
const PausedScreen: React.FC<PausedScreenProps> = ({areaName, reason}) => {
  const {checkServiceability, checkingServiceability} = useLocation();

  const handleRecheck = async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      await checkServiceability(latitude, longitude);
    } catch (error) {
      console.error('PausedScreen recheck error:', error);
    }
  };

  return (
    <ServiceGateLayout
      icon="pause-circle-outline"
      iconColor={color.danger}
      title={`${areaName} service is paused`}
      body="Bookings in your area are temporarily paused. This isn't permanent — we'll be back up and running soon."
      primaryLabel="Check again"
      onPrimaryPress={handleRecheck}
      primaryLoading={checkingServiceability}>
      {reason ? (
        <View style={styles.reasonChip}>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      ) : null}
    </ServiceGateLayout>
  );
};

const styles = StyleSheet.create({
  reasonChip: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: color.dangerBg,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textPrimary,
    textAlign: 'center',
  },
});

export default PausedScreen;
