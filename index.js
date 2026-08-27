/**
 * @format
 */
import { Alert, AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { saveRemoteNotification } from './src/utils/notificationInbox';

// Request permissions on iOS
if (Platform.OS === 'ios') {
    PushNotificationIOS.requestPermissions().then(
        (data) => console.log('PushNotificationIOS.requestPermissions', data),
        (data) => console.log('PushNotificationIOS.requestPermissions failed', data)
    );
}

// 📌 Background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Message Received:', remoteMessage);

    await saveRemoteNotification(remoteMessage);
    showLocalNotification(remoteMessage);
});

// 📌 Handle foreground messages
messaging().onMessage(async remoteMessage => {
    console.log("Foreground message received:", remoteMessage);

    // Ensure proper notification format
    await saveRemoteNotification(remoteMessage);
    showLocalNotification(remoteMessage);
});

// 📌 Handle notification when the app is opened from a background state
messaging().onNotificationOpenedApp(remoteMessage => {
    console.log("Notification opened from background:", remoteMessage);


    saveRemoteNotification(remoteMessage);
});

// 📌 Handle notification when the app is opened from a quit state
messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
        console.log("App launched by notification:", remoteMessage);
        saveRemoteNotification(remoteMessage);
    }
});

// 📌 Configure PushNotification (Ensure channel is created before showing notifications)
PushNotification.configure({
    onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
});

// Create the high-importance channel during app startup as well. FCM
// notification payloads may be displayed by Android before our JS handler runs.
PushNotification.createChannel({
    channelId: 'com.mrbikeuser',
    channelName: 'mrbikeuser',
    channelDescription: 'Mr.Bike alerts and campaign notifications',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
});

// 📌 Function to show local notifications
const showLocalNotification = (remoteMessage) => {
    const notification = remoteMessage?.notification || {};
    const data = remoteMessage?.data || {};
    const title = notification?.title || data?.title || data?.notification_title;
    const message = notification?.body || data?.body || data?.message || data?.description;

    if (!title && !message) {
        console.log('No valid notification data found:', remoteMessage);
        return;
    }

    // Ensure the channel is created
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

    // Show the local notification
    const imageUrl =
        notification?.android?.imageUrl ||
        notification?.ios?.imageUrl ||
        data?.image ||
        data?.imageUrl;

    PushNotification.localNotification({
        channelId: 'com.mrbikeuser',
        title: title || 'Notification',
        message: message || '',
        playSound: true,
        soundName: 'default',
        priority: 'high',
        badge: true,
        smallIcon: 'ic_notification',
        userInfo: data,
        ...(imageUrl && { bigPictureUrl: imageUrl, largeIconUrl: imageUrl }),
    });
};

AppRegistry.registerComponent(appName, () => App);
