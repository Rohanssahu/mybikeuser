
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import images, { icon } from '../../component/Image';
import Icon from '../../component/Icon';
import CustomTextInput from '../../component/TextInput';
import { hp } from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomDropdown from '../../component/CustomDropdown';
import { get_citys, get_profile, get_states, updateProfile, updateProfileImage, validate_referral_code } from '../../redux/Api/apiRequests';
import { captureImage, image_url, selectImageFromGallery } from '../../redux/Api';
import UploadImageModal from '../../component/UploadImageModal';
import Loading from '../../configs/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileDetailsProps {
    navigation: NativeStackNavigationProp<any, any>;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ navigation }) => {
    const [User, setUser] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [StateData, setStateData] = useState([]);
    const [cityData, setcityData] = useState([]);
    const [image, setImage] = useState('');

    // Referral code — optional, one-time-only. Only a code the backend has
    // confirmed via validate_referral_code is sent with the profile update;
    // editing the text after a successful validation resets it so a stale
    // referrer can't be submitted silently.
    const [referralCodeInput, setReferralCodeInput] = useState('');
    const [validatedReferralCode, setValidatedReferralCode] = useState<string | null>(null);
    const [referrerName, setReferrerName] = useState('');
    const [referralValidating, setReferralValidating] = useState(false);
    const [referralError, setReferralError] = useState('');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        get_states_list()
        getUser()
    }, [])


    useEffect(() => {
        if (User) {
            setFirstName(User?.first_name || '');
            setLastName(User?.last_name || '');
            setAddress(User?.address || '');
            setPinCode(User?.pincode ? User.pincode.toString() : '');
            setEmail(User?.email || '');
            setImage({ path: image_url + User?.image } || '');
            setPhone(User?.phone ? User.phone.toString() : '');
        }
    }, [User]);  // Make sure to include User as a dependency


    const getUser = async () => {
        setLoading(true)
        const user_id = await  AsyncStorage.getItem('user_id')

        const res = await get_profile(user_id);
        if (res.success) {
            setUser(res.data);
            console.log(res.data); // Log the response to verify
        } else {
            setUser('');
        }
        setLoading(false)
    };


    const get_states_list = async () => {


        const state = await get_states()

        if (state.success) {

            setStateData(state.state)
        } else {
            setStateData([])
        }


    }
    const get_citys_list = async (city) => {


        const state = await get_citys(city)

        if (state.success) {

            setcityData(state.state)
        } else {
            setcityData([])
        }


    }
    // Error states
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        state: '',
        city: '',
        address: '',
        pinCode: '',
        email: '',
        phone: ''
    });


    const handleCapture = async () => {
        const image = await captureImage();
        if (image) {
            console.log('Captured Image:', image);
            // Handle the captured image (e.g., upload, display, save, etc.)
            setImage(image)
            await   update_image(image?.path)
            setIsModalVisible(false)
        } else {
            console.log('Image capture canceled or failed.');
        }
    };

    const selectFromGallery = async () => {
        const image = await selectImageFromGallery();
        if (image) {
            console.log('Captured Image:', image);
            setImage(image)
            await   update_image(image?.path)
            setIsModalVisible(false)
        } else {
            console.log('Image capture canceled or failed.');
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    const handleValidateReferralCode = async () => {
        if (!referralCodeInput.trim()) {
            return;
        }
        setReferralValidating(true)
        setReferralError('')
        try {
            const res = await validate_referral_code(referralCodeInput.trim())
            if (res?.success && res?.data?.valid) {
                setValidatedReferralCode(referralCodeInput.trim())
                setReferrerName(res?.data?.referrerName || '')
            } else {
                setValidatedReferralCode(null)
                setReferrerName('')
                setReferralError(res?.message || 'Invalid referral code')
            }
        } catch (error) {
            setValidatedReferralCode(null)
            setReferrerName('')
            setReferralError('Something went wrong. Please try again.')
        } finally {
            setReferralValidating(false)
        }
    }

    const handleReferralCodeChange = (text: string) => {
        setReferralCodeInput(text)
        setValidatedReferralCode(null)
        setReferrerName('')
        if (referralError) setReferralError('')
    }

    const update_profile = async () => {
        setLoading(true)
        const user_id = await  AsyncStorage.getItem('user_id')

        const res = await updateProfile(User?._id, phone, firstName, lastName, state, city, address, pinCode, image, email, validatedReferralCode || undefined)
        if (res?.success) {
            get_profile(user_id)
            navigation.reset({
                index: 0,
                routes: [{ name: ScreenNameEnum.BOTTAM_TAB }],
              });

        }
        setLoading(false)
    }
    const update_image = async (uri:string) => {
        setLoading(true)
        const res = await updateProfileImage({uri:uri})
        if (res?.success) {
            setImage(res?.image_base_url)


        }
        setLoading(false)
    }

    const fullName = `${firstName} ${lastName}`.trim();

    return (
        <View style={{ flex: 1, backgroundColor: color.baground }}>
            {/* Header */}
            <CustomHeader navigation={navigation} title='Profile'
            onSkipPress={() => {navigation.reset({
  index: 0,
  routes: [{ name: ScreenNameEnum.BOTTAM_TAB }],
});
 }} showSkip={false} />
            {loading && <Loading />}
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Image Section */}
                <TouchableOpacity

                    onPress={() => {
                        setIsModalVisible(true)
                    }}
                    activeOpacity={0.85}
                    style={styles.profileImageContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={image?.path ? { uri: image?.path } : images.profileUpdate}
                            style={image?.path ? styles.profileImage : styles.profileImagePlaceholder}
                            resizeMode={image?.path ? 'cover' : 'contain'}
                        />
                    </View>
                    <View style={styles.addIcon}>
                        <Icon source={icon.add} size={14} tintColor={color.baground} />
                    </View>
                </TouchableOpacity>

                {/* Name / phone summary */}
                <View style={styles.summaryContainer}>
                    {!!fullName && <Text style={styles.summaryName}>{fullName}</Text>}
                    {!!phone && <Text style={styles.summaryPhone}>{phone}</Text>}
                </View>

                {/* Form Fields */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={styles.inputWrapper}>
                                <Icon source={icon.profile} size={16} tintColor={color.grey} style={styles.inputIcon} />
                                <CustomTextInput
                                    placeholder='First Name'
                                    onChangeText={setFirstName}
                                    value={firstName}
                                    inputStyle={[styles.input, errors.firstName && styles.errorInput]}
                                />
                            </View>
                            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Last Name</Text>
                            <View style={styles.inputWrapper}>
                                <Icon source={icon.profile} size={16} tintColor={color.grey} style={styles.inputIcon} />
                                <CustomTextInput
                                    placeholder='Last Name'
                                    onChangeText={setLastName}
                                    value={lastName}
                                    inputStyle={[styles.input, errors.lastName && styles.errorInput]}
                                />
                            </View>
                            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.send} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Email '
                                onChangeText={setEmail}
                                value={email}
                                inputStyle={[styles.input, errors.lastName && styles.errorInput]}
                            />
                        </View>
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.phone} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Phone number'
                                onChangeText={setPhone}
                                value={phone}
                                inputStyle={[styles.input, errors.lastName && styles.errorInput]}
                            />
                        </View>
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.pin} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Address'
                                onChangeText={setAddress}
                                value={address}
                                inputStyle={[styles.input, errors.address && styles.errorInput]}
                            />
                        </View>
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Pin-code</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.pin} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Pin-code'
                                onChangeText={setPinCode}
                                value={pinCode}
                                inputStyle={[styles.input, errors.pinCode && styles.errorInput]}
                            />
                        </View>
                        {errors.pinCode ? <Text style={styles.errorText}>{errors.pinCode}</Text> : null}
                    </View>

                    <View style={[styles.field, { marginBottom: 0 }]}>
                        <Text style={styles.label}>Referral Code (Optional)</Text>
                        {validatedReferralCode ? (
                            <View style={styles.referralAppliedRow}>
                                <Text style={styles.referralAppliedText}>
                                    ✓ Referral Applied — {validatedReferralCode}
                                </Text>
                                {!!referrerName && <Text style={styles.referralNote}>Referred by {referrerName}</Text>}
                                <TouchableOpacity onPress={() => handleReferralCodeChange('')}>
                                    <Text style={styles.referralRemoveText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.referralInputRow}>
                                <TextInput
                                    style={styles.referralInput}
                                    placeholder="Enter Referral Code"
                                    placeholderTextColor={color.grey}
                                    autoCapitalize="characters"
                                    value={referralCodeInput}
                                    onChangeText={handleReferralCodeChange}
                                    editable={!referralValidating}
                                />
                                <TouchableOpacity
                                    style={[styles.referralApplyBtn, (!referralCodeInput.trim() || referralValidating) && styles.referralApplyBtnDisabled]}
                                    disabled={!referralCodeInput.trim() || referralValidating}
                                    onPress={handleValidateReferralCode}>
                                    {referralValidating ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.referralApplyBtnText}>Validate</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                        {!!referralError && <Text style={styles.errorText}>{referralError}</Text>}
                    </View>
                </View>

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Update profile"
                        onPress={() => { update_profile() }}
                        buttonStyle={styles.button}
                    />
                </View>

            </ScrollView>
            <UploadImageModal
                shown={isModalVisible}
                onBackdropPress={handleCloseModal}
                onPressCamera={handleCapture}
                onPressGallery={selectFromGallery}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    profileImageContainer: {
        marginTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarWrapper: {
        height: 84,
        width: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: color.buttonColor,
        backgroundColor: color.baground,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        height: '100%',
        width: '100%',
    },
    profileImagePlaceholder: {
        height: 40,
        width: 40,
        tintColor: color.buttonColor,
    },
    addIcon: {
        position: 'absolute',
        bottom: 0,
        right: '32%',
        height: 26,
        width: 26,
        borderRadius: 13,
        backgroundColor: color.buttonColor,
        borderWidth: 3,
        borderColor: color.baground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: hp(3),
    },
    summaryName: {
        color: color.white,
        fontSize: 15,
        fontWeight: '700',
    },
    summaryPhone: {
        color: color.grey,
        fontSize: 12,
        marginTop: 2,
    },
    card: {
        marginHorizontal: 20,
        backgroundColor: color.cardSurface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: color.borderSubtle,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
        marginBottom: 14,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        color: color.grey,
        fontSize: 12,
        marginBottom: 6,
        marginLeft: 2,
    },
    inputWrapper: {
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    input: {
        backgroundColor: color.baground,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingLeft: 38,
        paddingRight: 12,
        color: color.white,
        fontSize: 14,
    },
    errorInput: {
        borderColor: 'red',
    },
    referralInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    referralInput: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: color.baground,
        color: color.white,
        paddingHorizontal: 12,
        fontSize: 14,
        marginRight: 10,
        textTransform: 'uppercase',
    },
    referralApplyBtn: {
        height: 44,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: color.buttonColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    referralApplyBtnDisabled: {
        opacity: 0.5,
    },
    referralApplyBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    referralAppliedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    referralAppliedText: {
        fontSize: 14,
        color: '#22c55e',
        fontWeight: '700',
    },
    referralNote: {
        fontSize: 12,
        color: color.grey,
    },
    referralRemoveText: {
        fontSize: 13,
        color: color.grey,
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    button: {
        borderRadius: 12,
    },
});

export default ProfileDetails;
