import React, {useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import {color} from '../../constant';
import Icon from '../Icon';
import {icon} from '../Image';

interface SelectionFieldProps {
  label: string;
  placeholder: string;
  value?: string | null;
  subValue?: string | null;
  disabled?: boolean;
  error?: string;
  onPress: () => void;
  leading?: React.ReactNode;
  style?: ViewStyle;
}

const SelectionField: React.FC<SelectionFieldProps> = ({
  label,
  placeholder,
  value,
  subValue,
  disabled = false,
  error,
  onPress,
  leading,
  style,
}) => {
  const hasValue = !!value;
  const pressScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) {return;}
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const onPressOut = () => {
    if (disabled) {return;}
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={{transform: [{scale: pressScale}]}}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={disabled ? undefined : onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled}
          style={[
            styles.field,
            disabled && styles.fieldDisabled,
            !!error && styles.fieldError,
          ]}>
          {leading ? <View style={styles.leadingWrap}>{leading}</View> : null}

          <View style={styles.textCol}>
            <Text
              numberOfLines={1}
              style={[styles.value, !hasValue && styles.placeholder]}>
              {value || placeholder}
            </Text>
            {subValue ? (
              <Text numberOfLines={1} style={styles.subValue}>
                {subValue}
              </Text>
            ) : null}
          </View>

          {!hasValue && !disabled ? (
            <Icon
              source={icon.search}
              size={15}
              tintColor="#7C86B8"
              style={styles.searchIcon}
            />
          ) : null}

          <Icon
            source={icon.downwhite}
            size={13}
            tintColor={disabled ? '#3D4472' : '#C7CCE6'}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {marginBottom: 18},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0B8D0',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.cardSurface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 60,
  },
  fieldDisabled: {
    opacity: 0.45,
  },
  fieldError: {
    borderColor: '#EF4444',
  },
  leadingWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textCol: {flex: 1},
  value: {fontSize: 15.5, fontWeight: '700', color: '#fff'},
  placeholder: {fontWeight: '500', color: '#7C86B8'},
  subValue: {fontSize: 12, color: color.buttonColor, marginTop: 2, fontWeight: '600'},
  searchIcon: {marginRight: 12},
  chevron: {transform: [{rotate: '-90deg'}]},
  errorText: {color: '#EF4444', fontSize: 12, marginTop: 6},
});

export default SelectionField;
