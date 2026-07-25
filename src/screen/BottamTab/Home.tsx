import React, {useEffect, useMemo, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {color, TAB_BAR_HEIGHT} from '../../constant';
import BannerSlider from '../../component/BannerSlider';
import HomeHeader from '../../component/HomeHeader';
import ScreenNameEnum from '../../routes/screenName.enum';
import AnnouncementPopup, {
  AnnouncementBanner,
} from '../modal/AnnouncementPopup';
import {
  get_app_banners,
  get_bannerlist,
  get_mybikes,
  get_nearyBydeler,
  get_most_booked_near_you,
  get_profile,
  get_quick_services,
  get_recommended_for_you,
  get_service_categories,
  get_servicelist,
  get_top_garages,
} from '../../redux/Api/apiRequests';
import {useLocation} from '../../component/LocationContext';
import {useRefreshOnResume} from '../../hooks/useRefreshOnResume';
import {useUserBookings} from '../../hooks/useUserBookings';
import {getCurrentLocation} from '../../component/helperFunction';

import SectionHeader from '../../component/home/SectionHeader';
import Shimmer, {SkeletonRow} from '../../component/home/Shimmer';
import HomeSearchBar from '../../component/home/HomeSearchBar';
import MyBikeCarousel from '../../component/home/MyBikeCarousel';
import QuickServicesRow from '../../component/home/QuickServicesRow';
import RecommendedForYouSection from '../../component/home/RecommendedForYouSection';
import PopularNearYouSection from '../../component/home/PopularNearYouSection';
import ServiceCategoriesGrid from '../../component/home/ServiceCategoriesGrid';
import TopRatedGaragesSection from '../../component/home/TopRatedGaragesSection';
import SpecialOffersRow, {
  OfferTile,
} from '../../component/home/SpecialOffersRow';
import RecentBookingsRow, {
  RecentBookingLike,
} from '../../component/home/RecentBookingsRow';
import {
  BikeItem,
  DealerItem,
  MostBookedServiceItem,
  QuickServiceItem,
  RecommendedServiceItem,
  SearchResult,
  ServiceCatalogItem,
  ServiceCategoryItem,
  TopGarageItem,
  buildSearchIndex,
} from '../../component/home/homeData';

type RootStackParamList = {
  SELECT_LOCATION: undefined;
  ALL_SERVICES: {categoryId?: string; categoryName?: string} | undefined;
  Notification: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface UserCoords {
  latitude: number;
  longitude: number;
}

const resolveObjectId = (value: any): string | undefined =>
  typeof value === 'string' ? value : value?._id;

const HomeSkeleton: React.FC = () => (
  <View>
    <SkeletonRow count={1} width={335} height={168} />
    <SkeletonRow count={5} width={64} height={64} />
    <SkeletonRow count={3} width={168} height={150} />
    <View style={{paddingHorizontal: 20, marginTop: 16}}>
      <Shimmer style={{height: 78, borderRadius: 18, marginBottom: 12}} />
      <Shimmer style={{height: 78, borderRadius: 18, marginBottom: 12}} />
    </View>
  </View>
);

const EmptySection: React.FC<{icon: string; message: string}> = ({
  icon,
  message,
}) => (
  <View style={styles.emptySection}>
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={color.textFaint}
      style={{marginBottom: 6}}
    />
    <Text style={styles.emptySectionText}>{message}</Text>
  </View>
);

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const isFocus = useIsFocused();
  const {locationName} = useLocation();

  const [serviceList, setServiceList] = useState<ServiceCatalogItem[]>([]);
  const [bannerList, setBannerList] = useState<any[]>([]);
  const [dealerList, setDealerList] = useState<DealerItem[]>([]);
  const [bikeList, setBikeList] = useState<BikeItem[]>([]);
  const [serviceCategories, setServiceCategories] = useState<
    ServiceCategoryItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [User, setUser] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementBanner | null>(
    null,
  );
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  // Which saved bike the bike-swipe carousel is currently on. Quick Services
  // and Recommended re-fetch whenever this changes — see the effect below.
  const [activeBikeIndex, setActiveBikeIndex] = useState(0);
  const activeBikeId = bikeList[activeBikeIndex]?._id;

  const [quickServices, setQuickServices] = useState<QuickServiceItem[]>([]);
  const [quickServicesLoading, setQuickServicesLoading] = useState(true);
  const [recommended, setRecommended] = useState<RecommendedServiceItem[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [mostBooked, setMostBooked] = useState<MostBookedServiceItem[]>([]);
  const [mostBookedLoading, setMostBookedLoading] = useState(true);
  const [topGarages, setTopGarages] = useState<TopGarageItem[]>([]);
  const [topGaragesLoading, setTopGaragesLoading] = useState(true);

  const {bookings} = useUserBookings(isFocus);

  // Fetched once per app session — not on every tab focus — so a dismissed
  // popup doesn't reappear each time the user switches back to Home.
  React.useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const [popupRes, announcementRes] = await Promise.all([
          get_app_banners('popup'),
          get_app_banners('announcement'),
        ]);
        const active = [
          ...(popupRes?.data ?? []),
          ...(announcementRes?.data ?? []),
        ];
        if (active.length > 0) {
          setAnnouncement(active[0]);
          setAnnouncementVisible(true);
        }
      } catch (error) {
        console.error('Home loadAnnouncement error:', error);
      }
    };
    loadAnnouncement();
  }, []);

  // Admin-managed taxonomy — fetched on mount, and again on every pull-to
  // -refresh (see onRefresh below) so an admin toggling a category's active
  // flag shows up without an app restart.
  const loadCategories = async () => {
    try {
      const res = await get_service_categories();
      setServiceCategories(res?.data ?? []);
    } catch (error) {
      console.error('Home loadCategories error:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [resolvedCoords, user_id] = await Promise.all([
        getCurrentLocation(),
        AsyncStorage.getItem('user_id'),
      ]);

      setUserCoords(resolvedCoords);

      const [services, banners, dealers, profile, myBikes] = await Promise.all([
        get_servicelist(),
        get_bannerlist(),
        resolvedCoords
          ? get_nearyBydeler(resolvedCoords.latitude, resolvedCoords.longitude)
          : Promise.resolve(null),
        user_id ? get_profile(user_id) : Promise.resolve(null),
        get_mybikes(),
      ]);

      if (services?.data) setServiceList(services.data);
      if (banners?.data) setBannerList(banners.data);
      if (dealers?.data) setDealerList(dealers.data);
      if (profile?.success) setUser(profile.data);
      const bikes = myBikes?.data ?? [];
      setBikeList(bikes);
      setActiveBikeIndex(0);
      return {resolvedCoords, bikes};
    } catch (error) {
      console.error('Home loadAll error:', error);
      return {resolvedCoords: null, bikes: [] as BikeItem[]};
    } finally {
      setLoading(false);
    }
  };

  // Pure fetchers (no state writes) shared between the reactive effects below
  // and pull-to-refresh, so a manual refresh can force every section fresh
  // using the just-resolved location/bike instead of whatever's still in
  // state from before the refresh.
  const fetchQuickAndRecommended = async (
    bikeId?: string,
    lat?: number,
    lng?: number,
  ) => {
    const [qs, rec] = await Promise.all([
      get_quick_services(bikeId, lat, lng),
      get_recommended_for_you(bikeId, lat, lng),
    ]);
    return {
      quickServices: (qs?.data ?? []) as QuickServiceItem[],
      recommended: (rec?.data ?? []) as RecommendedServiceItem[],
    };
  };

  const fetchMostBooked = async (lat?: number, lng?: number) => {
    const res = await get_most_booked_near_you(lat, lng);
    return (res?.data ?? []) as MostBookedServiceItem[];
  };

  const fetchTopGarages = async (lat?: number, lng?: number) => {
    const res = await get_top_garages(lat, lng);
    return (res?.data ?? []) as TopGarageItem[];
  };

  // Pull-to-refresh re-resolves location/bikes first, then re-fetches every
  // other section (categories, quick services, recommended, most-booked, top
  // garages) with those fresh values — the one place a user can force
  // everything current without waiting on a bike/location change.
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const {resolvedCoords, bikes} = await loadAll();
      const bikeId = bikes?.[0]?._id;

      setQuickServicesLoading(true);
      setRecommendedLoading(true);
      setMostBookedLoading(true);
      setTopGaragesLoading(true);

      await Promise.all([
        loadCategories(),
        fetchQuickAndRecommended(
          bikeId,
          resolvedCoords?.latitude,
          resolvedCoords?.longitude,
        )
          .then(result => {
            setQuickServices(result.quickServices);
            setRecommended(result.recommended);
          })
          .catch(error =>
            console.error('Home quick/recommended refresh error:', error),
          )
          .finally(() => {
            setQuickServicesLoading(false);
            setRecommendedLoading(false);
          }),
        fetchMostBooked(resolvedCoords?.latitude, resolvedCoords?.longitude)
          .then(setMostBooked)
          .catch(error =>
            console.error('Home most-booked refresh error:', error),
          )
          .finally(() => setMostBookedLoading(false)),
        resolvedCoords
          ? fetchTopGarages(resolvedCoords.latitude, resolvedCoords.longitude)
              .then(setTopGarages)
              .catch(error =>
                console.error('Home top-garages refresh error:', error),
              )
              .finally(() => setTopGaragesLoading(false))
          : Promise.resolve().then(() => {
              setTopGarages([]);
              setTopGaragesLoading(false);
            }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Refetches on tab focus AND on app resume (foreground) while Home is the
  // active tab — nearby garages must drop offline/inactive dealers on the
  // very next look, without needing a manual pull-to-refresh or restart.
  useRefreshOnResume(loadAll);

  // Quick Services + Recommended are bike-aware — re-fetch whenever the
  // active bike (bike-swipe) or the resolved location changes. bikeId is
  // omitted from the request entirely (not sent as '') when there's no
  // selected/available bike, so the backend falls back to area popularity.
  useEffect(() => {
    let cancelled = false;
    setQuickServicesLoading(true);
    setRecommendedLoading(true);
    fetchQuickAndRecommended(
      activeBikeId,
      userCoords?.latitude,
      userCoords?.longitude,
    )
      .then(result => {
        if (!cancelled) {
          setQuickServices(result.quickServices);
          setRecommended(result.recommended);
        }
      })
      .catch(error =>
        console.error('Home quick/recommended load error:', error),
      )
      .finally(() => {
        if (!cancelled) {
          setQuickServicesLoading(false);
          setRecommendedLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeBikeId, userCoords?.latitude, userCoords?.longitude]);

  // Most Booked Near You + Top Rated Garages are location-aware only (not
  // bike-specific) — re-fetch whenever the resolved location changes.
  useEffect(() => {
    let cancelled = false;
    setMostBookedLoading(true);
    fetchMostBooked(userCoords?.latitude, userCoords?.longitude)
      .then(data => {
        if (!cancelled) {
          setMostBooked(data);
        }
      })
      .catch(error => console.error('Home most-booked load error:', error))
      .finally(() => {
        if (!cancelled) {
          setMostBookedLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userCoords?.latitude, userCoords?.longitude]);

  useEffect(() => {
    let cancelled = false;
    if (userCoords?.latitude == null || userCoords?.longitude == null) {
      setTopGarages([]);
      setTopGaragesLoading(false);
      return undefined;
    }
    setTopGaragesLoading(true);
    fetchTopGarages(userCoords?.latitude, userCoords?.longitude)
      .then(data => {
        if (!cancelled) {
          setTopGarages(data);
        }
      })
      .catch(error => console.error('Home top-garages load error:', error))
      .finally(() => {
        if (!cancelled) {
          setTopGaragesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userCoords?.latitude, userCoords?.longitude]);

  const hasBike = bikeList.length > 0;

  const searchIndex: SearchResult[] = useMemo(
    () =>
      buildSearchIndex(serviceList, serviceCategories, dealerList, bikeList),
    [serviceList, serviceCategories, dealerList, bikeList],
  );

  const recentBookings: RecentBookingLike[] = useMemo(
    () =>
      bookings
        .filter((b): b is RecentBookingLike => Boolean(b._id))
        .sort((a: any, b: any) => {
          const da = new Date(a.create_date || a.createdAt || 0).getTime();
          const db = new Date(b.create_date || b.createdAt || 0).getTime();
          return db - da;
        })
        .slice(0, 6),
    [bookings],
  );

  // ── Navigation helpers ──────────────────────────────────────────────
  // Garage-first taps (user already picked a specific garage) skip straight
  // to the bike-select -> GARAGE_DETAILS flow the app already ships.
  const goToBikeSelect = (params: {serviceId?: string; Grageid?: string}) => {
    (navigation as any).navigate(ScreenNameEnum.MY_BIKES, {
      profile: false,
      ...params,
    });
  };

  // Service-first taps (Quick Services, Recommended, Most Booked, search)
  // open the Service Detail / Compare Garages screen instead — that's the
  // "service -> compare nearby garages -> book" entry point, not the bike
  // -> garage flow above. bikeId is the currently active bike from the
  // swipe carousel (falls back to the user's first saved bike if none is
  // active yet); the screen itself works fine without one.
  const goToServiceDetail = (serviceId?: string) => {
    if (!serviceId) return;
    (navigation as any).navigate(ScreenNameEnum.SERVICE_DETAIL, {
      serviceId,
      bikeId: activeBikeId ?? bikeList[0]?._id,
    });
  };

  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === 'garage') {
      goToBikeSelect({Grageid: result.dealerId});
    } else if (result.type === 'service') {
      goToServiceDetail(result.serviceId);
    } else if (result.type === 'category') {
      (navigation as any).navigate(ScreenNameEnum.ALL_SERVICES, {
        categoryId: result.categoryId,
      });
    } else {
      goToBikeSelect({});
    }
  };

  const handleQuickService = (service: QuickServiceItem) =>
    goToServiceDetail(service.serviceId);

  const handleRecommended = (item: RecommendedServiceItem) =>
    goToServiceDetail(item.serviceId);

  const handlePopular = (item: MostBookedServiceItem) =>
    goToServiceDetail(item.serviceId);

  const handleCategory = (cat: ServiceCategoryItem) =>
    (navigation as any).navigate(ScreenNameEnum.ALL_SERVICES, {
      categoryId: cat._id,
      categoryName: cat.name,
    });

  const handleTopGarage = (garage: TopGarageItem) =>
    goToBikeSelect({Grageid: garage.dealerId});

  const handleManageBike = () => goToBikeSelect({});
  const handleAddBike = () =>
    (navigation as any).navigate(ScreenNameEnum.BIKE_DETAILS);

  const handleTrackBooking = (booking: RecentBookingLike) =>
    (navigation as any).navigate(ScreenNameEnum.SERVICE_SUMMERY, {
      id: booking._id,
    });

  const handleInvoiceBooking = (booking: RecentBookingLike) =>
    (navigation as any).navigate(ScreenNameEnum.InvoiceScreen, {
      bookingId: booking._id,
    });

  const handleRepeatBooking = (booking: RecentBookingLike) => {
    const dealerId = resolveObjectId((booking as any).dealer_id);
    const bikeId = resolveObjectId((booking as any).userBike_id);
    const bike = bikeList.find(b => b._id === bikeId);

    if (bike && dealerId) {
      (navigation as any).navigate(ScreenNameEnum.GARAGE_DETAILS, {
        bike,
        id: dealerId,
      });
    } else if (dealerId) {
      goToBikeSelect({Grageid: dealerId});
    }
  };

  const offers: OfferTile[] = useMemo(
    () => [
      {
        key: 'refer',
        title: 'Refer & Earn',
        subtitle: 'Invite friends and earn rewards on their first service',
        icon: 'gift-outline',
        onPress: () =>
          (navigation as any).navigate(ScreenNameEnum.REWARDS_REFERRALS),
      },
    ],
    [navigation],
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      <AnnouncementPopup
        visible={announcementVisible}
        banner={announcement}
        onClose={() => setAnnouncementVisible(false)}
      />

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
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
            onProfilePress={() =>
              (navigation as any).navigate(ScreenNameEnum.PROFILE_SCREEN)
            }
          />
          <HomeSkeleton />
        </ScrollView>
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
            onProfilePress={() =>
              (navigation as any).navigate(ScreenNameEnum.PROFILE_SCREEN)
            }
          />

          <HomeSearchBar
            index={searchIndex}
            onSelectResult={handleSearchSelect}
          />

          {bannerList.length > 0 && (
            <BannerSlider navigation={navigation} data={bannerList} />
          )}
          {/* Service categories — admin-managed, no hardcoded list */}
          <SectionHeader title="Browse by Category" />
          {serviceCategories.length > 0 ? (
            <ServiceCategoriesGrid
              categories={serviceCategories}
              onPress={handleCategory}
            />
          ) : (
            <EmptySection
              icon="shape-outline"
              message="Categories are being updated"
            />
          )}
          {/* Quick Services — only ones this bike/network actually supports */}
          <SectionHeader
            title="Quick Services"
            subtitle="Book in a couple of taps"
          />

          {quickServicesLoading ? (
            <SkeletonRow count={5} width={64} height={64} />
          ) : quickServices.length > 0 ? (
            <QuickServicesRow
              services={quickServices}
              onPress={handleQuickService}
            />
          ) : (
            <EmptySection
              icon="wrench-outline"
              message="No quick services available right now"
            />
          )}

          {mostBooked.length > 0 && (
            <>
              {/* Most booked near you */}
              <SectionHeader
                title="Most Booked Near You"
                onSeeAll={() =>
                  (navigation as any).navigate(ScreenNameEnum.ALL_SERVICES)
                }
              />
              {mostBookedLoading ? (
                <View style={{paddingHorizontal: 20}}>
                  <Shimmer
                    style={{height: 70, borderRadius: 18, marginBottom: 12}}
                  />
                  <Shimmer
                    style={{height: 70, borderRadius: 18, marginBottom: 12}}
                  />
                </View>
              ) : mostBooked.length > 0 ? (
                <PopularNearYouSection
                  items={mostBooked}
                  onSelect={handlePopular}
                />
              ) : (
                <EmptySection
                  icon="chart-line"
                  message="No booking activity in your area yet"
                />
              )}
            </>
          )}

          {/* Top rated garages */}
          <SectionHeader
            title="Top Rated Garages"
            subtitle="Highest rated near you, right now"
          />
          {topGaragesLoading ? (
            <SkeletonRow count={3} width={236} height={180} />
          ) : topGarages.length > 0 ? (
            <TopRatedGaragesSection
              garages={topGarages}
              onSelect={handleTopGarage}
            />
          ) : (
            <EmptySection
              icon="store-search-outline"
              message="No garages found nearby"
            />
          )}
          {recommended.length > 0 && (
            <>
              {/* Recommended */}
              <SectionHeader
                title="Recommended For Your Bike"
                subtitle={
                  hasBike
                    ? 'Based on your bike & service history'
                    : 'Popular with riders near you'
                }
              />
              {recommendedLoading ? (
                <SkeletonRow count={3} width={168} height={150} />
              ) : recommended.length > 0 ? (
                <RecommendedForYouSection
                  items={recommended}
                  onSelect={handleRecommended}
                />
              ) : (
                <EmptySection
                  icon="star-outline"
                  message="No recommendations yet — check back soon"
                />
              )}
            </>
          )}
          {/* My Bike(s) */}
          <SectionHeader
            title="My Bikes"
            subtitle={
              hasBike
                ? 'Manage your vehicle & service history'
                : 'Add your bike to unlock quick booking'
            }
          />
          <MyBikeCarousel
            bikes={bikeList}
            onManage={handleManageBike}
            onAdd={handleAddBike}
            onActiveIndexChange={setActiveBikeIndex}
          />

          {/* Special offers */}
          <SectionHeader title="Offers For You" />
          <SpecialOffersRow offers={offers} />

          {/* Recent bookings */}
          {recentBookings.length > 0 && (
            <>
              <SectionHeader
                title="Recent Bookings"
                onSeeAll={() =>
                  (navigation as any).navigate(ScreenNameEnum.BOOKING_SCREEN)
                }
              />
              <RecentBookingsRow
                bookings={recentBookings}
                onTrack={handleTrackBooking}
                onRepeat={handleRepeatBooking}
                onInvoice={handleInvoiceBooking}
              />
            </>
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
  emptySection: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 22,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
  },
  emptySectionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: color.textMuted,
    textAlign: 'center',
  },
});

export default Home;
