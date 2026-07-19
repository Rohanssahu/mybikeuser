import React, {memo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {create_tikit} from '../../redux/Api/apiRequests';
import {captureImage, selectImageFromGallery} from '../../redux/Api';
import {successToast, errorToast} from '../../configs/customToast';
import UploadImageModal from '../UploadImageModal';
import HelpIcon from './icons';

interface ContactSupportCardProps {
  onSubmitted?: () => void;
}

const ContactSupportCard: React.FC<ContactSupportCardProps> = ({
  onSubmitted,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    const image = await captureImage();
    if (image?.path) {setImagePath(image.path);}
    setPickerVisible(false);
  };

  const handleGallery = async () => {
    const image = await selectImageFromGallery();
    if (image?.path) {setImagePath(image.path);}
    setPickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please fill in both Subject and Description.');
      return;
    }
    setLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      // TODO: create_tikit currently always sends attachments: [] — wire
      // `imagePath` into the request body once the backend accepts an
      // attachment upload for ticket creation.
      const res = await create_tikit(subject.trim(), description.trim(), user_id ?? '');
      if (res?.success) {
        setSubject('');
        setDescription('');
        setImagePath(null);
        successToast('Ticket submitted — we’ll get back to you shortly');
        onSubmitted?.();
      } else {
        errorToast(res?.message || 'Failed to submit ticket. Try again.');
      }
    } catch {
      errorToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Still stuck? Send us a message</Text>
      <Text style={styles.lede}>Our team typically replies within a few hours.</Text>

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="What's your issue about?"
        placeholderTextColor="#3D4F80"
        value={subject}
        onChangeText={setSubject}
        maxLength={100}
        returnKeyType="next"
      />

      <Text style={[styles.label, styles.labelGap]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue in detail…"
        placeholderTextColor="#3D4F80"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={500}
      />

      {imagePath && (
        <View style={styles.previewWrap}>
          <Image source={{uri: imagePath}} style={styles.preview} />
          <TouchableOpacity
            style={styles.removePreview}
            onPress={() => setImagePath(null)}
            accessibilityRole="button"
            accessibilityLabel="Remove attached image">
            <HelpIcon name="closeCircle" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Attach image">
          <HelpIcon name="paperclip" size={14} color="#fff" />
          <Text style={styles.outlineBtnText}>Attach Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filledBtn, loading && styles.filledBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          {loading ? (
            <ActivityIndicator size={16} color="#081041" />
          ) : (
            <Text style={styles.filledBtnText}>Send Message</Text>
          )}
        </TouchableOpacity>
      </View>

      <UploadImageModal
        shown={pickerVisible}
        onBackdropPress={() => setPickerVisible(false)}
        onPressCamera={handleCapture}
        onPressGallery={handleGallery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D1952',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.08)',
  },
  title: {fontSize: 14.5, fontWeight: '800', color: '#fff'},
  lede: {fontSize: 12, color: '#6B7DBE', marginTop: 2, marginBottom: 14},
  label: {fontSize: 11, fontWeight: '700', color: '#A0AFCE', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 7},
  labelGap: {marginTop: 14},
  input: {
    backgroundColor: '#081041',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.1)',
  },
  textArea: {height: 88, textAlignVertical: 'top', paddingTop: 12},
  previewWrap: {marginTop: 12, alignSelf: 'flex-start'},
  preview: {width: 64, height: 64, borderRadius: 12},
  removePreview: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(8,16,65,0.85)',
    borderRadius: 11,
  },
  actions: {flexDirection: 'row', gap: 10, marginTop: 16},
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  outlineBtnText: {fontSize: 12.5, fontWeight: '700', color: '#fff'},
  filledBtn: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FED428',
  },
  filledBtnDisabled: {opacity: 0.6},
  filledBtnText: {fontSize: 12.5, fontWeight: '800', color: '#081041'},
});

export default memo(ContactSupportCard);
