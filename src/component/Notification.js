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

// Configure notification listeners
export const notificationListener = () => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log("Notification opened from background:", remoteMessage);
   // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    // Show local notification or navigate to relevant screen
   const parsedMain = remoteMessage?.data;
     showLocalNotification(parsedMain);
  });

  messaging().onMessage(async remoteMessage => {
    console.log("Foreground message received:", remoteMessage);
    // Show local notification or process the data
   // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
   const parsedMain = remoteMessage?.data;
     showLocalNotification(parsedMain);
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log("App launched by notification:", remoteMessage);
     // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // Show local notification or process the data
      const parsedMain = remoteMessage?.data;
     showLocalNotification(parsedMain);
    } else {
      console.log("No initial notification data");
    }
  });
};

const showLocalNotification = (value) => {
  // Ensure the channel is created
  PushNotification.createChannel(
    {
      channelId: 'com.mrbikeuser', // Ensure this matches the created channel
      channelName: 'mrbikeuser',
      channelDescription: 'A channel to categorize your notifications',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`CreateChannel returned '${created}'`)
  );

  // Show the local notification
  PushNotification.localNotification({
    channelId: 'com.mrbikeuser',
    title: value?.title || 'Default Title', // Default fallback title
    message: value?.body || 'Default Message', // Default fallback body
    playSound: true,
    soundName: 'default',
    priority: 'high',
    badge: true,
    smallIcon: 'ic_notification',
  });
};

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
