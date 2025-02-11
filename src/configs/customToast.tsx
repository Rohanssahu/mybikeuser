import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

// Toast configuration
const toastConfig = {
  successResponse: ({ text1 }: { text1: string }) => (
    <View style={styles.successContainer}>
      <Text style={styles.titleStyle}>{text1}</Text>
    </View>
  ),
  errorResponse: ({ text1 }: { text1: string }) => (
    <View style={styles.errorContainer}>
      <Text style={[styles.titleStyle, { color: '#fff' }]}>{text1}</Text>
    </View>
  ),
  normalResponse: ({ text1 }: { text1: string }) => (
    <View style={styles.normalContainer}>
      <Text style={styles.titleStyle}>{text1}</Text>
    </View>
  ),
};

// Toast functions
export const successToast = (message: string, time = 2000) => {
  Toast.show({
    type: 'successResponse',
    text1: message,
    position: 'top',
    visibilityTime: time,
    topOffset: 50,
  });
};

export const errorToast = (message: string, time = 2000) => {
  Toast.show({
    type: 'errorResponse',
    text1: message,
    position: 'top',
    visibilityTime: time,
    topOffset: 50,
  });
};

export const normalToast = (message: string, time = 2000) => {
  Toast.show({
    type: 'normalResponse',
    text1: message,
    position: 'top',
    visibilityTime: time,
    topOffset: 50,
  });
};

export default toastConfig;

// Styles
const styles = StyleSheet.create({
  titleStyle: {
    marginLeft: 15,
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  successContainer: {
    height: 55,
    width: '93%',
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderLeftWidth: 10,
    borderLeftColor: '#51B732',
    shadowColor: '#51B732',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  errorContainer: {
    height: 55,
    width: '93%',
    backgroundColor: '#990707',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: 'gray',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  normalContainer: {
    height: 55,
    width: '93%',
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderLeftWidth: 10,
    borderLeftColor: '#4D3DB5',
    shadowColor: 'gray',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
