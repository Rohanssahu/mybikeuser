import React, {useCallback, useState} from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';

import {color, TAB_BAR_HEIGHT} from '../../constant';
import {get_app_settings, get_profile, get_tikit} from '../../redux/Api/apiRequests';
import {
  getCurrentLocation,
  locationPermission,
} from '../../component/helperFunction';
import {errorToast} from '../../configs/customToast';
import ScreenNameEnum from '../../routes/screenName.enum';
import SeeallHeader from '../../component/SeeallHeader';

import HelpHeader from '../../component/help/HelpHeader';
import EmergencyCard from '../../component/help/EmergencyCard';
import QuickHelpGrid, {QuickHelpItem} from '../../component/help/QuickHelpGrid';
import RecentTicketCard from '../../component/help/RecentTicketCard';
import FAQAccordion, {FAQItem} from '../../component/help/FAQAccordion';
import ContactSupportCard from '../../component/help/ContactSupportCard';
import ContactInfoCard from '../../component/help/ContactInfoCard';
import HelpIcon from '../../component/help/icons';

interface Ticket {
  _id: string;
  ticketNo: number;
  subject: string;
  created_at: string;
  status: 'Open' | 'Closed';
  messages: Array<{message: string; sender_type?: string}>;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How long does a service take?',
    answer:
      "Most standard services finish within 60–90 minutes. You'll get a live status update the moment your mechanic starts work.",
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Yes — cancel free of charge any time up to 30 minutes before your scheduled slot.',
  },
  {
    question: 'Why did my payment fail?',
    answer:
      'This is usually a bank timeout or low balance. Your booking is held for 15 minutes so you can retry safely.',
  },
  {
    question: "What's the refund policy?",
    answer:
      'Refunds for cancelled or disputed services are credited to your original payment method within 3–5 business days.',
  },
  {
    question: 'How do I contact my mechanic?',
    answer:
      'Once a mechanic is assigned, a direct chat opens automatically inside your ticket.',
  },
];

interface AppSupportSettings {
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  supportHours?: string;
}

