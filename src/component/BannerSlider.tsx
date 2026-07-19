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
import LinearGradient from 'react-native-linear-gradient';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {color} from '../constant';
import {wp} from './utils/Constant';
import {image_url} from '../redux/Api';
import ScreenNameEnum from '../routes/screenName.enum';

const {width} = Dimensions.get('window');

interface Banner {
  id: string;
  name: string;
  description: string;
  banner_image: string;
  baseServiceId?: string | {_id: string} | null;
}

// baseServiceId may arrive populated ({_id, name, image}) or as a raw id string.
const getBaseServiceId = (banner: Banner): string | null => {
  try {
    const raw = banner?.baseServiceId;
    if (!raw) {return null;}
    if (typeof raw === 'string') {return raw;}
    return raw._id || null;
  } catch {
    return null;
  }
};

interface BannerSliderProps {
  navigation: NativeStackNavigationProp<any, any>;
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
        baseServiceId: item.baseServiceId ?? null,
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

    const handleBannerPress = () => {
      const serviceId = getBaseServiceId(item);
      if (!serviceId) {
        return;
      }
      navigation.navigate(ScreenNameEnum.MY_BIKES, {
        profile: false,
        serviceId,
      });
    };

    return (
      <View style={styles.bannerContainer}>
        <Image
          source={{uri: url}}
          onError={e => console.log('Image error', e.nativeEvent)}
          resizeMode="cover"
          style={styles.bannerImage}
        />

        <LinearGradient
          colors={['rgba(8,16,65,0)', 'rgba(8,16,65,0.85)']}
          style={styles.overlay}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={handleBannerPress}>
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
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: color.cardSurface,
    position: 'relative',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 5,
  },
  bannerImage: {
    width: wp(100),
    height: '100%',
    backgroundColor: color.cardSurface,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    color: '#D7DBE8',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 18,
  },
  button: {
    backgroundColor: color.buttonColor,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  buttonText: {
    color: color.baground,
    fontWeight: '700',
    fontSize: 13,
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: color.buttonColor,
    width: 18,
    borderRadius: 4,
  },
});

export default BannerSlider;
