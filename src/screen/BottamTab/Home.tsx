import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {color, TAB_BAR_HEIGHT} from '../../constant';
import BannerSlider from '../../component/BannerSlider';
import HomeHeader from '../../component/HomeHeader';
import HorizontalList from '../../component/HorizontalList';
import GarageList from '../../component/GarageList';
import ScreenNameEnum from '../../routes/screenName.enum';
import {
  get_bannerlist,
  get_featured_categories,
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

interface FeaturedCategory {
  _id: string;
  categoryName: string;
  categoryImage: string;
  locationName: string;
  radius: number;
  serviceId?: {_id: string; name: string};
}

interface UserCoords {
  latitude: number;
  longitude: number;
}

const FEAT_CARD_WIDTH = Dimensions.get('window').width * 0.32;

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

const FeaturedCategoryCard: React.FC<{item: FeaturedCategory; onPress: () => void}> = ({item, onPress}) => {
  const [imgError, setImgError] = useState(false);
  const imageSource =
    !imgError && item.categoryImage
      ? {uri: item.categoryImage}
      : require('../../assets/images/LOGO2x.png');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 6,
        marginTop: 14,
        backgroundColor: '#1B2A4A',
      }}>
      <Image
        source={imageSource}
        resizeMode="cover"
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          padding: 10,
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}>
        <Text
          numberOfLines={2}
          style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
          }}>
          {item.categoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const FeaturedCategorySkeleton: React.FC = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={featStyles.skeletonRow}>
      {[0, 1, 2].map(i => (
        <Animated.View
          key={i}
          style={[featStyles.card, featStyles.skeletonCard, {opacity}]}
        />
      ))}
    </View>
  );
};

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [dealerList, setDealerList] = useState<Dealer[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<
    FeaturedCategory[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [User, setUser] = useState<any>(null);
  const {locationName} = useLocation();

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, []),
  );

  const loadFeaturedCategories = async (coords: UserCoords) => {
    setFeaturedLoading(true);
    try {
      const featured = await get_featured_categories(
        coords.latitude,
        coords.longitude,
      );
      setFeaturedCategories(featured?.data ?? []);
    } catch {
      setFeaturedCategories([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    let coords: UserCoords | null = null;
    try {
      const [resolvedCoords, user_id] = await Promise.all([
        getCurrentLocation(),
        AsyncStorage.getItem('user_id'),
      ]);

      coords = resolvedCoords;
      setUserCoords(coords);

      const [services, banners, dealers, profile] = await Promise.all([
        get_servicelist(),
        get_bannerlist(),
        coords
          ? get_nearyBydeler(coords.latitude, coords.longitude)
          : Promise.resolve(null),
        user_id ? get_profile(user_id) : Promise.resolve(null),
      ]);

      if (services?.data) {
        setServiceList(services.data);
      }
      if (banners?.data) {
        setBannerList(banners.data);
      }
      if (dealers?.data) {
        setDealerList(dealers.data);
      }
      if (profile?.success) {
        setUser(profile.data);
      }
    } catch (error) {
      console.error('Home loadAll error:', error);
    } finally {
      setLoading(false);
    }

    if (coords) {
      loadFeaturedCategories(coords);
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
          contentContainerStyle={{
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT,
          }}
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

          {featuredLoading ? (
            <FeaturedCategorySkeleton />
          ) : featuredCategories.length > 0 ? (
            <FlatList
              data={featuredCategories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item._id}
              contentContainerStyle={featStyles.listContainer}
              renderItem={({item}) => (
                <FeaturedCategoryCard
                  item={item}
                  onPress={() =>
                    (navigation as any).navigate(ScreenNameEnum.MY_BIKES, {
                      profile: false,
                      serviceId: item.serviceId?._id,
                    })
                  }
                />
              )}
            />
          ) : null}
          {!featuredLoading &&
            serviceList.length === 0 &&
            featuredCategories.length === 0 && (
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
});

const featStyles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  card: {
    width: FEAT_CARD_WIDTH,
    backgroundColor: '#1B2A4A',
    borderRadius: 16,
    marginTop: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.12)',
  },
  skeletonCard: {
    backgroundColor: '#1E2D4A',
    height: 110,
  },
  imageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: 52,
    height: 52,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8E8E8',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default Home;
