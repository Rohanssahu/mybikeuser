import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import FAQAccordion, {FAQItem} from '../../component/help/FAQAccordion';
import {get_faqs} from '../../redux/Api/apiRequests';

interface FaqApiItem {
  _id: string;
  question: string;
  answer: string;
  videoUrl?: string | null;
}

const FaqScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await get_faqs();
      if (res?.success) {
        setFaqs(
          (res.data || []).map((item: FaqApiItem) => ({
            id: item._id,
            question: item.question,
            answer: item.answer,
            videoUrl: item.videoUrl || null,
          })),
        );
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('FaqScreen error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFaqs();
    }, [loadFaqs]),
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="FAQ" navigation={navigation} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            Something went wrong while loading FAQs. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={loadFaqs}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Retry">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : faqs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            No FAQs available yet. Please check back later.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <FAQAccordion items={faqs} />
        </ScrollView>
      )}
    </View>
  );
};

export default FaqScreen;

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
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#FED428',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#081041',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
