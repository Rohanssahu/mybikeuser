import 'react-native-gesture-handler';
import React, {FunctionComponent, useEffect} from 'react';

import ScreenNameEnum from '../routes/screenName.enum';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '../routes/routes';
import { getCurrentLocation, locationPermission } from '../component/helperFunction';
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
        const locPermission = await locationPermission();
        if (locPermission !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        // Get current location
        const { latitude, longitude } = await getCurrentLocation();

        // Area-serviceability gate — runs right after location resolves and
        // before Home mounts/loads its other data. Fire-and-forget here:
        // checkServiceability manages its own loading/error state in
        // LocationContext and never throws, so it doesn't block geocoding.
        checkServiceability(latitude, longitude);

        // Fetch geocode
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAXxpcdmdcoGs0a4f6606f4kuYnpNxXMzs`;


        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'OK' && json.results.length) {

          const shortAddress = getShortAddress(json);
          setLocationName(shortAddress);

          // _update_location(latitude, longitude);
        }


      } catch (error) {
        console.log("Error fetching location:", error);
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
