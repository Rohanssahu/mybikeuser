import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {icon} from '../Image';
import SupportButton from './SupportButton';

interface EmergencyCardProps {
  onCallPress: () => void;
  onChatPress: () => void;
  onLocationPress: () => void;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({
  onCallPress,
  onChatPress,
  onLocationPress,
}) => {
  return (
    <LinearGradient
      colors={['#081041', '#1C286E']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.title}>Emergency Assistance</Text>
      </View>
      <Text style={styles.subtitle}>Get immediate help, anytime.</Text>

      <SupportButton
        iconSource={icon.phone}
        title="Call Roadside Assistance"
        subtitle="Avg. response in 4 min"
        onPress={onCallPress}
        showDivider={false}
      />
      <SupportButton
        iconSource={icon.support}
        title="Chat With Support"
        subtitle="Usually replies in 2 min"
        onPress={onChatPress}
      />
      <SupportButton
        iconSource={icon.pin}
        title="Share Live Location"
        subtitle="Helps us reach you faster"
        onPress={onLocationPress}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  headRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38E28A',
  },
  title: {fontSize: 16, fontWeight: '800', color: '#fff'},
  subtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    marginBottom: 6,
  },
});

export default memo(EmergencyCard);
