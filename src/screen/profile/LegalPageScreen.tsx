import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Linking, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import WebView from 'react-native-webview';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import {get_legal_document} from '../../redux/Api/apiRequests';
import {recoverDoubleEscapedHtml} from '../../component/htmlUtils';

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

// Navy header color from the CMS-authored legal pages, used to avoid a white
// flash before the WebView finishes its first paint.
const NAVY_BACKGROUND = '#0b1f3a';

const REMOTE_URL_PATTERN = /^https?:\/\//i;

// Android's WebView applies algorithmic dark-mode inversion by default, which
// re-colors the (already light/navy-styled) legal pages and breaks their
// layout. forceDarkOn={false} disables that at the native level; this script
// is a belt-and-suspenders fix for content whose own <head> we don't control
// (e.g. a remote `url` source or CMS HTML missing a color-scheme meta tag).
const FORCE_LIGHT_MODE_JS = `
  (function() {
    var meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = 'light only';
    document.head.appendChild(meta);
    document.documentElement.style.colorScheme = 'light';
  })();
  true;
`;

// The CMS's rich-text editor stores admin-pasted raw HTML source by wrapping
// EVERY line in its own <p>, substituting &nbsp; for literal spaces (to
// preserve indentation) and HTML-escaping the rest — so a pasted document
// like `<!DOCTYPE html>` / `  <style>` / `    --navy: #0b1f3a;` is actually
// stored as `<p>&lt;!DOCTYPE&nbsp;html&gt;</p><p>&nbsp;&nbsp;&lt;style&gt;</p>...`.
// recoverDoubleEscapedHtml() only reverses &lt;/&gt;, which leaves the <p>
// line-wrappers fragmenting the document (breaking a real <style> block
// across dozens of stray paragraphs) and leaves &nbsp;/&quot;/&amp; untouched
// (so spacing collapses and entities like &amp;copy; render as literal text
// instead of decoding to ©). This reconstructs the original source: strip the
// line-wrapper <p> tags, then decode the storage-level entities — &amp; last,
// so a genuinely double-escaped reference like &amp;copy; correctly becomes
// &copy; (for the WebView's own HTML parser to then render as ©), not '&'.
const PASTED_SOURCE_PATTERN = /<p>&lt;/i;
const LINE_WRAPPER_PARAGRAPH_PATTERN = /<\/?p[^>]*>/gi;

const decodeStorageEntities = (text: string): string =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const reconstructCmsHtml = (raw: string): string => {
  if (!PASTED_SOURCE_PATTERN.test(raw)) {
    return recoverDoubleEscapedHtml(raw);
  }
  return decodeStorageEntities(raw.replace(LINE_WRAPPER_PARAGRAPH_PATTERN, '\n'));
};

const HAS_HTML_DOCUMENT_PATTERN = /<html[\s>]/i;
const HAS_HEAD_TAG_PATTERN = /<head[^>]*>/i;
const LIGHT_SCHEME_HEAD_TAGS =
  '<meta name="color-scheme" content="light only">' +
  '<style>:root { color-scheme: light; }</style>';

// CMS content arrives as a bare fragment (no <html>/<head>), so this is the
// one place we control document structure for it — inject the color-scheme
// declaration here as a belt-and-suspenders complement to FORCE_LIGHT_MODE_JS
// above. A `url` source's <head> is out of our control at this layer; that
// case needs the same meta/style added server-side if we own that page.
const wrapLightModeHtml = (bodyHtml: string): string => {
  if (HAS_HTML_DOCUMENT_PATTERN.test(bodyHtml)) {
    return HAS_HEAD_TAG_PATTERN.test(bodyHtml)
      ? bodyHtml.replace(HAS_HEAD_TAG_PATTERN, match => `${match}${LIGHT_SCHEME_HEAD_TAGS}`)
      : bodyHtml;
  }
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">${LIGHT_SCHEME_HEAD_TAGS}</head><body>${bodyHtml}</body></html>`;
};

interface LegalPageScreenProps {
  /** Raw HTML string to render directly, bypassing the docType API fetch. */
  html?: string;
  /** Remote URL to load directly, bypassing the docType API fetch. */
  url?: string;
}

