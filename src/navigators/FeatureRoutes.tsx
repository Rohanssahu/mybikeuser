import React, {FunctionComponent} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import _routes from '../routes/routes';
import ScreenNameEnum from '../routes/screenName.enum';

const Stack = createNativeStackNavigator();

const FeatureRoutes: FunctionComponent<any> = ({
  SceenName,
}: {
  SceenName?: ScreenNameEnum;
}) => {
 
  return (
    <Stack.Navigator
      initialRouteName={SceenName}
    
      screenOptions={{
      
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}>
      {_routes.REGISTRATION_ROUTE.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
        />
      ))}

     
     
    </Stack.Navigator>
  );
};


export default FeatureRoutes;
