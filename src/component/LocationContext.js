import React, {createContext, useState, useContext, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

export const LocationProvider = ({children}) => {
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);

  const saveLocation = useCallback(async (name, coords) => {
    setLocationName(name);
    if (coords) setLocationCoords(coords);

    setRecentLocations(prev => {
      const filtered = prev.filter(l => l.name !== name);
      return [{name, ...coords}, ...filtered].slice(0, 5);
    });

    try {
      await AsyncStorage.setItem('Locations', name);
      if (coords) {
        await AsyncStorage.setItem(
          'LocationsLat',
          JSON.stringify({lat: coords.latitude, lng: coords.longitude}),
        );
      }
      const recentsRaw = await AsyncStorage.getItem('recentLocations');
      const recents = recentsRaw ? JSON.parse(recentsRaw) : [];
      const filtered = recents.filter(r => r.name !== name);
      const updated = [{name, ...(coords || {})}, ...filtered].slice(0, 5);
      await AsyncStorage.setItem('recentLocations', JSON.stringify(updated));
    } catch {}
  }, []);

  return (
    <LocationContext.Provider
      value={{
        locationName,
        setLocationName,
        locationCoords,
        setLocationCoords,
        recentLocations,
        setRecentLocations,
        saveLocation,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
