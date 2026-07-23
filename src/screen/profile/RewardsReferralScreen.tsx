import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Clipboard,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import {get_referral_summary, get_referral_transactions} from '../../redux/Api/apiRequests';
import {errorToast, successToast} from '../../configs/customToast';

interface ReferralSummary {
  referralCode: string;
  referralEarnings: number;
  successfulReferralsCount: number;
}

interface ReferralTransactionItem {
  rewardAmount: number;
  rewardType: 'referrer' | 'new_user';
  referredUserName: string;
  bookingId: string | null;
  createdDate: string;
}

const REWARD_TYPE_LABEL: Record<string, string> = {
  referrer: 'Referrer Reward',
  new_user: 'New User Reward',
};

const RewardsReferralScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [transactions, setTransactions] = useState<ReferralTransactionItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        get_referral_summary(),
        get_referral_transactions(1, 50),
      ]);

      if (summaryRes?.success) {
        setSummary(summaryRes.data);
      } else {
        setError(true);
      }

      if (transactionsRes?.success) {
        setTransactions(transactionsRes.data || []);
      }
    } catch (err) {
      console.error('RewardsReferralScreen error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleCopyCode = () => {
    if (!summary?.referralCode) return;
    Clipboard.setString(summary.referralCode);
    successToast('Referral code copied!');
  };

  const handleShareCode = async () => {
    if (!summary?.referralCode) return;
    try {
      await Share.share({
        message: `Use my referral code ${summary.referralCode} to sign up on Mr Bike Doctor and get rewarded!`,
      });
    } catch (err) {
      errorToast('Unable to share right now.');
    }
  };

  const renderTransaction = ({item}: {item: ReferralTransactionItem}) => (
    <View style={styles.transactionRow}>
      <View style={styles.transactionIconWrap}>
        <MaterialCommunityIcons name="gift-outline" size={18} color={color.buttonColor} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.transactionTitle}>{REWARD_TYPE_LABEL[item.rewardType] || item.rewardType}</Text>
        <Text style={styles.transactionSubText}>{item.referredUserName}</Text>
        {!!item.bookingId && <Text style={styles.transactionSubText}>Booking: {item.bookingId}</Text>}
        <Text style={styles.transactionDate}>
          {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : ''}
        </Text>
      </View>
      <Text style={styles.transactionAmount}>+₹{item.rewardAmount}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Rewards & Referrals" navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Rewards & Referrals" navigation={navigation} />
        <View style={styles.centered}>
          <Text style={styles.messageText}>
            Something went wrong while loading your referral details. Please try again later.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Rewards & Referrals" navigation={navigation} />

      <FlatList
        data={transactions}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderTransaction}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            {/* My Referral Code */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>My Referral Code</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{summary.referralCode}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopyCode} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="content-copy" size={16} color={color.baground} />
                  <Text style={styles.actionBtnText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleShareCode} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="share-variant" size={16} color={color.baground} />
                  <Text style={styles.actionBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>₹{summary.referralEarnings}</Text>
                <Text style={styles.statLabel}>Referral Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.successfulReferralsCount}</Text>
                <Text style={styles.statLabel}>Successful Referrals</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Referral Transactions</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={36} color="#4C557E" />
            <Text style={styles.messageText}>
              No referral transactions yet. Share your code to start earning!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default RewardsReferralScreen;

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
    marginTop: 12,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  flex1: {
    flex: 1,
  },
  card: {
    backgroundColor: color.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: color.grey,
    marginBottom: 8,
  },
  codeRow: {
    backgroundColor: color.baground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '700',
    color: color.buttonColor,
    letterSpacing: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.buttonColor,
    borderRadius: 10,
    height: 42,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.baground,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: color.grey,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: color.cardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: 14,
    marginBottom: 10,
  },
  transactionIconWrap: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(254,212,40,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  transactionSubText: {
    fontSize: 12,
    color: color.grey,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#4C557E',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22c55e',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
