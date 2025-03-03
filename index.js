/**
 * @format
 */
import { Alert, AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

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

    const { notification } = remoteMessage;
    showLocalNotification(notification);
});

// 📌 Handle foreground messages
messaging().onMessage(async remoteMessage => {
    console.log("Foreground message received:", remoteMessage);

    // Ensure proper notification format
    const { notification } = remoteMessage;

    // Show alert (optional)

    // Show local notification
    showLocalNotification(notification);
});

// 📌 Handle notification when the app is opened from a background state
messaging().onNotificationOpenedApp(remoteMessage => {
    console.log("Notification opened from background:", remoteMessage);


    const { notification } = remoteMessage;
    showLocalNotification(notification);
});

// 📌 Handle notification when the app is opened from a quit state
messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
        console.log("App launched by notification:", remoteMessage);



        const { notification } = remoteMessage;
        showLocalNotification(notification);
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

// 📌 Function to show local notifications
const showLocalNotification = (value) => {
    if (!value || !value.title || !value.body) {
        console.log("No valid notification data found:", value);
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
    PushNotification.localNotification({
        channelId: 'com.mrbikeuser',
        title: value?.title || 'Default Title',
        message: value?.body || 'Default Message',
        playSound: true,
        soundName: 'default',
        priority: 'high',
        badge: true,
        smallIcon: 'ic_notification',
    });
};

AppRegistry.registerComponent(appName, () => App);
