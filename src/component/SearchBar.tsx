import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { color } from '../constant';
import Icon from './Icon';
import { icon } from './Image';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search', value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Icon size={19} source={icon.search} tintColor={color.buttonColor} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={color.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: 16,
    height: 52,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: color.textPrimary,
    marginLeft: 8,
  },
});

export default SearchBar;
