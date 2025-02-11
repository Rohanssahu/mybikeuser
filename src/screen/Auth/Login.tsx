import React from 'react';
import {
    View,
    Text,
    StatusBar,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    FlatList
} from 'react-native';
import images, { icon } from '../../component/Image';
import { color } from '../../constant';
import { hp, wp } from '../../component/utils/Constant';
import Icon from '../../component/Icon';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';

// Define interface for button data
interface BtnData {
    icon: any; // Adjust type as needed based on actual icon type
}

const btnData: BtnData[] = [
    {
        icon: icon.google
    },
    {
        icon: icon.apple
    },
    {
        icon: icon.facebook
    },
];

const Login: React.FC = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <SafeAreaView>
                <StatusBar backgroundColor={color.baground} />

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                </View>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.labelText}>Phone Number</Text>

                    <View style={styles.phoneInputContainer}>
                        {/* Country Code Picker */}
                        <TouchableOpacity style={styles.countryCode}>
                            <Text style={styles.countryCodeText}>+91</Text>
                            <Icon source={icon.downwhite} size={20} />
                        </TouchableOpacity>

                        {/* Phone Number Input */}
                        <View style={styles.phoneNumberInput}>
                            <TextInput
                                placeholder="Phone number"
                                style={styles.textInput}
                                placeholderTextColor={color.white}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Login Button */}
                    <CustomButton
                        title="Login"
                        onPress={() => {
                            navigation.navigate(ScreenNameEnum.OTP_SCREEN)
                        }}
                        buttonStyle={styles.button}
                    />
                </View>
            </SafeAreaView>

            {/* Social Login Options */}
            <View style={styles.socialLoginContainer}>
                <Text style={styles.orText}>Or</Text>
                <View style={styles.socialButtons}>
                    <FlatList
                        data={btnData}
                        horizontal
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.socialButton}>
                                <Icon source={item.icon} size={50} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </View>
    );
};

export default Login;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(8),
    },
    logo: {
        height: 120,
        width: 120,
    },
    inputContainer: {
        paddingHorizontal: 25,
        marginTop: hp(5),
    },
    welcomeText: {
        fontWeight: '600',
        fontSize: 20,
        color: color.white,
    },
    labelText: {
        fontWeight: '500',
        fontSize: 14,
        color: color.white,
        marginTop: 15,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    countryCode: {
        borderColor: color.borderColor,
        height: 55,
        borderWidth: 1.8,
        marginTop: 5,
        padding: 10,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCodeText: {
        fontSize: 16,
        color: color.white,
        marginRight: 2,
    },
    phoneNumberInput: {
        borderColor: color.borderColor,
        borderWidth: 1.8,
        marginTop: 5,
        paddingHorizontal: 10,
        height: 55,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        width: '77%',
        marginLeft: 10,
    },
    textInput: {
        fontWeight: '500',
        color: color.white,
        flex: 1,
    },
    button: {
        marginTop: 30,
    },
    socialLoginContainer: {
        position: 'absolute',
        bottom: 0,
        width: wp(100),
        height: hp(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    orText: {
        color: color.grey,
        fontWeight: '600',
    },
    socialButtons: {
        marginTop: hp(5),
    },
    socialButton: {
        marginHorizontal: 10,
    },
});
