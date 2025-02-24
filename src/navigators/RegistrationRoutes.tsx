import 'react-native-gesture-handler';
import React, {FunctionComponent, useEffect} from 'react';

import ScreenNameEnum from '../routes/screenName.enum';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '../routes/routes';
import { getCurrentLocation, locationPermission } from '../component/helperFunction';
import { useLocation } from '../component/LocationContext';
const Stack = createNativeStackNavigator();

const RegistrationRoutes: FunctionComponent = () => {

  const { locationName, setLocationName } = useLocation();
  function getFormattedAddress(response) {
    if (response.status === "OK" && response.results.length > 0) {
      // Get the formatted address from the results
      return response.results[0].formatted_address;
    } else {
      return "Address not found";
    }
  }
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



        // Fetch geocode
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyADzwSBu_YTmqWZj7ys5kp5UcFDG9FQPVY`;


        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'OK' && json.results.length) {


         
          const city = getFormattedAddress(json);

        setLocationName(city);
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
