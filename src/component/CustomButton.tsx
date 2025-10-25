import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { color } from '../constant';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disable?: boolean; // ✅ use lowercase 'boolean' type (not 'Boolean')
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  disable = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        disable && { backgroundColor: '#d3d3d3' }, // grey when disabled
      ]}
      onPress={!disable ? onPress : undefined} // ✅ prevent accidental press
      activeOpacity={disable ? 1 : 0.8} // ✅ no press animation if disabled
      disabled={disable}>
      <Text
        style={[
          styles.text,
          textStyle,
          disable && { color: '#888' }, // faded text if disabled
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.buttonColor,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
  },
  text: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomButton;
