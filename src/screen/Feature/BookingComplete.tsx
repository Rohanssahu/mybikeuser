import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, SafeAreaView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../constant';
import images from '../../component/Image';
import ScreenNameEnum from '../../routes/screenName.enum';
import { hp, wp } from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';

// Define the navigation type
type RootStackParamList = {
    Home: undefined; // Change 'Home' to your actual destination screen name
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const BookingComplete: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Uncomment when `BOTTAM_TAB` is defined
            // navigation.replace(ScreenNameEnum.BOTTAM_TAB);
        }, 3000); // 3 seconds delay

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, [navigation]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor={color.baground} />

                {/* Confirmation Image */}
                <Image
                    source={images.complete}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Confirmation Text */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Booking Confirmed!</Text>
                    <Text style={styles.subtitle}>
                        Your bike service booking has been successfully confirmed.
                    </Text>
                </View>
                <View style={{
                    position: 'absolute',
                    bottom: 30, width: '100%', paddingHorizontal: 30
                }}>
                    <CustomButton
                        title='Back To Home'

                        onPress={() => {
                            navigation.navigate(ScreenNameEnum.BOTTAM_TAB)
                        }}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

export default BookingComplete;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    safeArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        height: hp(30),
        width: wp(90),
        marginTop: hp(5),
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(5),
        width: '100%',
        borderWidth: 1,
        paddingHorizontal: 60,
        borderColor: color.baground,
    },
    title: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 10,
        color: '#9DB2BF',
        fontWeight: '400',
        textAlign: 'center',
    },
});
