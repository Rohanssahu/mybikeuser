import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HelpIcon, {HelpIconName} from './icons';

export interface QuickHelpCardProps {
  icon: HelpIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  tintBg?: string;
}

const QuickHelpCard: React.FC<QuickHelpCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  tintBg = '#EEEEFB',
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={[styles.iconWrap, {backgroundColor: tintBg}]}>
        <HelpIcon name={icon} size={19} color="#081041" />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <View style={styles.arrow}>
        <HelpIcon name="chevronDown" size={11} color="#9EA2C0" strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    backgroundColor: '#0F1D3A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {fontSize: 13.5, fontWeight: '700', color: '#fff', lineHeight: 17},
  subtitle: {
    fontSize: 11.5,
    color: '#6B7DBE',
    marginTop: 3,
    lineHeight: 15,
  },
  arrow: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '-90deg'}],
  },
});

export default memo(QuickHelpCard);
