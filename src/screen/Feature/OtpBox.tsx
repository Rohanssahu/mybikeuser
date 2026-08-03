import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius, spacing} from '../../constant';

interface OtpBoxProps {
  otp: string | number;
  label: string;
  hint?: string;
}

const OtpBox: React.FC<OtpBoxProps> = ({ otp, label, hint }) => {
  const digits = otp ? otp.toString().split('') : ['-', '-', '-', '-'];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-key-outline" size={23} color={color.buttonColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>VERIFICATION CODE</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
      <Text style={styles.instruction}>
        {hint ?? 'Share this code with the service agent only when requested.'}
      </Text>
      <View style={styles.boxRow}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
      <View style={styles.safetyRow}>
        <MaterialCommunityIcons name="information-outline" size={14} color={color.textMuted} />
        <Text style={styles.hint}>Do not share this OTP over an unknown call.</Text>
      </View>
    </View>
  );
};

export default OtpBox;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.45)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(254,212,40,0.12)',
    marginRight: 11,
  },
  headerText: {flex: 1},
  eyebrow: {fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: color.textMuted},
  label: {
    color: color.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  instruction: {fontSize: 12, lineHeight: 17, color: color.textMuted, marginTop: 12},
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 16,
  },
  box: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: color.baground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(254,212,40,0.4)',
  },
  digit: {
    color: color.buttonColor,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  safetyRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5},
  hint: {fontSize: 10.5, color: color.textMuted, textAlign: 'center'},
});
