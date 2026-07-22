import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useEffect } from 'react';

// Request user permissions
export async function requestUserPermission() {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission({
        alert: true,  // ✅ Enable alerts
        sound: true,  // ✅ Enable sound
        badge: true,  // ✅ Enable badge
        carPlay: false,
      });

      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("iOS Notification Permission Granted ✅");
        getFcmToken();
      } else {
        console.warn("iOS Notification Permission Denied ❌");
      }

    } else {
      // 📌 Check if Android version is 13+ (API 33)
      if (Platform.Version >= 33) {
        const notificationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        const enabled = notificationPermission === PermissionsAndroid.RESULTS.GRANTED;

        if (enabled) {
          console.log("Android 13+ Notification Permission Granted ✅");
          getFcmToken();
        } else {
          console.warn("Android 13+ Notification Permission Denied ❌");
        }
      } else {
        console.log("Android <13: Notifications enabled by default ✅");
        getFcmToken();
      }
    }
  } catch (error) {
    console.error("Permission request failed:", error);
  }
}

// Get FCM token and store it (optional)
const getFcmToken = async () => {

};

// index.js registers the app's single onMessage/onNotificationOpenedApp/
// getInitialNotification handlers at startup and builds the local
// notification there. This used to re-register the same listeners, which
// made every foreground/opened-app message produce a second, duplicate
// tray notification. Kept as a no-op so the existing Login.tsx call site
// doesn't need to change.
export const notificationListener = () => {};

// Call this function once, e.g., in your App component
export const initializeNotifications = () => {
  PushNotification.createChannel(
    {
      channelId: 'com.mrbikeuser',
      channelName: 'mrbikeuser',
      channelDescription: 'A channel to categorize your notifications',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );
  requestUserPermission();
  notificationListener();
};



// notificationService.js
export const showBookingNotification = (serviceName, garageName, date) => {
  PushNotification.createChannel(
    {
      channelId: 'com.mrbikeuser',
      channelName: 'mrbikeuser',
      channelDescription: 'A channel to categorize your notifications',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );

  PushNotification.localNotification({
    channelId: 'com.mrbikeuser',
    title: 'Booking Confirmed!',
    message: `Your booking for ${serviceName} at ${garageName} is confirmed on ${date}`,
    playSound: true,
    soundName: 'default',
    priority: 'high',
    badge: true,
    smallIcon: 'ic_notification', // Make sure you have this icon in android/app/src/main/res/mipmap/
  });
};

export const showLocalNotificationcancel = (title, message) => {
  // Ensure the Android channel exists
  PushNotification.createChannel(
    {
      channelId: 'com.mrbikeuser',
      channelName: 'mrbikeuser',
      channelDescription: 'A channel for booking notifications',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );

  PushNotification.localNotification({
    channelId: 'com.mrbikeuser',
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    priority: 'high',
    badge: true,
    smallIcon: 'ic_notification',
  });
};