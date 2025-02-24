import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';

interface CustomTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions; // Supports different keyboard types
  inputStyle?: ViewStyle;
  textStyle?: TextStyle;
  editable:boolean;
  placeholderStyle?: TextStyle; // Secondary placeholder style
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = 'default', 
  editable = true, 
  inputStyle, 
  textStyle, 
  placeholderStyle 
}) => {
  return (
    <TextInput
      style={[styles.input, inputStyle]}
      placeholder={placeholder}
      placeholderTextColor={placeholderStyle?.color || '#A0A3BD'} // Default to light gray
      value={value}
      editable={editable}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#282F5A', // Dark blue background
    borderWidth: 1.5,
    borderColor: '#fff', // Light gray border
    borderRadius:15, // Rounded corners
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF', // White text color
    width: '100%',
  },
});

export default CustomTextInput;
