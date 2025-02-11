import React from 'react';
import { View, FlatList, Image, Text, StyleSheet, Dimensions } from 'react-native';

// Define the data type
interface ListItem {
  id: string;
  title: string;
  description: string;
  image: any; // Can be a local or remote image
}

// Define props for the component
interface VerticalListProps {
  data: ListItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const VerticalList: React.FC<VerticalListProps> = ({ data }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
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
    justifyContent: 'space-between',
    marginBottom: 15,
    width: SCREEN_WIDTH * 0.9, // 90% of screen width
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text color
  },
  description: {
    fontSize: 14,
    color: '#A0A3BD', // Light gray text
    marginTop: 5,
  },
  image: {
    width: 80,
    height: 50,
    marginLeft: 10,
  },
});

export default VerticalList;
