import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {color} from '../../constant';
import BannerSlider from '../../component/BannerSlider';
import HomeHeader from '../../component/HomeHeader';
import HorizontalList from '../../component/HorizontalList';
import GarageList from '../../component/GarageList';
import ScreenNameEnum from '../../routes/screenName.enum';
import {
  get_bannerlist,
  get_nearyBydeler,
  get_profile,
  get_servicelist,
} from '../../redux/Api/apiRequests';
import {useLocation} from '../../component/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCurrentLocation} from '../../component/helperFunction';

type RootStackParamList = {
  SELECT_LOCATION: undefined;
  ALL_SERVICES: undefined;
  Notification: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface Service {
  _id: string;
  name: string;
  image?: string;
}

interface Banner {
  _id: string;
  name: string;
  banner_image: string;
}

interface Dealer {
  _id: string;
  shopName: string;
  fullAddress?: string;
  address?: string;
  latitude: string | number;
  longitude: string | number;
  shopImages?: any[];
  averageRating?: number;
}

interface UserCoords {
  latitude: number;
  longitude: number;
}

const SectionHeader = ({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    )}
  </View>
);

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [dealerList, setDealerList] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [User, setUser] = useState<any>(null);
  const {locationName} = useLocation();

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, []),
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      const [coords, user_id] = await Promise.all([
        getCurrentLocation(),
        AsyncStorage.getItem('user_id'),
      ]);

      setUserCoords(coords);

      const [services, banners, dealers, profile] = await Promise.all([
        get_servicelist(),
        get_bannerlist(),
        get_nearyBydeler(coords.latitude, coords.longitude),
        user_id ? get_profile(user_id) : Promise.resolve(null),
      ]);

      if (services?.data) { setServiceList(services.data); }
      if (banners?.data) { setBannerList(banners.data); }
      if (dealers?.data) { setDealerList(dealers.data); }
      if (profile?.success) { setUser(profile.data); }
    } catch (error) {
      console.error('Home loadAll error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.buttonColor}
              colors={[color.buttonColor]}
            />
          }>
          <HomeHeader
            navigation={navigation}
            location={locationName || 'Set your location'}
            hasNotifications={true}
            User={User}
            onLocationPress={() =>
              navigation.navigate(ScreenNameEnum.SELECT_LOCATION)
            }
            onNotificationPress={() =>
              navigation.navigate(ScreenNameEnum.Notification)
            }
          />

          {/* Banner */}
          {bannerList.length > 0 && (
            <BannerSlider navigation={navigation} data={bannerList} />
          )}

          {/* Services */}
          <SectionHeader
            title="Our Services"
            onSeeAll={() => navigation.navigate(ScreenNameEnum.ALL_SERVICES)}
          />
          {serviceList.length > 0 ? (
            <HorizontalList data={serviceList} />
          ) : (
            <Text style={styles.emptyText}>No services available</Text>
          )}

          {/* Nearby Garages */}
          <SectionHeader title="Nearby Garages" />
          {dealerList.length > 0 ? (
            <View style={styles.garageSection}>
              <GarageList data={dealerList} userLocation={userCoords} />
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No garages found near your location
            </Text>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  seeAllText: {
    fontSize: 13,
    color: color.buttonColor,
    fontWeight: '600',
  },
  garageSection: {
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#606880',
    fontSize: 13,
  },
  bottomPad: {
    height: 20,
  },
});

export default Home;
