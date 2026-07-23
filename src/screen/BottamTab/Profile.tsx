import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {color, TAB_BAR_HEIGHT} from '../../constant';
import ProfileMenuList from '../../component/ProfileList';
import ScreenNameEnum from '../../routes/screenName.enum';
import {get_profile, get_referral_summary} from '../../redux/Api/apiRequests';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  icon: string;
  screen: string;
}

interface ProfileMenuSection {
  id: string;
  title?: string;
  data: ProfileMenuItem[];
  danger?: boolean;
}

const Profile: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<UserType>({});
  // Hidden by default until the admin flag confirms it should show — avoids
  // a flash of the menu item before the setting is known.
  const [showRewardsReferrals, setShowRewardsReferrals] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getUser();
      loadReferralMenuVisibility();
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

  const loadReferralMenuVisibility = async () => {
    try {
      const res = await get_referral_summary();
      setShowRewardsReferrals(!!res?.success && !!res?.data?.enableReferralSystem && !!res?.data?.showRewardsReferralsMenu);
    } catch (err) {
      setShowRewardsReferrals(false);
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

        <View style={styles.editBadge}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={13}
            color={color.buttonColor}
          />
          <Text style={styles.editLabel}>Edit</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={color.buttonColor}
          />
        </View>
      </TouchableOpacity>

      {/* Menu List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + TAB_BAR_HEIGHT},
        ]}>
        <ProfileMenuList sections={buildProfileSections(showRewardsReferrals)} />
      </ScrollView>
    </View>
  );
};

export default Profile;

const buildProfileSections = (showRewardsReferrals: boolean): ProfileMenuSection[] => [
  {
    id: 'activity',
    title: 'Activity',
    data: [
      {id: '2', title: 'My Bikes', icon: 'motorbike', screen: ScreenNameEnum.MY_BIKES},
      {id: '3', title: 'Notifications', icon: 'bell-outline', screen: ScreenNameEnum.NOTIFICATION_SETTING},
      ...(showRewardsReferrals
        ? [{id: '3a', title: 'Rewards & Referrals', icon: 'gift-outline', screen: ScreenNameEnum.REWARDS_REFERRALS}]
        : []),
    ],
  },
  {
    id: 'support',
    title: 'Support',
    data: [
      {id: '4', title: 'Help & Support', icon: 'lifebuoy', screen: ScreenNameEnum.SUPPORT_SCREEN},
      {id: '4a', title: 'FAQ', icon: 'frequently-asked-questions', screen: ScreenNameEnum.FAQ_SCREEN},
      {id: '5', title: 'Contact Us', icon: 'card-account-phone-outline', screen: ScreenNameEnum.CONTACT_US},
      {id: '6', title: 'Social Links', icon: 'link-variant', screen: ScreenNameEnum.SOCIAL_LINKS},
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    data: [
      {id: '7', title: 'About Us', icon: 'information-outline', screen: ScreenNameEnum.ABOUT_SCREEN},
      {id: '8', title: 'Privacy Policy', icon: 'shield-lock-outline', screen: ScreenNameEnum.PRIVACY_POLICY},
      {id: '9', title: 'Terms & Conditions', icon: 'file-document-outline', screen: ScreenNameEnum.TERMS_CONDITIONS},
      {id: '10', title: 'Refund Policy', icon: 'cash-refund', screen: ScreenNameEnum.REFUND_POLICY},
      {id: '11', title: 'Cancellation Policy', icon: 'calendar-remove-outline', screen: ScreenNameEnum.CANCELLATION_POLICY},
    ],
  },
  {
    id: 'logout',
    data: [{id: '6', title: 'Logout', icon: 'logout', screen: 'Logout'}],
    danger: true,
  },
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
    paddingTop: Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight ?? 24) + 14,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 20,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: color.buttonColor,
    marginHorizontal: 4,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
});
