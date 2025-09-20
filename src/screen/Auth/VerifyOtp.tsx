import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { color } from '../../constant';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';
import { hp } from '../../component/utils/Constant';
import messaging from '@react-native-firebase/messaging';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell
} from 'react-native-confirmation-code-field';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';

import { errorToast, successToast } from '../../configs/customToast';
import { otp_Verify, resend_Otp } from '../../redux/Api/apiRequests';
import Loading from '../../configs/Loader';

interface VerifyOtpProps {
    navigation: StackNavigationProp<any, any>;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ navigation }) => {
    const [value, setValue] = useState<string>('');
    const [isLoading, setisLoading] = useState<boolean>(false);

    const route = useRoute();
    const { phone } = route.params

    const ref = useBlurOnFulfill({ value, cellCount: 4 });

    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const Verify_otps = async (): Promise<void> => {
       


        setisLoading(true)
        if (!value) {
            return errorToast('Please Enter 4 Digit Otp');
        }
        if (value.length !== 4) {
            return errorToast('Please Enter Valid Otp');
        }

        // Construct the phone number with country code and call Login_witPhone
        const response = await otp_Verify(phone, value);

        // Handle the response
        if (response.success) {

console.log('response?.user')
console.log(response?.user);

            if(response?.user?.isProfile){
                navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
            }
            else{
               navigation.navigate(ScreenNameEnum.PROFILE_DETAILS)
             //navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
            }
            
            setisLoading(false)
        } else {
            console.log('Login failed: ', response.message);
            setisLoading(false)
        }

    };
    const resend_otps = async (): Promise<void> => {

        setisLoading(true)


        // Construct the phone number with country code and call Login_witPhone
        const response = await resend_Otp(phone);

        // Handle the response
        if (response.success) {
            console.log('otp successful: ', response);

            successToast('Otp Resent Successfully')
            response.user && console.log('User Info:', response.user);
            setisLoading(false)
        } else {
            console.log('Login failed: ', response.message);
            setisLoading(false)
        }

    };

    return (
        <View style={styles.container}>
            {isLoading&&<Loading />}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 15 }}>
                <Icon source={icon.back} size={50} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Check Your Cell Phone</Text>
                <Text style={styles.subtitle}>Please put the 4 digits sent to you</Text>

                <View style={styles.codeContainer}>
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={4}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <View key={index} style={styles.cellContainer}>
                                <Text
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}
                                >
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <TouchableOpacity
                    onPress={() => {
                        resend_otps()
                    }}
                >
                    <Text style={styles.resendOtp}>RESEND OTP</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <CustomButton
                    title="Submit"
                    onPress={() => {
                        Verify_otps()

                    }}
                    buttonStyle={styles.button}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(10),
    },
    title: {
        fontSize: 20,
        color: color.white,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 14,
        color: color.white,
        fontWeight: '400',
        marginTop: 5,
    },
    codeContainer: {
        height: hp(10),
        width: '50%',
        marginTop: hp(8),
        alignSelf: 'center',
    },
    cellContainer: {
        backgroundColor: '#E9E9E9',
        borderRadius: 15,
    },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#E9E9E9',
        textAlign: 'center',
        color: '#000',
        borderRadius: 10,
    },
    focusCell: {
        borderColor: '#009838',
        borderRadius: 10,
    },
    resendOtp: {
        fontSize: 14,
        color: color.white,
        borderBottomWidth: 0.8,
        borderColor: '#fff',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {},
});

export default VerifyOtp;
