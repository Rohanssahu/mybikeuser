import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon source={icon.close} size={20} />
          </TouchableOpacity>

          {/* Logout Text */}
          <Text style={styles.title}>Log Out?</Text>
          <Text style={styles.subtitle}>Are you sure you want to log out?</Text>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={onConfirm}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius:20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left:20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginTop: 10,
    textAlign: 'center',
  },
  logoutButton: {

    marginTop: 60,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
