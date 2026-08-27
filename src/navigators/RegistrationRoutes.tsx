import 'react-native-gesture-handler';
import React, {FunctionComponent, useEffect} from 'react';

import ScreenNameEnum from '../routes/screenName.enum';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '../routes/routes';
import { DEFAULT_LOCATION, getCurrentLocation, locationPermission } from '../component/helperFunction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from '../component/LocationContext';
const Stack = createNativeStackNavigator();

const RegistrationRoutes: FunctionComponent = () => {

  const { locationName, setLocationName, checkServiceability } = useLocation();
  const getShortAddress = (geoJson) => {
    if (!geoJson?.results?.length) return '';
  
    const addressComponents = geoJson.results[0].address_components;
  
    let locality = '';
    let subLocality = '';
    let city = '';
  
    addressComponents.forEach(component => {
      if (component.types.includes('sublocality_level_1')) {
        subLocality = component.long_name;
      }
  
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
  
      if (component.types.includes('neighborhood')) {
        locality = component.long_name;
      }
    });
  
    // Priority: subLocality > locality
    const area = subLocality || locality;
  
    if (area && city) return `${area}, ${city}`;
    if (city) return city;
  
    return geoJson.results[0].formatted_address;
  };
  

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Ask for the permission, but never gate on the answer. A denied
        // permission used to return early here, which left both the
        // serviceability gate and the location name unresolved — Home then
        // rendered "Set your location" with no content. getCurrentLocation()
        // always resolves (saved location, else DEFAULT_LOCATION), so the app
        // stays usable either way.
        try {
          await locationPermission();
        } catch (permissionError) {
          console.log('Location permission not granted, using default location');
        }

        const {latitude, longitude} = await getCurrentLocation();

        // Area-serviceability gate — runs right after location resolves and
        // before Home mounts/loads its other data. Fire-and-forget here:
        // checkServiceability manages its own loading/error state in
        // LocationContext and never throws, so it doesn't block geocoding.
        checkServiceability(latitude, longitude);

        // A name the user picked earlier always wins over reverse geocoding.
        const savedName = await AsyncStorage.getItem('Locations');
        if (savedName) {
          setLocationName(savedName);
          return;
        }

        const isDefaultLocation =
          latitude === DEFAULT_LOCATION.latitude &&
          longitude === DEFAULT_LOCATION.longitude;

        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAXxpcdmdcoGs0a4f6606f4kuYnpNxXMzs`;
          const res = await fetch(url);
          const json = await res.json();

          if (json.status === 'OK' && json.results.length) {
            setLocationName(getShortAddress(json));
            return;
          }
        } catch (geocodeError) {
          console.log('Reverse geocode failed:', geocodeError);
        }

        // Geocoding is a network call and may fail offline. Label the default
        // location from its own constant so the header never reads as unset.
        if (isDefaultLocation) {
          setLocationName(DEFAULT_LOCATION.name);
        }
      } catch (error) {
        console.log('Error fetching location:', error);
      }
    };

    fetchLocationData();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Stack.Navigator
      initialRouteName={ScreenNameEnum.SPLASH_SCREEN}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        
      }}>
      {_routes.REGISTRATION_ROUTE.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default RegistrationRoutes;
