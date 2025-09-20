import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { color } from '../../constant';
import BannerSlider from '../../component/BannerSlider';
import HomeHeader from '../../component/HomeHeader';
import HorizontalList from '../../component/HorizontalList';
import SeeallHeader from '../../component/SeeallHeader';
import GarageList from '../../component/GarageList';
import ScreenNameEnum from '../../routes/screenName.enum';
import { get_bannerlist, get_nearyBydeler, get_profile, get_servicelist } from '../../redux/Api/apiRequests';
import { useLocation } from '../../component/LocationContext';
import Skeleton from "react-native-reanimated-skeleton";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Define navigation type
type RootStackParamList = {
  SELECT_LOCATION: undefined;
  ALL_SERVICES: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Define data types
interface Service {
  id: string;
  name: string;
  image: string;
}

interface Banner {
  id: string;
  image: string;
}

interface Dealer {
  id: string;
  name: string;
  location: string;
  distance: string;
  logo: string;
}

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [dealerList, setDealerList] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [locationNames, setLocationNames] = useState<string>('');
  const { locationName } = useLocation();

  useEffect(() => {
    fetchServiceData();
    getUser()
  }, []);
  const getUser = async () => {
    setLoading(true)
  const user_id = await  AsyncStorage.getItem('user_id')


    const res = await get_profile(user_id);
    if (res.success) {
  await AsyncStorage.setItem('user_id',res.data?._id)
        
    } 
    setLoading(false)
};
  const fetchServiceData = async () => {
    setLoading(true);
    try {
      const [res, banner, dealer] = await Promise.all([
        get_servicelist(),
        get_bannerlist(),
        get_nearyBydeler('22.7028638', '75.8715857'),
      ]);

      if (dealer.data) setDealerList(dealer.data);
      if (res.data) setServiceList(res.data);
      if (banner.data) setBannerList(banner.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to Refresh Function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [res, banner, dealer] = await Promise.all([
        get_servicelist(),
        get_bannerlist(),
        get_nearyBydeler('22.6845065', '75.8644601'),
      ]);

      if (dealer.data) setDealerList(dealer.data);
      if (res.data) setServiceList(res.data);
      if (banner.data) setBannerList(banner.data);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.baground }}>
      <StatusBar  backgroundColor={color.baground} />
      
      {loading ? (
        // Show loader while fetching data initially
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color:"#fff"  }}>Loading data...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <HomeHeader
            navigation={navigation}
            location={locationName || locationNames || 'Fetching'}
            hasNotifications={true}
            onLocationPress={() => navigation.navigate(ScreenNameEnum.SELECT_LOCATION)}
            onNotificationPress={() => navigation.navigate(ScreenNameEnum.Notification) }
          />

          {/* Banner Section */}
          <BannerSlider navigation={navigation} data={bannerList} />
          {bannerList.length === 0 && (
            <Text style={{ textAlign: 'center', marginVertical: 10,color:'#fff' }}>No Banners Found</Text>
          )}

          {/* Services Section */}
          <View>
            <SeeallHeader
              title="Our Services"
              onSeeAllPress={() => navigation.navigate(ScreenNameEnum.ALL_SERVICES)}
            />
            {serviceList.length > 0 ? (
              <HorizontalList data={serviceList} />
            ) : (
              <Text style={{ textAlign: 'center', marginVertical: 10,color:'#fff' }}>No Services Found This Location</Text>
            )}
          </View>

          {/* Nearby Dealers Section */}
          <SeeallHeader title="Near By You" onSeeAllPress={() => console.log("See All Pressed")} />

          <View style={{ flex: 1, marginTop: 20 }}>
            {dealerList.length > 0 ? (
              <GarageList data={dealerList} />
            ) : (
              <Text style={{ textAlign: 'center', marginVertical: 10 ,color:'#fff'}}>No Dealers Found This Location</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Home;
