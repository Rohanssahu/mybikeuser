import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {create_tikit} from '../../redux/Api/apiRequests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {color} from '../../constant';

interface SupportFormModalProps {
  visible: boolean;
  onClose: () => void;
}

const SupportFormModal: React.FC<SupportFormModalProps> = ({
  visible,
  onClose,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Info', 'Please fill in both Subject and Message.');
      return;
    }
    setLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const res = await create_tikit(
        subject.trim(),
        message.trim(),
        user_id,
        '2',
      );
      if (res?.success) {
        setSubject('');
        setMessage('');
        onClose();
      } else {
        Alert.alert(
          'Error',
          res?.message || 'Failed to submit ticket. Try again.',
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}>
            <View style={styles.sheet}>
              {/* Drag handle */}
              <View style={styles.handle} />

              {/* Title */}
              <Text style={styles.title}>New Support Ticket</Text>
              <Text style={styles.subtitle}>
                Describe your issue and we'll respond shortly
              </Text>

              {/* Subject */}
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief title of your issue"
                placeholderTextColor="#3D4F80"
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
                returnKeyType="next"
              />

              {/* Message */}
              <Text style={[styles.label, styles.labelGap]}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue in detail…"
                placeholderTextColor="#3D4F80"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{message.length}/500</Text>

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  disabled={loading}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    loading && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size={18} color="#081041" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  kav: {justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: '#0D1952',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(254,212,40,0.15)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4},
  subtitle: {fontSize: 13, color: '#6B7DBE', marginBottom: 20, lineHeight: 18},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0AFCE',
    marginBottom: 7,
  },
  labelGap: {marginTop: 16},
  input: {
    backgroundColor: '#081041',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.1)',
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: '#3D4F80',
    textAlign: 'right',
    marginTop: 5,
  },
  btnRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {fontSize: 14, fontWeight: '700', color: '#A0AFCE'},
  submitBtn: {
    flex: 1.6,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: color.buttonColor,
  },
  submitBtnDisabled: {opacity: 0.6},
  submitBtnText: {fontSize: 14, fontWeight: '700', color: '#081041'},
});

export default SupportFormModal;
