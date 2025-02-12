import { View, Text, ScrollView } from 'react-native'
import React from 'react'
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

export default function Home({ }) {

  const navigation = useNavigation()
  return (
    <View style={{ flex: 1, backgroundColor: color.baground }}>
      <ScrollView >
      <HomeHeader
        navigation={navigation}
        location="Wallace, Australia"
        hasNotifications={true}
        onLocationPress={() => console.log("Location Pressed")}
        onNotificationPress={() => console.log("Notifications Pressed")}
      />

      <BannerSlider navigation={navigation} />
      <View>
        <SeeallHeader
          title="Your Category"
          onSeeAllPress={() => {navigation.navigate(ScreenNameEnum.ALL_SERVICES)}}
        />
        <HorizontalList data={data} />
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

const data = [
  {
    name: 'Standard',
    img: images.bikes

  },
  {
    name: 'Sport',
    img: images.honda

  },
  {
    name: 'Scooter',
    img: images.scuty

  },
]

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