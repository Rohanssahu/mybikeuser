import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const INBOX_KEY = '@mrbike/campaign-notification-inbox';
const PENDING_POPUP_KEY = '@mrbike/pending-campaign-popup';
const MAX_ITEMS = 100;

export const NOTIFICATION_INBOX_UPDATED = 'notificationInboxUpdated';

const notificationKey = (item: any) =>
  String(
    item?.messageId ||
      item?.id ||
      item?._id ||
      `${item?.title || ''}|${item?.body || ''}|${item?.sentAt || ''}`,
  );

export const getLocalNotifications = async (): Promise<any[]> => {
  try {
    const stored = await AsyncStorage.getItem(INBOX_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[notificationInbox] Could not read inbox:', error);
    return [];
  }
};

export const saveRemoteNotification = async (remoteMessage: any) => {
  const notification = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};
  const title = notification?.title || data?.title || data?.notification_title;
  const body = notification?.body || data?.body || data?.message || data?.description;

  if (!title && !body) { return; }

  const item = {
    ...data,
    id: remoteMessage?.messageId || data?.id || data?._id,
    messageId: remoteMessage?.messageId,
    title: title || 'Notification',
    body: body || '',
    type: data?.type || data?.notification_type || 'campaign',
    image:
      notification?.android?.imageUrl ||
      notification?.ios?.imageUrl ||
      data?.image ||
      data?.imageUrl,
    sentAt: remoteMessage?.sentTime
      ? new Date(remoteMessage.sentTime).toISOString()
      : data?.sentAt || data?.createdAt || new Date().toISOString(),
    read: false,
  };

  try {
    const current = await getLocalNotifications();
    const key = notificationKey(item);
    const next = [item, ...current.filter(existing => notificationKey(existing) !== key)]
      .slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(PENDING_POPUP_KEY, JSON.stringify(item));
    DeviceEventEmitter.emit(NOTIFICATION_INBOX_UPDATED, item);
  } catch (error) {
    console.warn('[notificationInbox] Could not save notification:', error);
  }
};

export const consumePendingCampaignPopup = async () => {
  try {
    const stored = await AsyncStorage.getItem(PENDING_POPUP_KEY);
    if (!stored) { return null; }
    await AsyncStorage.removeItem(PENDING_POPUP_KEY);
    return JSON.parse(stored);
  } catch (error) {
    console.warn('[notificationInbox] Could not read pending popup:', error);
    return null;
  }
};

export const mergeNotifications = (serverItems: any[], localItems: any[]) => {
  const seen = new Set<string>();
  return [...serverItems, ...localItems]
    .filter(item => {
      const key = notificationKey(item);
      if (seen.has(key)) { return false; }
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a?.sentAt || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.sentAt || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
};
