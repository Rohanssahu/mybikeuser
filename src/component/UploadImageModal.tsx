import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from './utils/Constant';
import { color } from '../constant';


// Defining types for the Button component
interface ButtonProps {
  buttonTitle: string;
  titleColor?: string;
  style?: ViewStyle;
  onPress: () => void;
  iconCompoennet?: React.ReactNode;
  disabled?: boolean;
}

// Defining types for the props of the UploadImageModal component
interface UploadImageModalProps {
  shown: boolean;
  onBackdropPress: () => void;
  onPressCamera: () => void;
  onPressGallery: () => void;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  shown = false,
  onBackdropPress = () => { },
  onPressCamera = () => { },
  onPressGallery = () => { },
}) => {
  const insets = useSafeAreaInsets();

  // Button component to handle button rendering
  const Button: React.FC<ButtonProps> = ({
    buttonTitle,
    titleColor = '#FFF',
    style,
    onPress,
    iconCompoennet,
    disabled = false,
  }) => {
    return (
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.5}
        onPress={onPress}
        style={[styles.buttonStyle, style, disabled && styles.disableStyle]}>
        {iconCompoennet && iconCompoennet}
        <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700' }}>
          {buttonTitle}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationInTiming={500}
      animationOutTiming={400}
      useNativeDriver
      useNativeDriverForBackdrop
      animationOut={'slideOutDown'}
      animationIn={'slideInUp'}
      isVisible={shown}
      onBackdropPress={onBackdropPress}
      backdropOpacity={0.2}
      style={{ padding: 0, margin: 0, zIndex: 2 }}>
      <View pointerEvents="box-none" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={[styles.modalChildContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '700' }}>
              {`Select Image`}
            </Text>
          </View>
          <View style={{ paddingHorizontal: wp(4), flex: 1, justifyContent: 'center' }}>
            <Button buttonTitle="Select photo from camera" onPress={onPressCamera} />
            <Button buttonTitle={"Select photo from gallery"} onPress={onPressGallery} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UploadImageModal;

const styles = StyleSheet.create({
  modalChildContainer: {
    backgroundColor: '#FFF',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    height: hp(40),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(7),
    justifyContent: 'space-between',
    backgroundColor: color.buttonColor,
    height: hp(7),
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  buttonStyle: {
    borderRadius: 10,
    height: hp(6),
    backgroundColor: color.baground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginVertical: hp(1),
  },
  disableStyle: {
    backgroundColor: 'lightgray',
  },
});
