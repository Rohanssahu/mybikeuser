
import React, {FunctionComponent, useEffect} from 'react';
import {LogBox, StatusBar, View, Text, StyleSheet} from 'react-native';


import AppNavigator from './src/navigators/AppNavigator';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-get-random-values';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications



const App: FunctionComponent<any> = () => <AppNavigator />;

export default App;
