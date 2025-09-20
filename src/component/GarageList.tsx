import React from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';
import { image_url } from '../redux/Api';
import ScreenNameEnum from '../routes/screenName.enum';

// Define the data type for each garage item
interface GarageItem {
  id: string;
  shopName: string;
  fullAddress: string;
  latitude: string;
  longitude: string;
  shopImages: any;
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
        <TouchableOpacity
        onPress={() =>   navigation.navigate(ScreenNameEnum.MY_BIKES,
          {profile:false,Grageid:item?._id})}
          
        style={styles.card}>
          <Image source={require('../assets/images/gragd.png')}
           style={styles.image}  />
        
          {/* <Image source={{uri: `${image_url}${item.shopImages[0]}`}} style={styles.image} resizeMode="contain" />
         */}
        
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.shopName}</Text>
            <View style={[styles.row,{width:'90%'}]}>
              <Icon size={20} source={icon.pin} />
              <Text style={styles.subText}>{item.fullAddress}</Text>
            </View>
            <View style={styles.row}>
              <Icon size={20} source={icon.pickups} />
              <Text style={[styles.subText,{fontSize:14}]}>3 km away</Text>
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
    backgroundColor: '#1E293B', 
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
    width:120,
    height: 120,
    borderRadius: 20,
    marginRight: 15,
  },
  textContainer: {
    width:'60%',
    height:'100%'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  subText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
    fontWeight:'500'
  },
  button: {
    backgroundColor: '#081041',
    paddingVertical: 8,
    paddingHorizontal: 70,
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
