'use strict';

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, StatusBar, Platform, Keyboard, TextInput,
  FlatList, Image, Dimensions, Linking, BackHandler, Alert,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation} from '@react-navigation/native';
import {useLocation} from './LocationContext';
import {icon} from './Image';
import {locationPermission} from './helperFunction';
import {color} from '../constant';

const GOOGLE_API = 'AIzaSyD-wpc72_cdZesSpttpE2tXHbqlpp84JJA';
const {width: W, height: H} = Dimensions.get('window');
const STATUS_H = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
const CARD_H = 220;

const INDIA = {latitude: 20.5937, longitude: 78.9629, latitudeDelta: 15, longitudeDelta: 15};

const extract = (comps, types) =>
  comps?.find(c => types.some(t => c.types.includes(t)))?.long_name ?? '';

const parseAddr = comps => ({
  premise:   extract(comps, ['premise','establishment','point_of_interest']),
  streetNum: extract(comps, ['street_number']),
  route:     extract(comps, ['route']),
  sub:       extract(comps, ['sublocality_level_1','sublocality']),
  locality:  extract(comps, ['locality']),
  city:      extract(comps, ['administrative_area_level_2','locality']),
  state:     extract(comps, ['administrative_area_level_1']),
  pincode:   extract(comps, ['postal_code']),
});

const buildDisplay = (p, formatted) => {
  const area = [p.sub || p.locality, p.city].filter(Boolean).join(', ');
  if (p.premise)              return {primary: p.premise,                   secondary: area || formatted};
  if (p.streetNum && p.route) return {primary: `${p.streetNum} ${p.route}`, secondary: area};
  if (p.route)                return {primary: p.route,                     secondary: area};
  if (p.sub)                  return {primary: p.sub,                       secondary: [p.locality, p.city].filter(Boolean).join(', ')};
  return                             {primary: p.locality || 'Selected Location', secondary: formatted};
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => {
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(op, {toValue: 0.9, duration: 600, useNativeDriver: true}),
      Animated.timing(op, {toValue: 0.4, duration: 600, useNativeDriver: true}),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <View>
      <Animated.View style={[sk.line, {width: '70%', height: 16, opacity: op}]} />
      <Animated.View style={[sk.line, {width: '50%', height: 12, marginTop: 8, opacity: op}]} />
    </View>
  );
};
const sk = StyleSheet.create({
  line: {backgroundColor: '#E5E7EB', borderRadius: 6},
});

