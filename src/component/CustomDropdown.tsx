import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from './Icon';
import { icon } from './Image';

// Define dropdown item type
interface DropdownItem {
  label: string;
  values: string;
}

// Define props for the component
interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  onSelect: (value: string) => void;
  label: string;
  value: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ data, placeholder = 'Select', onSelect,label,value }) => {
  const [values, setValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && styles.focusedDropdown]}
        data={data}
        labelField={label}
        valueField={value}
        placeholderStyle={{color:'#fff'}}
        placeholder={placeholder}
        value={values}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.id);
          onSelect(item);
        }}
        renderRightIcon={() => (
          <Icon  size={20} source={icon.downwhite}/>
        )}
        itemTextStyle={styles.itemText}
        selectedTextStyle={styles.selectedText}
        containerStyle={styles.dropdownContainer}
        renderItem={(item, isSelected) => (
          <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
            <Text style={[styles.itemText, isSelected && {color:'#000'}]}>
              {item[label]}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical:15,
    paddingHorizontal: 15,
    backgroundColor: '#2C2F5B', // Default background for all items
  },
  selectedItem: {
    backgroundColor: '#FFFFFF', // ✅ White background for selected item
  },
  itemText: {
    color: '#FFFFFF', // ✅ White text for all dropdown items
  },
  selectedItemText: {
    color: '#000000', // ✅ Black text for selected item
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 16,
    color: '#000000', // ✅ Black text for the selected value inside the dropdown
    fontWeight: 'bold',
  },
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

});

export default CustomDropdown;
