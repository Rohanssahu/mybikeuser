import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';

import {color, spacing} from '../../constant';
import {useLocation} from '../../component/LocationContext';
import {getCurrentLocation} from '../../component/helperFunction';
import ServiceGateLayout from './ServiceGateLayout';

// Client-side-only "Notify me" flag — there is no notify/waitlist backend
// endpoint today, so this just remembers the request on-device (and disables
// the button) instead of actually enqueueing a server-side notification.
const NOTIFY_ME_KEY = 'NotifyMeAreas';

type NotifyMeEntry = {areaName: string; requestedAt: string};

const hasRequestedNotify = async (areaName: string): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFY_ME_KEY);
    const list: NotifyMeEntry[] = raw ? JSON.parse(raw) : [];
    return list.some(entry => entry.areaName === areaName);
  } catch {
    return false;
  }
};

const recordNotifyMeRequest = async (areaName: string): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFY_ME_KEY);
    const list: NotifyMeEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(entry => entry.areaName !== areaName);
    filtered.push({areaName, requestedAt: new Date().toISOString()});
    await AsyncStorage.setItem(NOTIFY_ME_KEY, JSON.stringify(filtered));
  } catch {}
};

interface ComingSoonScreenProps {
  areaName: string;
  estimatedLiveDate?: string | null;
}

const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  areaName,
  estimatedLiveDate,
}) => {
  const {checkServiceability, checkingServiceability} = useLocation();
  const [notifyRequested, setNotifyRequested] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasRequestedNotify(areaName).then(requested => {
      if (!cancelled) setNotifyRequested(requested);
    });
    return () => {
      cancelled = true;
    };
  }, [areaName]);

  const handleNotifyMe = async () => {
    setNotifyLoading(true);
    try {
      await recordNotifyMeRequest(areaName);
      setNotifyRequested(true);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleRecheck = async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      await checkServiceability(latitude, longitude);
    } catch (error) {
      console.error('ComingSoonScreen recheck error:', error);
    }
  };

  let estimateText: string | null = null;
  if (estimatedLiveDate) {
    try {
      estimateText = `Expected live ${format(
        new Date(estimatedLiveDate),
        'd MMM yyyy',
      )}`;
    } catch {
      estimateText = null;
    }
  }

  return (
    <ServiceGateLayout
      icon="map-marker-radius-outline"
      title={`We're not in ${areaName} yet`}
      body="We're expanding fast — this area isn't live for bookings just yet. Check back soon or ask us to notify you the moment we launch here."
      primaryLabel={
        notifyRequested ? "You'll be notified" : 'Notify me when we launch'
      }
      onPrimaryPress={handleNotifyMe}
      primaryLoading={notifyLoading}
      primaryDisabled={notifyRequested}
      secondaryLabel="Check again"
      onSecondaryPress={handleRecheck}
      secondaryLoading={checkingServiceability}>
      {estimateText ? (
        <View style={styles.estimateChip}>
          <Text style={styles.estimateText}>{estimateText}</Text>
        </View>
      ) : null}
    </ServiceGateLayout>
  );
};

const styles = StyleSheet.create({
  estimateChip: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: color.successBg,
  },
  estimateText: {
    fontSize: 13,
    fontWeight: '700',
    color: color.success,
  },
});

export default ComingSoonScreen;
