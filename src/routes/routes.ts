
import Login from "../screen/Auth/Login";
import Splash from "../screen/Auth/Splash";
import VerifyOtp from "../screen/Auth/VerifyOtp";
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

  ],





  BOTTOM_TAB: [
    // {
    //   name: ScreenNameEnum.Home,
    //   Component: Home,
    //   logo: require('../assets/Cropping/home2.png'),
    //   lable: 'Home'
    // },



  ]
  ,


};

export default _routes;
