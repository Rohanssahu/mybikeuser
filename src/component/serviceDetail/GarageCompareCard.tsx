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
  return `${Math.max(km, 0.1).toFixed(1)} km`;
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
        <View style={styles.bestMatchRow}>
          <View style={styles.bestMatchBadge}>
            <MaterialCommunityIcons name="check-decagram" size={14} color={color.success} />
            <Text style={styles.bestMatchBadgeText}>Best match</Text>
          </View>
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
          <Text style={styles.title} numberOfLines={2}>{garage.shopName}</Text>

          {address.length > 0 && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color={color.textMuted} />
              <Text style={styles.address} numberOfLines={2}>{address}</Text>
            </View>
          )}

        </View>
      </View>

      <View style={styles.chipRow}>
        {distanceLabel && (
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="map-marker-distance" size={14} color={color.buttonColor} />
            <Text style={styles.infoChipText}>{distanceLabel} away</Text>
          </View>
        )}
        {garage.isOpen !== undefined && (
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name={isClosed ? 'clock-outline' : 'store-check-outline'} size={14} color={isClosed ? color.textFaint : color.success} />
            <Text style={[styles.infoChipText, isClosed ? styles.metaClosed : styles.metaOpen]}>
              {isClosed ? 'Closed' : 'Open now'}
            </Text>
          </View>
        )}
        {rating && (
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="star" size={14} color={color.buttonColor} />
            <Text style={styles.infoChipText}>{rating}</Text>
          </View>
        )}
        {garage.pickupAndDrop && (
          <View style={styles.infoChip}>
            <MaterialCommunityIcons name="truck-fast-outline" size={14} color={color.success} />
            <Text style={styles.infoChipText}>Pickup & drop</Text>
          </View>
        )}
        {garage.price != null && (
          <View style={styles.priceChip}>
            <Text style={styles.price}>₹{garage.price}</Text>
          </View>
        )}
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
  bestMatchRow: {flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10},
  bestMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.14)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.55)',
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  bestMatchBadgeText: {fontSize: 11.5, fontWeight: '800', color: color.success},
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
  body: {flex: 1},
  title: {fontSize: 16, lineHeight: 21, fontWeight: '700', color: color.textPrimary},
  metaOpen: {color: color.success},
  metaClosed: {color: color.textFaint},
  detailRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 5},
  address: {fontSize: 11.5, lineHeight: 16, color: color.textMuted, flex: 1},
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginTop: spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoChipText: {fontSize: 11, fontWeight: '700', color: color.textPrimary},
  priceChip: {backgroundColor: 'rgba(254,212,40,0.1)', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5},
  price: {fontSize: 12, fontWeight: '800', color: color.buttonColor},
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
