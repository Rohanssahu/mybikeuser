import React from 'react';
import { View, FlatList, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { hp } from './utils/Constant';
import images from './Image';
import { image_url } from '../redux/Api';
import { useNavigation } from '@react-navigation/native';
import ScreenNameEnum from '../routes/screenName.enum';

// Define the data type for bike items
interface BikeItem {
  id: string;
  name: string;
  image: any; // Can be a local or remote image
}

// Define props for the component
interface HorizontalListProps {
  data: BikeItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const HorizontalList: React.FC<HorizontalListProps> = ({ data }) => {

  const navigation = useNavigation()
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity 
        onPress={()=>{
          navigation.navigate(ScreenNameEnum.MY_BIKES,{profile:false})
        }}
        style={styles.card}>
          <Image source={{ uri: `${image_url}${item.image}` }} style={styles.image} resizeMode="contain" />
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: SCREEN_WIDTH * 0.3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    padding: 10,
    height: hp(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
  image: {
    width: '100%',
    height: 70,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HorizontalList;