// ── PermissionDenied ──────────────────────────────────────────────────────────
const PermDenied = ({onRetry}) => (
  <View style={pd.wrap}>
    <Text style={pd.emoji}>📍</Text>
    <Text style={pd.title}>Location Access Required</Text>
    <Text style={pd.body}>Enable location permission to set your pickup point.</Text>
    <TouchableOpacity style={pd.primary} onPress={() => Linking.openSettings()}>
      <Text style={pd.primaryTxt}>Open Settings</Text>
    </TouchableOpacity>
    <TouchableOpacity style={pd.secondary} onPress={onRetry}>
      <Text style={pd.secondaryTxt}>Try Again</Text>
    </TouchableOpacity>
  </View>
);
const pd = StyleSheet.create({
  wrap:        {flex:1, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', paddingHorizontal:40},
  emoji:       {fontSize:64, marginBottom:20},
  title:       {fontSize:20, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:12},
  body:        {fontSize:14, color:'#6B7280', textAlign:'center', lineHeight:22, marginBottom:32},
  primary:     {backgroundColor:color.baground, borderRadius:14, paddingVertical:15, width:'100%', alignItems:'center', marginBottom:12},
  primaryTxt:  {fontSize:15, fontWeight:'700', color:'#fff'},
  secondary:   {borderRadius:14, borderWidth:1.5, borderColor:color.baground, paddingVertical:13, width:'100%', alignItems:'center'},
  secondaryTxt:{fontSize:15, fontWeight:'600', color:color.baground},
});

// ── Main ──────────────────────────────────────────────────────────────────────
const SelectLocation = () => {
  const navigation  = useNavigation();
  const {saveLocation} = useLocation();
  const mapRef      = useRef(null);

  const [region,       setRegion]       = useState(INDIA);
  const [addrInfo,     setAddrInfo]     = useState(null);
  const [resolving,    setResolving]    = useState(false);
  const [permDenied,   setPermDenied]   = useState(false);
  const [locatingGPS,  setLocatingGPS]  = useState(false);

  // Search overlay
  const [searchVisible, setSearchVisible] = useState(false);
  const [query,         setQuery]         = useState('');
  const [suggestions,   setSuggestions]   = useState([]);
  const [searching,     setSearching]     = useState(false);

  const isDragging   = useRef(false);
  const geocodeTimer = useRef(null);
  const searchTimer  = useRef(null);
  const inputRef     = useRef(null);

  // Animated values
  const pinY     = useRef(new Animated.Value(0)).current;
  const pinScale = useRef(new Animated.Value(1)).current;
  const shadowOp = useRef(new Animated.Value(0.2)).current;
  const cardY    = useRef(new Animated.Value(CARD_H + 40)).current;
  const overlayO = useRef(new Animated.Value(0)).current;
  const gpsAnim  = useRef(new Animated.Value(0)).current;
  const gpsLoop  = useRef(null);

  const gpsScale = useMemo(() => gpsAnim.interpolate({inputRange:[0,1], outputRange:[0.5,2.4]}), [gpsAnim]);
  const gpsOp    = useMemo(() => gpsAnim.interpolate({inputRange:[0,0.7,1], outputRange:[0.7,0.2,0]}), [gpsAnim]);

  // Init
  useEffect(() => {
    Animated.spring(cardY, {toValue:0, useNativeDriver:true, tension:58, friction:12, delay:200}).start();
    initGPS();
    loadStored();
  }, []);

  // Back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (searchVisible) { closeSearch(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [searchVisible]);

  // GPS pulse
  useEffect(() => {
    if (locatingGPS) {
      gpsAnim.setValue(0);
      gpsLoop.current = Animated.loop(
        Animated.timing(gpsAnim, {toValue:1, duration:900, useNativeDriver:true})
      );
      gpsLoop.current.start();
    } else {
      gpsLoop.current?.stop();
      gpsAnim.setValue(0);
    }
    return () => gpsLoop.current?.stop();
  }, [locatingGPS]);

  // Pin lift/drop
  const liftPin = useCallback(() => {
    Animated.parallel([
      Animated.spring(pinY,     {toValue:-20,  useNativeDriver:true, tension:260, friction:10}),
      Animated.spring(pinScale, {toValue:1.14, useNativeDriver:true, tension:260, friction:10}),
      Animated.timing(shadowOp, {toValue:0.5,  duration:100, useNativeDriver:true}),
    ]).start();
  }, []);
  const dropPin = useCallback(() => {
    Animated.parallel([
      Animated.spring(pinY,     {toValue:0, useNativeDriver:true, tension:190, friction:7}),
      Animated.spring(pinScale, {toValue:1, useNativeDriver:true, tension:190, friction:7}),
      Animated.timing(shadowOp, {toValue:0.2, duration:200, useNativeDriver:true}),
    ]).start();
  }, []);

  // Open/close search overlay
  const openSearch = useCallback(() => {
    setSearchVisible(true);
    setQuery('');
    setSuggestions([]);
    Animated.timing(overlayO, {toValue:1, duration:200, useNativeDriver:true}).start(() => {
      inputRef.current?.focus();
    });
  }, []);
  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(overlayO, {toValue:0, duration:150, useNativeDriver:true}).start(() => {
      setSearchVisible(false);
      setQuery('');
      setSuggestions([]);
    });
  }, []);

  // GPS
  const initGPS = useCallback(async () => {
    try { await locationPermission(); } catch { setPermDenied(true); return; }
    setLocatingGPS(true);
    Geolocation.getCurrentPosition(
      ({coords: {latitude, longitude}}) => {
        const r = {latitude, longitude, latitudeDelta:0.008, longitudeDelta:0.008};
        setRegion(r);
        setLocatingGPS(false);
        mapRef.current?.animateToRegion(r, 800);
        reverseGeocode(latitude, longitude);
      },
      () => { setLocatingGPS(false); setPermDenied(true); },
      {enableHighAccuracy:true, timeout:15000, maximumAge:5000},
    );
  }, []);

  const loadStored = useCallback(async () => {}, []);

  // Reverse geocode
  const reverseGeocode = useCallback((lat, lng) => {
    clearTimeout(geocodeTimer.current);
    setResolving(true);
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API}&language=en`);
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const r = data.results[0];
          const p = parseAddr(r.address_components);
          const {primary, secondary} = buildDisplay(p, r.formatted_address);
          setAddrInfo({primary, secondary, formatted: r.formatted_address, parsed: p});
        } else {
          setAddrInfo({primary:'Unknown Location', secondary:`${lat.toFixed(5)}, ${lng.toFixed(5)}`, formatted:'', parsed:{}});
        }
      } catch {
        setAddrInfo({primary:'Address unavailable', secondary:'Try moving the map', formatted:'', parsed:{}});
      } finally {
        setResolving(false);
      }
    }, 800);
  }, []);

  // Autocomplete fetch
  const fetchSuggestions = useCallback(async (text) => {
    if (text.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API}&language=en&components=country:in`;
      const res  = await fetch(url);
      const data = await res.json();
      console.log('[SelectLocation][autocomplete] input=', text, 'status=', data.status, 'predictions=', data.predictions?.length ?? 0, 'error=', data.error_message || '');
      if (data.status === 'OK') {
        setSuggestions(data.predictions || []);
      } else {
        console.warn('Places autocomplete failed:', data.status, data.error_message || '');
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const onQueryChange = useCallback((text) => {
    setQuery(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSuggestions(text), 300);
  }, [fetchSuggestions]);

  // Select from autocomplete
  const selectPlace = useCallback(async (placeId, description) => {
    closeSearch();
    setResolving(true);
    try {
      const url  = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API}&language=en&fields=geometry,name,formatted_address,address_components`;
      const res  = await fetch(url);
      const data = await res.json();
      console.log(
        '[SelectLocation][details]',
        'placeId=',
        placeId,
        'status=',
        data.status,
        'hasGeometry=',
        !!data.result?.geometry?.location,
        'error=',
        data.error_message || '',
      );
      if (data.result?.geometry?.location) {
        const {lat, lng} = data.result.geometry.location;
        const r = {latitude:lat, longitude:lng, latitudeDelta:0.005, longitudeDelta:0.005};
        setRegion(r);
        mapRef.current?.animateToRegion(r, 700);
        const p = parseAddr(data.result.address_components || []);
        const {primary, secondary} = buildDisplay(p, data.result.formatted_address || '');
        setAddrInfo({
          primary:   data.result.name || primary,
          secondary: secondary || data.result.formatted_address,
          formatted: data.result.formatted_address,
          parsed:    p,
        });
      } else {
        console.warn('Places details missing geometry:', data.status, data.error_message || '');
        setAddrInfo({
          primary: description.split(',')[0],
          secondary: description,
          formatted: description,
          parsed: {},
        });
      }
    } catch {
      setAddrInfo({primary: description.split(',')[0], secondary: description, formatted: description, parsed: {}});
    } finally {
      setResolving(false);
    }
  }, [closeSearch]);

  // Map handlers
  const onRegionChange = useCallback(() => {
    if (!isDragging.current) { isDragging.current = true; liftPin(); }
  }, [liftPin]);

  const onRegionChangeComplete = useCallback((r) => {
    isDragging.current = false;
    setRegion(r);
    dropPin();
    reverseGeocode(r.latitude, r.longitude);
  }, [dropPin, reverseGeocode]);

  // GPS FAB
  const handleGPS = useCallback(async () => {
    setLocatingGPS(true);
    try { await locationPermission(); } catch {
      setLocatingGPS(false);
      Alert.alert('Permission Denied', 'Enable location in Settings.');
      return;
    }
    Geolocation.getCurrentPosition(
      ({coords: {latitude, longitude}}) => {
        const r = {latitude, longitude, latitudeDelta:0.005, longitudeDelta:0.005};
        setRegion(r);
        setLocatingGPS(false);
        mapRef.current?.animateToRegion(r, 700);
        reverseGeocode(latitude, longitude);
      },
      () => { setLocatingGPS(false); Alert.alert('GPS Error', 'Could not detect location.'); },
      {enableHighAccuracy:true, timeout:15000, maximumAge:0},
    );
  }, [reverseGeocode]);

  // Confirm
  const handleConfirm = useCallback(async () => {
    if (!addrInfo) return;
    await saveLocation(addrInfo.primary, {latitude: region.latitude, longitude: region.longitude});
    navigation.goBack();
  }, [addrInfo, region, saveLocation, navigation]);

  if (permDenied) {
    return <PermDenied onRetry={() => { setPermDenied(false); initGPS(); }} />;
  }

  const PIN_CX = W / 2;
  const PIN_CY = H / 2;

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INDIA}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      />

      {/* Center Pin */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[s.pinWrap, {left: PIN_CX - 12, top: PIN_CY - 38, transform:[{translateY:pinY},{scale:pinScale}]}]}>
          <View style={s.pinBall} />
          <View style={s.pinStem} />
        </Animated.View>
        <Animated.View style={[s.pinShadow, {left: PIN_CX - 9, top: PIN_CY - 3, opacity: shadowOp}]} />
      </View>

      {/* Back */}
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Image source={icon.back} style={s.backImg} />
      </TouchableOpacity>

      {/* Search bar tap — always visible */}
      <TouchableOpacity style={s.searchBar} onPress={openSearch} activeOpacity={0.9}>
        <Image source={icon.search} style={s.searchIcon} />
        <Text style={s.searchPlaceholder} numberOfLines={1}>
          Search area, street, landmark…
        </Text>
      </TouchableOpacity>

      {/* GPS FAB */}
      <TouchableOpacity style={s.gpsFab} onPress={handleGPS} activeOpacity={0.85} disabled={locatingGPS}>
        <View style={s.gpsFabInner}>
          {locatingGPS ? (
            <>
              <Animated.View style={[s.gpsRing, {transform:[{scale:gpsScale}], opacity:gpsOp}]} />
              <ActivityIndicator size="small" color={color.baground} />
            </>
          ) : (
            <Image source={icon.mpin} style={s.gpsFabImg} />
          )}
        </View>
      </TouchableOpacity>

      {/* Bottom Card — always visible */}
      <Animated.View style={[s.card, {transform:[{translateY:cardY}]}]}>
        <View style={s.dragHandle} />
        <View style={s.addrRow}>
          <View style={s.addrDot} />
          <View style={{flex:1}}>
            {resolving ? <Skeleton /> : addrInfo ? (
              <>
                <Text style={s.addrPrimary} numberOfLines={2}>{addrInfo.primary}</Text>
                {!!addrInfo.secondary && (
                  <Text style={s.addrSecondary} numberOfLines={2}>{addrInfo.secondary}</Text>
                )}
              </>
            ) : (
              <Text style={s.addrSecondary}>Move the map to pick a location</Text>
            )}
          </View>
        </View>
        <View style={s.divider} />
        <TouchableOpacity
          style={[s.confirmBtn, (resolving || !addrInfo) && s.confirmOff]}
          onPress={handleConfirm}
          disabled={resolving || !addrInfo}
          activeOpacity={0.85}>
          <Text style={s.confirmTxt}>Confirm Location</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Search Overlay — fullscreen, above everything */}
      {searchVisible && (
        <Animated.View style={[s.overlay, {opacity: overlayO}]}>
          {/* Header */}
          <View style={s.overlayHeader}>
            <TouchableOpacity onPress={closeSearch} style={s.overlayBack} activeOpacity={0.8}>
              <Image source={icon.back} style={s.backImg} />
            </TouchableOpacity>
            <View style={s.overlayInputWrap}>
              <Image source={icon.search} style={s.searchIcon} />
              <TextInput
                ref={inputRef}
                style={s.overlayInput}
                placeholder="Search area, street, landmark…"
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={onQueryChange}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }} hitSlop={{top:12,bottom:12,left:12,right:12}}>
                  <Image source={icon.close} style={s.clearIcon} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results */}
          {searching ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator color={color.baground} />
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={item => item.place_id}
              keyboardShouldPersistTaps="always"
              ItemSeparatorComponent={() => <View style={s.sep} />}
              ListEmptyComponent={() => query.length >= 2 && !searching ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyTxt}>No results found</Text>
                </View>
              ) : query.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyTxt}>Search for an area or landmark</Text>
                </View>
              ) : null}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={s.resultRow}
                  onPress={() => selectPlace(item.place_id, item.description)}
                  activeOpacity={0.7}>
                  <View style={s.resultIcon}>
                    <Image source={icon.pin} style={[s.resultPinImg, {tintColor:'#92400E'}]} />
                  </View>
                  <View style={{flex:1}}>
                    <Text style={s.resultMain} numberOfLines={1}>
                      {item.structured_formatting?.main_text || item.description}
                    </Text>
                    {!!item.structured_formatting?.secondary_text && (
                      <Text style={s.resultSub} numberOfLines={1}>
                        {item.structured_formatting.secondary_text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
};

const PIN_BALL = 24;
const PIN_STEM = 14;

const s = StyleSheet.create({
  root: {flex:1, backgroundColor:'#f0f0f0'},

  // Pin
  pinWrap:   {position:'absolute', alignItems:'center'},
  pinBall:   {width:PIN_BALL, height:PIN_BALL, borderRadius:PIN_BALL/2, backgroundColor:color.baground, borderWidth:3, borderColor:color.buttonColor, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:6, elevation:7},
  pinStem:   {width:3, height:PIN_STEM, backgroundColor:color.baground, borderRadius:2},
  pinShadow: {position:'absolute', width:18, height:6, borderRadius:9, backgroundColor:'rgba(0,0,0,0.22)'},

  // Back
  backBtn:  {position:'absolute', top:STATUS_H+10, left:16, width:42, height:42, borderRadius:21, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.15, shadowRadius:8, elevation:6, zIndex:30},
  backImg:  {width:18, height:18, tintColor:color.baground},

  // Search bar (tap target)
  searchBar: {position:'absolute', top:STATUS_H+10, left:68, right:16, flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:14, paddingHorizontal:14, paddingVertical:Platform.OS==='ios'?13:10, shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.12, shadowRadius:10, elevation:7, zIndex:30},
  searchIcon:        {width:16, height:16, tintColor:'#9CA3AF', marginRight:10},
  searchPlaceholder: {flex:1, fontSize:14, color:'#9CA3AF', fontWeight:'500'},

  // GPS FAB
  gpsFab:      {position:'absolute', right:16, bottom:CARD_H+16, width:48, height:48, borderRadius:24, backgroundColor:'#fff', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:10, elevation:7, zIndex:20, overflow:'hidden'},
  gpsFabInner: {width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center'},
  gpsRing:     {position:'absolute', width:22, height:22, borderRadius:11, backgroundColor:color.baground},
  gpsFabImg:   {width:22, height:22, tintColor:color.baground},

  // Bottom card
  card:       {position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#fff', borderTopLeftRadius:26, borderTopRightRadius:26, paddingHorizontal:24, paddingTop:12, paddingBottom:Platform.OS==='ios'?40:26, shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:16, elevation:24, zIndex:20, minHeight:CARD_H},
  dragHandle: {width:40, height:4, borderRadius:2, backgroundColor:'#E5E7EB', alignSelf:'center', marginBottom:18},
  addrRow:    {flexDirection:'row', alignItems:'flex-start', marginBottom:18},
  addrDot:    {width:12, height:12, borderRadius:6, backgroundColor:color.baground, marginTop:4, marginRight:14, flexShrink:0},
  addrPrimary:   {fontSize:17, fontWeight:'800', color:'#111827', lineHeight:24, marginBottom:5},
  addrSecondary: {fontSize:13, color:'#6B7280', lineHeight:19},
  divider:    {height:1, backgroundColor:'#F3F4F6', marginBottom:18},
  confirmBtn: {backgroundColor:color.buttonColor, borderRadius:16, paddingVertical:17, alignItems:'center', shadowColor:color.buttonColor, shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:10, elevation:6},
  confirmOff: {opacity:0.45},
  confirmTxt: {fontSize:16, fontWeight:'800', color:'#1C1917', letterSpacing:0.3},

  // Search overlay
  overlay:       {position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'#fff', zIndex:100},
  overlayHeader: {flexDirection:'row', alignItems:'center', paddingTop:STATUS_H+8, paddingBottom:12, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  overlayBack:   {width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', marginRight:10},
  overlayInputWrap: {flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#F9FAFB', borderRadius:12, paddingHorizontal:12, paddingVertical:Platform.OS==='ios'?11:7, borderWidth:1, borderColor:'#E5E7EB'},
  overlayInput:  {flex:1, fontSize:14, color:'#111827', fontWeight:'500', paddingVertical:0, marginLeft:8},
  clearIcon:     {width:13, height:13, tintColor:'#9CA3AF'},

  // Results list
  resultRow:    {flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14},
  resultIcon:   {width:38, height:38, borderRadius:19, backgroundColor:'#FEF3C7', alignItems:'center', justifyContent:'center', marginRight:12, flexShrink:0},
  resultPinImg: {width:15, height:15},
  resultMain:   {fontSize:14, fontWeight:'600', color:'#111827', marginBottom:2},
  resultSub:    {fontSize:12, color:'#6B7280'},
  sep:          {height:1, backgroundColor:'#F3F4F6', marginLeft:66},
  loadingWrap:  {paddingTop:40, alignItems:'center'},
  emptyWrap:    {paddingTop:40, alignItems:'center'},
  emptyTxt:     {fontSize:13, color:'#9CA3AF'},
});

export default SelectLocation;