const LegalPageScreen: React.FC<LegalPageScreenProps> = ({html: htmlProp, url: urlProp}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const config = LEGAL_SCREEN_CONFIG[route.name] ?? {docType: '', title: 'Details'};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notPublished, setNotPublished] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);

  // Tracks the base (hash-stripped) URL of the currently loaded page so
  // same-page anchor navigations aren't mistaken for external link taps.
  const baseUrlRef = useRef('');
  const isInitialLoadRef = useRef(true);

  const loadDocument = useCallback(async () => {
    if (urlProp) {
      setSourceUrl(urlProp);
      setSourceHtml('');
      baseUrlRef.current = urlProp;
      isInitialLoadRef.current = true;
      setWebViewLoading(true);
      setLoading(false);
      return;
    }
    if (htmlProp) {
      setSourceHtml(wrapLightModeHtml(reconstructCmsHtml(htmlProp)));
      setSourceUrl('');
      baseUrlRef.current = '';
      isInitialLoadRef.current = true;
      setWebViewLoading(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setNotPublished(false);
    try {
      const res = await get_legal_document(config.docType);
      const content: string | undefined = res?.data?.content;
      if (res?.success && content) {
        isInitialLoadRef.current = true;
        setWebViewLoading(true);
        if (REMOTE_URL_PATTERN.test(content.trim())) {
          baseUrlRef.current = content.trim();
          setSourceUrl(content.trim());
          setSourceHtml('');
        } else {
          baseUrlRef.current = '';
          setSourceHtml(wrapLightModeHtml(reconstructCmsHtml(content)));
          setSourceUrl('');
        }
      } else {
        setNotPublished(true);
      }
    } catch (err) {
      console.error('LegalPageScreen error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [config.docType, htmlProp, urlProp]);

  useFocusEffect(
    useCallback(() => {
      loadDocument();
    }, [loadDocument]),
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const {url} = request;

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        return true;
      }

      if (url.startsWith('mailto:') || url.startsWith('tel:')) {
        Linking.openURL(url).catch(() => undefined);
        return false;
      }

      if (REMOTE_URL_PATTERN.test(url)) {
        const isSamePageAnchor =
          !!baseUrlRef.current && url.split('#')[0] === baseUrlRef.current.split('#')[0];
        if (isSamePageAnchor) {
          return true;
        }
        Linking.openURL(url).catch(() => undefined);
        return false;
      }

      // In-page anchors on HTML-string content (e.g. about:blank#introduction)
      // and other non-http schemes are left to navigate natively.
      return true;
    },
    [],
  );

  const onWebViewLoadEnd = useCallback(() => {
    setWebViewLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      isInitialLoadRef.current = true;
    };
  }, []);

  const hasSource = !!sourceUrl || !!sourceHtml;

  // TEMPORARY debug logging — remove once the CMS HTML rendering issue is confirmed fixed.
  useEffect(() => {
    if (sourceHtml) {
      console.log('[LegalPageScreen] sourceHtml length:', sourceHtml.length);
      console.log('[LegalPageScreen] sourceHtml head (first 500):', sourceHtml.slice(0, 500));
      console.log('[LegalPageScreen] sourceHtml tail (last 500):', sourceHtml.slice(-500));
    } else if (sourceUrl) {
      console.log('[LegalPageScreen] sourceUrl:', sourceUrl);
    }
  }, [sourceHtml, sourceUrl]);

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
      ) : notPublished || !hasSource ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            This content isn't available right now. Please check back later.
          </Text>
        </View>
      ) : (
        <View style={styles.webViewWrapper}>
          <WebView
            style={styles.webView}
            source={sourceUrl ? {uri: sourceUrl} : {html: sourceHtml}}
            onLoadEnd={onWebViewLoadEnd}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            originWhitelist={['*']}
            forceDarkOn={false}
            injectedJavaScriptBeforeContentLoaded={FORCE_LIGHT_MODE_JS}
          />
          {webViewLoading && (
            <View style={styles.webViewLoadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
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
  webViewWrapper: {
    flex: 1,
    backgroundColor: NAVY_BACKGROUND,
  },
  webView: {
    flex: 1,
    // The legal pages themselves are light-themed; keep this white (not navy)
    // so there's no dark bleed-through once forceDarkOn/color-scheme kicks in.
    backgroundColor: '#ffffff',
  },
  webViewLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY_BACKGROUND,
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
