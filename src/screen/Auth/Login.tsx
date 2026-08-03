import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import images from '../../component/Image';
import { hp, wp } from '../../component/utils/Constant';
import { errorToast } from '../../configs/customToast';
import { Login_witPhone } from '../../redux/Api/apiRequests';
import Loading from '../../configs/Loader';
import ScreenNameEnum from '../../routes/screenName.enum';
import messaging from '@react-native-firebase/messaging';
import { notificationListener, requestUserPermission } from '../../component/Notification';

const Login: React.FC = ({ navigation }: any) => {
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isLoading, setisLoading] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const isValid = phoneNumber.length === 10;

    const LoginHandler = async (): Promise<void> => {
        const device_token = await messaging().getToken();
        setisLoading(true);
        if (!phoneNumber) {
            setisLoading(false);
            return errorToast('Please enter your phone number');
        }
        if (phoneNumber.length !== 10) {
            setisLoading(false);
            return errorToast('Please enter a valid 10-digit number');
        }
        const response = await Login_witPhone(`+91${phoneNumber}`, device_token);
        if (response.success) {
            navigation.navigate(ScreenNameEnum.OTP_SCREEN, { phone: `+91${phoneNumber}` });
        }
        setisLoading(false);
    };

    useEffect(() => {
        notificationListener();
        requestUserPermission();
    }, []);

    useEffect(() => {
        // index.js owns the single onMessage/localNotification pipeline for
        // FCM messages — this screen used to register a second onMessage
        // handler that built its own local notification, doubling every
        // foreground push. Only the launched-from-notification alert stays
        // here since it isn't a tray notification.
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    const { title, body } = remoteMessage.notification;
                    Alert.alert(title, body);
                }
            });
    }, []);

    return (
        // ROOT = plain View — never intercepts touches
        <View style={styles.root}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

            {/* Layer 1 — gradient background, pointerEvents none */}
            <LinearGradient
                colors={['#060E36', '#081041', '#0A1458']}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
            />

            {/* Layer 2 — decorative circles + bike, pointerEvents none */}
            <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
                <View style={styles.circleTopRight} />
                <View style={styles.circleBottomLeft} />
                <View style={styles.bikeWrap}>
                    <Image source={images.bikes} style={styles.bikeImg} resizeMode="contain" />
                </View>
            </View>

            {/* Layer 3 — all interactive content */}
            {isLoading && <Loading />}

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}>

                    {/* Logo */}
                    <View style={styles.logoArea}>
                        <View style={styles.logoBg}>
                            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                        </View>
                        <Text style={styles.appName}>Mr.Bike Doctor </Text>
                        <Text style={styles.tagline}>⭐ Your Bike Our Care ⭐</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.greetText}>Welcome! 👋</Text>
                        <Text style={styles.subText}>
                            Enter your mobile number to{'\n'}login or create an account
                        </Text>

                        {/* Phone Input */}
                        <Text style={styles.label}>MOBILE NUMBER</Text>

                        <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                            <View style={styles.flagSection}>
                                <Text style={styles.flagEmoji}>🇮🇳</Text>
                                <Text style={styles.dialCode}>+91</Text>
                                <View style={styles.sep} />
                            </View>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Enter 10-digit number"
                                placeholderTextColor="#4A5A8A"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                underlineColorAndroid="transparent"
                                autoCorrect={false}
                            />
                            {isValid && (
                                <View style={styles.validDot}>
                                    <Text style={styles.validTick}>✓</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.helperText}>
                            You'll receive an OTP on this number
                        </Text>

                        {/* Button */}
                        <TouchableOpacity
                            style={[styles.sendBtn, isValid && styles.sendBtnActive]}
                            onPress={LoginHandler}
                            activeOpacity={0.85}>
                            <Text style={[styles.sendBtnText, isValid && styles.sendBtnTextActive]}>
                                Send OTP  →
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Secure Login</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Chips */}
                        <View style={styles.chips}>
                            <View style={styles.chip}>
                                <Text style={styles.chipIcon}>🔒</Text>
                                <Text style={styles.chipText}>100% Secure</Text>
                            </View>
                            <View style={styles.chip}>
                                <Text style={styles.chipIcon}>⚡</Text>
                                <Text style={styles.chipText}>Instant OTP</Text>
                            </View>
                            <View style={styles.chip}>
                                <Text style={styles.chipIcon}>🇮🇳</Text>
                                <Text style={styles.chipText}>Made in India</Text>
                            </View>
                        </View>
                    </View>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#081041',   // fallback color while gradient loads
    },
    flex1: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 20,
        paddingBottom: 40,
    },

    /* decoratives */
    circleTopRight: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#FED42812',
        top: -70,
        right: -70,
    },
    circleBottomLeft: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FED4280A',
        bottom: hp(15),
        left: -60,
    },
    bikeWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.06,
        alignItems: 'center',
    },
    bikeImg: {
        width: wp(100),
        height: hp(16),
    },

    /* logo */
    logoArea: {
        alignItems: 'center',
        marginTop: hp(5),
        marginBottom: hp(4),
    },
    logoBg: {
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: '#FED42818',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FED42840',
        elevation: 8,
    },
    logo: {
        width: 64,
        height: 64,
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FED428',
        marginTop: 10,
        letterSpacing: 1.5,
    },
    tagline: {
        fontSize: 13,
        color: '#fff',
        marginTop: 4,
    },

    /* card */
    card: {
        marginHorizontal: 20,
        backgroundColor: '#0C1650',
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1A2870',
        elevation: 6,
    },
    greetText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subText: {
        fontSize: 14,
        color: '#6677AA',
        lineHeight: 22,
        marginBottom: 22,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8899CC',
        marginBottom: 8,
        letterSpacing: 0.8,
    },

    /* input */
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#080F38',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#1A2870',
        height: 58,
        paddingRight: 12,
        marginBottom: 8,
    },
    inputRowFocused: {
        borderColor: '#FED428',
    },
    flagSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 2,
    },
    flagEmoji: {
        fontSize: 20,
    },
    dialCode: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 5,
    },
    sep: {
        width: 1.5,
        height: 22,
        backgroundColor: '#2A3878',
        marginLeft: 10,
        marginRight: 2,
    },
    phoneInput: {
        flex: 1,
        height: 58,          // match parent height — fixes Android tap area
        fontSize: 16,
        color: '#FFFFFF',
        paddingLeft: 10,
        paddingVertical: 0,  // remove default Android padding
    },
    validDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#00C853',
        alignItems: 'center',
        justifyContent: 'center',
    },
    validTick: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
    },
    helperText: {
        fontSize: 12,
        color: '#4A5A8A',
        marginBottom: 22,
    },

    /* button */
    sendBtn: {
        height: 56,
        borderRadius: 14,
        backgroundColor: '#162060',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
        borderWidth: 1,
        borderColor: '#1E2E7A',
    },
    sendBtnActive: {
        backgroundColor: '#FED428',
        borderColor: '#FED428',
        elevation: 6,
    },
    sendBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#4A5A8A',
    },
    sendBtnTextActive: {
        color: '#081041',
    },

    /* divider */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1A2870',
    },
    dividerText: {
        fontSize: 11,
        color: '#4A5A8A',
        marginHorizontal: 10,
    },

    /* chips */
    chips: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    chip: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#080F38',
        borderRadius: 12,
        paddingVertical: 10,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#1A2870',
    },
    chipIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    chipText: {
        fontSize: 10,
        color: '#6677AA',
        fontWeight: '500',
    },

    /* terms */
    termsText: {
        fontSize: 12,
        color: '#3A4A6A',
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 30,
        lineHeight: 18,
    },
    termsLink: {
        color: '#FED428',
        fontWeight: '600',
    },
});
