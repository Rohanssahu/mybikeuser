import React, {memo, useState} from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import HelpIcon from './icons';
import HtmlRenderer from '../common/HtmlRenderer';

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
  videoUrl?: string | null;
}

// Extracts the 11-char video ID out of the canonical
// https://www.youtube.com/embed/<id> form the backend stores.
const YOUTUBE_EMBED_ID_PATTERN = /embed\/([\w-]{11})/;
const extractYoutubeId = (embedUrl?: string | null) => {
  const match = (embedUrl || '').match(YOUTUBE_EMBED_ID_PATTERN);
  return match ? match[1] : null;
};

// Admin-authored answers are rich text — render every answer through the
// shared HtmlRenderer (native RN views, no script execution) so formatting
// (headings, lists, tables, links, images) survives securely.
const AnswerHtml: React.FC<{html: string; videoUrl?: string | null}> = memo(
  ({html, videoUrl}) => {
    const {width} = useWindowDimensions();
    const videoId = extractYoutubeId(videoUrl);

    return (
      <View>
        {videoId && (
          <View style={styles.videoWrap}>
            <YoutubePlayer height={(width - 60) * (9 / 16)} videoId={videoId} />
          </View>
        )}
        <HtmlRenderer html={html} variant="dark" containerPadding={0} />
      </View>
    );
  },
);

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
                <AnswerHtml html={item.answer} videoUrl={item.videoUrl} />
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
  videoWrap: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default memo(FAQAccordion);
