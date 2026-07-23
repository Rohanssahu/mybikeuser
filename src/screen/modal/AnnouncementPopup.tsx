import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {errorToast} from '../../configs/customToast';

export interface AnnouncementBanner {
  _id: string;
  image: string;
  title: string;
  description?: string;
  linkUrl?: string;
}

interface AnnouncementPopupProps {
  visible: boolean;
  banner: AnnouncementBanner | null;
  onClose: () => void;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 420);
// Image is sized from its own aspect ratio (never cropped) but clamped
// so it always reads as the dominant ~60-70% of the card, like a
// Zomato/Swiggy/Blinkit promo banner.
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.5;
const MIN_IMAGE_HEIGHT = CARD_WIDTH * 0.75;
const FALLBACK_ASPECT_RATIO = 4 / 5; // width / height

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({
  visible,
  banner,
  onClose,
}) => {
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const [imageAspectRatio, setImageAspectRatio] = useState(FALLBACK_ASPECT_RATIO);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{scale: cardScale.value}],
  }));

  useEffect(() => {
    if (visible && banner) {
      backdropOpacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.ease),
      });
      cardOpacity.value = withTiming(1, {duration: 280});
      cardScale.value = withTiming(1, {
        duration: 340,
        easing: Easing.out(Easing.back(1.15)),
      });
    }
  }, [visible, banner, backdropOpacity, cardOpacity, cardScale]);

  useEffect(() => {
    if (!banner?.image) {return;}
    Image.getSize(
      banner.image,
      (w, h) => {
        if (w > 0 && h > 0) {setImageAspectRatio(w / h);}
      },
      () => setImageAspectRatio(FALLBACK_ASPECT_RATIO),
    );
  }, [banner?.image]);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, {duration: 200});
    cardOpacity.value = withTiming(0, {duration: 180});
    cardScale.value = withTiming(
      0.9,
      {duration: 200, easing: Easing.in(Easing.ease)},
      finished => {
        if (finished) {runOnJS(onClose)();}
      },
    );
  };

  if (!banner) {return null;}

  const handleLinkPress = () => {
    if (!banner.linkUrl) {return;}
    Linking.openURL(banner.linkUrl).catch(() =>
      errorToast('Unable to open this link on this device.'),
    );
  };

  const computedImageHeight = Math.min(
    Math.max(CARD_WIDTH / imageAspectRatio, MIN_IMAGE_HEIGHT),
    MAX_IMAGE_HEIGHT,
  );

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, backdropStyle]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.card, cardStyle]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
            activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" size={20} color="#081041" />
          </TouchableOpacity>

          {banner.image ? (
            <View style={[styles.imageWrapper, {height: computedImageHeight}]}>
              <Image
                source={{uri: banner.image}}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <View style={styles.contentWrapper}>
            {banner.title ? (
              <Text style={styles.title} numberOfLines={3}>
                {banner.title}
              </Text>
            ) : null}

            {banner.description ? (
              <Text style={styles.description} numberOfLines={4}>
                {banner.description}
              </Text>
            ) : null}

            {banner.linkUrl ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleLinkPress}
                activeOpacity={0.85}>
                <Text style={styles.actionText}>Learn More</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AnnouncementPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 32, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    maxWidth: '100%',
    maxHeight: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 14},
        shadowOpacity: 0.28,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.18,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: '#F2F3F8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B1130',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5B6178',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FED428',
    borderRadius: 14,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#FED428',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#081041',
    letterSpacing: 0.2,
  },
});
