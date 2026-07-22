import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Share from 'react-native-share';

interface Props {
  receiptText: string;
}

// No Bluetooth thermal-printer SDK is wired up (confirmed decision) — this
// is a monospace preview of the 80mm receipt layout plus a text-share
// fallback until a specific printer SDK is chosen and hardware-tested.
const ThermalReceiptPreview: React.FC<Props> = ({ receiptText }) => {
  const handleShare = async () => {
    try {
      await Share.open({ message: receiptText, failOnCancel: false });
    } catch (err: any) {
      console.error('Thermal receipt share error:', err?.message || err);
    }
  };

  return (
    <View>
      <View style={styles.paper}>
        <Text style={styles.mono}>{receiptText}</Text>
      </View>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>Share as Text</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Bluetooth thermal printing isn't wired up yet — share this to a printer app, or copy it manually.
      </Text>
    </View>
  );
};

export default ThermalReceiptPreview;

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 11,
    lineHeight: 15,
    color: '#1a1a1a',
  },
  shareBtn: {
    marginTop: 12,
    backgroundColor: '#0D1952',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  note: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 8 },
});
