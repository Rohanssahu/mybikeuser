import React from 'react';
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {errorToast} from '../../configs/customToast';

export interface AnnouncementBanner {
  _id: string;
  image: string;
  title: string;
  linkUrl?: string;
}

interface AnnouncementPopupProps {
  visible: boolean;
  banner: AnnouncementBanner | null;
  onClose: () => void;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({
  visible,
  banner,
  onClose,
}) => {
  if (!banner) {return null;}

  const handleLinkPress = () => {
    if (!banner.linkUrl) {return;}
    Linking.openURL(banner.linkUrl).catch(() =>
      errorToast('Unable to open this link on this device.'),
    );
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialCommunityIcons name="close" size={20} color="#081041" />
          </TouchableOpacity>

          {banner.image ? (
            <Image source={{uri: banner.image}} style={styles.image} resizeMode="cover" />
          ) : null}

          {banner.title ? <Text style={styles.title}>{banner.title}</Text> : null}

          {banner.linkUrl ? (
            <TouchableOpacity style={styles.actionBtn} onPress={handleLinkPress} activeOpacity={0.85}>
              <Text style={styles.actionText}>Learn More</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default AnnouncementPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
  },
  image: {
    width: '100%',
    height: 220,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  actionBtn: {
    marginTop: 16,
    backgroundColor: '#FED428',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  actionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#081041',
  },
});
