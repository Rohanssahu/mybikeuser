import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';

interface SettingItem {
  id: number;
  label: string;
  state: boolean;
}

const NotificatioScreen: React.FC = ({navigation}) => {
  const [settings, setSettings] = useState<SettingItem[]>([
    { id: 1, label: 'Sound', state: false },
    { id: 2, label: 'Vibrate', state: false },
    { id: 3, label: 'App Updates', state: true },
  ]);

  const toggleSwitch = (id: number) => {
    setSettings((prevSettings) =>
      prevSettings.map((item) =>
        item.id === id ? { ...item, state: !item.state } : item
      )
    );
  };

  return (
    <View style={styles.container}>
           <CustomHeader navigation={navigation} title="Notification" onSkipPress={() => { }} showSkip={false} />
    <View style={{paddingHorizontal:20,flex:1}}>
      {settings.map((item) => (
        <View key={item.id} style={styles.settingRow}>
          <Text style={styles.label}>{item.label}</Text>
          <Switch
            value={item.state}
            onValueChange={() => toggleSwitch(item.id)}
            trackColor={{ false: '#A0A3BD', true: '#FFD700' }}
            thumbColor={item.state ? '#fff' : '#f4f3f4'}
          />
        </View>
      ))}
      </View>
    </View>
  );
};

export default NotificatioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:color.baground,

  
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222A45',
  },
  label: {
    fontSize:18,
    color: '#FFFFFF',
    fontWeight:'600'
  },
});
