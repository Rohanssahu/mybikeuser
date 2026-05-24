import React from 'react';
import { View, Dimensions, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const GarageImage = ({ shopImages = [] }) => {
  return (
    <View style={styles.container}>
      {shopImages?.length > 0 && (
        <Carousel
          loop
          width={width}
          height={220}
          autoPlay
          autoPlayInterval={3000}
          data={shopImages}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        />
      )}
    </View>
  );
};

export default GarageImage;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  image: {
    width: width - 20,
    height: 220,
    borderRadius: 16,
    alignSelf: 'center',
  },
});