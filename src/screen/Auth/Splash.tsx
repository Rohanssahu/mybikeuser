import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../constant';
import images from '../../component/Image';
import ScreenNameEnum from '../../routes/screenName.enum';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the navigation type
type RootStackParamList = {
    Home: undefined; // Change 'Home' to your actual destination screen name
};

const Splash: React.FC = async() => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const checkLogout = async () => {
        const token = await AsyncStorage.getItem('token')

        if (!token) {

            navigation.navigate(ScreenNameEnum.LOGIN_SCREEN);
        }
        if (token) {

            navigation.navigate(ScreenNameEnum.BOTTAM_TAB);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            checkLogout()
        }, 3000); // 3 seconds delay

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, [navigation]);

    return (
        <View style={styles.container}>
             <StatusBar  backgroundColor={color.baground} />
            <SafeAreaView>
              
                <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        height: 120,
        width: 120,
    },
});

export default Splash;
