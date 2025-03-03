import React from 'react';
import { View, FlatList, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import { image_url } from '../redux/Api';

// Define the data type for list items

interface ListItem {
  name: string;
  shopDescription: string;
  rating: string;
  address: string;
  shopImages: any;
  _id:string
}

// Define props for the component
interface VerticalListProps {
  data: any;
  navigation:any,
  bike:any
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const VerticalshopList: React.FC<VerticalListProps> = ({ data,navigation,bike }) => {


  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
        onPress={()=>{
          navigation.navigate(ScreenNameEnum.GARAGE_DETAILS,{bike,id:item?._id})
        }}
        style={styles.card}>
          <Image source={{uri:`${image_url}${item.shopImages[0]}`}} style={styles.image} resizeMode="cover" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.shopName}</Text>
            <Text style={styles.address}>{item.shopDescription}</Text>
            <View style={styles.infoContainer}>
              <Icon size={16}source={icon.pin} />
              <Text style={styles.infoText}>{item.address}</Text>
              <Icon source={icon.star} size={16}  />
              <Text style={styles.infoText}>{item.rating}</Text>
            </View>
          </View>
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
    marginBottom: 15,
    width: SCREEN_WIDTH * 0.9, // 90% of screen width
    alignSelf: 'center',
  },
  image: {
    width: 80,
    height: 80,
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
    marginBottom: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
    marginRight: 10,
    fontWeight:'500'
  },
});

export default VerticalshopList;
