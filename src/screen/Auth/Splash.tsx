import React, {useEffect} from 'react';
import { View, Image, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../constant';
import images from '../../component/Image';
import ScreenNameEnum from '../../routes/screenName.enum';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash: React.FC = () => {
    const navigation = useNavigation<any>();
    const checkLogout = async () => {
        const token = await AsyncStorage.getItem('token')

        if (!token) {

            navigation.replace(ScreenNameEnum.LOGIN_SCREEN);
        }
        if (token) {

            navigation.reset({index: 0, routes: [{name: ScreenNameEnum.BOTTAM_TAB}]});
        }
    };
    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                checkLogout()
            }
        }, 3000); // 3 seconds delay

        return () => {
            isMounted = false;
            clearTimeout(timer);
        }; // Cleanup timeout on unmount
    }, []);

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
