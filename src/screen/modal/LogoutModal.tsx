import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '../../component/Icon';
import { icon } from '../../component/Image';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon source={icon.close} size={22} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Icon
              source={icon.logout}
              size={50}
              style={{ tintColor: '#FF4D4F' }}
            />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Confirm Logout</Text>
          <Text style={styles.subtitle}>
            You will be logged out from your account. All session data will be cleared.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onConfirm}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  iconWrapper: {
    backgroundColor: '#FFF1F0',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 25,
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  logoutButton: {
    backgroundColor: '#FF4D4F',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
