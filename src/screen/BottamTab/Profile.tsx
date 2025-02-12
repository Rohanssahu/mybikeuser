import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { color } from '../../constant';
import { icon } from '../../component/Image';
import ProfileMenuList from '../../component/ProfileList';
import ScreenNameEnum from '../../routes/screenName.enum';
import LogoutModal from '../modal/LogoutModal';

// Define navigation type
type RootStackParamList = {
    Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Define type for Profile Menu Items
interface ProfileMenuItem {
    id: number;
    title: string;
    icon: any;
    screen: string;
}

const Profile: React.FC<Props> = ({ navigation }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Profile</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ProfileMenuList data={profileData} />
               
            </ScrollView>
        </View>
    );
};

export default Profile;

// Profile menu list data
const profileData: ProfileMenuItem[] = [
    {
        id: 1,
        title: 'Profile',
        icon: icon.profileIcon,
        screen: ScreenNameEnum.EDIT_PROFILE,
    },
    {
        id: 2,
        title: 'Vehicles',
        icon: icon.bikep,
        screen: ScreenNameEnum.VEHICAL_SCREEN,
    },
    {
        id: 3,
        title: 'Notifications',
        icon: icon.bellp,
        screen: ScreenNameEnum.NOTIFICATION_SETTING
    },
    {
        id: 4,
        title: 'About Us',
        icon: icon.aboutIcon,
        screen:ScreenNameEnum.ABOUT_SCREEN
    },
    {
        id: 5,
        title: 'Privacy Policy',
        icon: icon.privacy,
        screen: ScreenNameEnum.PRIVACY_POLICY
    },
    {
        id: 6,
        title: 'Logout',
        icon: icon.logout,
        screen: 'Logout',
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    headerText: {
        fontWeight: '600',
        fontSize: 22,
        color: '#FFFFFF',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    scrollContent: {
        marginTop: 30,
    },
});
