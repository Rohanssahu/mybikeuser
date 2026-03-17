import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {color} from '../../constant';
import {icon} from '../../component/Image';
import ProfileMenuList from '../../component/ProfileList';
import ScreenNameEnum from '../../routes/screenName.enum';
import {get_profile} from '../../redux/Api/apiRequests';
import { image_url } from '../../redux/Api';

type RootStackParamList = {
  Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface UserType {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const Profile: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<UserType>({});

  console.log('====================================');
  console.log(user);
  console.log('====================================');

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  const getUser = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');

      const res = await get_profile(user_id);
      if (res?.success) {
        setUser(res.data || {});
      }
    } catch (err) {
      console.log('Profile error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate(ScreenNameEnum.EDIT_PROFILE)}
        style={styles.header}>
        <Image source= {user?.image?{uri:user?.image}:icon.profileIcon} style={styles.avatar} />

        <View style={{flex: 1}}>
          <Text style={styles.userName}>
            {user?.first_name || 'User'} {user?.last_name || ''}
          </Text>

          <Text style={styles.userSubText}>
            {user?.phone ? `${user.phone}` : 'View / Edit Profile'}
          </Text>
          <Text style={styles.userSubText}>View / Edit Profile</Text>
        </View>

        <Image source={icon.rightArrow} style={styles.arrow} />
      </TouchableOpacity>

      {/* Menu List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <ProfileMenuList data={profileData} />
      </ScrollView>
    </View>
  );
};

export default Profile;

// Profile menu list data
const profileData: ProfileMenuItem[] = [
  {
    id: 2,
    title: 'My Bikes',
    icon: icon.bikep,
    screen: ScreenNameEnum.MY_BIKES,
  },
  {
    id: 3,
    title: 'Notifications',
    icon: icon.bellp,
    screen: ScreenNameEnum.NOTIFICATION_SETTING,
  },
  {
    id: 4,
    title: 'About Us',
    icon: icon.aboutIcon,
    screen: ScreenNameEnum.ABOUT_SCREEN,
  },
  {
    id: 5,
    title: 'Privacy Policy',
    icon: icon.privacy,
    screen: ScreenNameEnum.PRIVACY_POLICY,
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

  header: {
    backgroundColor: color.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  avatar: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    marginRight: 16,
  },

  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  userSubText: {
    fontSize: 13,
    color: '#E5E7EB',
    marginTop: 4,
  },

  scrollContent: {
    
  },
});
