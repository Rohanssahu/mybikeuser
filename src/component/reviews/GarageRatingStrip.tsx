import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';

export const isTopRated = (rating?: number, count?: number) =>
  Number(rating) >= 4.5 && Number(count) >= 5;

type Props = {
  averageRating?: number;
  ratingCount?: number;
  verified?: boolean;
  compact?: boolean;
  onViewReviews?: () => void;
};
export default function GarageRatingStrip({
  averageRating = 0,
  ratingCount = 0,
  verified = true,
  compact,
  onViewReviews,
}: Props) {
  const hasReviews = ratingCount > 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.score}>
        <MaterialCommunityIcons
          name="star"
          size={compact ? 14 : 16}
          color="#FFD54A"
        />
        <Text style={styles.rating}>
          {hasReviews ? averageRating.toFixed(1) : 'New'}
        </Text>
        {hasReviews && (
          <>
            <Text style={styles.stars}>
              {'★'.repeat(Math.max(1, Math.round(averageRating)))}
            </Text>
            <Text style={styles.count}>({ratingCount})</Text>
          </>
        )}
      </View>
      <View style={styles.badges}>
        {verified && (
          <View style={styles.verified}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={12}
              color="#38D996"
            />
            <Text style={styles.verifiedText}>Verified Partner</Text>
          </View>
        )}
        {isTopRated(averageRating, ratingCount) && (
          <View style={styles.top}>
            <MaterialCommunityIcons name="trophy" size={11} color="#171717" />
            <Text style={styles.topText}>Top Rated</Text>
          </View>
        )}
      </View>
      {onViewReviews && (
        <TouchableOpacity onPress={onViewReviews} hitSlop={8}>
          <Text style={styles.link}>View Reviews →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {gap: 7, marginTop: 7},
  score: {flexDirection: 'row', alignItems: 'center', gap: 4},
  rating: {color: '#fff', fontSize: 13, fontWeight: '900'},
  stars: {color: '#FFD54A', fontSize: 10, letterSpacing: -1},
  count: {color: color.textMuted, fontSize: 11, fontWeight: '600'},
  badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 5},
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(56,217,150,.10)',
  },
  verifiedText: {color: '#70E6B2', fontSize: 9, fontWeight: '800'},
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#FFD54A',
  },
  topText: {color: '#171717', fontSize: 9, fontWeight: '900'},
  link: {color: color.buttonColor, fontSize: 11, fontWeight: '800'},
});
