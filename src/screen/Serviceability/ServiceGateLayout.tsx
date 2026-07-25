import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {color, radius, spacing, TAB_BAR_HEIGHT} from '../../constant';

// Shared full-screen layout for the area-serviceability gate (ComingSoon /
// Paused). Rendered in place of Home's normal content — the bottom tab bar
// stays mounted around it (see Home.tsx), so Booking/Support/Alerts/Profile
// remain usable while this is showing.
interface ServiceGateLayoutProps {
  icon: string;
  iconColor?: string;
  title: string;
  body: string;
  children?: React.ReactNode;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryLoading?: boolean;
}

const ServiceGateLayout: React.FC<ServiceGateLayoutProps> = ({
  icon,
  iconColor,
  title,
  body,
  children,
  primaryLabel,
  onPrimaryPress,
  primaryLoading,
  primaryDisabled,
  secondaryLabel,
  onSecondaryPress,
  secondaryLoading,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom + TAB_BAR_HEIGHT},
      ]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={icon}
          size={56}
          color={iconColor ?? color.buttonColor}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {children}

      <TouchableOpacity
        style={[styles.primaryBtn, primaryDisabled && styles.primaryBtnDisabled]}
        onPress={onPrimaryPress}
        disabled={primaryDisabled || primaryLoading}
        activeOpacity={0.8}>
        {primaryLoading ? (
          <ActivityIndicator color={color.baground} />
        ) : (
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        )}
      </TouchableOpacity>

      {secondaryLabel && onSecondaryPress ? (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onSecondaryPress}
          disabled={secondaryLoading}
          activeOpacity={0.7}>
          {secondaryLoading ? (
            <ActivityIndicator color={color.buttonColor} />
          ) : (
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: color.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: color.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: spacing.xxl,
    backgroundColor: color.buttonColor,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: color.baground,
  },
  secondaryBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
  },
});

export default ServiceGateLayout;
