
import React, {FunctionComponent} from 'react';
import {LogBox, StatusBar, View, Text, StyleSheet} from 'react-native';

import 'react-native-gesture-handler';
import AppNavigator from './src/navigators/AppNavigator';


LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications




const App: FunctionComponent<any> = () => <AppNavigator />;

export default App;
