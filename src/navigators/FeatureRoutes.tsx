import React, {FunctionComponent, useEffect, useState} from 'react';

import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import _routes from '../routes/routes';
import ScreenNameEnum from '../models/routes/screenName.enum';
import {PermissionsAndroid} from 'react-native';
import {RootState} from '../store/app.store';
import {useSelector} from 'react-redux';
import { Subscriptions } from '../iap/Subscriptions';
const Stack = createStackNavigator();

const FeatureRoutes: FunctionComponent<any> = ({
  SceenName,
}: {
  SceenName?: ScreenNameEnum;
}) => {
 
  return permissionRequired != null ? (
    <Stack.Navigator
      initialRouteName={SceenName}
    
      screenOptions={{
      
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      {_routes.FEATURE_ROUTE.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
        />
      ))}

     
     
    </Stack.Navigator>
  ) : null;
};


export default FeatureRoutes;
