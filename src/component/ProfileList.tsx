import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import Icon from './Icon';
import { icon } from './Image';
import LogoutModal from '../screen/modal/LogoutModal';
import ScreenNameEnum from '../routes/screenName.enum';

// Define the data type for menu items
interface MenuItem {
  id: string;
  title: string;
  icon: any;
  screen: string;
}

// Define props for the component
interface ProfileMenuListProps {
  data: MenuItem[];
}

// Profile menu list component
const ProfileMenuList: React.FC<ProfileMenuListProps> = ({ data }) => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}

            onPress={() => {

              if (item.title !== 'Logout') {
                navigation.navigate(item.screen as never)
              }
              else{
                setIsModalVisible(true)
              }
            }}

          >
            <Icon source={item.icon} size={50} />
            <Text style={styles.text}>{item.title}</Text>
            <Icon size={24} source={icon.rightarrow} />
          </TouchableOpacity>
        )}
      />

      <LogoutModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={() => {
          setIsModalVisible(false);
         navigation.navigate(ScreenNameEnum.LOGIN_SCREEN)
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 15,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 20
  },
});

export default ProfileMenuList;
