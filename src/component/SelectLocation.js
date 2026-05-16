import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDistance} from 'geolib';
import {useNavigation} from '@react-navigation/native';
import {useLocation} from './LocationContext';
import {icon} from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import {getAddressFromLatLng, locationPermission} from './helperFunction';
import {color} from '../constant';

const GOOGLE_API = 'AIzaSyB_Lz_b22Sf5eKRSHhgxOnoZ8InrtXkpSM';

const SelectLocation = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const {saveLocation} = useLocation();
  const navigation = useNavigation();

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Animations ──────────────────────────────────────────
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const searchBounce = useRef(new Animated.Value(0.96)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const gpsAnim = useRef(new Animated.Value(0)).current;
  const gpsAnimLoop = useRef(null);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(headerSlide, {toValue: 0, useNativeDriver: true, tension: 80, friction: 9}),
      Animated.timing(headerOpacity, {toValue: 1, duration: 280, useNativeDriver: true}),
      Animated.spring(searchBounce, {toValue: 1, useNativeDriver: true, tension: 120, friction: 8}),
    ]).start();

    setTimeout(() => searchInputRef.current?.focus(), 350);
    loadInitialData();
  }, []);

  // GPS pulse loop
  useEffect(() => {
    if (locatingGPS) {
      gpsAnim.setValue(0);
      gpsAnimLoop.current = Animated.loop(
        Animated.timing(gpsAnim, {toValue: 1, duration: 1100, useNativeDriver: true}),
      );
      gpsAnimLoop.current.start();
    } else {
      gpsAnimLoop.current?.stop();
      gpsAnim.setValue(0);
    }
    return () => gpsAnimLoop.current?.stop();
  }, [locatingGPS]);

  const ring1Scale = gpsAnim.interpolate({inputRange: [0, 1], outputRange: [0.3, 2.8]});
  const ring1Opacity = gpsAnim.interpolate({inputRange: [0, 0.5, 1], outputRange: [0.9, 0.4, 0]});

  const loadInitialData = async () => {
    try {
      const [savedRaw, recentsRaw] = await Promise.all([
        AsyncStorage.getItem('savedAddresses'),
        AsyncStorage.getItem('recentLocations'),
      ]);
      if (savedRaw) setSavedAddresses(JSON.parse(savedRaw));
      if (recentsRaw) setRecentSearches(JSON.parse(recentsRaw));
    } catch {}

    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        setCurrentCoords({latitude, longitude});
        fetchNearby(latitude, longitude);
      },
      () => {},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 60000},
    );
  };

  const fetchNearby = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=sublocality|neighborhood&key=${GOOGLE_API}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) setNearbyPlaces(data.results.slice(0, 7));
    } catch {}
  };

  const handleSearchChange = text => {
    setSearchText(text);
    clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSearchResults([]);
      Animated.timing(resultsOpacity, {toValue: 0, duration: 150, useNativeDriver: true}).start();
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => searchPlaces(text), 380);
  };

  const searchPlaces = async query => {
    if (query.length < 2) {setSearching(false); return;}
    try {
      const bias = currentCoords
        ? `&location=${currentCoords.latitude},${currentCoords.longitude}&radius=50000`
        : '';
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API}&language=en&components=country:in${bias}`;
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.predictions || []);
      Animated.timing(resultsOpacity, {toValue: 1, duration: 200, useNativeDriver: true}).start();
    } catch {}
    finally {setSearching(false);}
  };

  const getPlaceDetails = async placeId => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_API}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.result;
  };

  const saveAndGo = useCallback(
    async (name, latitude, longitude) => {
      await saveLocation(name, {latitude, longitude});
      navigation.navigate(ScreenNameEnum.BOTTAM_TAB);
    },
    [saveLocation, navigation],
  );

  const handleSelectPlace = async place => {
    setFetchingDetails(true);
    Keyboard.dismiss();
    try {
      const details = await getPlaceDetails(place.place_id);
      if (details?.geometry?.location) {
        const {lat, lng} = details.geometry.location;
        const name = details.name || place.structured_formatting.main_text;
        await saveAndGo(name, lat, lng);
      }
    } catch {
      Alert.alert('Error', 'Could not fetch location details. Try again.');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleUseCurrentLocation = useCallback(async () => {
    setLocatingGPS(true);
    Keyboard.dismiss();
    try { await locationPermission(); } catch {}
    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        try {
          const address = await getAddressFromLatLng(latitude, longitude);
          if (address) {
            const parts = address.split(',');
            const locality = parts.slice(0, 2).join(',').trim();
            await saveAndGo(locality || address, latitude, longitude);
          } else {
            Alert.alert('Error', 'Could not resolve your location.');
          }
        } catch {
          Alert.alert('Error', 'Unable to get address.');
        } finally {
          setLocatingGPS(false);
        }
      },
      () => {
        setLocatingGPS(false);
        Alert.alert('Location Error', 'Could not access GPS. Please check permissions.');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 0},
    );
  }, [saveAndGo]);

  const handleSelectNearby = async item => {
    const {lat, lng} = item.geometry.location;
    await saveAndGo(item.name, lat, lng);
  };

  const deleteSaved = async id => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    await AsyncStorage.setItem('savedAddresses', JSON.stringify(updated));
  };

  const distanceLabel = (lat, lng) => {
    if (!currentCoords) return '';
    const d = getDistance(currentCoords, {latitude: lat, longitude: lng});
    return d < 1000 ? `${d} m` : `${(d / 1000).toFixed(1)} km`;
  };

  const labelEmoji = label => {
    if (label === 'home') return '🏠';
    if (label === 'work') return '🏢';
    return '📍';
  };

  const showResults = searchText.length > 0;

  // ── Item row renderers ──────────────────────────────────

  const ResultRow = ({item}) => (
    <TouchableOpacity style={styles.row} onPress={() => handleSelectPlace(item)} activeOpacity={0.7}>
      <View style={[styles.rowIcon, styles.rowIconYellow]}>
        <Image source={icon.pin} style={[styles.rowIconImg, {tintColor: '#92400E'}]} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowMain} numberOfLines={1}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
      <Image source={icon.rightarrow} style={styles.arrowImg} />
    </TouchableOpacity>
  );

  const NearbyRow = ({item}) => {
    const dl = distanceLabel(item.geometry.location.lat, item.geometry.location.lng);
    return (
      <TouchableOpacity style={styles.row} onPress={() => handleSelectNearby(item)} activeOpacity={0.7}>
        <View style={[styles.rowIcon, styles.rowIconBlue]}>
          <Image source={icon.mpin} style={[styles.rowIconImg, {tintColor: '#1D4ED8'}]} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowMain} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowSub} numberOfLines={1}>{item.vicinity}</Text>
        </View>
        {dl ? <View style={styles.distBadge}><Text style={styles.distText}>{dl}</Text></View> : null}
      </TouchableOpacity>
    );
  };

  const RecentRow = ({item}) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => saveAndGo(item.name, item.latitude, item.longitude)}
      activeOpacity={0.7}>
      <View style={[styles.rowIcon, styles.rowIconGrey]}>
        <Text style={styles.emojiIcon}>🕐</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowMain} numberOfLines={1}>{item.name}</Text>
      </View>
      <Image source={icon.rightarrow} style={styles.arrowImg} />
    </TouchableOpacity>
  );

  const SavedRow = ({item}) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', flex: 1}}
        onPress={() => saveAndGo(item.name, item.latitude, item.longitude)}
        activeOpacity={0.7}>
        <View style={[styles.rowIcon, styles.rowIconGreen]}>
          <Text style={styles.emojiIcon}>{labelEmoji(item.label)}</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowMain}>
            {item.label ? item.label.charAt(0).toUpperCase() + item.label.slice(1) : 'Address'}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteSaved(item.id)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        style={styles.deleteBtn}>
        <Image source={icon.close} style={styles.deleteImg} />
      </TouchableOpacity>
    </View>
  );

  // ── Render ──────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {opacity: headerOpacity, transform: [{translateY: headerSlide}]},
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <Image source={icon.back} style={styles.backImg} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Where are you?</Text>
          <Text style={styles.headerSub}>Set your pickup location</Text>
        </View>
      </Animated.View>

      {/* ── Search bar ── */}
      <View style={styles.searchOuter}>
        <Animated.View style={[styles.searchBar, {transform: [{scale: searchBounce}]}]}>
          <Image source={icon.search} style={styles.searchIconImg} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search area, street, landmark…"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searching && (
            <ActivityIndicator size="small" color={color.buttonColor} style={{marginRight: 4}} />
          )}
          {searchText.length > 0 && !searching && (
            <TouchableOpacity
              onPress={() => {setSearchText(''); setSearchResults([]);}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Image source={icon.close} style={styles.clearImg} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* ── Fullscreen overlay while fetching details ── */}
      {fetchingDetails && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={color.baground} />
            <Text style={styles.overlayText}>Getting location…</Text>
          </View>
        </View>
      )}

      {/* ── Search results ── */}
      {showResults ? (
        <Animated.View style={[{flex: 1}, {opacity: resultsOpacity}]}>
          <FlatList
            data={searchResults}
            keyExtractor={item => item.place_id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listPad}
            renderItem={({item}) => <ResultRow item={item} />}
            ListEmptyComponent={
              !searching ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySub}>Try a different area or landmark</Text>
                </View>
              ) : null
            }
          />
        </Animated.View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Use current location ── */}
          <TouchableOpacity
            style={styles.gpsRow}
            onPress={handleUseCurrentLocation}
            disabled={locatingGPS}
            activeOpacity={0.85}>
            <View style={styles.gpsDotWrap}>
              {locatingGPS && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {transform: [{scale: ring1Scale}], opacity: ring1Opacity},
                  ]}
                />
              )}
              <View style={styles.gpsDotCore} />
            </View>
            <View style={styles.gpsTexts}>
              <Text style={styles.gpsLabel}>
                {locatingGPS ? 'Detecting your location…' : 'Use current location'}
              </Text>
              <Text style={styles.gpsSub}>Accurate GPS detection</Text>
            </View>
            {locatingGPS ? (
              <ActivityIndicator size="small" color={color.baground} />
            ) : (
              <View style={styles.gpsChevron}>
                <Image source={icon.rightarrow} style={[styles.arrowImg, {tintColor: color.baground}]} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.sectionGap} />

          {/* ── Saved addresses ── */}
          {savedAddresses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
              {savedAddresses.map(addr => (
                <SavedRow key={addr.id} item={addr} />
              ))}
            </View>
          )}

          {/* ── Recent searches ── */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              {recentSearches.map((item, i) => (
                <RecentRow key={i} item={item} />
              ))}
            </View>
          )}

          {/* ── Nearby areas ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEARBY AREAS</Text>
            {nearbyPlaces.length > 0 ? (
              nearbyPlaces.map(place => (
                <NearbyRow key={place.place_id} item={place} />
              ))
            ) : (
              <View style={styles.nearbyLoading}>
                <ActivityIndicator size="small" color={color.buttonColor} />
                <Text style={styles.nearbyLoadText}>Finding areas near you…</Text>
              </View>
            )}
          </View>

          <View style={{height: 48}} />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const HEADER_BG = color.baground;        // '#081041' deep navy
const ACCENT = color.buttonColor;        // '#FED428' golden
const SURFACE = '#FFFFFF';
const BG = '#F4F6FB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  backImg: {width: 18, height: 18, tintColor: '#fff'},
  headerTextWrap: {flex: 1},
  headerTitle: {fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.2},
  headerSub: {fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontWeight: '500'},

  // Search
  searchOuter: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIconImg: {width: 18, height: 18, tintColor: TEXT_SECONDARY, marginRight: 10},
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearImg: {width: 14, height: 14, tintColor: '#9CA3AF'},

  // GPS row
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  gpsDotWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gpsDotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
  },
  gpsTexts: {flex: 1},
  gpsLabel: {fontSize: 15, fontWeight: '700', color: '#2563EB'},
  gpsSub: {fontSize: 12, color: TEXT_SECONDARY, marginTop: 3},
  gpsChevron: {width: 28, height: 28, alignItems: 'center', justifyContent: 'center'},

  // Sections
  sectionGap: {height: 8, backgroundColor: BG},
  section: {backgroundColor: SURFACE, marginBottom: 8},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 1.1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },

  // Generic row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowIconYellow: {backgroundColor: '#FEF3C7'},
  rowIconBlue: {backgroundColor: '#EFF6FF'},
  rowIconGrey: {backgroundColor: '#F3F4F6'},
  rowIconGreen: {backgroundColor: '#ECFDF5'},
  rowIconImg: {width: 18, height: 18},
  emojiIcon: {fontSize: 19},
  rowText: {flex: 1, marginRight: 8},
  rowMain: {fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY},
  rowSub: {fontSize: 12, color: TEXT_SECONDARY, marginTop: 3},
  arrowImg: {width: 14, height: 14, tintColor: '#D1D5DB'},

  // Distance badge
  distBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  distText: {fontSize: 11, fontWeight: '600', color: TEXT_SECONDARY},

  // Delete button
  deleteBtn: {padding: 8},
  deleteImg: {width: 12, height: 12, tintColor: '#D1D5DB'},

  // Nearby loading
  nearbyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  nearbyLoadText: {color: TEXT_SECONDARY, marginLeft: 10, fontSize: 13},

  // List
  listPad: {paddingBottom: 40},
  scroll: {flex: 1},

  // Empty
  emptyWrap: {alignItems: 'center', paddingTop: 60, paddingHorizontal: 40},
  emptyText: {fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6},
  emptySub: {fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center'},

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  overlayCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  overlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: 14,
  },
});

export default SelectLocation;
