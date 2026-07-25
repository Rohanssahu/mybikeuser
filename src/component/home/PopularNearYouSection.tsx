import React, {useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {MostBookedServiceItem} from './homeData';

const PopularCard: React.FC<{item: MostBookedServiceItem; onPress: () => void}> = ({item, onPress}) => {
  const [imgError, setImgError] = useState(false);

  // isFallback: no booking history yet for this area — the backend falls
  // back to distinct-dealer-coverage instead of pretending it has a real
  // booking count. Never blend the two into one invented number.
  const metaText = item.isFallback
    ? `Available at ${item.dealerCount ?? 0} garage${item.dealerCount === 1 ? '' : 's'} nearby`
    : `Booked ${item.bookingCount ?? 0} time${item.bookingCount === 1 ? '' : 's'} recently`;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.imageWrap}>
        {!imgError && item.image ? (
          <Image source={{uri: item.image}} style={styles.image} resizeMode="cover" onError={() => setImgError(true)} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <MaterialCommunityIcons name="wrench" size={26} color="rgba(254,212,40,0.4)" />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="store-outline" size={12} color={color.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{metaText}</Text>
        </View>

        <TouchableOpacity style={styles.compareBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.compareBtnText}>Compare</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color={color.baground} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const PopularNearYouSection: React.FC<{
  items: MostBookedServiceItem[];
  onSelect: (item: MostBookedServiceItem) => void;
}> = ({items, onSelect}) => {
  if (items.length === 0) return null;

  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.serviceId}
      contentContainerStyle={styles.list}
      renderItem={({item}) => <PopularCard item={item} onPress={() => onSelect(item)} />}
    />
  );
};

const CARD_WIDTH = 236;

const styles = StyleSheet.create({
  list: {paddingHorizontal: 14, paddingVertical: 6},
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    marginHorizontal: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 5,
  },
  imageWrap: {width: '100%', height: 110},
  image: {width: '100%', height: '100%'},
  imageFallback: {alignItems: 'center', justifyContent: 'center', backgroundColor: '#132549'},
  body: {padding: 12},
  title: {fontSize: 14, fontWeight: '700', color: '#fff'},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4},
  metaText: {fontSize: 11.5, color: color.textMuted, fontWeight: '500', flexShrink: 1},
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.buttonColor,
    borderRadius: radius.pill,
    paddingVertical: 8,
    marginTop: 10,
    gap: 2,
  },
  compareBtnText: {fontSize: 12, fontWeight: '800', color: color.baground},
});

export default PopularNearYouSection;
