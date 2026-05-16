import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {color} from '../../constant';
import {icon} from '../../component/Image';
import ProfileMenuList from '../../component/ProfileList';
import ScreenNameEnum from '../../routes/screenName.enum';
import {get_profile} from '../../redux/Api/apiRequests';

type RootStackParamList = {Profile: undefined};
type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface UserType {
  first_name?: string;
  last_name?: string;
  phone?: string;
  image?: string;
}

interface ProfileMenuItem {
  id: string;
  title: string;
  icon: any;
  screen: string;
}

const Profile: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<UserType>({});

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  const getUser = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const res = await get_profile(user_id ?? '');
      if (res?.success) {setUser(res.data || {});}
    } catch (err) {
      console.log('Profile error:', err);
    }
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {/* Profile Header */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => (navigation as any).navigate(ScreenNameEnum.EDIT_PROFILE)}
        style={styles.header}>

        {user?.image ? (
          <Image source={{uri: user.image}} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userSubText}>
            {user?.phone || 'Tap to edit profile'}
          </Text>
        </View>

        <Image source={icon.rightarrow} style={styles.arrow} />
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

const profileData: ProfileMenuItem[] = [
  {id: '2', title: 'My Bikes', icon: icon.bikep, screen: ScreenNameEnum.MY_BIKES},
  {id: '3', title: 'Notifications', icon: icon.bellp, screen: ScreenNameEnum.NOTIFICATION_SETTING},
  {id: '4', title: 'About Us', icon: icon.aboutIcon, screen: ScreenNameEnum.ABOUT_SCREEN},
  {id: '5', title: 'Privacy Policy', icon: icon.privacy, screen: ScreenNameEnum.PRIVACY_POLICY},
  {id: '6', title: 'Logout', icon: icon.logout, screen: 'Logout'},
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  header: {
    backgroundColor: '#0D1B42',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 14,
  },
  avatarPlaceholder: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: color.buttonColor,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userSubText: {
    fontSize: 13,
    color: '#A0A3BD',
    marginTop: 4,
  },
  arrow: {
    width: 20,
    height: 20,
    tintColor: '#606880',
  },
  scrollContent: {
    paddingTop: 8,
  },
});
