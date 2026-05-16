import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OtpBoxProps {
  otp: string | number;
  label: string;
}

const OtpBox: React.FC<OtpBoxProps> = ({ otp, label }) => {
  const digits = otp ? otp.toString().split('') : ['-', '-', '-', '-'];

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.lockIcon}>🔓</Text>
        <Text style={styles.label}>  {label}</Text>
      </View>
      <View style={styles.boxRow}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Share this OTP with the service agent</Text>
    </View>
  );
};

export default OtpBox;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D1952',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.25)',
    marginHorizontal: 14,
    marginTop: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  lockIcon: { fontSize: 16 },
  label: {
    color: '#FED428',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  box: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#1A2566',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(254,212,40,0.4)',
  },
  digit: {
    color: '#FED428',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: '#3D4F80',
    textAlign: 'center',
  },
});
