import React, {memo, useState} from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import HelpIcon from './icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface FAQItem {
  question: string;
  answer: string;
}

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
          <View key={item.question} style={styles.item}>
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
              <Text style={styles.answer}>{item.answer}</Text>
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
  answer: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#6B7DBE',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
});

export default memo(FAQAccordion);
