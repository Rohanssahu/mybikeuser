import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDistance} from 'geolib';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useLocation} from './LocationContext';
import GooglePlacesInput from './AutoAddress';
import Icon from './Icon';
import {icon} from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import CustomHeader from './CustomHeaderProps';

const GOOGLE_PLACES_API_KEY = 'AIzaSyB_Lz_b22Sf5eKRSHhgxOnoZ8InrtXkpSM'; // Store securely!

const SelectLocation = () => {
  const [location, setLocation] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [currentCoords, setCurrentCoords] = useState(null);
  const {setLocationName} = useLocation();
  const navigation = useNavigation();
  const isFocus = useIsFocused();

  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedAddresses');
        if (saved) setSavedAddresses(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      }
    };

    loadSavedAddresses();
  }, []);
  useEffect(() => {
    const fetchLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;

         
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setCurrentCoords({latitude, longitude});

          // Call your function to fetch nearby locations, using the coordinates
          fetchNearbyLocations(latitude, longitude);
        },
        error => {
          console.error('Geolocation error:', error);
          Alert.alert('Location Error', 'Failed to fetch current location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    fetchLocation(); // Call the fetchLocation function inside useEffect
  }, []);

  const fetchNearbyLocations = async (latitude, longitude) => {
   
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=2000&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error_message) {
        console.error('Google API Error:', data.error_message);
        return;
      }
      setNearbyLocations(data.results);
    } catch (error) {
      console.error('Fetch Nearby Locations Error:', error);
    }
  };

  const handleSaveAddress = useCallback(
    async address => {
      try {
        const existingAddress = savedAddresses.find(
          item => item.place_id === address.place_id,
        );
        if (existingAddress) {
          // Alert.alert('Address Saved', 'This address is already saved.');
          setLocationName(address?.name);
          navigation.goBack();
          return;
        }

        const updatedAddresses = [...savedAddresses, address];
        setSavedAddresses(updatedAddresses);
        await AsyncStorage.setItem(
          'savedAddresses',
          JSON.stringify(updatedAddresses),
        );

        setLocationName(address?.name);
        navigation.goBack();
      } catch (error) {
        console.error('Error saving address:', error);
      }
    },
    [savedAddresses, setLocationName, navigation],
  );

  const handleSelectLocation = useCallback(
    async details => {
      try {
        const {lat, lng} = details.geometry.location;
        //    _update_location(lat, lng);
        setLocation({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        handleSaveAddress(details);
        setLocationName(details.name);
        await AsyncStorage.setItem('Locations', details.name);
        await AsyncStorage.setItem('LocationsLat', JSON.stringify({lat, lng}));

        navigation.navigate(ScreenNameEnum.BOTTAM_TAB);
      } catch (error) {
        console.error('Error selecting location:', error);
      }
    },
    [savedAddresses, handleSaveAddress, setLocationName, navigation],
  );

  const renderLocationItem = useCallback(
    ({item}) => {
      const distance = currentCoords
        ? getDistance(currentCoords, {
            latitude: item.geometry.location.lat,
            longitude: item.geometry.location.lng,
          })
        : 0;

      const formattedDistance =
        distance < 1000
          ? `${distance} m`
          : `${(distance / 1000).toFixed(2)} km`;

      return (
        <TouchableOpacity
          onPress={() => handleSaveAddress(item)}
          style={styles.locationItem}>
          <View>
            <Image
              source={icon.pin}
              style={{height: 15, width: 15, tintColor: '#081041'}}
            />
            <Text style={{fontSize: 10, color: '#000', marginTop: 5}}>
              {formattedDistance}
            </Text>
          </View>
          <View style={{marginLeft: 20}}>
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.locationAddress}>{item.vicinity}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [currentCoords],
  );

  return (
    <View style={styles.container}>
    <CustomHeader
navigation={navigation}

title='Locaiton'
    />

      <View style={{width: '100%', marginTop: 10}}>
        <GooglePlacesInput
          placeholder="Search location"
          onPlaceSelected={handleSelectLocation}
        />
      </View>

      <View style={styles.nearbyContainer}>
        <Text style={styles.sectionTitle}>Nearby Locations</Text>
        {nearbyLocations.length > 0 ? (
          <FlatList
            data={nearbyLocations?.slice(0, 7)}
            renderItem={renderLocationItem}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <ActivityIndicator size="large" color="#081041" />
        )}
      </View>

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={() => {
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
            // _update_location(latitude, longitude);
              setLocation({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              setCurrentCoords({latitude, longitude});
              fetchNearbyLocations(latitude, longitude);
            },
            error => {
              console.error('Geolocation Error:', error);
              Alert.alert('Error', 'Unable to fetch your current location.');
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }}>
        <Image
          source={icon.pin}
          style={{height: 30, width: 30, tintColor: '#fff'}}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  nearbyContainer: {marginVertical: 10},
  sectionTitle: {fontSize: 16, fontWeight: 'bold', margin: 15, color: '#000'},
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {fontSize: 16, fontWeight: 'bold'},
  locationAddress: {fontSize: 14, color: '#555'},
  currentLocationButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#081041',
    borderRadius: 30,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SelectLocation;
