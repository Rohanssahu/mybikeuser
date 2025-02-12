import React from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';

// Define the data type for each garage item
interface GarageItem {
  id: string;
  name: string;
  location: string;
  distance: string;
  logo: any;
}

// Define props for the component
interface GarageListProps {
  data: GarageItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const GarageList: React.FC<GarageListProps> = ({ data }) => {
  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={item.logo} style={styles.image} resizeMode="contain" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.row}>
              <Icon size={16} source={icon.pin} />
              <Text style={styles.subText}>{item.location}</Text>
            </View>
            <View style={styles.row}>
              <Icon size={16} source={icon.pickups} />
              <Text style={styles.subText}>{item.distance} km away</Text>
            </View>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('BookingScreen', { garageId: item.id })}
            >
              <Text style={styles.buttonText}>BOOK NOW</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  subText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginLeft: 5,
    fontWeight:'500'
  },
  button: {
    backgroundColor: '#081041',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GarageList;
