import React, {useRef, useState} from 'react';
import {Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInRight} from 'react-native-reanimated';
import {color, radius} from '../../constant';
import {BikeItem} from './homeData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const BikeCard: React.FC<{bike: BikeItem; onManage: () => void}> = ({bike, onManage}) => {
  const plate = bike?.plate_number ? bike.plate_number.toUpperCase() : 'Your Bike';
  const cc = bike?.bike_cc ? `${bike.bike_cc} CC` : null;

  return (
    <LinearGradient
      colors={color.navyGradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.card, styles.cardRow, {width: CARD_WIDTH}]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="motorbike" size={22} color={color.buttonColor} />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.titleLine}>
          <Text style={styles.plate} numberOfLines={1}>{plate}</Text>
          {cc && <Text style={styles.cc}>· {cc}</Text>}
        </View>
        <Text style={styles.metaText} numberOfLines={1}>Last service — · Next due —</Text>
      </View>

      <TouchableOpacity style={styles.manageBtn} onPress={onManage} activeOpacity={0.85}>
        <Text style={styles.manageBtnText}>Manage</Text>
        <MaterialCommunityIcons name="arrow-right" size={14} color={color.baground} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const AddBikeCard: React.FC<{onAdd: () => void}> = ({onAdd}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onAdd}
    style={[styles.card, styles.cardRow, styles.addCard, {width: CARD_WIDTH}]}>
    <View style={styles.addIconWrap}>
      <MaterialCommunityIcons name="plus" size={20} color={color.buttonColor} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.addTitle} numberOfLines={1}>Add another bike</Text>
      <Text style={styles.metaText} numberOfLines={1}>Book faster next time</Text>
    </View>
  </TouchableOpacity>
);

const EmptyBikeCard: React.FC<{onAdd: () => void}> = ({onAdd}) => (
  <LinearGradient
    colors={color.navyGradient}
    style={[styles.card, styles.cardRow, {width: CARD_WIDTH}]}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name="motorbike" size={22} color={color.buttonColor} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.addTitle} numberOfLines={1}>No bike added yet</Text>
      <Text style={styles.metaText} numberOfLines={1}>Add one to unlock quick booking</Text>
    </View>
    <TouchableOpacity style={styles.manageBtn} onPress={onAdd} activeOpacity={0.85}>
      <Text style={styles.manageBtnText}>Add</Text>
      <MaterialCommunityIcons name="arrow-right" size={14} color={color.baground} />
    </TouchableOpacity>
  </LinearGradient>
);

const MyBikeCarousel: React.FC<{
  bikes: BikeItem[];
  onManage: (bike?: BikeItem) => void;
  onAdd: () => void;
  // Reported whenever the swiped-to card changes, so Home can re-fetch
  // Quick Services / Recommended for the newly active bike. Only fires for
  // an actual bike card (index < bikes.length) — swiping to the trailing
  // "add another bike" card doesn't change which bike is "active".
  onActiveIndexChange?: (index: number) => void;
}> = ({bikes, onManage, onAdd, onActiveIndexChange}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  if (!bikes || bikes.length === 0) {
    return (
      <View style={styles.wrapper}>
        <EmptyBikeCard onAdd={onAdd} />
      </View>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 14));
    if (idx !== activeIndex) {
      setActiveIndex(idx);
      if (idx < bikes.length) onActiveIndexChange?.(idx);
    }
  };

  const slidesCount = bikes.length + 1; // + "add another bike" card

  return (
    <Animated.View entering={FadeInRight.duration(350)} style={styles.wrapper}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 14}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        {bikes.map((bike, i) => (
          <View key={bike._id || i} style={{marginRight: i === bikes.length - 1 ? 0 : 14}}>
            <BikeCard bike={bike} onManage={() => onManage(bike)} />
          </View>
        ))}
        <AddBikeCard onAdd={onAdd} />
      </Animated.ScrollView>

      {slidesCount > 1 && (
        <View style={styles.dots}>
          {Array.from({length: slidesCount}).map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginTop: 4},
  scrollContent: {paddingHorizontal: 20},
  card: {
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardRow: {flexDirection: 'row', alignItems: 'center'},
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,212,40,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: {flex: 1, marginRight: 10},
  titleLine: {flexDirection: 'row', alignItems: 'baseline'},
  plate: {fontSize: 15.5, fontWeight: '800', color: '#fff', letterSpacing: 0.3},
  cc: {fontSize: 11.5, color: '#B7BEDB', fontWeight: '600', marginLeft: 4},
  metaText: {fontSize: 11, color: '#8A93AD', fontWeight: '600', marginTop: 2},
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: color.buttonColor,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  manageBtnText: {fontSize: 12.5, fontWeight: '800', color: color.baground},
  addCard: {
    backgroundColor: color.cardSurface,
    borderStyle: 'dashed',
    borderColor: 'rgba(254,212,40,0.3)',
  },
  addIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addTitle: {fontSize: 13.5, fontWeight: '700', color: '#fff'},
  dots: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 6},
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)'},
  dotActive: {backgroundColor: color.buttonColor, width: 16},
});

export default MyBikeCarousel;
