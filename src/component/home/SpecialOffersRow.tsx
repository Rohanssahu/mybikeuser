import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';

export interface OfferTile {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

const SpecialOffersRow: React.FC<{offers: OfferTile[]}> = ({offers}) => {
  if (offers.length === 0) return null;

  if (offers.length === 1) {
    const item = offers[0];
    return (
      <View style={styles.singleWrap}>
        <TouchableOpacity activeOpacity={0.88} onPress={item.onPress}>
          <LinearGradient colors={color.goldGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[styles.card, styles.fullCard]}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={22} color={color.baground} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={offers}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.key}
      contentContainerStyle={styles.list}
      renderItem={({item}) => (
        <TouchableOpacity activeOpacity={0.88} onPress={item.onPress}>
          <LinearGradient colors={color.goldGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.card}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={22} color={color.baground} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
  );
};

const CARD_WIDTH = 190;

const styles = StyleSheet.create({
  list: {paddingHorizontal: 14, paddingVertical: 6},
  singleWrap: {paddingHorizontal: 20, paddingVertical: 6},
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    padding: 14,
    marginHorizontal: 6,
    minHeight: 108,
  },
  fullCard: {
    width: '100%',
    marginHorizontal: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(8,16,65,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {fontSize: 14, fontWeight: '800', color: color.baground},
  subtitle: {fontSize: 11, color: 'rgba(8,16,65,0.75)', marginTop: 4, fontWeight: '600', lineHeight: 15},
});

export default SpecialOffersRow;
