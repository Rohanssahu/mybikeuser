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
import { get_states, get_citys, add_Profile } from '../../redux/Api/apiRequests';
import { captureImage } from '../../redux/Api';
import Loading from '../../configs/Loader';

interface ProfileDetailsProps {
    navigation: StackNavigationProp<any, any>;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [StateData, setStateData] = useState([]);
    const [cityData, setcityData] = useState([]);
    const [image, setImage] = useState('');
    const [isLoading, setisLoading] = useState(false);


    // Error states
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        state: '',
        city: '',
        address: '',
        pinCode: ''
    });


    useEffect(() => {
        get_states_list()
    }, [])


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
    const validateFields = () => {
        let isValid = true;
        let newErrors = {
            firstName: firstName ? '' : 'First Name is required',
            lastName: lastName ? '' : 'Last Name is required',
            state: state ? '' : 'State is required',
            city: city ? '' : 'City is required',
            address: address ? '' : 'Address is required',
            pinCode: pinCode ? '' : 'Pin Code is required'
        };

        setErrors(newErrors);

        // If any field has an error, form is invalid
        isValid = Object.values(newErrors).every(error => error === '');
        return isValid;
    };

    const handleSubmit = async () => {
        setisLoading(true)
        if (validateFields()) {

            const states = await add_Profile('',
                first_name,
                last_name,
                state,
                city,
                address,
                pincode,
                'image')

            setisLoading(false)

        }

       
        setisLoading(false)
    };
    const handleCapture = async () => {
        const image = await captureImage();
        if (image) {
            console.log('Captured Image:', image);
            // Handle the captured image (e.g., upload, display, save, etc.)
        } else {
            console.log('Image capture canceled or failed.');
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: color.baground }}>
            <ScrollView>
                {isLoading && <Loading />}
                <CustomHeader navigation={navigation} title='Add Profile Details'
                    onSkipPress={() => { navigation.navigate(ScreenNameEnum.BOTTAM_TAB); }} showSkip={true}


                />

                {/* Profile Image Section */}
                <View style={styles.profileImageContainer}>
                    <Image source={image ? { uri: image } : images.profileUpdate} style={styles.profileImage} />
                    <TouchableOpacity
                        onPress={() => {
                            handleCapture()
                        }}
                        style={styles.addIcon}>
                        <Icon source={icon.add} size={20} />
                    </TouchableOpacity>
                </View>

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

                    <CustomDropdown
                        data={StateData}
                        onSelect={(value) => {

                            get_citys_list(value.id)
                            setState(value.name)
                        }}
                        placeholder="State"
                        label={'name'}
                        value={'id'}
                    />
                    {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

                    <CustomDropdown
                        data={cityData}
                        onSelect={(value) => {

                            get_citys_list(value.id)
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
                        title="Submit"
                        onPress={() => { handleSubmit() }}
                        buttonStyle={styles.button}
                    />
                </View>
            </ScrollView>
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
        marginTop: 60,
        bottom: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {

    },
});

export default ProfileDetails;
