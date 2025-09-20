import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OtpBox = ({ otp , label }) => {
  const otpDigits = otp ? otp.toString().split('') : ['-', '-', '-', '-'];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {label} : 
      </Text>
      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => (
          <View key={index} style={styles.otpBox}>
            <Text style={styles.otpText}>{digit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default OtpBox;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%', // Adjust based on screen
  },
  otpBox: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  otpText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
  },
});
