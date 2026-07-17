import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../component/utils/Constant';
import { errorToast, successToast } from '../../configs/customToast';
import { otp_Verify, resend_Otp } from '../../redux/Api/apiRequests';
import Loading from '../../configs/Loader';
import ScreenNameEnum from '../../routes/screenName.enum';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';

const RESEND_DELAY = 30;
const CELL_COUNT = 4;

interface VerifyOtpProps {
    navigation: NativeStackNavigationProp<any, any>;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ navigation }) => {
    const [value, setValue] = useState<string>('');
    const [isLoading, setisLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(RESEND_DELAY);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const route = useRoute();
    const { phone } = route.params as { phone: string };
    const insets = useSafeAreaInsets();

    // Masked phone: +91XXXXXX7890 → +91 ******7890
    const maskedPhone = phone
        ? phone.slice(0, 3) + ' ******' + phone.slice(-4)
        : '';

    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

    /* ── countdown timer ── */
    const startTimer = () => {
        setTimer(RESEND_DELAY);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    /* ── verify OTP ── */
    const Verify_otps = async (): Promise<void> => {
        if (!value) return errorToast('Please enter the 4-digit OTP');
        if (value.length !== 4) return errorToast('Please enter a valid OTP');
        setisLoading(true);
        const response = await otp_Verify(phone, value);
        if (response.success) {
            if (response?.user?.isProfile) {
                navigation.reset({index: 0, routes: [{name: ScreenNameEnum.BOTTAM_TAB}]});
            } else {
                navigation.reset({index: 0, routes: [{name: ScreenNameEnum.PROFILE_DETAILS}]});
            }
        }
        setisLoading(false);
    };

    /* ── resend OTP ── */
    const resend_otps = async (): Promise<void> => {
        if (timer > 0) return;
        setisLoading(true);
        const response = await resend_Otp(phone);
        if (response.success) {
            successToast('OTP resent successfully');
            startTimer();
        }
        setisLoading(false);
    };

    const isComplete = value.length === CELL_COUNT;

    return (
        <LinearGradient
            colors={['#060E36', '#081041', '#0A1458']}
            style={styles.container}>
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle="light-content"
            />
            {isLoading && <Loading />}

            {/* Decorative circles */}
            <View style={styles.circleTopRight} />
            <View style={styles.circleBottomLeft} />

            {/* Back Button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}>
                <Icon source={icon.back} size={24} tintColor="#FFFFFF" />
            </TouchableOpacity>

            {/* Progress pills */}
            <View style={styles.progress}>
                <View style={[styles.pill, styles.pillDone]} />
                <View style={[styles.pill, styles.pillActive]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Icon badge */}
                <View style={styles.iconBadge}>
                    <Text style={styles.iconBadgeText}>📱</Text>
                </View>

                <Text style={styles.title}>Enter OTP</Text>
                <Text style={styles.subtitle}>
                    We sent a 4-digit OTP to{'\n'}
                    <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
                </Text>

                {/* OTP cells */}
                <View style={styles.codeWrapper}>
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <View
                                key={index}
                                style={[
                                    styles.cell,
                                    isFocused && styles.cellFocused,
                                    symbol && styles.cellFilled,
                                ]}
                                onLayout={getCellOnLayoutHandler(index)}>
                                <Text style={styles.cellText}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                        )}
                    />
                </View>

                {/* Timer / Resend */}
                <View style={styles.resendRow}>
                    {timer > 0 ? (
                        <Text style={styles.timerText}>
                            Resend OTP in{' '}
                            <Text style={styles.timerCount}>
                                00:{String(timer).padStart(2, '0')}
                            </Text>
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={resend_otps} activeOpacity={0.7}>
                            <Text style={styles.resendText}>
                                Didn't receive OTP?{' '}
                                <Text style={styles.resendLink}>Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Wrong number link */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.wrongNumber}>
                        Wrong number?{' '}
                        <Text style={styles.changeNumber}>Change</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <View style={[styles.btnWrap, {paddingBottom: insets.bottom + 16}]}>
                <TouchableOpacity
                    style={[styles.verifyBtn, isComplete && styles.verifyBtnActive]}
                    onPress={Verify_otps}
                    activeOpacity={0.85}>
                    <Text style={[styles.verifyText, isComplete && styles.verifyTextActive]}>
                        {isComplete ? 'Verify & Continue  ✓' : 'Enter OTP to continue'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.secureNote}>
                    🔒  This is a secure OTP verification
                </Text>
            </View>
        </LinearGradient>
    );
};

export default VerifyOtp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    /* Decorative */
    circleTopRight: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#FED42808',
        top: -80,
        right: -80,
    },
    circleBottomLeft: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FED42806',
        bottom: hp(12),
        left: -60,
    },

    /* Back btn */
    backBtn: {
        marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 20,
        marginLeft: 20,
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#0C1650',
        borderWidth: 1,
        borderColor: '#1A2870',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Progress */
    progress: {
        flexDirection: 'row',
        marginLeft: 20,
        marginTop: 16,
        gap: 6,
    },
    pill: {
        height: 4,
        width: 32,
        borderRadius: 2,
    },
    pillDone: {
        backgroundColor: '#FED428',
    },
    pillActive: {
        backgroundColor: '#FED42860',
    },

    /* Content */
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: hp(5),
        paddingHorizontal: 24,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#0C1650',
        borderWidth: 1.5,
        borderColor: '#1A2870',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#FED428',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    iconBadgeText: {
        fontSize: 36,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 15,
        color: '#6677AA',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: hp(5),
    },
    phoneHighlight: {
        color: '#FED428',
        fontWeight: '700',
    },

    /* OTP Cells */
    codeWrapper: {
        width: '85%',
        alignSelf: 'center',
        marginBottom: 28,
    },
    cell: {
        width: 62,
        height: 68,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#1A2870',
        backgroundColor: '#0C1650',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 6,
    },
    cellFocused: {
        borderColor: '#FED428',
        backgroundColor: '#141E6A',
        shadowColor: '#FED428',
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    cellFilled: {
        borderColor: '#FED42880',
        backgroundColor: '#0F1960',
    },
    cellText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 32,
    },

    /* Resend */
    resendRow: {
        marginBottom: 16,
    },
    timerText: {
        fontSize: 14,
        color: '#4A5A8A',
        textAlign: 'center',
    },
    timerCount: {
        color: '#FED428',
        fontWeight: '700',
    },
    resendText: {
        fontSize: 14,
        color: '#6677AA',
        textAlign: 'center',
    },
    resendLink: {
        color: '#FED428',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    wrongNumber: {
        fontSize: 13,
        color: '#3A4A6A',
        textAlign: 'center',
        marginTop: 4,
    },
    changeNumber: {
        color: '#8899CC',
        fontWeight: '600',
    },

    /* Verify Button */
    btnWrap: {
        paddingHorizontal: 24,
    },
    verifyBtn: {
        height: 60,
        borderRadius: 18,
        backgroundColor: '#162060',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1E2E7A',
        marginBottom: 12,
    },
    verifyBtnActive: {
        backgroundColor: '#FED428',
        borderColor: '#FED428',
        shadowColor: '#FED428',
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 10,
    },
    verifyText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#3A4A6A',
        letterSpacing: 0.3,
    },
    verifyTextActive: {
        color: '#081041',
    },
    secureNote: {
        fontSize: 12,
        color: '#2A3A5A',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});
