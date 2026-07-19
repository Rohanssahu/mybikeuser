import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ContactInfoCardProps {
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  supportHours?: string;
  onCallPress: () => void;
  onEmailPress: () => void;
  onWhatsappPress: () => void;
}

const InfoRow: React.FC<{icon: string; label: string; value: string}> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={18} color="#8C93B8" style={styles.infoIcon} />
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ActionButton: React.FC<{icon: string; label: string; onPress: () => void}> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.85}>
    <MaterialCommunityIcons name={icon} size={18} color="#081041" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  supportEmail,
  supportPhone,
  whatsappNumber,
  supportHours,
  onCallPress,
  onEmailPress,
  onWhatsappPress,
}) => {
  const hasAnyInfo = supportEmail || supportPhone || whatsappNumber || supportHours;
  if (!hasAnyInfo) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Support contact details aren't available right now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Contact Support</Text>

      {supportEmail ? <InfoRow icon="email-outline" label="Email" value={supportEmail} /> : null}
      {supportPhone ? <InfoRow icon="phone-outline" label="Phone" value={supportPhone} /> : null}
      {whatsappNumber ? <InfoRow icon="whatsapp" label="WhatsApp" value={whatsappNumber} /> : null}
      {supportHours ? <InfoRow icon="clock-outline" label="Support Hours" value={supportHours} /> : null}

      <View style={styles.actionsRow}>
        {supportPhone ? <ActionButton icon="phone" label="Call" onPress={onCallPress} /> : null}
        {supportEmail ? <ActionButton icon="email" label="Email" onPress={onEmailPress} /> : null}
        {whatsappNumber ? <ActionButton icon="whatsapp" label="WhatsApp" onPress={onWhatsappPress} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1D3A',
    borderRadius: 18,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7DBE',
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7DBE',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 13.5,
    color: '#fff',
    fontWeight: '600',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FED428',
    borderRadius: 12,
    paddingVertical: 11,
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#081041',
  },
});

export default memo(ContactInfoCard);
