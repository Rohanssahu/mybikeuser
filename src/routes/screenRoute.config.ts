import {TransitionPresets} from '@react-navigation/stack';

const navigationRouteConfig: any = {
  // TODO: ScreenOptions type is not defined properly
  basicScreenOptions: {
    headerShown: false,
    ...TransitionPresets.SlideFromRightIOS,
    gestureDirection: 'horizontal',
  },
  basicModalScreenOptions: {
    headerShown: false,
    ...TransitionPresets.ModalSlideFromBottomIOS,
    ...TransitionPresets.RevealFromBottomAndroid,
    gestureDirection: 'vertical',
  },
};

export default navigationRouteConfig;
