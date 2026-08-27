// AddressAutocomplete.tsx
import React from 'react';
import {Alert, StyleSheet} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  setMarkerPosition: (position: Coordinates) => void;
  setRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  }) => void;
  setAddress: (address: string) => void;
  setLocationName: (locationName: string) => void;
  sendLocation: (location: Coordinates) => void;
  liveLocation: Coordinates;   // ← was missing, caused the prop error
  onFocus?: () => void;
  onBlur?: () => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  setMarkerPosition,
  setRegion,
  setAddress,
  setLocationName,
  sendLocation,
  liveLocation,
  onFocus,
  onBlur,
}) => {
  return (
    <GooglePlacesAutocomplete
      placeholder="Search for area, street name..."
      fetchDetails={true}
      onPress={(data, details = null) => {
        if (!details?.geometry?.location) {
          Alert.alert(
            'Location',
            details?.formatted_address
              ? 'Could not read coordinates for this place.'
              : 'No location details available',
          );
          return;
        }

        const {lat, lng} = details.geometry.location;

        setMarkerPosition({latitude: lat, longitude: lng});
        setRegion({latitude: lat, longitude: lng});
        setAddress(details.formatted_address);
        setLocationName(details.formatted_address);
        sendLocation({latitude: lat, longitude: lng});
      }}
      textInputProps={{
        placeholderTextColor: '#fff',
        selectionColor: '#fff',
        autoCorrect: false,
        autoCapitalize: 'none',
        autoFocus: true,   // keyboard opens immediately when search view appears
        onFocus,
        onBlur,
      }}
      enablePoweredByContainer={false}
      query={{
        key: 'AIzaSyAXxpcdmdcoGs0a4f6606f4kuYnpNxXMzs',
        language: 'en',
        components: 'country:in',
      }}
      debounce={250}
      minLength={2}
      requestUrl={{
        useOnPlatform: 'web',
        url: 'https://maps.googleapis.com/maps/api',
      }}
      onFail={error => {
        console.warn('Google Places autocomplete failed:', error);
      }}
      styles={autocompleteStyles}
      listViewDisplayed="auto"
    />
  );
};

export default AddressAutocomplete;

const autocompleteStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    top: 84,
    zIndex: 10,
    alignSelf: 'center',
  },

  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },

  textInput: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 14,
    height: 50,
    fontSize: 13,
    color: '#e0e0e0',
    paddingHorizontal: 14,
    marginBottom: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  listView: {
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },

  row: {
    backgroundColor: '#242424',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e2e',
    minHeight: 60,
    justifyContent: 'center',
  },

  description: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '500',
  },

  predefinedPlacesDescription: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },

  separator: {
    height: 0,
    backgroundColor: 'transparent',
  },

  loader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },

  poweredContainer: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2e2e2e',
  },

  powered: {
    tintColor: '#444',
  },
});
