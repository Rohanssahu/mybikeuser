import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius, spacing} from '../../constant';

interface ServiceSummaryCardProps {
  name: string;
  image?: string;
  // Built by the caller by joining only the parts it could actually derive
  // (e.g. "From ₹350 · 40 min") — this component never invents a value when
  // a part is missing, it just renders whatever string it's given.
  subtitle: string;
}

const ServiceSummaryCard: React.FC<ServiceSummaryCardProps> = ({name, image, subtitle}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        {!imgError && image ? (
          <Image source={{uri: image}} style={styles.thumb} onError={() => setImgError(true)} />
        ) : (
          <MaterialCommunityIcons name="wrench" size={26} color={color.buttonColor} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{name || 'Service'}</Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.cardSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  thumb: {width: 56, height: 56},
  body: {flex: 1},
  name: {fontSize: 16, fontWeight: '700', color: color.textPrimary},
  subtitle: {fontSize: 12, color: color.textMuted, marginTop: 4, fontWeight: '500'},
});

export default ServiceSummaryCard;
