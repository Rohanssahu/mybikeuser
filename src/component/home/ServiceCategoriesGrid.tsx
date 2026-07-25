import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {ServiceCategoryItem} from './homeData';

const ServiceCategoriesGrid: React.FC<{
  categories: ServiceCategoryItem[];
  onPress: (category: ServiceCategoryItem) => void;
}> = ({categories, onPress}) => (
  <View style={styles.grid}>
    {categories.map(cat => (
      <TouchableOpacity key={cat._id} style={styles.item} activeOpacity={0.8} onPress={() => onPress(cat)}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={cat.icon} size={24} color={color.buttonColor} />
        </View>
        <Text style={styles.label} numberOfLines={1}>{cat.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const ITEM_WIDTH = '25%';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  item: {
    width: ITEM_WIDTH as any,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D7DBEE',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ServiceCategoriesGrid;
