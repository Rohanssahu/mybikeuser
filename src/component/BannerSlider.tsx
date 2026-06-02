import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';

import {StackNavigationProp} from '@react-navigation/stack';
import {color} from '../constant';
import {wp} from './utils/Constant';
import {image_url} from '../redux/Api';

const {width} = Dimensions.get('window');

interface Banner {
  id: string;
  name: string;
  description: string;
  banner_image: string;
}

interface BannerSliderProps {
  navigation: StackNavigationProp<any, any>;
  data: any[]; // Expecting the data passed as a prop
}

const BannerSlider: React.FC<BannerSliderProps> = ({navigation, data}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const updatedData = useMemo(
    () =>
      data.map(item => ({
        id: item._id,
        name: item.name,
        description: item.description || '',
        banner_image: item.banner_image,
      })),
    [data],
  );

  useEffect(() => {
    if (!updatedData || updatedData.length === 0) {return;}

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % updatedData.length;
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, updatedData]);

  const renderItem = ({item}: {item: Banner}) => {
    const url = item.banner_image?.startsWith('http')
      ? item.banner_image
      : `${image_url}${item.banner_image}`;

    return (
      <View style={styles.bannerContainer}>
        <Image
          source={{uri: url}}
          onError={e => console.log('Image error', e.nativeEvent)}
          resizeMode="cover"
          style={styles.bannerImage}
        />

        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>

          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate('ServiceDetails', {id: item.id})
              }>
              <Text style={styles.buttonText}>Bike Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={updatedData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        getItemLayout={(_, index) => ({
          length: width * 0.9 + 40,
          offset: (width * 0.9 + 40) * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {updatedData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  bannerContainer: {
    width: width * 0.9,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    position: 'relative',
    marginHorizontal: 20,
  },
  bannerImage: {
    width: wp(100),
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textContainer: {
    position: 'absolute',
    left: 15,
    bottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#ddd',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    width: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FED428',
    width: 18,
    borderRadius: 4,
  },
});

export default BannerSlider;
