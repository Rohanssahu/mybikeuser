import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../../component/Icon';


interface PaymentOptionProps {
  title: string;
  description: string;
  iconName: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({ title, description, iconName, isSelected, onSelect }) => {
  return (
    <TouchableOpacity style={[styles.container, isSelected && styles.selected]} onPress={onSelect}>
      <Icon source={iconName} size={24} style={{tintColor:'black'}} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, ]}>{title}</Text>
        <Text style={[styles.description, ]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    marginVertical: 5,
    paddingVertical:25
  },
  selected: {
    backgroundColor: '#D4F8DC', // light green tint
    borderColor: '#00B050', 
    borderWidth: 2,
  },
  textContainer: {
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  selectedText: {
    color: 'white',
  },
});

export default PaymentOption;
