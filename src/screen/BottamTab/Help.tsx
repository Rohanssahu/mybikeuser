import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {icon} from '../../component/Image';
import Icon from '../../component/Icon';
import {color} from '../../constant';
import {format} from 'date-fns';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  get_profile,
  get_tikitdetails,
  replay_tikit,
} from '../../redux/Api/apiRequests';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time?: string;
}

const Help: React.FC = ({navigation}: any) => {
  const [User, setUser] = useState<any>(null);
  const [TikitDetails, setTikitDetails] = useState<any>(null);
  const route = useRoute<any>();
  const {ticket} = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchData = async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    const [profileRes, tikitRes] = await Promise.all([
      get_profile(user_id),
      get_tikitdetails(ticket?._id),
    ]);
    if (tikitRes?.success) {
      setTikitDetails(tikitRes.data);
      const formatted = tikitRes.data.messages.map((msg: any) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.sender_type === 'user' ? 'user' : 'bot',
        time: msg.created_at,
      }));
      setMessages(formatted);
    }
    if (profileRes?.success) {
      setUser(profileRes.data);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (TikitDetails?.status !== 'Closed') {
        fetchData();
      }
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TikitDetails?.status]);

  const formatTime = (dateString?: string) => {
    if (!dateString) {return '';}
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch {
      return '';
    }
  };

  const replayTikit = async () => {
    if (!inputText.trim() || sending) {return;}
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic UI — add message immediately
    const tmpMsg: Message = {
      id: `tmp_${Date.now()}`,
      text,
      sender: 'user',
      time: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tmpMsg]);

    try {
      const user_id = await AsyncStorage.getItem('user_id');
      await replay_tikit(ticket?._id, text, user_id);
      await fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const isClosed = TikitDetails?.status === 'Closed';

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <Icon source={icon.back} size={22} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {ticket?.subject || `Ticket #${ticket?.ticketNo}`}
          </Text>
          <View
            style={[
              styles.statusPill,
              isClosed ? styles.statusPillClosed : styles.statusPillOpen,
            ]}>
            <Text
              style={[
                styles.statusPillText,
                {color: isClosed ? '#6B7DBE' : '#10B981'},
              ]}>
              {TikitDetails?.status || ticket?.status || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.ticketNumSmall}>T-{ticket?.ticketNo}</Text>
        </View>
      </View>

      {/* Chat + Input */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

        <FlatList
          ref={flatListRef}
          data={messages}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: true})
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Icon
                source={icon.support}
                size={40}
                tintColor="rgba(255,255,255,0.1)"
              />
              <Text style={styles.emptyChatTitle}>No messages yet</Text>
              <Text style={styles.emptyChatSub}>
                Start the conversation below
              </Text>
            </View>
          }
          renderItem={({item}) => {
            const isUser = item.sender === 'user';
            return (
              <View
                style={[
                  styles.msgWrap,
                  isUser ? styles.msgWrapRight : styles.msgWrapLeft,
                ]}>
                {!isUser && (
                  <View style={styles.botAvatar}>
                    <Icon
                      source={icon.support}
                      size={13}
                      tintColor={color.buttonColor}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleBot,
                  ]}>
                  <Text style={styles.bubbleText}>{item.text}</Text>
                  {item.time ? (
                    <Text style={styles.bubbleTime}>
                      {formatTime(item.time)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          }}
        />

        {/* Closed banner */}
        {isClosed && (
          <View style={styles.closedBanner}>
            <Icon source={icon.check} size={14} tintColor="#6B7DBE" />
            <Text style={styles.closedBannerText}>
              {'  '}This ticket has been resolved and closed
            </Text>
          </View>
        )}

        {/* Input bar */}
        {!isClosed && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type your message…"
              placeholderTextColor="#3D4F80"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={replayTikit}
              style={[
                styles.sendBtn,
                (!inputText.trim() || sending) && styles.sendBtnDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!inputText.trim() || sending}>
              {sending ? (
                <ActivityIndicator size={18} color="#081041" />
              ) : (
                <Icon source={icon.send} size={20} tintColor="#081041" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  flex: {flex: 1},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {flex: 1, marginHorizontal: 12, alignItems: 'center'},
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 5,
  },
  statusPillOpen: {backgroundColor: 'rgba(16,185,129,0.12)'},
  statusPillClosed: {backgroundColor: 'rgba(107,125,190,0.12)'},
  statusPillText: {fontSize: 11, fontWeight: '700'},
  headerRight: {width: 50, alignItems: 'flex-end'},
  ticketNumSmall: {fontSize: 11, color: '#3D4F80', fontWeight: '600'},

  // Chat area
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexGrow: 1,
  },
  emptyChat: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  emptyChatSub: {
    fontSize: 13,
    color: '#3D4F80',
    marginTop: 6,
  },

  // Message bubbles
  msgWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  msgWrapRight: {justifyContent: 'flex-end'},
  msgWrapLeft: {justifyContent: 'flex-start'},
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.2)',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  bubbleUser: {
    backgroundColor: '#1A2D70',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.12)',
  },
  bubbleBot: {
    backgroundColor: '#0D1952',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleText: {fontSize: 14, color: '#E8ECF4', lineHeight: 20},
  bubbleTime: {
    fontSize: 10,
    color: '#3D4F80',
    marginTop: 4,
    textAlign: 'right',
  },

  // Closed / input
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107,125,190,0.1)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  closedBannerText: {
    fontSize: 13,
    color: '#6B7DBE',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 10,
    backgroundColor: color.baground,
  },
  input: {
    flex: 1,
    backgroundColor: '#0D1952',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.1)',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: color.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {opacity: 0.4},
});
