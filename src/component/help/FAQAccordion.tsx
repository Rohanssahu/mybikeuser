import React, {memo, useMemo, useState} from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';
import HelpIcon from './icons';
import {recoverDoubleEscapedHtml, wrapHtml} from '../htmlUtils';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

// Admin-authored answers are rich text and may contain real HTML markup —
// render every answer through a WebView so formatting (bold, lists, links)
// survives, while plain-text answers (e.g. hardcoded fallback content) still
// display correctly since a browser renders untagged text as-is.
const ANSWER_BODY_STYLE =
  'margin:0;padding:0;background:#0D1952;color:#6B7DBE;font-family:sans-serif;font-size:13px;line-height:19px;';

const INJECTED_HEIGHT_SCRIPT = `
(function () {
  function postHeight() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
    }
  }
  postHeight();
  window.addEventListener('load', postHeight);
  setTimeout(postHeight, 300);
})();
true;
`;

const AnswerHtml: React.FC<{html: string}> = memo(({html}) => {
  const [height, setHeight] = useState(40);
  const source = useMemo(
    () => ({html: wrapHtml(recoverDoubleEscapedHtml(html), ANSWER_BODY_STYLE)}),
    [html],
  );

  return (
    <WebView
      source={source}
      originWhitelist={['*']}
      style={[styles.answerWebview, {height}]}
      containerStyle={styles.answerWebviewContainer}
      scrollEnabled={false}
      nestedScrollEnabled={false}
      injectedJavaScript={INJECTED_HEIGHT_SCRIPT}
      onMessage={event => {
        const nextHeight = Number(event.nativeEvent.data);
        if (!Number.isNaN(nextHeight) && nextHeight > 0 && nextHeight !== height) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setHeight(nextHeight);
        }
      }}
    />
  );
});

interface FAQAccordionProps {
  items: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({items}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <View>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <View key={item.id ?? item.question} style={styles.item}>
            <TouchableOpacity
              style={styles.question}
              onPress={() => toggle(index)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={item.question}
              accessibilityState={{expanded: isOpen}}>
              <Text style={styles.questionText}>{item.question}</Text>
              <View style={isOpen ? styles.chevronOpen : undefined}>
                <HelpIcon
                  name="chevronDown"
                  size={15}
                  color={isOpen ? '#FED428' : '#6B7DBE'}
                  strokeWidth={2.2}
                />
              </View>
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.answerWrap}>
                <AnswerHtml html={item.answer} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#0D1952',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
    overflow: 'hidden',
  },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    gap: 10,
  },
  questionText: {flex: 1, fontSize: 13, fontWeight: '700', color: '#fff'},
  chevronOpen: {transform: [{rotate: '180deg'}]},
  answerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  answerWebview: {
    width: '100%',
    backgroundColor: '#0D1952',
  },
  answerWebviewContainer: {
    backgroundColor: '#0D1952',
  },
});

export default memo(FAQAccordion);
