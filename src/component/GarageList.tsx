import React, {useState} from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {icon} from './Image';
import {image_url} from '../redux/Api';
import ScreenNameEnum from '../routes/screenName.enum';

interface GarageItem {
  _id: string;
  id?: string;
  shopName: string;
  fullAddress?: string;
  address?: string;
  latitude: string | number;
  longitude: string | number;
  shopImages?: any[];
  averageRating?: number;
  isOpen?: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface GarageListProps {
  data: GarageItem[];
  userLocation?: UserLocation | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const toRad = (deg: number) => (deg * Math.PI) / 180;

const calcDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const GarageCard = ({
  item,
  userLocation,
}: {
  item: GarageItem;
  userLocation?: UserLocation | null;
}) => {
  const navigation = useNavigation();
  const [imgError, setImgError] = useState(false);

  const distanceKm =
    userLocation && item.latitude && item.longitude
      ? calcDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(String(item.latitude)),
          parseFloat(String(item.longitude)),
        )
      : null;

  const distanceLabel =
    distanceKm !== null
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`
      : '—';
console.log('image_url',item.shopImages);

  const shopImage =
    !imgError && item.shopImages && item.shopImages.length > 0
      ? {uri: item.shopImages[0]}
      : require('../assets/images/gragd.png');

  const rating = item.averageRating
    ? parseFloat(String(item.averageRating)).toFixed(1)
    : null;
  const address = item.fullAddress || item.address || '';

  return (
    <TouchableOpacity
      onPress={() =>
        (navigation as any).navigate(ScreenNameEnum.MY_BIKES, {
          profile: false,
          Grageid: item._id,
        })
      }
      style={styles.card}
      activeOpacity={0.82}>
      <Image
        source={shopImage}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.shopName}
        </Text>

        {address.length > 0 && (
          <View style={styles.row}>
            <Image source={icon.pin} style={styles.rowIcon} />
            <Text style={styles.subText} numberOfLines={2}>
              {address}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.pill}>
            <Image source={icon.pickups} style={styles.pillIcon} />
            <Text style={styles.pillText}>{distanceLabel}</Text>
          </View>

          {rating && (
            <View style={[styles.pill, styles.ratingPill]}>
              <Image source={icon.star} style={[styles.pillIcon, {tintColor: '#FED428'}]} />
              <Text style={[styles.pillText, {color: '#FED428'}]}>{rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const GarageList: React.FC<GarageListProps> = ({data, userLocation}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id || item.id || item.shopName}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
      renderItem={({item}) => (
        <GarageCard item={item} userLocation={userLocation} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0F1D3A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#1B2A4A',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  rowIcon: {
    width: 12,
    height: 12,
    tintColor: '#FED428',
    marginRight: 4,
    marginTop: 2,
  },
  subText: {
    fontSize: 11,
    color: '#A0A3BD',
    flex: 1,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,212,40,0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingPill: {
    backgroundColor: 'rgba(254,212,40,0.08)',
  },
  pillIcon: {
    width: 12,
    height: 12,
    tintColor: '#E0E0E0',
    marginRight: 4,
  },
  pillText: {
    fontSize: 11,
    color: '#E0E0E0',
    fontWeight: '600',
  },
});

export default GarageList;
