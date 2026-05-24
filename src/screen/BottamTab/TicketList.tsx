import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {color} from '../../constant';
import {get_tikit} from '../../redux/Api/apiRequests';
import SupportFormModal from './SupportFormModal';
import ScreenNameEnum from '../../routes/screenName.enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import {icon} from '../../component/Image';

interface Ticket {
  _id: string;
  ticketNo: number;
  subject: string;
  created_at: string;
  status: 'Open' | 'Closed';
  messages: Array<{message: string; sender_type?: string}>;
}

const TicketList: React.FC = ({navigation}: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Open' | 'Closed'>('Open');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      tikit_list();
    }
  }, [isFocused]);

  const tikit_list = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const res = await get_tikit(user_id);
      if (res?.success) {
        setTickets(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredTickets = tickets.filter(t => t.status === selectedTab);
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy · hh:mm a');
    } catch {
      return '—';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Support</Text>
          <Text style={styles.headerSub}>We're here to help you</Text>
        </View>
        <TouchableOpacity
          style={styles.newTicketBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}>
          <Text style={styles.newTicketBtnText}>+ New Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['Open', 'Closed'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
            onPress={() => setSelectedTab(tab)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.tabBtnText,
                selectedTab === tab && styles.tabBtnTextActive,
              ]}>
              {tab} ({tab === 'Open' ? openCount : closedCount})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : filteredTickets.length > 0 ? (
        <FlatList
          data={filteredTickets}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => tikit_list(true)}
              tintColor={color.buttonColor}
              colors={[color.buttonColor]}
            />
          }
          renderItem={({item}) => {
            const lastMsg =
              item.messages?.[item.messages.length - 1]?.message || '—';
            const isOpen = item.status === 'Open';
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ScreenNameEnum.CHAT_SCREEN, {
                    ticket: item,
                  })
                }
                style={styles.card}
                activeOpacity={0.82}>
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={styles.ticketNumBox}>
                    <Text style={styles.ticketNumText}>T-{item.ticketNo}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isOpen ? styles.statusOpen : styles.statusClosed,
                    ]}>
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: isOpen ? '#10B981' : '#6B7DBE'},
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {color: isOpen ? '#10B981' : '#6B7DBE'},
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Subject */}
                <Text style={styles.subject} numberOfLines={1}>
                  {item.subject}
                </Text>

                {/* Last message preview */}
                <Text style={styles.lastMsg} numberOfLines={2}>
                  {lastMsg}
                </Text>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {formatDate(item.created_at)}
                  </Text>
                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.centerBox}>
          <Image source={icon.support} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>
            {selectedTab === 'Open' ? 'No Open Tickets' : 'No Closed Tickets'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab === 'Open'
              ? "Raise a support ticket and we'll get back to you"
              : 'All resolved tickets will appear here'}
          </Text>
          {selectedTab === 'Open' && (
            <TouchableOpacity
              style={styles.raiseBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}>
              <Text style={styles.raiseBtnText}>Raise a Ticket</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <SupportFormModal
        visible={modalVisible}
        onClose={() => {
          tikit_list();
          setModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 16,
  },
  headerTitle: {fontSize: 22, fontWeight: '700', color: '#fff'},
  headerSub: {fontSize: 13, color: '#6B7DBE', marginTop: 2},
  newTicketBtn: {
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.35)',
  },
  newTicketBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: color.buttonColor,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#0D1952',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabBtnActive: {backgroundColor: color.buttonColor},
  tabBtnText: {fontSize: 13, fontWeight: '600', color: '#6B7DBE'},
  tabBtnTextActive: {color: '#081041'},

  // List
  list: {paddingHorizontal: 16, paddingBottom: 24},
  card: {
    backgroundColor: '#0D1952',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketNumBox: {
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.3)',
  },
  ticketNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: color.buttonColor,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  statusOpen: {backgroundColor: 'rgba(16,185,129,0.12)'},
  statusClosed: {backgroundColor: 'rgba(107,125,190,0.12)'},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  statusText: {fontSize: 11, fontWeight: '700'},
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  lastMsg: {
    fontSize: 13,
    color: '#6B7DBE',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {fontSize: 12, color: '#3D4F80'},
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {fontSize: 18, color: '#6B7DBE', lineHeight: 22},

  // Empty / loading
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    tintColor: 'rgba(255,255,255,0.12)',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#606880',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  raiseBtn: {
    marginTop: 24,
    backgroundColor: color.buttonColor,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  raiseBtnText: {fontSize: 14, fontWeight: '700', color: '#081041'},
});

export default TicketList;
