import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, ViewStyle} from 'react-native';
import {color, radius} from '../../constant';

/** A single shimmering skeleton block. Compose these to build a section's loading state. */
const Shimmer: React.FC<{style?: ViewStyle}> = ({style}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 1, duration: 900, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 0, duration: 900, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({inputRange: [0, 1], outputRange: [0.35, 0.75]});

  return (
    <Animated.View
      style={[
        styles.base,
        style,
        {opacity},
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: color.cardSurfaceElevated,
    borderRadius: radius.md,
  },
});

export const SkeletonRow: React.FC<{
  count?: number;
  width: number;
  height: number;
  gap?: number;
}> = ({count = 3, width, height, gap = 12}) => (
  <View style={[localStyles.row, {paddingHorizontal: 20 - gap / 2}]}>
    {Array.from({length: count}).map((_, i) => (
      <Shimmer key={i} style={{width, height, marginHorizontal: gap / 2}} />
    ))}
  </View>
);

const localStyles = StyleSheet.create({
  row: {flexDirection: 'row', marginTop: 14},
});

export default Shimmer;
