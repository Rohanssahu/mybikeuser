import React, {useCallback, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import {get_legal_document} from '../../redux/Api/apiRequests';
import {recoverDoubleEscapedHtml, wrapHtml} from '../../component/htmlUtils';

// One shared, backend-driven screen for every legal/informational page.
// route.name decides which docType + title to show — no per-page duplicate screens.
const LEGAL_SCREEN_CONFIG: Record<string, {docType: string; title: string}> = {
  [ScreenNameEnum.PRIVACY_POLICY]: {docType: 'user-privacy-policy', title: 'Privacy Policy'},
  [ScreenNameEnum.ABOUT_SCREEN]: {docType: 'about-us', title: 'About Us'},
  [ScreenNameEnum.TERMS_CONDITIONS]: {docType: 'user-terms-conditions', title: 'Terms & Conditions'},
  [ScreenNameEnum.REFUND_POLICY]: {docType: 'refund-policy', title: 'Refund Policy'},
  [ScreenNameEnum.CANCELLATION_POLICY]: {docType: 'cancellation-policy', title: 'Cancellation Policy'},
  [ScreenNameEnum.CONTACT_US]: {docType: 'contact-us', title: 'Contact Us'},
};

const LegalPageScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const config = LEGAL_SCREEN_CONFIG[route.name] ?? {docType: '', title: 'Details'};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notPublished, setNotPublished] = useState(false);
  const [html, setHtml] = useState('');

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotPublished(false);
    try {
      const res = await get_legal_document(config.docType);
      if (res?.success && res.data?.content) {
        setHtml(recoverDoubleEscapedHtml(res.data.content));
      } else if (res?.success && !res.data?.content) {
        setNotPublished(true);
      } else {
        setNotPublished(true);
      }
    } catch (err) {
      console.error('LegalPageScreen error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [config.docType]);

  useFocusEffect(
    useCallback(() => {
      loadDocument();
    }, [loadDocument]),
  );

  return (
    <View style={styles.container}>
      <CustomHeader title={config.title} navigation={navigation} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            Something went wrong while loading this page. Please try again later.
          </Text>
        </View>
      ) : notPublished ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            This content isn't available right now. Please check back later.
          </Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{html: wrapHtml(html)}}
          style={styles.webview}
          containerStyle={styles.webviewContainer}
          scrollEnabled
          nestedScrollEnabled
          showsVerticalScrollIndicator
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.centered, styles.webviewLoader]}>
              <ActivityIndicator size="large" color={color.buttonColor} />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default LegalPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webviewContainer: {
    flex: 1,
  },
  webviewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
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
});
