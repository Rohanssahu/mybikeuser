import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color} from '../../constant';

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}> = ({title, subtitle, onSeeAll}) => (
  <View style={styles.container}>
    <View style={styles.textWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} style={styles.seeAllBtn}>
        <Text style={styles.seeAllText}>See All</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={color.buttonColor} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 4,
  },
  textWrap: {flex: 1, marginRight: 12},
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: color.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {flexDirection: 'row', alignItems: 'center'},
  seeAllText: {fontSize: 13, color: color.buttonColor, fontWeight: '700', marginRight: 2},
});

export default SectionHeader;
