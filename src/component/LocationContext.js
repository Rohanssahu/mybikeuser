import React, {createContext, useState, useContext, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get_serviceability} from '../redux/Api/apiRequests';

const LocationContext = createContext();

export const LocationProvider = ({children}) => {
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);

  // Area-serviceability gate state. `serviceability` stays null until the
  // first successful check resolves — Home treats null as "not yet
  // resolved" and fails open (renders normally) rather than gating, so a
  // transient network failure here never locks a user out of the app.
  const [serviceability, setServiceability] = useState(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);

  const checkServiceability = useCallback(async (lat, lng) => {
    if (lat == null || lng == null) return;
    setCheckingServiceability(true);
    try {
      const res = await get_serviceability(lat, lng);
      if (res?.success && res?.data?.status) {
        setServiceability({
          status: res.data.status,
          areaName: res.data.areaName,
          reason: res.data.reason ?? null,
          estimatedLiveDate: res.data.estimatedLiveDate ?? null,
        });
      }
      // else: leave serviceability as-is rather than guessing a status.
    } catch (error) {
      // Network/transient failure — never hard-fail app boot over this.
      // Leaving serviceability unresolved lets Home fail open instead of
      // showing an incorrect gate screen.
      console.error('checkServiceability error:', error);
    } finally {
      setCheckingServiceability(false);
    }
  }, []);

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
        serviceability,
        checkingServiceability,
        checkServiceability,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
