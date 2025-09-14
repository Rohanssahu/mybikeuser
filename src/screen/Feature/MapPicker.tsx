import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Image, Platform, 
    ImageBackground
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import AddressAutocomplete from '../../component/AddressAutocomplete';
import images, { icon } from '../../component/Image';
import { color } from '../../constant';
import { hp, wp } from '../../component/utils/Constant';

// Initialize Geocoder with API key
Geocoder.init('AIzaSyB_Lz_b22Sf5eKRSHhgxOnoZ8InrtXkpSM');

// Define interface for coordinates
interface Coordinates {
    latitude: number;
    longitude: number;
}

// Define props for the MapPickerModal component
interface MapPickerModalProps {
    sendLocation: (location: Coordinates) => void;
    setLocationName: (name: string) => void;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({ 
    sendLocation, setLocationName, modalVisible, setModalVisible 
}) => {
    const navigation = useNavigation();

    // Default Region and Marker Position
    const [region, setRegion] = useState<Region>({
        latitude: 22.6996933,
        longitude: 75.8569801,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    });

    const [markerPosition, setMarkerPosition] = useState<Coordinates>({
        latitude: 22.6996933,
        longitude: 75.8569801,
    });

    const [address, setAddress] = useState<string>('');
    const [placeholderModal, setPlaceholderModal] = useState<boolean>(false);

    // Fetch User's Current Location
    const getCurrentLocation = (): void => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setRegion((prevRegion) => ({
                    ...prevRegion,
                    latitude,
                    longitude,
                }));
                setMarkerPosition({ latitude, longitude });
            },
            (error) => {
                console.error('Error fetching location:', error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // Get location when component mounts
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Handle Confirm Button
    const handleConfirmLocation = (): void => {
        setModalVisible(false);
    };

    // Update Address based on Lat & Lng
    const setLocationNameFromCoordinates = (liveLocation: Coordinates): void => {
        sendLocation({ latitude: liveLocation.latitude, longitude: liveLocation.longitude });

        if (liveLocation.latitude && liveLocation.longitude) {
            Geocoder.from(liveLocation.latitude, liveLocation.longitude)
                .then(json => {
                    const addressComponent = json.results[0]?.formatted_address;
                    console.log("Fetched Address:", addressComponent); // Debugging
                    if (addressComponent) {
                        setLocationName(addressComponent);
                        setAddress(addressComponent);
                    }
                })
                .catch(error => console.warn("Geocoder Error:", error));
        }
    };

    return (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
       
                {placeholderModal && (
              <ImageBackground  source={images.map} style={{height:hp(100),width:wp(100),alignItems:'center'}}>


        

                    <AddressAutocomplete
                        setMarkerPosition={({ latitude, longitude }) => {
                            sendLocation({ latitude, longitude });
                            setMarkerPosition({ latitude, longitude });
                            setPlaceholderModal(false);
                        }}
                        setRegion={setRegion}
                        setAddress={setAddress}
                        setLocationName={setLocationName}
                        sendLocation={sendLocation}
                        liveLocation={markerPosition}
                        
                    />
                          </ImageBackground>
                )}

                <Pressable
                    onPress={() => setPlaceholderModal(true)}
                    style={styles.addressInput}
                >
                    <Text style={styles.addressText}>
                        {address ? address.substring(0, 60) : 'Enter address'}
                    </Text>
                </Pressable>

                {!placeholderModal && (
                    <MapView
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={(newRegion) => {
                            setRegion(newRegion); 
                            setMarkerPosition({
                                latitude: newRegion.latitude,
                                longitude: newRegion.longitude,
                            });

                            sendLocation({ latitude: newRegion.latitude, longitude: newRegion.longitude });

                            setLocationNameFromCoordinates(newRegion); // Ensure address gets updated
                        }}
                    />
                )}

                {!placeholderModal && (
                    <View style={styles.markerFixed}>
                        <Image source={icon.mpin} style={styles.markerImage} />
                    </View>
                )}

                {!placeholderModal && (
                    <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
                        <Image source={icon.pin} style={styles.currentLocationIcon} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default MapPickerModal;

const styles = StyleSheet.create({
    markerFixed: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -12,
        marginTop: -48,
    },
    markerImage: {
        height: 40,
        width: 40,
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    addressInput: {
        flexDirection: 'row',
        position: 'absolute',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        width: '90%',
        height: 48,
        paddingHorizontal: 10,
        zIndex: 1,
        marginTop: '20%',
    },
    addressText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: color.buttonColor,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 50,
        marginBottom: 30,
        elevation: 5,
        position: 'absolute',
        bottom: 10,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerContainer: {
        width: '100%',
        backgroundColor: '#fff',
        marginTop: -25,
        paddingHorizontal: 15,
    },
    currentLocationButton: {
        position: 'absolute',
        bottom: 150,
        right: 30,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#919b9d',
        borderRadius: 15,
    },
    currentLocationIcon: {
        height: 25,
        width: 25,
    },
});
