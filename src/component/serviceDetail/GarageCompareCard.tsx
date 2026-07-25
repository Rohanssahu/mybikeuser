import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius, spacing} from '../../constant';
import {image_url} from '../../redux/Api';

const resolveImageUri = (path: string) =>
  path.startsWith('http') ? path : `${image_url}${path}`;

export interface CompareGarage {
  _id: string;
  shopName: string;
  shopImages?: any[];
  fullAddress?: string;
  address?: string;
  averageRating?: number;
  isOpen?: boolean;
  pickupAndDrop?: boolean;
  distanceKm: number | null;
  // null = price for this exact service couldn't be resolved (no bike
  // context to query dealer pricing with) — never a fabricated number.
  price: number | null;
}

interface GarageCompareCardProps {
  garage: CompareGarage;
  isBestMatch: boolean;
  onBookNow: () => void;
  onViewDetails: () => void;
}

const formatDistance = (km: number | null) => {
  if (km === null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const GarageCompareCard: React.FC<GarageCompareCardProps> = ({garage, isBestMatch, onBookNow, onViewDetails}) => {
  const [imgError, setImgError] = useState(false);

  const isClosed = garage.isOpen === false;
  const rating = garage.averageRating ? parseFloat(String(garage.averageRating)).toFixed(1) : null;
  const address = garage.fullAddress || garage.address || '';
  const distanceLabel = formatDistance(garage.distanceKm);
  // De-emphasize the CTA on a closed garage even if it happens to rank
  // first for the active sort — a filled "Book now" on a shop that's shut
  // would be misleading.
  const showFilledCta = isBestMatch && !isClosed;

  return (
    <View
      style={[
        styles.card,
        isBestMatch && styles.cardBestMatch,
        isClosed && styles.cardClosed,
      ]}>
      {isBestMatch && (
        <View style={styles.bestMatchBadge}>
          <Text style={styles.bestMatchBadgeText}>Best match</Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          {!imgError && garage.shopImages && garage.shopImages.length > 0 ? (
            <Image
              source={{uri: resolveImageUri(garage.shopImages[0])}}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <MaterialCommunityIcons name="store" size={24} color="rgba(254,212,40,0.5)" />
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{garage.shopName}</Text>
            {rating && (
              <View style={styles.ratingPill}>
                <MaterialCommunityIcons name="star" size={12} color={color.buttonColor} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            {distanceLabel && <Text style={styles.metaText}>{distanceLabel}</Text>}
            {distanceLabel && <Text style={styles.metaDot}>·</Text>}
            <Text style={[styles.metaText, isClosed ? styles.metaClosed : styles.metaOpen]}>
              {garage.isOpen === undefined ? '' : isClosed ? 'Closed' : 'Open now'}
            </Text>
          </View>

          {address.length > 0 && (
            <Text style={styles.address} numberOfLines={1}>{address}</Text>
          )}

          {garage.price != null ? (
            <Text style={styles.price}>₹{garage.price}</Text>
          ) : (
            <Text style={styles.priceUnknown}>Select a bike to see price</Text>
          )}
        </View>
      </View>

      {showFilledCta ? (
        <TouchableOpacity style={styles.filledBtn} activeOpacity={0.85} onPress={onBookNow}>
          <Text style={styles.filledBtnText}>Book now</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.outlinedBtn} activeOpacity={0.85} onPress={onViewDetails}>
          <Text style={styles.outlinedBtnText}>View details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardBestMatch: {
    borderWidth: 1,
    borderColor: color.buttonColor,
  },
  cardClosed: {
    opacity: 0.55,
  },
  bestMatchBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bestMatchBadgeText: {fontSize: 10.5, fontWeight: '800', color: color.buttonColor},
  topRow: {flexDirection: 'row'},
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  image: {width: 52, height: 52},
  body: {flex: 1, paddingRight: 60},
  titleRow: {flexDirection: 'row', alignItems: 'center'},
  title: {fontSize: 15, fontWeight: '700', color: color.textPrimary, flexShrink: 1, marginRight: 6},
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(254,212,40,0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  ratingText: {fontSize: 11, fontWeight: '700', color: color.buttonColor},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4},
  metaText: {fontSize: 11.5, color: color.textMuted, fontWeight: '500'},
  metaDot: {fontSize: 11.5, color: color.textMuted},
  metaOpen: {color: color.success},
  metaClosed: {color: color.textFaint},
  address: {fontSize: 11.5, color: color.textMuted, marginTop: 2},
  price: {fontSize: 16, fontWeight: '800', color: color.buttonColor, marginTop: 6},
  priceUnknown: {fontSize: 11.5, color: color.textFaint, marginTop: 6, fontStyle: 'italic'},
  filledBtn: {
    marginTop: spacing.md,
    backgroundColor: color.buttonColor,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  filledBtnText: {fontSize: 14, fontWeight: '800', color: color.baground},
  outlinedBtn: {
    marginTop: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  outlinedBtnText: {fontSize: 14, fontWeight: '800', color: color.buttonColor},
});

export default GarageCompareCard;
