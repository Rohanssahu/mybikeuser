import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

// Define the data type for menu items
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

// Define props for the component
interface ProfileMenuListProps {
  data: MenuItem[];
}

// Profile menu list component
const ProfileMenuList: React.FC<ProfileMenuListProps> = ({ data }) => {
  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.screen as never)}>
          <FontAwesome5 name={item.icon} size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.text}>{item.title}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#FFD700" />
        </TouchableOpacity>
      )}
    />
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
    backgroundColor: '#0E1333', // Dark background
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
  },
});

export default ProfileMenuList;
