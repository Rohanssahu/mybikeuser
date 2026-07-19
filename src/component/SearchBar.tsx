import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
      <Icon size={18} source={icon.search} tintColor="#6B7DBE" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#6B7DBE"
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
    borderRadius: 25,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: 16,
    height: 46,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default SearchBar;
