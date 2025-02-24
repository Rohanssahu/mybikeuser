
import { icon } from "../component/Image";
import SelectLocation from "../component/SelectLocation";
import TabNavigator from "../navigators/TabNavigator";
import Login from "../screen/Auth/Login";
import ProfileDetails from "../screen/Auth/ProfileDetails";
import Splash from "../screen/Auth/Splash";
import VerifyOtp from "../screen/Auth/VerifyOtp";
import Booking from "../screen/BottamTab/Booking";
import Help from "../screen/BottamTab/Help";
import Home from "../screen/BottamTab/Home";
import Profile from "../screen/BottamTab/Profile";
import Reward from "../screen/BottamTab/Reward";
import AllServices from "../screen/Feature/AllServices";
import BikeDetails from "../screen/Feature/BikeDetails";
import BookingComplete from "../screen/Feature/BookingComplete";
import GarageDetails from "../screen/Feature/GarageDetails";
import MyBikes from "../screen/Feature/MyBikes";
import NearByShops from "../screen/Feature/NearByShops";
import ServiceSummary from "../screen/Feature/ServiceSummary";
import AboutUsScreen from "../screen/profile/AboutUsScreen";
import EditProfile from "../screen/profile/EditProfile";
import NotificatioScreen from "../screen/profile/NotificationSetting";
import Privacy from "../screen/profile/Privacy";
import Vehical from "../screen/profile/Vehical";
import ScreenNameEnum from "./screenName.enum";


const _routes = {
  REGISTRATION_ROUTE: [
    {
      name: ScreenNameEnum.SPLASH_SCREEN,
      Component: Splash,
    },
    {
      name: ScreenNameEnum.LOGIN_SCREEN,
      Component: Login,
    },
    {
      name: ScreenNameEnum.OTP_SCREEN,
      Component: VerifyOtp,
    },
    {
      name: ScreenNameEnum.PROFILE_DETAILS,
      Component: ProfileDetails,
    },
    {
      name: ScreenNameEnum.BOTTAM_TAB,
      Component: TabNavigator,
    },
    {
      name: ScreenNameEnum.ALL_SERVICES,
      Component: AllServices,
    },
    {
      name: ScreenNameEnum.BIKE_DETAILS,
      Component: BikeDetails,
    },
    {
      name: ScreenNameEnum.NEARBY_SHOPS,
      Component: NearByShops,
    },
    {
      name: ScreenNameEnum.GARAGE_DETAILS,
      Component: GarageDetails,
    },
    {
      name: ScreenNameEnum.BOOKING_COMPLETE,
      Component: BookingComplete,
    },
    {
      name: ScreenNameEnum.SERVICE_SUMMERY,
      Component: ServiceSummary,
    },
    {
      name: ScreenNameEnum.EDIT_PROFILE,
      Component: EditProfile,
    },
    {
      name: ScreenNameEnum.VEHICAL_SCREEN,
      Component: Vehical,
    },
    {
      name: ScreenNameEnum.NOTIFICATION_SETTING,
      Component: NotificatioScreen,
    },
    {
      name: ScreenNameEnum.ABOUT_SCREEN,
      Component: AboutUsScreen,
    },
    {
      name: ScreenNameEnum.PRIVACY_POLICY,
      Component: Privacy,
    },
    {
      name: ScreenNameEnum.SELECT_LOCATION,
      Component: SelectLocation,
    },
    {
      name: ScreenNameEnum.MY_BIKES,
      Component: MyBikes,
    },

  ],





  BOTTOM_TAB: [
    {
      name: ScreenNameEnum.HOME_SCREEN,
      Component: Home,
      active: icon.home,
      logo: icon.home1,
      lable: 'Home'
    },
    {
      name: ScreenNameEnum.BOOKING_SCREEN,
      Component: Booking,
      active: icon.booking,
      logo: icon.booking,
      lable: 'Booking'
    },
    {
      name: ScreenNameEnum.SUPPORT_SCREEN,
      Component: Help,
      active: icon.support,
      logo: icon.support,
      lable: 'Help'
    },
    {
      name: ScreenNameEnum.REWARD_SCREEN,
      Component: Reward,
      active: icon.reward,
      logo: icon.reward,
      lable: 'Reward'
    },
    {
      name: ScreenNameEnum.PROFILE_SCREEN,
      Component: Profile,
      active: icon.profile,
      logo: icon.profile,
      lable: 'Profile'
    },



  ]
  ,


};

export default _routes;
