import React, {memo} from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {icon} from '../Image';

interface SupportButtonProps {
  iconSource: ImageSourcePropType;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showDivider?: boolean;
}

const SupportButton: React.FC<SupportButtonProps> = ({
  iconSource,
  title,
  subtitle,
  onPress,
  showDivider = true,
}) => {
  return (
    <TouchableOpacity
      style={[styles.row, showDivider && styles.divider]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
      <View style={styles.iconWrap}>
        <Image source={iconSource} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Image source={icon.rightarrow} style={styles.chevron} resizeMode="contain" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 48,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(254,212,40,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {width: 17, height: 17, tintColor: '#FED428'},
  textWrap: {flex: 1},
  title: {fontSize: 13.5, fontWeight: '700', color: '#fff'},
  subtitle: {fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 1},
  chevron: {width: 14, height: 14, tintColor: 'rgba(255,255,255,0.4)'},
});

export default memo(SupportButton);
