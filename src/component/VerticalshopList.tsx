import React from 'react';
import { View, FlatList, Image, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Define the data type for list items
interface ListItem {
  id: string;
  title: string;
  address: string;
  distance: string;
  rating: number;
  image: any; // Local or remote image
}

// Define props for the component
interface VerticalListProps {
  data: ListItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const VerticalshopList: React.FC<VerticalListProps> = ({ data }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <View style={styles.infoContainer}>
              <MaterialIcons name="place" size={16} color="#FFD700" />
              <Text style={styles.infoText}>{item.distance}</Text>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.infoText}>{item.rating}</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#2C2F5B', // Dark blue background
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    width: SCREEN_WIDTH * 0.9, // 90% of screen width
    alignSelf: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text color
  },
  address: {
    fontSize: 14,
    color: '#A0A3BD', // Light gray text
    marginVertical: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 5,
    marginRight: 10,
  },
});

export default VerticalshopList;
