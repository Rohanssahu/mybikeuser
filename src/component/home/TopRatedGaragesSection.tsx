import React, {useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {image_url} from '../../redux/Api';
import {TopGarageItem} from './homeData';
import GarageRatingStrip from '../reviews/GarageRatingStrip';

const resolveImageUri = (path: string) =>
  path.startsWith('http') ? path : `${image_url}${path}`;

// Already server-ranked (rating then distance) and capped at 5 — no
// client-side sorting/distance math needed here anymore.
const GarageCard: React.FC<{
  item: TopGarageItem;
  onPress: () => void;
  onViewReviews: () => void;
}> = ({item, onPress, onViewReviews}) => {
  const [imgError, setImgError] = useState(false);
  const distanceLabel =
    item.distanceKm != null
      ? item.distanceKm < 1
        ? `${Math.round(item.distanceKm * 1000)} m`
        : `${item.distanceKm.toFixed(1)} km`
      : null;
  const rating = item.averageRating ? item.averageRating.toFixed(1) : null;
  const address = item.locality || item.city || '';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.imageWrap}>
        {!imgError && item.shopImages && item.shopImages.length > 0 ? (
          <Image
            source={{uri: resolveImageUri(item.shopImages[0])}}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <MaterialCommunityIcons name="store" size={26} color="rgba(254,212,40,0.4)" />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.shopName}</Text>
          {rating && (
            <View style={styles.ratingPill}>
              <MaterialCommunityIcons name="star" size={12} color={color.buttonColor} />
              <Text style={styles.ratingText}>{rating}</Text>
              {!!item.ratingCount && <Text style={styles.ratingCount}> ({item.ratingCount})</Text>}
            </View>
          )}
        </View>
        <GarageRatingStrip averageRating={item.averageRating} ratingCount={item.ratingCount} verified compact onViewReviews={onViewReviews}/>

        {address.length > 0 && (
          <Text style={styles.address} numberOfLines={1}>{address}</Text>
        )}

        <View style={styles.metaRow}>
          {distanceLabel && (
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="map-marker-distance" size={12} color={color.textMuted} />
              <Text style={styles.metaChipText}>{distanceLabel}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.viewBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const TopRatedGaragesSection: React.FC<{
  garages: TopGarageItem[];
  onSelect: (garage: TopGarageItem) => void;
  onViewReviews: (garage: TopGarageItem) => void;
}> = ({garages, onSelect, onViewReviews}) => {
  if (garages.length === 0) return null;

  return (
    <FlatList
      data={garages}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.dealerId}
      contentContainerStyle={styles.list}
      renderItem={({item}) => <GarageCard item={item} onPress={() => onSelect(item)} onViewReviews={() => onViewReviews(item)} />}
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
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 14, fontWeight: '700', color: '#fff', flex: 1, marginRight: 6},
  ratingPill: {flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(254,212,40,0.1)', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3},
  ratingText: {fontSize: 11, fontWeight: '700', color: color.buttonColor},
  ratingCount: {fontSize: 10, fontWeight: '600', color: color.textMuted},
  address: {fontSize: 11, color: color.textMuted, marginTop: 4},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8},
  metaChip: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4},
  metaChipText: {fontSize: 10.5, color: color.textMuted, fontWeight: '600'},
  viewBtn: {marginTop: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: color.buttonColor, alignItems: 'center', paddingVertical: 8},
  viewBtnText: {fontSize: 12, fontWeight: '800', color: color.buttonColor},
});

export default TopRatedGaragesSection;
