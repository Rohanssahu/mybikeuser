import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { color } from '../../constant'
import BannerSlider from '../../component/BannerSlider'
import { useNavigation } from '@react-navigation/native'
import HomeHeader from '../../component/HomeHeader'
import HorizontalList from '../../component/HorizontalList'
import images from '../../component/Image'
import { hp } from '../../component/utils/Constant'
import SeeallHeader from '../../component/SeeallHeader'
import VerticalList from '../../component/VerticalList'
import GarageList from '../../component/GarageList'
import ScreenNameEnum from '../../routes/screenName.enum'
import { get_bannerlist, get_nearyBydeler, get_servicelist } from '../../redux/Api/apiRequests'
import { useLocation } from '../../component/LocationContext'

export default function Home({ }) {

  const navigation = useNavigation()
const [Servicelist,setServicelist] = useState([])
const [bannerlist,setbannerlist] = useState([])
const [dealerlist,setdealerlist] = useState([])
const [LocationNames, setLocationNames] = useState('');
const { locationName, setLocationName } = useLocation();

  useEffect(()=>{
    servicelist()
  },[])
  const servicelist =async()=>{
     const res = await get_servicelist()
     const banner = await get_bannerlist()
     const dealer = await get_nearyBydeler('40.7128','74.006')



     
   if(dealer.data?.length >0 ){
    setdealerlist(res.data)
   }
   if(res.data?.length >0 ){
    setServicelist(res.data)
   }
   if(banner.data?.length >0 ){
    setbannerlist(res.data)
   }
  }
  return (
    <View style={{ flex: 1, backgroundColor: color.baground }}>
      <ScrollView >
      <HomeHeader
        navigation={navigation}
        location={locationName ? locationName : LocationNames ? LocationNames : 'Fetching'}
        hasNotifications={true}
        onLocationPress={() => {navigation.navigate(ScreenNameEnum.SELECT_LOCATION)}}
        onNotificationPress={() => console.log("Notifications Pressed")}
      />

      <BannerSlider navigation={navigation} data={bannerlist} />
      <View>
        <SeeallHeader
          title="Over Services"
          onSeeAllPress={() => {navigation.navigate(ScreenNameEnum.ALL_SERVICES)}}
        />
        <HorizontalList data={Servicelist} />
      </View>
      <SeeallHeader
        title="Near By You"
        onSeeAllPress={() => console.log("See All Pressed")}
      />
      <View style={{ flex: 1, marginTop: 20 }}>
        <GarageList
          data={shopList}
        />
      </View>
      </ScrollView>
    </View>
  )
}



const shopList = [
  {
    name: 'GearUp Garage',
    location: 'Grand Park New',
    distance: '2.5',
    logo:images.superbike
  },
  {
    name: 'GearUp Garage',
    location: 'Grand Park New',
    distance: '2.5',
    logo:images.superbike
  },
]