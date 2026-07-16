import {View, Text, Image, Keyboard, Platform, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import _routes from '../routes/routes';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: isKeyboardVisible ? 'none' : 'flex',
          backgroundColor: '#0A1340',
          borderTopWidth: 1,
          borderTopColor: 'rgba(254,212,40,0.12)',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.35,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: '#FED428',
        tabBarInactiveTintColor: '#4A5680',
      }}>
      {_routes.BOTTOM_TAB.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
          options={{
            tabBarIcon: ({focused}) =>
              screen.lable === 'Help' ? (
                /* Help / Support — raised pill button */
                <View style={styles.helpWrap}>
                  <View
                    style={[
                      styles.helpCircle,
                      focused && styles.helpCircleActive,
                    ]}>
                    <Image
                      source={screen.logo}
                      style={[
                        styles.helpIcon,
                        {tintColor: focused ? '#081041' : '#FED428'},
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      focused ? styles.tabLabelActive : styles.tabLabelInactive,
                    ]}>
                    {screen.lable}
                  </Text>
                </View>
              ) : (
                /* Regular tabs */
                <View style={styles.tabItem}>
                  <Image
                    source={screen.logo}
                    style={[
                      styles.tabIcon,
                      {tintColor: focused ? '#FED428' : '#4A5680'},
                    ]}
                  />
                  {focused ? (
                    <View style={styles.activeDot} />
                  ) : (
                    <View style={styles.activeDotPlaceholder} />
                  )}
                  <Text
                    style={[
                      styles.tabLabel,
                      focused ? styles.tabLabelActive : styles.tabLabelInactive,
                    ]}>
                    {screen.lable}
                  </Text>
                </View>
              ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FED428',
    marginTop: 3,
  },
  activeDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {color: '#FED428'},
  tabLabelInactive: {color: '#4A5680'},

  // Help tab
  helpWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  helpCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(254,212,40,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(254,212,40,0.4)',
    marginBottom: 2,
  },
  helpCircleActive: {
    backgroundColor: '#FED428',
    borderColor: '#FED428',
  },
  helpIcon: {
    width: 24,
    height: 24,
  },
});
