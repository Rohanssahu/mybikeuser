import React, {useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {QuickServiceItem} from './homeData';

const QuickServiceTile: React.FC<{item: QuickServiceItem; onPress: () => void}> = ({item, onPress}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity style={styles.tile} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconWrap}>
        {!imgError && item.image ? (
          <Image source={{uri: item.image}} style={styles.image} onError={() => setImgError(true)} />
        ) : (
          <MaterialCommunityIcons name="wrench" size={26} color={color.buttonColor} />
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const QuickServicesRow: React.FC<{
  services: QuickServiceItem[];
  onPress: (service: QuickServiceItem) => void;
}> = ({services, onPress}) => {
  if (services.length === 0) return null;

  return (
    <FlatList
      data={services}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.serviceId}
      contentContainerStyle={styles.list}
      renderItem={({item}) => <QuickServiceTile item={item} onPress={() => onPress(item)} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {paddingHorizontal: 14, paddingVertical: 4},
  tile: {
    width: 84,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 3,
  },
  image: {width: '100%', height: '100%'},
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D7DBEE',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
  },
});

export default QuickServicesRow;
