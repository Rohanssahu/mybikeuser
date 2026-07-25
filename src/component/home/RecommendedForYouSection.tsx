import React, {useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {RecommendedServiceItem} from './homeData';

const RecommendedCard: React.FC<{
  item: RecommendedServiceItem;
  onPress: () => void;
}> = ({item, onPress}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.imageWrap}>
        {!imgError && item.image ? (
          <Image
            source={{uri: item.image}}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <MaterialCommunityIcons name="motorbike" size={30} color="rgba(254,212,40,0.4)" />
          </View>
        )}
        {item.reasonLabel && (
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons name="creation" size={11} color={color.baground} />
            <Text style={styles.aiBadgeText}>{item.reasonLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>

        {(!!item.basePrice || !!item.duration) && (
          <View style={styles.metaRow}>
            {item.basePrice ? <Text style={styles.metaText}>From ₹{item.basePrice}</Text> : null}
            {item.basePrice && item.duration ? <Text style={styles.metaDot}>·</Text> : null}
            {item.duration ? <Text style={styles.metaText}>{item.duration} mins</Text> : null}
          </View>
        )}

        <TouchableOpacity style={styles.bookBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const RecommendedForYouSection: React.FC<{
  items: RecommendedServiceItem[];
  onSelect: (item: RecommendedServiceItem) => void;
}> = ({items, onSelect}) => {
  if (items.length === 0) return null;

  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.serviceId}
      contentContainerStyle={styles.list}
      renderItem={({item}) => <RecommendedCard item={item} onPress={() => onSelect(item)} />}
    />
  );
};

const CARD_WIDTH = 168;

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
  imageWrap: {width: '100%', height: 96},
  image: {width: '100%', height: '100%'},
  imageFallback: {alignItems: 'center', justifyContent: 'center', backgroundColor: '#132549'},
  aiBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: color.buttonColor,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeText: {fontSize: 9.5, fontWeight: '800', color: color.baground},
  body: {padding: 10},
  title: {fontSize: 13.5, fontWeight: '700', color: '#fff'},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5},
  metaText: {fontSize: 11, color: color.textMuted, fontWeight: '600'},
  metaDot: {fontSize: 11, color: color.textMuted},
  bookBtn: {
    marginTop: 9,
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderRadius: radius.pill,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.3)',
  },
  bookBtnText: {fontSize: 11.5, fontWeight: '800', color: color.buttonColor},
});

export default RecommendedForYouSection;
