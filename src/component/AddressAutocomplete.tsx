// AddressAutocomplete.tsx
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface AddressAutocompleteProps {
    setMarkerPosition: (position: { latitude: number; longitude: number }) => void;
    setRegion: (region: { latitude: number; longitude: number; latitudeDelta?: number; longitudeDelta?: number }) => void;
    setAddress: (address: string) => void;
    setLocationName: (locationName: string) => void;
    sendLocation: (location: { latitude: number; longitude: number }) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    setMarkerPosition,
    setRegion,
    setAddress,
    setLocationName,
    sendLocation,
    onFocus,
    onBlur
}) => {
    return (
        <GooglePlacesAutocomplete
            placeholder={'search'}
            fetchDetails={true}
            onPress={(data, details = null) => {
                if (!details || !details.geometry || !details.geometry.location) {
                    Alert.alert('LOcation',"No location details available");
                    return;
                }

                const { lat, lng } = details.geometry.location;
            
                console.log("Selected Location:", details.formatted_address, "Lat:", lat, "Lng:", lng);
            
                setMarkerPosition({ latitude: lat, longitude: lng });
            
                setRegion(prevRegion => ({
                    ...prevRegion,
                    latitude: lat,
                    longitude: lng,
                }));
            
                setAddress(details.formatted_address);
                setLocationName(details.formatted_address);
                sendLocation({ latitude: lat, longitude: lng });
            }}
            
            textInputProps={{
                placeholderTextColor: "#000"
            }}
            enablePoweredByContainer={false}
            query={{
                key: 'AIzaSyADzwSBu_YTmqWZj7ys5kp5UcFDG9FQPVY',
                language: 'en',
            }}
            styles={styles}
            listViewDisplayed="auto"
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

const styles = StyleSheet.create({
    description: {
        fontWeight: 'bold',
        color: 'black',
        width: '100%',
    },
    textInput: {
        fontSize: 13,
        color: '#000',
        height: '100%',
        width: '90%',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        borderColor: '#ccc',
    },
    container: {
        position: 'absolute',
        width: '90%',
        top: 84,
        zIndex: 2, // Ensure the autocomplete is on top
    },
    listView: {
        backgroundColor: 'white',
        zIndex: 3, // Ensure the list is on top of everything
    },
});

export default AddressAutocomplete;
