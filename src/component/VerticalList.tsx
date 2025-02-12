import React from 'react';
import { View, FlatList, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import ScreenNameEnum from '../routes/screenName.enum';

// Define the data type
interface ListItem {
  id: string;
  name: string;
  description: string;
  logo: any; // Can be a local or remote image
}

// Define props for the component
interface VerticalListProps {
  data: ListItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const VerticalList: React.FC<VerticalListProps> = ({ data ,navigation }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
        onPress={()=>{
          navigation.navigate(ScreenNameEnum.BIKE_DETAILS)
        }}
        style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Image source={item.logo} style={styles.image} resizeMode="contain" />
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
    color: '#fff', // Light gray text
    marginTop: 5,
  },
  image: {
    width: 80,
    height: 50,
    marginLeft: 10,
  },
});

export default VerticalList;
