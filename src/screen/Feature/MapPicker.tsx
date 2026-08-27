import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import MapView, {Region} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import {useNavigation} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import AddressAutocomplete from '../../component/AddressAutocomplete';
import images, {icon} from '../../component/Image';
import {hp, wp} from '../../component/utils/Constant';

Geocoder.init('AIzaSyAXxpcdmdcoGs0a4f6606f4kuYnpNxXMzs');

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapPickerModalProps {
  sendLocation: (location: Coordinates) => void;
  setLocationName: (name: string) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean, location?: Coordinates) => void;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  sendLocation,
  setLocationName,
  modalVisible,
  setModalVisible,
}) => {
  const navigation = useNavigation();

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

  const getCurrentLocation = (): void => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setRegion(prevRegion => ({...prevRegion, latitude, longitude}));
        setMarkerPosition({latitude, longitude});
      },
      error => console.error('Error fetching location:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleConfirmLocation = (): void => {
    setLocationNameFromCoordinates(markerPosition);
    setModalVisible(false, markerPosition);
  };

  const setLocationNameFromCoordinates = (liveLocation: Coordinates): void => {
    sendLocation({
      latitude: liveLocation.latitude,
      longitude: liveLocation.longitude,
    });

    if (liveLocation.latitude && liveLocation.longitude) {
      Geocoder.from(liveLocation.latitude, liveLocation.longitude)
        .then(json => {
          const addressComponent = json.results[0]?.formatted_address;
          if (addressComponent) {
            setLocationName(addressComponent);
            setAddress(addressComponent);
          }
        })
        .catch(error => console.warn('Geocoder Error:', error));
    }
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>

        {/* ── Search overlay (placeholderModal) ── */}
        {placeholderModal && (
          <ImageBackground
            source={images.map}
            style={{height: hp(100), width: wp(100), alignItems: 'center'}}>
            <AddressAutocomplete
              setMarkerPosition={({latitude, longitude}) => {
                sendLocation({latitude, longitude});
                setMarkerPosition({latitude, longitude});
                setPlaceholderModal(false);
              }}
              setRegion={nextRegion =>
                setRegion(prevRegion => ({
                  ...prevRegion,
                  ...nextRegion,
                  latitudeDelta:
                    nextRegion.latitudeDelta ?? prevRegion.latitudeDelta,
                  longitudeDelta:
                    nextRegion.longitudeDelta ?? prevRegion.longitudeDelta,
                }))
              }
              setAddress={setAddress}
              setLocationName={setLocationName}
              sendLocation={sendLocation}
              liveLocation={markerPosition}
            />
          </ImageBackground>
        )}

        {/* ── Search bar tap target (shows when map is visible) ── */}
        {!placeholderModal && (
          <Pressable
            onPress={() => setPlaceholderModal(true)}
            style={styles.addressInput}>
            <Image source={icon.search} style={styles.searchIcon} />
            <Text style={styles.addressText} numberOfLines={1}>
              {address ? address.substring(0, 55) : 'Search for area, street name...'}
            </Text>
          </Pressable>
        )}

        {/* ── Map ── */}
        {!placeholderModal && (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={newRegion => {
              setRegion(newRegion);
              setMarkerPosition({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude,
              });
              sendLocation({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude,
              });
              setLocationNameFromCoordinates(newRegion);
            }}
          />
        )}

        {/* ── Center pin ── */}
        {!placeholderModal && (
          <View style={styles.markerFixed}>
            <Image source={icon.mpin} style={styles.markerImage} />
          </View>
        )}

        {/* ── Current location FAB ── */}
        {!placeholderModal && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}>
            <Image source={icon.pin} style={styles.currentLocationIcon} />
          </TouchableOpacity>
        )}

        {/* ── Bottom address card ── */}
        <View style={styles.addressCard}>
          <View style={styles.addressIconWrapper}>
            <Image source={icon.mpin} style={styles.addressCardIcon} />
          </View>
          <View style={styles.addressCardText}>
            <Text style={styles.addressCardLabel}>Delivering to</Text>
            <Text style={styles.addressCardTitle} numberOfLines={1}>
              {address ? address.split(',')[0] : 'Move map to select'}
            </Text>
            <Text style={styles.addressCardSubtitle} numberOfLines={1}>
              {address || 'Drop the pin on your location'}
            </Text>
          </View>
        </View>

        {/* ── Confirm button ── */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Confirm location</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
};

export default MapPickerModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Search bar
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    width: '90%',
    alignSelf: 'center',
    left: '5%',
    height: 50,
    paddingHorizontal: 14,
    zIndex: 5,
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 24) + 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    gap: 10,
  },
  searchIcon: {
    height: 18,
    width: 18,
    tintColor: '#666',
  },
  addressText: {
    color: '#666',
    fontSize: 13,
    flex: 1,
  },

  // Center pin
  markerFixed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -52,
    zIndex: 2,
  },
  markerImage: {
    height: 44,
    width: 40,
  },

  // GPS FAB
  currentLocationButton: {
    position: 'absolute',
    bottom: 210,
    right: 20,
    height: 46,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 4,
  },
  currentLocationIcon: {
    height: 22,
    width: 22,
    tintColor: '#4CAF50',
  },

  // Address card
  addressCard: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: '#242424',
    borderRadius: 14,
    padding: 14,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addressIconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#FF572215',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addressCardIcon: {
    height: 20,
    width: 18,
    tintColor: '#FF5722',
  },
  addressCardText: {
    flex: 1,
  },
  addressCardLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressCardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  addressCardSubtitle: {
    color: '#555',
    fontSize: 12,
  },

  // Confirm button
  confirmButton: {
    backgroundColor: '#FED428',
    paddingVertical: 16,
    borderRadius: 14,
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 6,
    elevation: 5,
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
