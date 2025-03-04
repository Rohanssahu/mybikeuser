
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
import { StackNavigationProp } from '@react-navigation/stack';
import CustomDropdown from '../../component/CustomDropdown';
import { get_citys, get_profile, get_states, updateProfile, updateProfileImage } from '../../redux/Api/apiRequests';
import { captureImage, image_url, selectImageFromGallery } from '../../redux/Api';
import UploadImageModal from '../../component/UploadImageModal';
import Loading from '../../configs/Loader';

interface ProfileDetailsProps {
    navigation: StackNavigationProp<any, any>;
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
            setImage({ path: image_url + User?.image } || '');
            setPhone(User?.phone ? User.phone.toString() : '');
        }
    }, [User]);  // Make sure to include User as a dependency


    const getUser = async () => {
        setLoading(true)
        const res = await get_profile();
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


    const update_profile = async () => {
        setLoading(true)
        const res = await updateProfile(User?._id, phone, firstName, lastName, state, city, address, pinCode, image, email)
        if (res?.success) {
            get_profile()
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
                    style={styles.profileImageContainer}>
                    <Image source={image?.path ? { uri: image?.path } : images.profileUpdate} style={styles.profileImage} />
                    <View style={styles.addIcon}>
                        <Icon source={icon.add} size={20} />
                    </View>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <CustomTextInput
                        placeholder='First Name'
                        onChangeText={setFirstName}
                        value={firstName}
                        inputStyle={[styles.input, errors.firstName && styles.errorInput]}
                    />
                    {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

                    <CustomTextInput
                        placeholder='Last Name'
                        onChangeText={setLastName}
                        value={lastName}
                        inputStyle={[styles.input, errors.lastName && styles.errorInput, { marginTop: 15 }]}
                    />
                    {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                    <CustomTextInput
                        placeholder='Email '
                        onChangeText={setEmail}
                        value={email}
                        inputStyle={[styles.input, errors.lastName && styles.errorInput, { marginTop: 15 }]}
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    <CustomTextInput
                        placeholder='Phone number'
                        onChangeText={setPhone}
                        value={phone}
                        inputStyle={[styles.input, errors.lastName && styles.errorInput, { marginTop: 15 }]}
                    />
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                    <CustomDropdown
                        data={StateData}
                        onSelect={(value) => {

                            get_citys_list(value.id)
                            setState(value.name)
                            console.log('=================value.name===================');
                            console.log(value.name);
                            console.log('====================================');
                        }}
                        placeholder="State"
                        label={'name'}
                        value={'id'}
                    />
                    {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

                    <CustomDropdown
                        data={cityData}
                        onSelect={(value) => {


                            setCity(value.name)
                        }}
                        placeholder="City"
                        label={'name'}
                        value={'id'}

                    />
                    {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

                    <CustomTextInput
                        placeholder='Address'
                        onChangeText={setAddress}
                        value={address}
                        inputStyle={[styles.input, errors.address && styles.errorInput, { marginTop: 15 }]}
                    />
                    {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

                    <CustomTextInput
                        placeholder='Pin-code'
                        onChangeText={setPinCode}
                        value={pinCode}
                        inputStyle={[styles.input, errors.pinCode && styles.errorInput, { marginTop: 15 }]}
                    />
                    {errors.pinCode ? <Text style={styles.errorText}>{errors.pinCode}</Text> : null}
                </View>

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Update"
                        onPress={() => { update_profile() }}
                        buttonStyle={styles.button}
                    />
                </View>

<View  style={{height:hp(10)}} />
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
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#fff'
    },
    addIcon: {
        marginTop: -25,
        right: -30,
        borderWidth: 1,
        borderColor: color.white,
        borderRadius: 30,
        padding: 1,
    },
    formContainer: {
        paddingHorizontal: 25,
        marginTop: hp(8),
    },
    input: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 15,
        padding: 10,
        color: '#fff',
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
    button: {},
});

export default EditProfile;