const HelpCenter: React.FC = ({navigation}: any) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [supportSettings, setSupportSettings] = useState<AppSupportSettings>({});

  const loadSupportSettings = useCallback(async () => {
    try {
      const res = await get_app_settings();
      if (res?.success) {setSupportSettings(res.data || {});}
    } catch (error) {
      console.error('Error fetching support settings:', error);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {return;}
      const res = await get_profile(user_id);
      if (res?.success) {setFirstName(res.data?.first_name || '');}
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const res = await get_tikit(user_id);
      if (res?.success) {
        const sorted = [...(res.data || [])].sort(
          (a: Ticket, b: Ticket) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setTickets(sorted.slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadTickets();
      loadSupportSettings();
    }, [loadProfile, loadTickets, loadSupportSettings]),
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy · hh:mm a');
    } catch {
      return '—';
    }
  };

  const goToTicketList = () => {
    navigation.navigate(ScreenNameEnum.TICKET_LIST);
  };

  const handleCall = () => {
    if (!supportSettings.supportPhone) {return;}
    Linking.openURL(`tel:${supportSettings.supportPhone}`).catch(() =>
      errorToast('Unable to start a call on this device.'),
    );
  };

  const handleChat = () => {
    goToTicketList();
  };

  const handleEmail = () => {
    if (!supportSettings.supportEmail) {return;}
    Linking.openURL(`mailto:${supportSettings.supportEmail}`).catch(() =>
      errorToast('Unable to open an email client on this device.'),
    );
  };

  const handleWhatsapp = () => {
    if (!supportSettings.whatsappNumber) {return;}
    const digits = supportSettings.whatsappNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${digits.replace('+', '')}`).catch(() =>
      errorToast('Unable to open WhatsApp on this device.'),
    );
  };

  const handleShareLocation = async () => {
    try {
      await locationPermission();
      const {latitude, longitude} = await getCurrentLocation();
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      await Share.share({
        message: `Here's my live location for roadside assistance: ${mapsUrl}`,
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert(
        'Location unavailable',
        "We couldn't access your location. Please check location permissions and try again.",
      );
    }
  };

  // TODO: once TicketList / SupportFormModal accepts a route param to
  // preset the create-ticket subject, pass it here (e.g. `{presetSubject:
  // title}`) instead of a plain navigate.
  const quickHelpItems: QuickHelpItem[] = [
    {key: 'bike-not-starting', icon: 'wrench', title: 'Bike Not Starting', subtitle: 'Engine or ignition trouble', tintBg: '#EEEEFB', onPress: goToTicketList},
    {key: 'flat-tyre', icon: 'tire', title: 'Flat Tyre', subtitle: 'Puncture or air loss', tintBg: '#FFF6D9', onPress: goToTicketList},
    {key: 'battery-problem', icon: 'battery', title: 'Battery Problem', subtitle: 'Charging or drain issue', tintBg: '#E4F6EC', onPress: goToTicketList},
    {key: 'fuel-delivery', icon: 'fuel', title: 'Fuel Delivery', subtitle: 'Running low on fuel', tintBg: '#FCE9E2', onPress: goToTicketList},
    {key: 'accident-support', icon: 'shield', title: 'Accident Support', subtitle: 'Report an incident', tintBg: '#EEEEFB', onPress: goToTicketList},
    {key: 'booking-issue', icon: 'clock', title: 'Booking Issue', subtitle: 'Problem with a booking', tintBg: '#FFF6D9', onPress: goToTicketList},
    {key: 'payment-issue', icon: 'card', title: 'Payment Issue', subtitle: 'Charge or refund concern', tintBg: '#E4F6EC', onPress: goToTicketList},
    {key: 'service-delay', icon: 'clock', title: 'Service Delay', subtitle: 'Check your service ETA', tintBg: '#FCE9E2', onPress: goToTicketList},
  ];

  const topInset = Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8;
  const bottomPad = insets.bottom + TAB_BAR_HEIGHT + 24;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: bottomPad}}>
        <View style={{paddingTop: topInset}}>
          <HelpHeader
            firstName={firstName}
            onBellPress={() => navigation.navigate(ScreenNameEnum.Notification)}
          />
        </View>

        <View style={styles.section}>
          <EmergencyCard
            onCallPress={handleCall}
            onChatPress={handleChat}
            onLocationPress={handleShareLocation}
          />
        </View>

        <View style={styles.section}>
          <ContactInfoCard
            supportEmail={supportSettings.supportEmail}
            supportPhone={supportSettings.supportPhone}
            whatsappNumber={supportSettings.whatsappNumber}
            supportHours={supportSettings.supportHours}
            onCallPress={handleCall}
            onEmailPress={handleEmail}
            onWhatsappPress={handleWhatsapp}
          />
        </View>

        <View style={styles.section}>
          <SeeallHeader title="Quick Help" />
          <View style={styles.sectionSpacer}>
            <QuickHelpGrid items={quickHelpItems} />
          </View>
        </View>

        <View style={styles.section}>
          <SeeallHeader title="My Recent Tickets" onSeeAllPress={goToTicketList} />
          <View style={styles.sectionSpacer}>
            {ticketsLoading ? null : tickets.length > 0 ? (
              <>
                {tickets.map(item => (
                  <RecentTicketCard
                    key={item._id}
                    ticketNo={item.ticketNo}
                    subject={item.subject}
                    status={item.status}
                    updatedAt={formatDate(item.created_at)}
                    onPress={() =>
                      navigation.navigate(ScreenNameEnum.CHAT_SCREEN, {
                        ticket: item,
                      })
                    }
                  />
                ))}
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={goToTicketList}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="View all tickets">
                  <Text style={styles.viewAllText}>View All Tickets</Text>
                  <View style={styles.viewAllChevron}>
                    <HelpIcon name="chevronDown" size={12} color="#081041" strokeWidth={2.6} />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.emptyText}>
                No tickets yet — raise one below if you need help.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SeeallHeader title="Frequently Asked" />
          <View style={styles.sectionSpacer}>
            <FAQAccordion items={FAQ_ITEMS} />
          </View>
        </View>

        <View style={styles.section}>
          <ContactSupportCard onSubmitted={loadTickets} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  section: {paddingHorizontal: 20, marginTop: 22},
  sectionSpacer: {marginTop: 12},
  emptyText: {fontSize: 13, color: '#6B7DBE', lineHeight: 19},
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FED428',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 2,
  },
  viewAllText: {fontSize: 13.5, fontWeight: '800', color: '#081041'},
  viewAllChevron: {transform: [{rotate: '-90deg'}]},
});

export default HelpCenter;
