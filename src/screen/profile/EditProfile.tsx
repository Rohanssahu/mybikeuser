
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
import { get_citys, get_profile, get_states, updateProfile, updateProfileImage } from '../../redux/Api/apiRequests';
import { captureImage, image_url, selectImageFromGallery } from '../../redux/Api';
import UploadImageModal from '../../component/UploadImageModal';
import Loading from '../../configs/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileDetailsProps {
    navigation: NativeStackNavigationProp<any, any>;
}

const EditProfile: React.FC<ProfileDetailsProps> = ({ navigation }) => {
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
            setCity(User?.city || '');
            setAddress(User?.address || '');
            setPinCode(User?.pincode ? User.pincode.toString() : '');
            setEmail(User?.email || '');
            setImage({ path: User?.image } || '');
            setPhone(User?.phone ? User.phone.toString() : '');
        }
    }, [User]);  // Make sure to include User as a dependency


    const getUser = async () => {
        setLoading(true)
        const user_id = await AsyncStorage.getItem('user_id')

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
            await update_image(image?.path)
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
            await update_image(image?.path)
            setIsModalVisible(false)
        } else {
            console.log('Image capture canceled or failed.');
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    const update_profile = async () => {
        setLoading(true)
        const res = await updateProfile(User?._id, phone, firstName, lastName, state, city, address, pinCode, image, email)
        if (res?.success) {
            const user_id = await AsyncStorage.getItem('user_id')

            get_profile(user_id)
        }
        setLoading(false)
    }
    const update_image = async (uri: string) => {
        setLoading(true)
        const res = await updateProfileImage({ uri: uri })
        if (res?.success) {
            setImage(res?.image_base_url)

        }
        setLoading(false)
    }

    const fullName = `${firstName} ${lastName}`.trim();

    return (
        <View style={{ flex: 1, backgroundColor: color.baground }}>
            {/* Header */}
            <CustomHeader navigation={navigation} title='Profile' showSkip={false} />
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

                            // source={{ uri: 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png' }}
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

                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={styles.inputWrapper}>
                                <Icon source={icon.profile} size={16} tintColor={color.grey} style={styles.inputIcon} />
                                <CustomTextInput
                                    placeholder='Enter first name'
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
                                    placeholder='Enter last name'
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
                                placeholder='Enter email'
                                onChangeText={setEmail}
                                value={email}
                                inputStyle={[styles.input, errors.email && styles.errorInput]}
                            />
                        </View>
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.phone} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Enter phone number'
                                onChangeText={setPhone}
                                value={phone}
                                inputStyle={[styles.input, errors.phone && styles.errorInput]}
                            />
                        </View>
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </View>

                    <View style={[styles.field, { marginBottom: 0 }]}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWrapper}>
                            <Icon source={icon.pin} size={16} tintColor={color.grey} style={styles.inputIcon} />
                            <CustomTextInput
                                placeholder='Enter address'
                                onChangeText={setAddress}
                                value={address}
                                inputStyle={[styles.input, errors.address && styles.errorInput]}
                            />
                        </View>
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
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

                <View style={{ height: hp(10) }} />
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
    },
    button: {
        borderRadius: 12,
    },
});

export default EditProfile;
