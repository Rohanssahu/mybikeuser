import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';

// Define dropdown item type
interface DropdownItem {
  label: string;
  value: string;
}

// Define props for the component
interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  onSelect: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ data, placeholder = 'Select', onSelect }) => {
  const [value, setValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && styles.focusedDropdown]}
        data={data}
        labelField="label"
        valueField="value"
        placeholderStyle={{color:'#fff'}}
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          onSelect(item.value);
        }}
        renderRightIcon={() => (
          <Icon  size={20} source={icon.downwhite}/>
        )}
        itemTextStyle={styles.itemText}
        selectedTextStyle={styles.selectedText}
        containerStyle={styles.dropdownContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  dropdown: {
    height: 50,
    backgroundColor: '#2C2F5B', // Dark background
    borderRadius: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F7F8F8', // Light gray border
  },
  focusedDropdown: {
    borderColor: '#F7F8F8', // Light gray border Highlighted border when focused
  },
  dropdownContainer: {
    backgroundColor: '#2C2F5B', // Dropdown background
    borderRadius: 10,
  },
  itemText: {
    color: '#FFFFFF', // White text for dropdown items
  },
  selectedText: {
    fontSize: 16,
    color: '#FFFFFF', // White text for selected value
  },
});

export default CustomDropdown;
