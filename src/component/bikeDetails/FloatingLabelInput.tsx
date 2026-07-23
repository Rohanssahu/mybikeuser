import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import {color} from '../../constant';

interface FloatingLabelInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
}

const FloatingLabelInput = forwardRef<TextInput, FloatingLabelInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      helperText,
      style,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: focused || value ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }, [focused, value, anim]);

    const labelTop = anim.interpolate({inputRange: [0, 1], outputRange: [18, 8]});
    const labelSize = anim.interpolate({inputRange: [0, 1], outputRange: [15.5, 11.5]});
    const labelColor = error
      ? '#EF4444'
      : focused
      ? color.buttonColor
      : '#8892C0';

    return (
      <View style={styles.wrap}>
        <View
          style={[
            styles.field,
            focused && styles.fieldFocused,
            !!error && styles.fieldError,
          ]}>
          <Animated.Text
            style={[
              styles.label,
              {top: labelTop, fontSize: labelSize, color: labelColor},
            ]}>
            {label}
          </Animated.Text>
          <TextInput
            {...rest}
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onFocus={e => {
              setFocused(true);
              onFocusProp?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlurProp?.(e);
            }}
            style={[styles.input, style]}
            placeholderTextColor="#5B6390"
          />
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {marginBottom: 4},
  field: {
    backgroundColor: color.cardSurface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 60,
    justifyContent: 'flex-end',
    paddingBottom: 9,
  },
  fieldFocused: {
    borderColor: color.buttonColor,
  },
  fieldError: {
    borderColor: '#EF4444',
  },
  label: {
    position: 'absolute',
    left: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
    padding: 0,
  },
  errorText: {color: '#EF4444', fontSize: 12, marginTop: 6},
  helperText: {color: '#7C86B8', fontSize: 12, marginTop: 6},
});

export default FloatingLabelInput;
