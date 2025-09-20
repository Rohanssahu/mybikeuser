import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { image_url } from '../redux/Api';


interface NotificationItemProps {
  name: string;
  message: string;
  time: string;
  image: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ name, message, time, image }) => {
   const GetData = useSelector((state: any) => state.feature.userGetData);

  return (
    <View style={styles.container}>
      <Image source={{ uri: `${image_url}${GetData?.images}` }} style={styles.profileImage} resizeMode='contain' />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 45.5, // Half of width/height for perfect circle
    marginRight: 10,
    resizeMode: 'cover', // Ensures image fills the space
    backgroundColor: '#ccc', // Optional fallback background
  
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default NotificationItem;
