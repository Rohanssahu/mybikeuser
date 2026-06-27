import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCurrentLocation = async () => {
  // 1️⃣ Check saved location first
  const saved = await AsyncStorage.getItem('LocationsLat');

  if (saved) {
    const { lat, lng } = JSON.parse(saved);
    return { latitude: lat, longitude: lng };
  }

  // 2️⃣ Fallback to GPS
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => reject(error),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
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
  const API_KEY = 'AIzaSyCM15ry8lewwj6YZ-04_m7Z58dsQo_hBBA';
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
