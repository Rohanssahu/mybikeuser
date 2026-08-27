import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Location the app starts from before the user has picked one of their own.
// Pocharam, Secunderabad sits inside the only currently live serviceable area,
// so a first-time open always lands on a working, bookable Home instead of the
// "We're not in your area yet" gate. Every caller of getCurrentLocation()
// previously rejected when permission was denied or the device had no GPS fix,
// which took Home's whole Promise.all down with it.
export const DEFAULT_LOCATION = Object.freeze({
  latitude: 17.4487732,
  longitude: 78.6324753,
  name: 'Pocharam, Secunderabad',
});

// Resolves the coordinates the app should use for content. A location the user
// saved wins; otherwise the default above. Never rejects, so a denied permission
// or a dead GPS can no longer break a screen that awaits it. Real device GPS is
// still read directly by the "use my current location" controls in
// SelectLocation and MapPicker, so the user can always override this.
export const getCurrentLocation = async () => {
  try {
    const saved = await AsyncStorage.getItem('LocationsLat');
    if (saved) {
      const {lat, lng} = JSON.parse(saved);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {latitude: lat, longitude: lng};
      }
    }
  } catch (error) {
    console.log('getCurrentLocation: could not read saved location', error);
  }

  return {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  };
};

export const locationPermission = () =>
  new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
      try {
        const permissionStatus = await Geolocation.requestAuthorization(
          'whenInUse',
        );
        if (permissionStatus === 'granted') {
          return resolve('granted');
        }
        reject('Permission not granted');
      } catch (error) {
        return reject(error);
      }
    }
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    )
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          resolve('granted');
        }
        return reject('Location Permission denied');
      })
      .catch(error => {
        console.log('Ask Location permission error: ', error);
        return reject(error);
      });
  });



const getAddressFromLatLng = async (latitude, longitude) => {
  const API_KEY = 'AIzaSyAXxpcdmdcoGs0a4f6606f4kuYnpNxXMzs';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

  try {
    let response = await fetch(url);
    let data = await response.json();

    if (data.status === 'OK') {
      return data.results[0].formatted_address;
    } else {
      throw new Error('Unable to get address');
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};




export { getAddressFromLatLng };
