import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Toast from 'react-native-toast-message';
import toastConfig from '../configs/customToast';

import RegistrationRoutes from './RegistrationRoutes';

import { ThemeProvider } from '../component/utils/ThemeProvider';
import { LanguageProvider } from '../component/Localization/LanguageContext';
import { persistor, store } from '../redux/Store';
import { LocationProvider, useLocation } from '../component/LocationContext';
import { locationPermission } from '../component/helperFunction';

export default function AppNavigator() {


  return (
    <Provider store={store}>

      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <LocationProvider>
                <LanguageProvider>
                  <NavigationContainer>
                    <RegistrationRoutes />
                    <Toast config={toastConfig} />
                  </NavigationContainer>
                </LanguageProvider>
              </LocationProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
