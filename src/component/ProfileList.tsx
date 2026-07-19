import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useNavigation} from '@react-navigation/native';
import LogoutModal from '../screen/modal/LogoutModal';
import ScreenNameEnum from '../routes/screenName.enum';
import {color} from '../constant';
import {useDispatch} from 'react-redux';

import {successToast} from '../configs/customToast';
import {logout} from '../redux/feature/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the data type for menu items
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

// A group of menu items rendered together as one rounded card
interface MenuSection {
  id: string;
  title?: string;
  data: MenuItem[];
  danger?: boolean;
}

// Define props for the component
interface ProfileMenuListProps {
  sections: MenuSection[];
}

// Profile menu list component
const ProfileMenuList: React.FC<ProfileMenuListProps> = ({sections}) => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    AsyncStorage.clear();
    navigation.replace(ScreenNameEnum.LOGIN_SCREEN);
    successToast('Logout Successful');
  };

  const handlePress = (item: MenuItem) => {
    if (item.title === 'Logout') {
      setIsModalVisible(true);
      return;
    }
    if (item.title === 'My Bikes') {
      navigation.navigate(ScreenNameEnum.MY_BIKES, {profile: true});
      return;
    }
    navigation.navigate(item.screen as never);
  };

  return (
    <>
      {sections.map(section => (
        <View
          key={section.id}
          style={[styles.sectionWrapper, section.danger && styles.dangerWrapper]}>
          {section.title ? (
            <Text style={styles.sectionLabel}>{section.title}</Text>
          ) : null}

          <View style={[styles.card, section.danger && styles.dangerCard]}>
            {section.data.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[
                  styles.row,
                  index < section.data.length - 1 && styles.rowDivider,
                ]}
                onPress={() => handlePress(item)}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={section.danger ? '#F16C6C' : '#8C93B8'}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowText, section.danger && styles.dangerText]}>
                  {item.title}
                </Text>
                {!section.danger && (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#4C557E"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <LogoutModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={() => {
          handleLogout();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 20,
  },
  dangerWrapper: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#7B82A6',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  dangerCard: {
    backgroundColor: 'rgba(241,108,108,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  dangerText: {
    color: '#F16C6C',
    fontWeight: '600',
  },
});

export default ProfileMenuList;
