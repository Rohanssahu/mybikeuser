import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import {get_app_settings} from '../../redux/Api/apiRequests';
import {errorToast} from '../../configs/customToast';

interface SocialItem {
  key: string;
  label: string;
  icon: string;
}

const SOCIAL_ITEMS: SocialItem[] = [
  {key: 'websiteUrl', label: 'Website', icon: 'web'},
  {key: 'facebookUrl', label: 'Facebook', icon: 'facebook'},
  {key: 'instagramUrl', label: 'Instagram', icon: 'instagram'},
  {key: 'youtubeUrl', label: 'YouTube', icon: 'youtube'},
  {key: 'linkedinUrl', label: 'LinkedIn', icon: 'linkedin'},
  {key: 'playStoreUrl', label: 'Play Store', icon: 'google-play'},
  {key: 'appStoreUrl', label: 'App Store', icon: 'apple'},
];

const SocialLinksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await get_app_settings();
      if (res?.success) {
        setSettings(res.data || {});
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('SocialLinksScreen error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() =>
      errorToast('Unable to open this link on this device.'),
    );
  };

  const availableLinks = SOCIAL_ITEMS.filter(item => !!settings?.[item.key]);

  return (
    <View style={styles.container}>
      <CustomHeader title="Social Links" navigation={navigation} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            Something went wrong while loading social links. Please try again later.
          </Text>
        </View>
      ) : availableLinks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>No social links available yet.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {availableLinks.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                style={[
                  styles.row,
                  index < availableLinks.length - 1 && styles.rowDivider,
                ]}
                onPress={() => openLink(settings[item.key])}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color="#8C93B8"
                  style={styles.rowIcon}
                />
                <Text style={styles.rowText}>{item.label}</Text>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={18}
                  color="#4C557E"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default SocialLinksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  messageText: {
    fontSize: 14,
    color: '#A0A3BD',
    textAlign: 'center',
    lineHeight: 21,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
});
